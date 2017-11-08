import { expect } from 'chai';
import { RouteQueryParams } from '../index';
import 'mocha';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import * as chai from 'chai';
import { Observable } from 'rxjs/Rx'
import 'rxjs/add/observable/of';

const should = chai.should();
chai.use(sinonChai);

describe('Decorator RouteQueryParams', () => {
    let comp, spy;

    beforeEach(() => {
        spy = sinon.spy();

        comp = { ngOnInit: spy };
    });

    it('should exist', () => {
        expect(RouteQueryParams).should.exist;
    });

    describe('Not nested', () => {
        beforeEach(() => {
            comp.route = {
                queryParams: { map: cb => cb({ contactId: {} }) }
            };

            RouteQueryParams('contactId')(comp, 'queryParams$', 0);
            comp.ngOnInit();
        });

        it('should have found the param', () => {
            should.exist(comp.queryParams$);
        });

        it('should have called ngOnInit', () => {
            spy.should.have.been.called;
        });

        it('should have restored ngOnInit', () => {
            comp.ngOnInit.should.equals(spy);
        });
    });

    describe('Nested', () => {
        beforeEach(() => {
            let queryParams = { map: cb => cb({}) };

            comp.route = {
                queryParams,
                parent: {
                    queryParams,
                    parent: {
                        queryParams: { map: cb => cb({ contactId: {} }) }
                    }
                }
            };

            RouteQueryParams('contactId')(comp, 'queryParams$', 0);
            comp.ngOnInit();
        });

        it('should have found the param', () => {
            should.exist(comp.queryParams$);
        });

        it('should have called ngOnInit', () => {
            spy.should.have.been.called;
        });

        it('should have restored ngOnInit', () => {
            comp.ngOnInit.should.equals(spy);
        });
    });

    describe('Without ngOnInit', () => {
        beforeEach(() => {
            delete comp.ngOnInit;
            comp.route = { queryParams: { map: cb => cb({ contactId: {} }) } };

            RouteQueryParams('contactId')(comp, 'queryParams$', 0);
        });

        it('should have created ngOnInit', () => {
            comp.ngOnInit.should.exist;
        });

        it('should inject the data', () => {
            comp.ngOnInit();

            comp.queryParams$.should.exist;
        });

        it('should remove the fake ngOnInit', () => {
            comp.ngOnInit();

            should.not.exist(comp.ngOnInit);
        });
    });

    describe('Without queryParams', () => {
        beforeEach(() => {
            comp.route = {
                queryParams: { map: cb => cb({ contactId: {} }) }
            };

            RouteQueryParams()(comp, 'contactId$', 0);
            comp.ngOnInit();
        });

        it('should have set the data', () => {
            comp.contactId$.should.exist;
        });
    });

    describe('With { observable: false }', () => {
        beforeEach(() => {
            comp.route = {
                queryParams: Observable.of({ contactId: '123' })
            };

            RouteQueryParams('contactId', { observable: false })(comp, 'contactId', 0);
            comp.ngOnInit();
        });

        it('should have found the contact id', () => {
            should.exist(comp.contactId);
        })

        it('should have correct value for contact id', () => {
            should.equal(comp.contactId, '123');
        })
    });
});