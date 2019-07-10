import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AllComponent} from './all.component';

describe('AlladminComponent', () => {
    let component: AllComponent;
    let fixture: ComponentFixture<AllComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AllComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AllComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
