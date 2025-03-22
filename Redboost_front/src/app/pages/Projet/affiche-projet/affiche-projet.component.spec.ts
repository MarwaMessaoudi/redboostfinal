import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfficheProjetComponent } from './affiche-projet.component';

describe('AfficheProjetComponent', () => {
  let component: AfficheProjetComponent;
  let fixture: ComponentFixture<AfficheProjetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfficheProjetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfficheProjetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
