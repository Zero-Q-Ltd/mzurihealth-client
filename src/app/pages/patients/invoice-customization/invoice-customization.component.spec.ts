import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {InvoiceCustomizationComponent} from './invoice-customization.component';

describe('InvoiceCustomizationComponent', () => {
    let component: InvoiceCustomizationComponent;
    let fixture: ComponentFixture<InvoiceCustomizationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [InvoiceCustomizationComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InvoiceCustomizationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
