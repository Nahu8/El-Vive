import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDiasReunionComponent } from './admin-dias-reunion.component';

describe('AdminDiasReunionComponent', () => {
  let component: AdminDiasReunionComponent;
  let fixture: ComponentFixture<AdminDiasReunionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDiasReunionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDiasReunionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
