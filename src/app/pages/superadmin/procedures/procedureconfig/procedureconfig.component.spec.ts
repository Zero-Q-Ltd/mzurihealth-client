import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ProcedureconfigComponent} from './procedureconfig.component';

describe('ProcedureconfigComponent', () => {
    let component: ProcedureconfigComponent;
    let fixture: ComponentFixture<ProcedureconfigComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProcedureconfigComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProcedureconfigComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
