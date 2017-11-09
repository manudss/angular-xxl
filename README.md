This library provides three decorators: **@RouteData**, **@RouteParams** and **@RouteQueryParams**. They extract the resolved
data, route parameters and query parameters values respectively using the `ActivatedRoute`. 

Its only requirement is that the `ActivatedRoute` is injected in the component's constructor as `route`

[![CircleCI](https://circleci.com/gh/scaljeri/angular-route-xxl.svg?style=svg)](https://circleci.com/gh/scaljeri/angular-route-xxl)

### Without @RouteData / @RouteParams / @RouteQueryParams

```typescript
@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
    contacts$: Observable<Contact[]>;
    contactId$: Observable<string>;
    search$: Observable<string>;
    
    constructor(private route: ActivatedRoute) {}
    
    ngOnInit() {
        this.contacts$ = this.route.parent.parent.parent.parent.data.map(data => data['contacts']);
        this.contactId$ = this.route.parent.parent.parent.params.map(params => params['contactId']);
        this.search$ = this.route.parent.parent.parent.queryParams.map(queryParams => queryParams['search']);
    }
}
```

### With @RouteData / @RouteParams / @RouteQueryParams

```typescript
@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent {
    @RouteData('contacts') contacts$: Observable<Contact[]>;
    @RouteParams('contactId') contactId$: Observable<string>;
    @RouteQueryParams('search') search$: Observable<string>;
    
    constructor(private route: ActivatedRoute) {}
}
```

The argument for both decorators is optional only if the value is identical to the property name 
the decorator belongs to (ignoring the '$')

```typescript
@RouteData() contacts$: Observable<Contact[]>;
@RouteParams() contactId$: Observable<string>;
@RouteQueryParams() search$: Observable<string>;
```

### Actual values instead of Observables 

If what you need is the actual value instead of an Observable, add the `observable: false` config option
to the decorator

```typescript
@RouteData('contacts', { observable: false }) contacts: Contact[];
@RouteParams('contactId', { observable: false }) contactId: string;
@RouteQueryParams('search', { observable: false }) search: string;
```

Unlike the route snapshot, these values are automatically update whenever the url changes.

### Contributors
   + @dirkluijk - Suggested to solve the issue using decorators
   + @superMDguy - Added `@RouteQueryParams()` and an option to return actual values instead of Observables
