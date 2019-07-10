import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AdminSelectionComponent} from './admin-selection.component';

describe('AdminSelectionComponent', () => {
    let component: AdminSelectionComponent;
    let fixture: ComponentFixture<AdminSelectionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AdminSelectionComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminSelectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
