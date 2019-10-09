import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PerformProcedureComponent} from './perform-procedure.component';

describe('PerformProcedureComponent', () => {
    let component: PerformProcedureComponent;
    let fixture: ComponentFixture<PerformProcedureComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PerformProcedureComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PerformProcedureComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
