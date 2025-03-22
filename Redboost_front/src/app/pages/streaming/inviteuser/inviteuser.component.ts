// invite-users.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../models/user.model'; // Importer l’interface User
import { CommonModule } from '@angular/common'; // Importer CommonModule pour *ngFor et ngClass
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-invite-users',
  standalone: true,
  imports: [CommonModule, MatIconModule], // Importer CommonModule et MatIconModule
  template: `
    <h2 mat-dialog-title>Inviter des utilisateurs</h2>
    <mat-dialog-content>
      <ul>
        <li *ngFor="let user of data.users">
          {{ user.username }}
          <button mat-button (click)="inviteUser(user)">Invite</button>
        </li>
      </ul>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="dialogRef.close()">Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    ul { list-style: none; padding: 0; }
    li { margin: 10px 0; display: flex; justify-content: space-between; align-items: center; }
    button { background-color: #007bff; color: white; margin-left: 10px; }
    button:hover { background-color: #0056b3; }
  `]
})
export class InviteUsersComponent {
  constructor(
    public dialogRef: MatDialogRef<InviteUsersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { users: User[], meetingId: number }
  ) {}

  inviteUser(user: User): void {
    console.log(`Utilisateur invité : ${user.username} pour la réunion ${this.data.meetingId}`);
    // Ajoutez ici la logique pour inviter l’utilisateur (par exemple, appeler une API backend)
    this.dialogRef.close(user);
  }
}