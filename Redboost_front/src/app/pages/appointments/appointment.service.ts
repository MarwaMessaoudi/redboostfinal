import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RendezVous } from './models/rendez-vous.model'; // Adjust path as needed

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = 'http://localhost:8085/api/rendezvous';

  constructor(private http: HttpClient) {}

  getAllAppointments(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.apiUrl}/all`);
  }

  getAppointmentById(id: number): Observable<RendezVous> {
    return this.http.get<RendezVous>(`${this.apiUrl}/${id}`);
  }

  createAppointment(appointment: RendezVous): Observable<RendezVous> {
    const backendData = {
      ...appointment,
      heure: appointment.heure,
      status: appointment.status || 'PENDING', // Default to "PENDING"
    };
    return this.http.post<RendezVous>(`${this.apiUrl}/add`, backendData);
  }

  addToGoogleCalendar(appointment: RendezVous): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-to-google-calendar`, appointment);
  }

  updateAppointment(id: number, appointment: RendezVous): Observable<RendezVous> {
    const backendData = {
      ...appointment,
      heure: appointment.heure,
    };
    return this.http.put<RendezVous>(`${this.apiUrl}/update/${id}`, backendData);
  }

  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  getAppointmentsByCoach(coachId: number): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.apiUrl}/coach/${coachId}`);
  }

  updateAppointmentStatus(
    id: number,
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED',
    token?: string
  ): Observable<{ message: string; success: boolean }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    });
    return this.http.patch<{ message: string; success: boolean }>(
      `${this.apiUrl}/update-status/${id}`,
      JSON.stringify(status),
      { headers }
    );
  }

  getAcceptedAppointmentsByDate(date: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.apiUrl}/accepted?date=${date}&status=ACCEPTED`);
  }
}