import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiasReunionComponent } from './dias-reunion.component';

describe('DiasReunionComponent', () => {
  let component: DiasReunionComponent;
  let fixture: ComponentFixture<DiasReunionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiasReunionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiasReunionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
