declare global {
    interface Window {
        ResizeObserver: any;
    }
}

export function HostElement(...args: Array<any>): PropertyDecorator {
    const config = args[args.length - 1];

    return function factory(proto: any, key: any): void {
        const ngOnInit = proto.ngOnInit;

        proto.ngOnInit = function () {
            // this.width = this.element.nativeElement.clientWidth;
            const propertyList = args[0].split('.');
            const target = config.selector ? this.element.nativeElement.querySelector(config.selector) : this.element.nativeElement;
            console.log(propertyList[0]);
            if (target[propertyList[0]]) {
                var observer = new MutationObserver(muatations => {
                    this[key] = extractProperty(target, propertyList.slice())
                });

                observer.observe(target, { attributes: true, attributeOldValue: true, attributeFilter: [propertyList[0]] });
            } else {
                if (window.ResizeObserver) { // Only Chrome > 65
                    var ro = new window.ResizeObserver(entries => {
                        for (let entry of entries) {
                            const cr = entry.contentRect;
                            console.log('Element:', entry.target);
                            console.log(`Element size: ${cr.width}px x ${cr.height}px`);
                            console.log(`Element padding: ${cr.top}px ; ${cr.left}px`);

                            this[key] = cr[propertyList[0]];
                        }

                    });

                    ro.observe(target);
                } else { // anything else
                    resizeObserverPolyfill(target, () => {
                        this[key] = window.getComputedStyle(target)[propertyList[0]];
                    });
                }
            }

            this.ngOnInit = ngOnInit;
            this.ngOnInit();
        }
    }
}

function extractProperty(source, list) {
    if (list.length === 0) {
        return source;
    }

    return extractProperty(source[list.shift()], list);
}

function resizeObserverPolyfill(element, callback) {
    let zIndex = parseInt(window['getComputedStyle'](element).zIndex);
    if (isNaN(zIndex)) {
        zIndex = 0;
    };
    zIndex--;

    let expand = document.createElement('div');
    expand.style.position = "absolute";
    expand.style.left = "0px";
    expand.style.top = "0px";
    expand.style.right = "0px";
    expand.style.bottom = "0px";
    expand.style.overflow = "hidden";
    expand.style.zIndex = '' + zIndex;
    expand.style.visibility = "hidden";

    let expandChild = document.createElement('div');
    expandChild.style.position = "absolute";
    expandChild.style.left = "0px";
    expandChild.style.top = "0px";
    expandChild.style.width = "10000000px";
    expandChild.style.height = "10000000px";
    expand.appendChild(expandChild);

    let shrink = document.createElement('div');
    shrink.style.position = "absolute";
    shrink.style.left = "0px";
    shrink.style.top = "0px";
    shrink.style.right = "0px";
    shrink.style.bottom = "0px";
    shrink.style.overflow = "hidden";
    shrink.style.zIndex = '' + zIndex;
    shrink.style.visibility = "hidden";

    let shrinkChild = document.createElement('div');
    shrinkChild.style.position = "absolute";
    shrinkChild.style.left = "0px";
    shrinkChild.style.top = "0px";
    shrinkChild.style.width = "200%";
    shrinkChild.style.height = "200%";
    shrink.appendChild(shrinkChild);

    element.appendChild(expand);
    element.appendChild(shrink);

    function setScroll() {
        expand.scrollLeft = 10000000;
        expand.scrollTop = 10000000;

        shrink.scrollLeft = 10000000;
        shrink.scrollTop = 10000000;
    };
    setScroll();

    let size = element.getBoundingClientRect();

    let currentWidth = size.width;
    let currentHeight = size.height;

    let onScroll = function () {
        let size = element.getBoundingClientRect();

        let newWidth = size.width;
        let newHeight = size.height;

        if (newWidth != currentWidth || newHeight != currentHeight) {
            currentWidth = newWidth;
            currentHeight = newHeight;

            callback();
        }

        setScroll();
    };

    expand.addEventListener('scroll', onScroll);
    shrink.addEventListener('scroll', onScroll);
}