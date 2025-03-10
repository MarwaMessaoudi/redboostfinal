import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionDocsComponent } from './gestion-docs.component';

describe('GestionDocsComponent', () => {
  let component: GestionDocsComponent;
  let fixture: ComponentFixture<GestionDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionDocsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
