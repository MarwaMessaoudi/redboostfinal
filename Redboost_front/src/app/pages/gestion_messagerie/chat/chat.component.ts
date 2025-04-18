import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, SimpleChanges, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subscription } from 'rxjs';
import { AuthService } from '../../service/auth.service';
import { UserService } from '../../service/UserService'; // Import UserService
interface ChatItem {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  status?: string;
  unreadCount?: number;
  conversationId: number;
  isGroup?: boolean;
}

interface User {
  name: string;
  avatar: string;
}
interface Reaction {
  id?: number;
  userId: number;
  username: string;
  emoji: string;
}


interface Message {
  id?: number;
  text: string;
  time: string;
  sent: boolean;
  read?: boolean;
  file?: {
    name: string;
    size: string;
    url: string;
  };
  showOptions: boolean;
  showReactionPicker?: boolean;
  senderAvatar?: string;
  reactions?: Reaction[];
}

interface MessageDTO {
  id?: number;
  content: string;
  timestamp: string;
  senderId: number;
  senderName: string;
  recipientId?: number;
  conversationId?: number;
  groupId?: number;
  isRead: boolean;
  senderAvatar?: string;
  reactionMessages?: {
    id: number;
    userId: number;
    username: string;
    emoji: string;
  }[];
}
interface PrivateMessageRequest {
  senderId: number;
  recipientId: number;
  content: string;
}

interface GroupMessageRequest {
  senderId: number;
  conversationId: number;
  content: string;
}

interface UpdateMessageRequest {
  userId: number;
  newContent: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() currentChat!: ChatItem;
  @Input() currentUser!: User;
  @Output() goBack = new EventEmitter<void>();

  newMessage: string = '';
  selectedFile: File | null = null;
  messages: Message[] = [];
  private wsSubject!: WebSocketSubject<any>;
  private subscriptions: Subscription[] = [];
  private currentUserId: number | null = null;
  isEditing: boolean = false;
  editingMessageIndex: number = -1;
  isLoading: boolean = false;
  availableEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService, 
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('document:click', ['$event'])
  closeDropdowns(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.message-options') && !target.closest('.reaction-picker')) {
      this.messages = this.messages.map(msg => ({ 
        ...msg, 
        showOptions: false,
        showReactionPicker: false
      }));
      this.cdr.detectChanges();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentChat'] && changes['currentChat'].currentValue !== changes['currentChat'].previousValue) {
      this.messages = [];
      this.newMessage = '';
      this.isEditing = false;
      this.editingMessageIndex = -1;
      if (this.wsSubject) {
        this.wsSubject.complete();
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];
      }
      if (this.currentUserId) {
        this.setupWebSocket();
        this.loadMessages();
      }
    }
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.currentUserId = user.id;
          this.setupWebSocket();
          this.loadMessages();
        } else {
          console.error('Aucun utilisateur connecté');
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l’utilisateur:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.wsSubject) {
      this.wsSubject.complete();
    }
  }

  private setupWebSocket(): void {
    if (!this.currentUserId) {
      console.error('Impossible de configurer WebSocket: Aucun ID utilisateur disponible');
      return;
    }

    this.wsSubject = webSocket('ws://localhost:8085/ws');

    this.subscriptions.push(
      this.wsSubject.subscribe({
        next: (message: MessageDTO) => {
          if (
            (this.isGroupChat() && message.conversationId === this.currentChat.conversationId) ||
            (!this.isGroupChat() &&
              ((message.senderId === this.currentUserId && message.recipientId === this.currentChat.id) ||
               (message.recipientId === this.currentUserId && message.senderId === this.currentChat.id)))
          ) {
            this.fetchAndMapMessage(message);
          }
        },
        error: err => console.error('Erreur WebSocket:', err),
        complete: () => console.log('Connexion WebSocket fermée')
      })
    );
  }

  private isGroupChat(): boolean {
    return this.currentChat.isGroup ||
           this.currentChat.name?.toLowerCase().includes('groupe') ||
           (!this.currentChat.id && !!this.currentChat.conversationId) ||
           this.currentChat.avatar?.toLowerCase().includes('group') || false;
  }

  private loadMessages(): void {
    if (!this.currentUserId || !this.currentChat.conversationId) {
      console.error('Impossible de charger les messages: ID utilisateur ou ID de conversation manquant');
      return;
    }

    this.isLoading = true;
    this.http.get<MessageDTO[]>(`http://localhost:8085/api/messages/conversation/${this.currentChat.conversationId}`).subscribe({
      next: messages => {
        // Fetch avatars for all messages
        Promise.all(messages.map(dto => this.fetchAndMapMessage(dto))).then(mappedMessages => {
          this.messages = mappedMessages.filter(msg => msg !== null) as Message[];
          this.scrollToBottom();
          const unreadMessageIds = messages
            .filter(m => !m.isRead && m.recipientId === this.currentUserId)
            .map(m => m.id!);
          if (unreadMessageIds.length > 0) {
            this.http.put('http://localhost:8085/api/messages/mark-as-read', unreadMessageIds, {
              params: { userId: this.currentUserId!.toString() }
            }).subscribe();
          }
          this.isLoading = false;
        });
      },
      error: err => {
        console.error(`Erreur lors du chargement des messages pour la conversation ${this.currentChat.conversationId}:`, err);
        this.isLoading = false;
      }
    });
  }

  private fetchAndMapMessage(dto: MessageDTO): Promise<Message | null> {
    return new Promise((resolve) => {
      // If senderAvatar is already in MessageDTO, use it (future-proofing)
      if (dto.senderAvatar) {
        resolve(this.mapToMessage(dto));
        return;
      }

      // Fetch sender's profile to get profile_pictureurl
      this.userService.getUserById(dto.senderId).subscribe({
        next: (user) => {
          const avatar = user?.profile_pictureurl || 'assets/default-avatar.png';
          resolve(this.mapToMessage({ ...dto, senderAvatar: avatar }));
        },
        error: () => {
          resolve(this.mapToMessage({ ...dto, senderAvatar: 'assets/default-avatar.png' }));
        }
      });
    });
  }

  private mapToMessage(dto: MessageDTO): Message {
    return {
      id: dto.id,
      text: dto.content,
      time: new Date(dto.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: dto.senderId === this.currentUserId,
      read: dto.isRead,
      showOptions: false,
      showReactionPicker: false,
      senderAvatar: dto.senderAvatar || 'assets/default-avatar.png',
      reactions: dto.reactionMessages?.map(r => ({
        id: r.id,
        userId: r.userId,
        username: r.username,
        emoji: r.emoji
      })) || []
    };
  }

  toggleReactionPicker(index: number): void {
    this.messages = this.messages.map((msg, i) => ({
      ...msg,
      showReactionPicker: i === index ? !msg.showReactionPicker : false,
      showOptions: false
    }));
    this.cdr.detectChanges();
  }

  addReaction(messageIndex: number, emoji: string): void {
    if (!this.currentUserId) return;

    const message = this.messages[messageIndex];
    if (!message.id) return;

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions?.find(r => 
      r.userId === this.currentUserId && r.emoji === emoji
    );

    if (existingReaction) {
      this.removeReaction(messageIndex, existingReaction.id!);
      return;
    }

    this.http.post<MessageDTO>(
      `http://localhost:8085/api/messages/${message.id}/reactions`,
      null,
      {
        params: {
          userId: this.currentUserId.toString(),
          emoji
        }
      }
    ).subscribe({
      next: (updatedMessage) => {
        this.fetchAndMapMessage(updatedMessage).then(mappedMessage => {
          if (mappedMessage) {
            this.messages[messageIndex] = mappedMessage;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error adding reaction:', err);
      }
    });
  }

  removeReaction(messageIndex: number, reactionId: number): void {
    if (!this.currentUserId) return;

    const message = this.messages[messageIndex];
    if (!message.id) return;

    this.http.delete<MessageDTO>(
      `http://localhost:8085/api/messages/${message.id}/reactions`,
      {
        params: {
          userId: this.currentUserId.toString()
        }
      }
    ).subscribe({
      next: (updatedMessage) => {
        this.fetchAndMapMessage(updatedMessage).then(mappedMessage => {
          if (mappedMessage) {
            this.messages[messageIndex] = mappedMessage;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error removing reaction:', err);
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.currentUserId) return;

    this.isLoading = true;
    const isGroupChat = this.isGroupChat();
    if (isGroupChat) {
      this.sendGroupMessage();
    } else {
      this.sendPrivateMessage();
    }
    if (this.selectedFile) {
      console.warn('Téléchargement de fichier non implémenté dans le backend');
      console.warn('Selected file:', this.selectedFile);
    }
  }

  private sendPrivateMessage(): void {
    if (!this.currentUserId || !this.currentChat.id) {
      console.error('Impossible d’envoyer un message privé: ID utilisateur ou ID destinataire manquant');
      this.isLoading = false;
      return;
    }

    const request: PrivateMessageRequest = {
      senderId: this.currentUserId,
      recipientId: this.currentChat.id,
      content: this.newMessage
    };

    this.http.post<MessageDTO>('http://localhost:8085/api/messages/private', request).subscribe({
      next: (response) => {
        this.fetchAndMapMessage(response).then(message => {
          if (message) {
            this.messages.push(message);
            this.scrollToBottom();
            this.newMessage = '';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de l’envoi du message privé:', error);
        this.isLoading = false;
      }
    });
  }

  private sendGroupMessage(): void {
    if (!this.currentUserId || !this.currentChat.conversationId) {
      console.error('Impossible d’envoyer un message de groupe: ID utilisateur ou ID de conversation manquant');
      this.isLoading = false;
      return;
    }

    const request: GroupMessageRequest = {
      senderId: this.currentUserId,
      conversationId: this.currentChat.conversationId,
      content: this.newMessage
    };

    this.http.post<MessageDTO>('http://localhost:8085/api/messages/group', request).subscribe({
      next: (response) => {
        this.fetchAndMapMessage(response).then(message => {
          if (message) {
            this.messages.push(message);
            this.scrollToBottom();
            this.newMessage = '';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de l’envoi du message de groupe:', error);
        this.isLoading = false;
      }
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }

  toggleMessageOptions(index: number): void {
    this.messages = this.messages.map((msg, i) => ({
      ...msg,
      showOptions: i === index ? !msg.showOptions : false
    }));
    this.cdr.detectChanges();
  }

  editMessage(index: number): void {
    if (!this.messages[index].sent) return;

    this.isEditing = true;
    this.editingMessageIndex = index;
    this.newMessage = this.messages[index].text;
    this.messages[index].showOptions = false;
    this.cdr.detectChanges();

    setTimeout(() => {
      const inputField = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputField) inputField.focus();
    }, 100);
  }

  updateMessage(): void {
    if (!this.newMessage.trim() || this.editingMessageIndex === -1 || !this.currentUserId) {
      console.error('Impossible de mettre à jour le message: État invalide');
      return;
    }

    const messageToUpdate = this.messages[this.editingMessageIndex];
    if (!messageToUpdate.id) {
      console.error('Impossible de mettre à jour le message: Aucun ID de message');
      return;
    }

    this.isLoading = true;
    const request: UpdateMessageRequest = {
      userId: this.currentUserId,
      newContent: this.newMessage
    };

    this.http.put<MessageDTO>(`http://localhost:8085/api/messages/${messageToUpdate.id}`, request).subscribe({
      next: (response) => {
        this.fetchAndMapMessage(response).then(message => {
          if (message) {
            this.messages[this.editingMessageIndex] = message;
            this.isEditing = false;
            this.editingMessageIndex = -1;
            this.newMessage = '';
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du message:', error);
        alert('Échec de la mise à jour du message.');
        this.isLoading = false;
      }
    });
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.editingMessageIndex = -1;
    this.newMessage = '';
    this.cdr.detectChanges();
  }

  deleteMessage(index: number): void {
    if (!this.messages[index].sent || !this.currentUserId) return;
  
    const messageToDelete = this.messages[index];
    if (!messageToDelete.id) {
      console.error('Impossible de supprimer le message: Aucun ID de message');
      return;
    }
  
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }
  
    this.isLoading = true;
    this.http.delete<MessageDTO>(`http://localhost:8085/api/messages/${messageToDelete.id}`, {
      params: { userId: this.currentUserId.toString() }
    }).subscribe({
      next: (updatedMessage) => {
        // Update the message in the messages array with the new content ("Message retiré")
        this.fetchAndMapMessage(updatedMessage).then(mappedMessage => {
          if (mappedMessage) {
            this.messages[index] = mappedMessage; // Update the message instead of removing it
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du message:', error);
        alert('Échec de la suppression du message.');
        this.isLoading = false;
      }
    });
  }
}