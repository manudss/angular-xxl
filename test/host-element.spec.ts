import * as sinon from 'sinon';
import { HostElement, ResizeObserver } from '../src/host-element.decorator';
import { Observable } from 'rxjs/Observable';

declare global {
    interface ResizeObserver { cbs: [any]; }
}

function triggerChange(width, height, instance, index?): void {
    const entries = [{contentRect: {width, height}}];

    instance['cbs']
        .forEach((cb, i) => {
            if (index === undefined || i === index) {
                cb(entries);
            }
        });
}

export function hostElementSpecs(should): void {
    describe.only('HostElement', () => {
        let instance: ResizeObserver, Component, clock, element, comp;
        let ngOnInitSpy, ngOnDestroySpy,
            observeSpy, disconnectSpy;

        beforeEach(() => {
            element = {nativeElement: {}};
            clock = sinon.useFakeTimers();
            Component = function() {
                this.element = element;
            };
            Component.prototype = {
                ngOnInit: () => {},
                ngOnDestroy: () => {},
            };

            instance = {
                observe: () => {
                },
                disconnect: () => {
                },
            };
            instance['cbs'] = [];

            ngOnInitSpy = sinon.spy(Component.prototype, 'ngOnInit');
            ngOnDestroySpy = sinon.spy(Component.prototype, 'ngOnDestroy');
            observeSpy = sinon.spy(instance, 'observe');
            disconnectSpy = sinon.spy(instance, 'disconnect');

            window.ResizeObserver = (cb) => {
                instance['cbs'].push(cb);

                return instance;
            };
        });

        afterEach(() => {
            clock.restore();
        });

        it('should just be a function', () => {
            HostElement.should.be.a('function');
        });

        it('should apply currying', () => {
            HostElement().should.be.a('function');
        });

        describe('Monitor', () => {
            describe('Width', () => {
                beforeEach(() => {
                    HostElement('width', { observable: false})(Component.prototype, 'x');
                    HostElement({ observable: false})(Component.prototype, 'width');
                    comp = new Component();
                    comp.ngOnInit();
                    clock.tick();
                });

                it('should have created the resize observer', () => {
                    instance['cbs'].length.should.equal(2); // `observe` called 2 times!
                });

                it('should have set the target to be observed', () => {
                    observeSpy.should.have.been.calledWith(element.nativeElement);
                });

                it('should have eventually called the original ngOnInit once', () => {
                    ngOnInitSpy.should.have.been.calledOnce;
                });

                it('should cleanup onDestroy', () => {
                    comp.ngOnDestroy();

                    ngOnDestroySpy.should.have.been.calledOnce;
                    disconnectSpy.should.have.been.calledTwice;
                });

                describe('Trigger change', () => {
                    beforeEach(() => {
                        triggerChange(5, 6, instance, 0); // value for implicit
                        triggerChange(7, 8, instance, 1); // value for explicit
                    });

                    it('should update the explicit width', () => {
                        // Not 5!! This is the result of how `ngOnInit` is replaced -> FILO!!!!
                        comp.x.should.equal(7);
                    });

                    it('should update the implicit width', () => {
                        comp.width.should.equal(5);
                    });
                });
            });

            describe('Height', () => {
                beforeEach(() => {
                    HostElement('height', { observable: false})(Component.prototype, 'y');
                    HostElement({ observable: false})(Component.prototype, 'height');
                    comp = new Component();
                    comp.ngOnInit();
                    clock.tick();
                });

                describe('Trigger change', () => {
                    beforeEach(() => {
                        triggerChange(8, 9, instance, 0);
                        triggerChange(10, 11, instance, 1);
                    });

                    it('should update the explicit height', () => {
                        comp.y.should.equal(11);
                    });

                    it('should update the implicit height', () => {
                        comp.height.should.equal(9);
                    });
                });
            });

            describe('Width as Observable', () => {
                beforeEach(() => {
                    HostElement('width')(Component.prototype, 'w$');
                    HostElement()(Component.prototype, 'width$');
                    comp = new Component();
                    comp.ngOnInit();
                    clock.tick();
                });

                it('should have set an Observable on the explicit width', () => {
                    comp.w$.should.be.instanceOf(Observable);
                });

                it('should have set an Observable on the implicit width', () => {
                    comp.width$.should.be.instanceOf(Observable);
                });

                describe('Trigger change', () => {
                    beforeEach(() => {
                        triggerChange(11, 12, instance, 0);
                        triggerChange(13, 14, instance, 1);
                    });

                    it('should update the explicit width', (done) => {
                        comp.w$.subscribe(val => {
                            val.should.equal(13);
                            done();
                        });
                    });

                    it('should update the implicit width', (done) => {
                        comp.width$.subscribe(val => {
                            val.should.equal(11);
                            done();
                        });
                    });
                });
            });

            describe('Height/Width', () => {
                beforeEach(() => {
                    HostElement('height', 'width', { observable: false })(Component.prototype, 'wh');
                    comp = new Component();
                    comp.ngOnInit();
                    clock.tick();
                });

                describe('Trigger change', () => {
                    beforeEach(() => {
                        triggerChange(8, 18, instance);
                    });

                    it('should update both width and height', () => {
                        comp.wh.should.eql({width: 8, height: 18});
                    });
                });
            });

            describe('Height/Width as Observable', () => {
                beforeEach(() => {
                    HostElement('height', 'width')(Component.prototype, 'wh$');
                    comp = new Component();
                    comp.ngOnInit();
                    clock.tick();
                });

                describe('Trigger change', () => {
                    beforeEach(() => {
                        triggerChange(8, 18, instance);
                    });

                    it('should update both width and height', (done) => {
                        comp.wh$.subscribe(wh => {
                            wh.should.eql({width: 8, height: 18});
                            done();
                        });
                    });
                });
            });

            describe('Using a selector', () => {

            });

            describe('Using a pipe', () => {

            });
        });
    });
}
