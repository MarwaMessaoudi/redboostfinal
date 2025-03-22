import { Component, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JitsiService } from '../services/Jitsi.Service';
import { FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-jitsi-meeting',
  templateUrl: './jitsi-meeting.component.html',
  styleUrls: ['./jitsi-meeting.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class JitsiMeetingComponent implements AfterViewInit {
  roomName: string = '';
  public jitsiApi: any;
  showInvite: boolean = false;
  showNote: boolean = false;
  currentNote: string = '';
  meetingNotes: { [key: string]: string } = {};
  users: any[] = [];
  filteredUsers: any[] = [];
  searchQuery: string = '';
  selectedRole: string = 'all';

  constructor(
    private http: HttpClient,
    private jitsiService: JitsiService
  ) {
    this.roomName = this.getRoomNameFromUrl() || 'default-room';
  }

  

  ngAfterViewInit() {
    this.loadJitsiMeeting();
    this.loadUsers();
  }

  private getRoomNameFromUrl(): string {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('roomName') || '';
  }

  async loadJitsiMeeting() {
    try {
      console.log('Tentative de chargement de Jitsi Meet avec roomName:', this.roomName);
      this.jitsiApi = await this.jitsiService.createMeeting(this.roomName);

      if (this.jitsiApi) {
        console.log('Jitsi API initialisée avec succès');
        this.jitsiApi.addEventListeners({
          readyToClose: () => {
            console.log('La réunion est terminée');
            this.jitsiApi = null;
          },
          participantJoined: (participant: any) => {
            console.log('Participant rejoint:', participant);
          },
          participantLeft: (participant: any) => {
            console.log('Participant parti:', participant);
          }
        });
      } else {
        console.error('Échec de l’initialisation de Jitsi API');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la réunion:', error);
    }
  }

  private async loadUsers(): Promise<void> {
    try {
      console.log('Loading users...');
      const users = await this.http.get<any[]>('http://localhost:8085/api/users').toPromise();
      console.log('Users received:', users);
      this.users = users || [];
      this.filteredUsers = this.users;
    } catch (error: any) {
      console.error('Error loading users:', error);
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