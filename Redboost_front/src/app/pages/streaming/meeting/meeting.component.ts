import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Meeting } from '../models/meeting.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { JitsiService } from '../services/Jitsi.Service';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class MeetingComponent implements OnInit {
  meetings: Meeting[] = [];
  newMeeting = {
    title: '',
    capacity: 2,
    startTime: '',
    endTime: '',
    host: { id: 1 }
  };

  users: any[] = [];
  filteredUsers: any[] = [];
  searchQuery: string = '';
  selectedRole: string = 'all';
  showInvite: boolean = false;
  showNote: boolean = false;
  currentNote: string = '';
  roomName: string = '';
  meetingNotes: { [key: string]: string } = {};
  public jitsiApi: any;

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private router: Router,
    private jitsiService: JitsiService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  async createMeeting() {
    try {
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json');

      // Générer un nom de salle unique
      const roomName = `redboost-${this.newMeeting.title.toLowerCase().replace(/\s+/g, '-')}`; // Unicité avec timestamp

      // Formater les dates pour le backend
      const formattedMeeting: Meeting = {
        title: this.newMeeting.title,
        capacity: this.newMeeting.capacity || 2,
        startTime: new Date(this.newMeeting.startTime).toISOString(),
        endTime: new Date(this.newMeeting.endTime).toISOString(),
        host: this.newMeeting.host,
        jitsiUrl: roomName
      };

      console.log('Données envoyées au backend:', formattedMeeting);

      const response = await this.http.post<Meeting>(
        'http://localhost:8085/api/meetings/create', 
        formattedMeeting,
        { headers }
      ).toPromise();
      
      console.log('Réunion créée avec succès:', response);

      // Générer l'URL de la réunion pour l'ouvrir dans un nouvel onglet
      const jitsiUrl = `http://localhost:8000/${roomName}`; // Ou https://localhost:8443 si HTTPS
      this.openJitsiInNewTab(jitsiUrl);

    } catch (error) {
      console.error('Erreur lors de la création de la réunion:', error);
    }
  }

  private openJitsiInNewTab(jitsiUrl: string) {
    // Ouvrir un nouvel onglet avec l'URL Jitsi
    window.open(jitsiUrl, '_blank');
  }

  private async loadUsers(): Promise<void> {
    try {
      console.log('Loading users...');
      const users = await this.userService.getAllUsers().toPromise();
      console.log('Users received:', users);
      if (Array.isArray(users)) {
        this.users = users;
      } else if (users && typeof users === 'object') {
        this.users = (users as any).data || [];
      }
      this.filteredUsers = this.users;
      console.log('Users array after assignment:', this.users);
    } catch (error: any) {
      console.error('Error loading users:', error);
      if (error?.error) {
        console.error('Error details:', error.error);
      }
    }
  }

  filterUsers() {
    let tempUsers = this.users;
    
    if (this.selectedRole !== 'all') {
      tempUsers = tempUsers.filter(user => 
        user.role.toLowerCase() === this.selectedRole.toLowerCase()
      );
    }
    
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      tempUsers = tempUsers.filter(user => 
        user.username.toLowerCase().includes(query)
      );
    }
    
    this.filteredUsers = tempUsers;
  }

  onRoleChange(role: string) {
    this.selectedRole = role;
    this.filterUsers();
  }

  toggleInvite() {
    this.showInvite = !this.showInvite;
    if (this.showInvite) {
      this.loadUsers();
    }
  }

  toggleNote() {
    this.showNote = !this.showNote;
  }

  saveNote() {
    if (this.currentNote.trim()) {
      const timestamp = new Date().toISOString();
      this.meetingNotes[timestamp] = this.currentNote;
      this.currentNote = '';
    }
  }

  inviteUser(userId: number) {
    console.log(`Inviting user with ID: ${userId}`);
  }
}