import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ProcedurenotesComponent} from './procedurenotes.component';

describe('ProcedurenotesComponent', () => {
  let component: ProcedurenotesComponent;
  let fixture: ComponentFixture<ProcedurenotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcedurenotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedurenotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
