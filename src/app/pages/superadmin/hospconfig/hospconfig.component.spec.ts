import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {HospconfigComponent} from './hospconfig.component';

describe('HospconfigComponent', () => {
    let component: HospconfigComponent;
    let fixture: ComponentFixture<HospconfigComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HospconfigComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HospconfigComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
