import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProjetComponent } from './addprojet.component';

describe('AddprojetComponent', () => {
  let component: AddProjetComponent;
  let fixture: ComponentFixture<AddProjetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProjetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProjetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
