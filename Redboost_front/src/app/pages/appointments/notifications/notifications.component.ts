// src/app/views/appointments/notifications/notifications.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notification {
  id: number;
  message: string;
  date: string;
}

@Component({
  selector: 'app-appointments-notifications', // Updated selector to reflect new location
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  imports: [CommonModule], // Ajoute les modules nécessaires  
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [
    { id: 1, message: 'Nouveau rendez-vous avec Alice Dubois confirmé', date: '15 février 2024' },
    { id: 2, message: 'Rappel: Réunion avec Bernard Martin demain', date: '19 février 2024' }
  ];

  constructor() { }

  ngOnInit() { }
  deleteNotification(notificationId: number): void {
    // Implémentation pour supprimer la notification
    this.notifications = this.notifications.filter(notification => notification.id !== notificationId);
  }
  editNotification(notificationId: number): void {
    // Implémentation pour modifier la notification
    const notification = this.notifications.find(notification => notification.id === notificationId);
    if (notification) {
      // Logique pour éditer la notification (par exemple, afficher un formulaire d'édition)
      console.log('Modification de la notification', notification);
    }
  }
}
