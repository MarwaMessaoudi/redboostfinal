import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CommonModule } from '@angular/common';
import { ProgramService } from '../../service/program.service';
import { ActivityService } from '../../service/activity.service';
import { EventService } from '../../service/event.service';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [FullCalendarModule, CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './program-details.component.html',
  styleUrls: ['./program-details.component.scss']
})
export class ProgramDetailComponent implements OnInit {
  program: any;
  activities: any[] = [];

  activityForm: FormGroup;
  eventForm: FormGroup;

  showAddActivityModal = false;
  showAddEventForm = false;
  // Add these properties to the class
activityFilter: string = '';
filteredActivities: any[] = [];

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    events: [],
    height: 'auto'
  };

  constructor(
    private route: ActivatedRoute,
    private programService: ProgramService,
    private activityService: ActivityService,
    private eventService: EventService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.activityForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });

    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const programId = Number(this.route.snapshot.paramMap.get('id'));
    if (programId) {
      this.loadProgram(programId);
      this.loadActivities(programId);
      this.loadEvents(programId);
    }
    this.filteredActivities = this.activities; // Initialize
  }

  loadProgram(programId: number): void {
    this.programService.getProgramById(programId).subscribe({
      next: (data) => {
        this.program = data;
      },
      error: (err) => {
        console.error('❌ Error fetching program', err);
      }
    });
  }

 // Update loadActivities to refresh filteredActivities
loadActivities(programId: number): void {
  this.activityService.getActivitiesByProgram(programId).subscribe({
    next: (data) => {
      this.activities = data;
      this.filteredActivities = data; // Update filtered list
      this.calendarOptions.events = data.map((activity: any) => ({
        title: activity.name,
        start: activity.startDate,
        end: activity.endDate
      }));
    },
    error: (err) => {
      console.error('❌ Error loading activities', err);
    }
  });}

  loadEvents(programId: number): void {
    this.eventService.getEventsByProgram(programId).subscribe({
      next: (events) => {
        this.calendarOptions.events = [
          ...this.calendarOptions.events as any[],
          ...events.map(event => ({
            title: event.title,
            start: event.startDate
          }))
        ];
      },
      error: (err) => {
        console.error('❌ Error loading events', err);
      }
    });
  }

  toggleActivityModal(): void {
    this.showAddActivityModal = !this.showAddActivityModal;
    if (!this.showAddActivityModal) {
      this.activityForm.reset();
    }
  }

  addActivity(): void {
    if (this.activityForm.invalid || !this.program?.id) return;

    const newActivity = {
      ...this.activityForm.value,
      program: { id: this.program.id }
    };

    this.activityService.createActivity(newActivity, this.program.id).subscribe({
      next: () => {
        this.activityForm.reset();
        this.showAddActivityModal = false;
        this.loadActivities(this.program.id);
      },
      error: (err) => {
        console.error('❌ Error adding activity', err);
      }
    });
  }

  toggleEventForm(): void {
    this.showAddEventForm = !this.showAddEventForm;
    if (!this.showAddEventForm) {
      this.eventForm.reset();
    }
  }

  addEvent(): void {
    if (this.eventForm.invalid || !this.program?.id) return;

    const formValue = this.eventForm.value;
    const newEvent = {
      name: formValue.name,
      description: formValue.description,
      startDate: formValue.startDate
    };

    this.eventService.createEvent(newEvent, this.program.id).subscribe({
      next: (savedEvent) => {
        const calendarApi = (document.querySelector('full-calendar') as any)?.getApi?.();
        const calendarEvent = {
          title: savedEvent.title,
          start: savedEvent.startDate
        };

        if (calendarApi) {
          calendarApi.addEvent(calendarEvent);
        } else {
          this.calendarOptions.events = [
            ...(this.calendarOptions.events as any[]),
            calendarEvent
          ];
        }

        this.eventForm.reset();
        this.showAddEventForm = false;
      },
      error: (err) => {
        console.error('❌ Error saving event', err);
      }
    });
  }

  goToKanban(activityId: number): void {
    this.router.navigate(['/Activities', activityId]);
  }
  // Add filter method
filterActivities(): void {
  if (!this.activityFilter) {
    this.filteredActivities = this.activities;
    return;
  }
  this.filteredActivities = this.activities.filter(act =>
    act.name.toLowerCase().includes(this.activityFilter.toLowerCase())
  );
}


  }
