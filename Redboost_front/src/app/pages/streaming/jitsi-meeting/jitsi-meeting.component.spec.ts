import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JitsiMeetingComponent } from './jitsi-meeting.component';

describe('JitsiMeetingComponent', () => {
  let component: JitsiMeetingComponent;
  let fixture: ComponentFixture<JitsiMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JitsiMeetingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JitsiMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
