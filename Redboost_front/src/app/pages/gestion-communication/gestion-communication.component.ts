import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChatComponent } from '../chat/chat.component';
import { Subscription } from 'rxjs';

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

interface ConversationDTO {
  id: number;
  titre: string;
  estGroupe: boolean;
  creatorId?: number;
  participantIds: number[];
}

interface RoleSpecificUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  profile_pictureurl?: string;
  specialization?: string;
  yearsOfExperience?: number;
  StartupName?: string;
  Industry?: string;
  showOptions?: boolean;
  selected?: boolean;
}

@Component({
  selector: 'app-gestion-communication',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent],
  templateUrl: './gestion-communication.component.html',
  styleUrls: ['./gestion-communication.component.scss']
})
export class GestionCommunicationComponent implements OnInit, OnDestroy {
  currentUser = {
    name: 'Johan',
    avatar: 'assets/avatars/user.jpg'
  };

  activeTab = 'chats';
  chats: ChatItem[] = [];
  groups: ChatItem[] = [];
  searchTerm: string = '';
  selectedChat: ChatItem | null = null;
  showChatDetail: boolean = false;
  isMobileView: boolean = false;
  showUserModal: boolean = false;
  showGroupModal: boolean = false;
  availableUsers: RoleSpecificUser[] = [];
  selectedUsers: RoleSpecificUser[] = [];
  groupName: string = '';
  initialGroupUser: RoleSpecificUser | null = null;
  private subscriptions: Subscription[] = [];

  constructor(private http: HttpClient) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.loadConversations();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadConversations(): void {
    this.subscriptions.push(
      this.http.get<ConversationDTO[]>('http://localhost:8085/api/conversations').subscribe({
        next: conversations => {
          this.chats = conversations
            .filter(conv => !conv.estGroupe)
            .map(conv => this.mapToChatItem(conv));
          this.groups = conversations
            .filter(conv => conv.estGroupe)
            .map(conv => this.mapToChatItem(conv));
        },
        error: err => console.error('Erreur lors du chargement des conversations:', err)
      })
    );
  }

  private mapToChatItem(conv: ConversationDTO): ChatItem {
    return {
      id: conv.estGroupe ? Number(`group${conv.id}`) : conv.participantIds.find(id => id !== this.currentUserId) || 0,
      name: conv.titre,
      avatar: conv.estGroupe ? 'assets/avatars/group.jpg' : 'assets/avatars/user.jpg',
      lastMessage: '',
      time: '',
      unreadCount: 0,
      conversationId: conv.id,
      isGroup: conv.estGroupe
    };
  }

  @HostListener('window:resize', ['$event'])
  checkScreenSize() {
    this.isMobileView = window.innerWidth < 768;
  }

  changeTab(tab: string): void {
    this.activeTab = tab;
  }

  searchChats(): void {
    // Implement if needed
  }

  addNewChat(): void {
    this.subscriptions.push(
      this.http.get<RoleSpecificUser[]>('http://localhost:8085/users/role-specific').subscribe({
        next: (users) => {
          this.availableUsers = users
            .filter(user => user.id !== this.currentUserId)
            .map(user => ({ ...user, showOptions: false, selected: false }));
          this.showUserModal = true;
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des utilisateurs:', err);
          this.availableUsers = [];
          this.showUserModal = true;
        }
      })
    );
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.availableUsers = [];
  }

  closeGroupModal(): void {
    this.showGroupModal = false;
    this.availableUsers = [];
    this.selectedUsers = [];
    this.groupName = '';
    this.initialGroupUser = null;
  }

  toggleUserOptions(userId: number): void {
    this.availableUsers = this.availableUsers.map(user => ({
      ...user,
      showOptions: user.id === userId ? !user.showOptions : false
    }));
  }

  startChatWithUser(user: RoleSpecificUser): void {
    this.startPrivateChat(user);
  }

  startPrivateChat(user: RoleSpecificUser): void {
    const existingChat = this.chats.find(chat => chat.id === user.id && !chat.isGroup);
    if (existingChat) {
      this.openChat(existingChat);
      this.closeUserModal();
      return;
    }

    const payload = {
      recipientId: user.id
    };

    this.subscriptions.push(
      this.http.post<ConversationDTO>('http://localhost:8085/api/conversations/private', payload).subscribe({
        next: (conv) => {
          const newChat: ChatItem = {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.profile_pictureurl || 'assets/avatars/user.jpg',
            lastMessage: '',
            time: '',
            unreadCount: 0,
            conversationId: conv.id,
            isGroup: false
          };
          this.chats.push(newChat);
          this.openChat(newChat);
          this.closeUserModal();
        },
        error: (err) => console.error('Erreur lors de la création de la conversation privée:', err)
      })
    );
  }

  startGroupChat(user: RoleSpecificUser): void {
    this.initialGroupUser = user;
    this.subscriptions.push(
      this.http.get<RoleSpecificUser[]>('http://localhost:8085/users/role-specific').subscribe({
        next: (users) => {
          this.availableUsers = users
            .filter(u => u.id !== this.currentUserId)
            .map(u => ({
              ...u,
              selected: u.id === user.id,
              showOptions: false
            }));
          this.selectedUsers = [user];
          this.groupName = `Groupe avec ${user.firstName} ${user.lastName}`;
          this.showUserModal = false;
          this.showGroupModal = true;
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des utilisateurs pour le chat de groupe:', err);
          this.availableUsers = [];
          this.showGroupModal = true;
        }
      })
    );
  }

  toggleUserSelection(user: RoleSpecificUser): void {
    if (user.id === this.initialGroupUser?.id) {
      return;
    }
    user.selected = !user.selected;
    if (user.selected) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
    }
  }

  createGroup(): void {
    if (!this.groupName.trim()) {
      alert('Veuillez entrer un nom de groupe.');
      return;
    }
    if (this.selectedUsers.length < 1) {
      alert('Veuillez sélectionner au moins un utilisateur.');
      return;
    }

    const memberIds = [...new Set([this.currentUserId, ...this.selectedUsers.map(u => u.id)])];
    const payload = {
      name: this.groupName,
      memberIds
    };

    this.subscriptions.push(
      this.http.post<ConversationDTO>('http://localhost:8085/api/conversations/group', payload).subscribe({
        next: (conv) => {
          const newGroup: ChatItem = {
            id: Number(`group${conv.id}`),
            name: this.groupName,
            avatar: 'assets/avatars/group.jpg',
            lastMessage: '',
            time: '',
            unreadCount: 0,
            conversationId: conv.id,
            isGroup: true
          };
          this.groups.push(newGroup);
          this.openChat(newGroup);
          this.closeGroupModal();
        },
        error: (err) => {
          console.error('Erreur lors de la création du chat de groupe:', err);
          alert('Échec de la création du chat de groupe.');
        }
      })
    );
  }

  deleteConversation(conversationId: number, event: Event): void {
    event.stopPropagation(); // Prevent opening the chat

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.')) {
      return;
    }

    this.subscriptions.push(
      this.http.delete(`http://localhost:8085/api/conversations/${conversationId}`).subscribe({
        next: () => {
          // Remove from chats or groups
          this.chats = this.chats.filter(chat => chat.conversationId !== conversationId);
          this.groups = this.groups.filter(group => group.conversationId !== conversationId);
          
          // If the deleted conversation is open, close the chat detail
          if (this.selectedChat?.conversationId === conversationId) {
            this.selectedChat = null;
            this.showChatDetail = false;
          }
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la conversation:', err);
          alert(`Échec de la suppression de la conversation: ${err.error || 'Erreur serveur'}`);
        }
      })
    );
  }

  get filteredChats(): ChatItem[] {
    const chatsToShow = this.activeTab === 'groups' ? this.groups : this.chats;
    if (!this.searchTerm.trim()) {
      return chatsToShow;
    }
    return chatsToShow.filter(chat =>
      chat.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openChat(chat: ChatItem): void {
    this.selectedChat = { ...chat };
    this.showChatDetail = true;
    if (chat.unreadCount) {
      chat.unreadCount = 0;
    }
  }

  backToList(): void {
    if (this.isMobileView) {
      this.showChatDetail = false;
      this.selectedChat = null;
    }
  }

  private get currentUserId(): number {
    return 1; // TODO: Replace with actual user ID from auth service
  }
}