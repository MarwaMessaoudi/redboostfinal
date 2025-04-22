import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChatComponent } from '../chat/chat.component';
import { Subscription } from 'rxjs';
import { AuthService } from '../../service/auth.service';

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

interface User {
  id: number;
  name: string;
  avatar: string;
}

@Component({
  selector: 'app-gestion-communication',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent],
  templateUrl: './gestion-communication.component.html',
  styleUrls: ['./gestion-communication.component.scss']
})
export class GestionCommunicationComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  currentUserId: number | null = null;
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
  private userCache: Map<number, RoleSpecificUser> = new Map();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    // Fetch current user dynamically
    this.subscriptions.push(
      this.authService.getCurrentUser().subscribe({
        next: (userData) => {
          if (userData) {
            this.currentUserId = userData.id;
            
            // Fetch complete user data using the ID
            this.getUserProfile(userData.id).then(userDetails => {
              if (userDetails) {
                this.currentUser = {
                  id: userDetails.id,
                  name: `${userDetails.firstName || 'Unknown'} ${userDetails.lastName || ''}`.trim(),
                  avatar: userDetails.profile_pictureurl || 'assets/avatars/user.jpg'
                };
                this.loadConversations();
              }
            }).catch(err => {
              console.error('Error fetching user profile:', err);
              // Set default user and try to load conversations anyway
              this.currentUser = {
                id: userData.id,
                name: 'Unknown User',
                avatar: 'assets/avatars/user.jpg'
              };
              this.loadConversations();
            });
          } else {
            console.error('No user logged in');
          }
        },
        error: (err) => {
          console.error('Error retrieving current user:', err);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // User profile fetching with caching
  private getUserProfile(userId: number): Promise<RoleSpecificUser> {
    if (this.userCache.has(userId)) {
      return Promise.resolve(this.userCache.get(userId)!);
    }

    return new Promise((resolve, reject) => {
      this.http.get<RoleSpecificUser>(`http://localhost:8085/users/${userId}`).subscribe({
        next: (userDetails) => {
          if (userDetails) {
            // Clean and validate the user data
            const validatedUser: RoleSpecificUser = {
              id: userDetails.id ?? userId,
              firstName: userDetails.firstName || 'Unknown',
              lastName: userDetails.lastName || 'User',
              email: userDetails.email || '',
              phoneNumber: userDetails.phoneNumber || '',
              role: userDetails.role || '',
              isActive: userDetails.isActive ?? false,
              profile_pictureurl: userDetails.profile_pictureurl || 'assets/avatars/user.jpg',
              specialization: userDetails.specialization,
              yearsOfExperience: userDetails.yearsOfExperience,
              StartupName: userDetails.StartupName,
              Industry: userDetails.Industry,
              showOptions: false,
              selected: false
            };
            this.userCache.set(userId, validatedUser);
            resolve(validatedUser);
          } else {
            reject(new Error('User data is null or undefined'));
          }
        },
        error: (err) => {
          console.error(`Failed to fetch user ${userId}:`, err);
          // Create a fallback user when fetch fails
          const fallbackUser: RoleSpecificUser = {
            id: userId,
            firstName: 'Unknown',
            lastName: 'User',
            email: '',
            phoneNumber: '',
            role: '',
            isActive: false,
            profile_pictureurl: 'assets/avatars/user.jpg',
            showOptions: false,
            selected: false
          };
          // Still cache the fallback to avoid repeated failed requests
          this.userCache.set(userId, fallbackUser);
          resolve(fallbackUser);
        }
      });
    });
  }

  private loadConversations(): void {
    if (!this.currentUserId) {
      console.error('Cannot load conversations: No user ID available');
      return;
    }
    
    this.subscriptions.push(
      this.http.get<ConversationDTO[]>('http://localhost:8085/api/conversations').subscribe({
        next: conversations => {
          // Use Promise.all to wait for all mapping operations to complete
          Promise.all(
            conversations.map(conv => this.mapToChatItem(conv))
          ).then(chatItems => {
            this.chats = chatItems.filter(chat => !chat.isGroup);
            this.groups = chatItems.filter(chat => chat.isGroup);
          }).catch(err => {
            console.error('Error mapping conversations:', err);
          });
        },
        error: err => console.error('Error loading conversations:', err)
      })
    );
  }

  private async mapToChatItem(conv: ConversationDTO): Promise<ChatItem> {
    const isGroup = conv.estGroupe;
    
    if (isGroup) {
      // Handle group conversation
      try {
        // Map participant IDs to usernames and avatars
        const participants = await Promise.all(
          conv.participantIds
            .filter(id => id !== this.currentUserId)
            .slice(0, 4) // Limit to 4 participants for the combined avatar
            .map(id => this.getUserProfile(id))
        );
        
        const participantNames = participants.map(p => `${p.firstName}`).join(', ');
        const participantAvatars = participants.map(p => p.profile_pictureurl || 'assets/avatars/user.jpg');
        
        // Generate combined avatar for group
        const groupAvatar = await this.generateCombinedAvatar(participantAvatars);
        
        return {
          id: Number(`group${conv.id}`), // Use a special ID format for groups
          name: conv.titre || `Group (${participantNames})`,
          avatar: groupAvatar,
          lastMessage: '',
          time: '',
          unreadCount: 0,
          conversationId: conv.id,
          isGroup: true
        };
      } catch (err) {
        console.error('Error creating group chat item:', err);
        return {
          id: Number(`group${conv.id}`),
          name: conv.titre || 'Unknown Group',
          avatar: 'assets/avatars/group.jpg',
          lastMessage: '',
          time: '',
          unreadCount: 0,
          conversationId: conv.id,
          isGroup: true
        };
      }
    } else {
      // Handle private conversation
      const otherUserId = conv.participantIds.find(id => id !== this.currentUserId);
      
      if (!otherUserId) {
        return {
          id: 0,
          name: 'Unknown User',
          avatar: 'assets/avatars/user.jpg',
          lastMessage: '',
          time: '',
          unreadCount: 0,
          conversationId: conv.id,
          isGroup: false
        };
      }
      
      try {
        const otherUser = await this.getUserProfile(otherUserId);
        return {
          id: otherUser.id,
          name: `${otherUser.firstName} ${otherUser.lastName}`,
          avatar: otherUser.profile_pictureurl || 'assets/avatars/user.jpg',
          lastMessage: '',
          time: '',
          unreadCount: 0,
          conversationId: conv.id,
          isGroup: false
        };
      } catch (err) {
        console.error(`Error fetching user ${otherUserId}:`, err);
        return {
          id: otherUserId,
          name: 'Unknown User',
          avatar: 'assets/avatars/user.jpg',
          lastMessage: '',
          time: '',
          unreadCount: 0,
          conversationId: conv.id,
          isGroup: false
        };
      }
    }
  }

  private async generateCombinedAvatar(imageUrls: string[]): Promise<string> {
    if (imageUrls.length === 0) {
      return 'assets/avatars/group.jpg'; // Fallback for empty groups
    }
  
    const canvas = document.createElement('canvas');
    canvas.width = 100; // Size of the combined avatar
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return 'assets/avatars/group.jpg'; // Fallback if canvas context is unavailable
    }
  
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Define layout based on number of images
    const layouts: { [key: number]: { x: number; y: number; width: number; height: number }[] } = {
      1: [{ x: 0, y: 0, width: 100, height: 100 }],
      2: [
        { x: 0, y: 0, width: 50, height: 100 },
        { x: 50, y: 0, width: 50, height: 100 }
      ],
      3: [
        { x: 0, y: 0, width: 50, height: 50 },
        { x: 50, y: 0, width: 50, height: 50 },
        { x: 0, y: 50, width: 100, height: 50 }
      ],
      4: [
        { x: 0, y: 0, width: 50, height: 50 },
        { x: 50, y: 0, width: 50, height: 50 },
        { x: 0, y: 50, width: 50, height: 50 },
        { x: 50, y: 50, width: 50, height: 50 }
      ]
    };
  
    const layout = layouts[Math.min(imageUrls.length, 4)] || layouts[1];
    
    try {
      const images = await Promise.all(
        imageUrls.slice(0, 4).map(url =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous'; // Handle cross-origin images if needed
            img.onload = () => resolve(img);
            img.onerror = () => {
              const fallbackImg = new Image();
              fallbackImg.src = 'assets/avatars/user.jpg';
              fallbackImg.onload = () => resolve(fallbackImg);
              fallbackImg.onerror = reject;
            };
            img.src = url;
          })
        )
      );
    
      // Draw images onto canvas
      images.forEach((img, index) => {
        if (index >= layout.length) return;
        const { x, y, width, height } = layout[index];
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.clip();
        ctx.drawImage(img, x, y, width, height);
        ctx.restore();
      });
    
      // Convert canvas to data URL
      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error('Error generating combined avatar:', err);
      return 'assets/avatars/group.jpg';
    }
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
    if (!this.currentUserId) {
      console.error('Cannot retrieve users: No user ID available');
      return;
    }
    this.subscriptions.push(
      this.http.get<RoleSpecificUser[]>('http://localhost:8085/users/role-specific').subscribe({
        next: (users) => {
          this.availableUsers = users
            .filter(user => user.id !== this.currentUserId)
            .map(user => ({ ...user, showOptions: false, selected: false }));
          this.showUserModal = true;
        },
        error: (err) => {
          console.error('Error retrieving users:', err);
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
    if (!this.currentUserId) {
      console.error('Cannot start private conversation: No user ID available');
      return;
    }
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
        error: (err) => console.error('Error creating private conversation:', err)
      })
    );
  }

  startGroupChat(user: RoleSpecificUser): void {
    if (!this.currentUserId) {
      console.error('Cannot start group chat: No user ID available');
      return;
    }
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
          console.error('Error retrieving users for group chat:', err);
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
    if (!this.currentUserId) {
      console.error('Cannot create group: No user ID available');
      return;
    }
    if (!this.groupName.trim()) {
      alert('Please enter a group name.');
      return;
    }
    if (this.selectedUsers.length < 1) {
      alert('Please select at least one user.');
      return;
    }

    const memberIds = [...new Set([this.currentUserId, ...this.selectedUsers.map(u => u.id)])];
    const payload = {
      name: this.groupName,
      memberIds
    };

    this.subscriptions.push(
      this.http.post<ConversationDTO>('http://localhost:8085/api/conversations/group', payload).subscribe({
        next: async (conv) => {
          // Get avatars for the combined group avatar
          const avatarUrls = await Promise.all(
            this.selectedUsers.slice(0, 4).map(async user => {
              return user.profile_pictureurl || 'assets/avatars/user.jpg';
            })
          );
          
          const groupAvatar = await this.generateCombinedAvatar(avatarUrls);
          
          const newGroup: ChatItem = {
            id: Number(`group${conv.id}`),
            name: this.groupName,
            avatar: groupAvatar,
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
          console.error('Error creating group chat:', err);
          alert('Failed to create group chat.');
        }
      })
    );
  }

  deleteConversation(conversationId: number, event: Event): void {
    event.stopPropagation(); // Prevent opening the chat

    if (!confirm('Are you sure you want to delete this conversation? This action is irreversible.')) {
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
          console.error('Error deleting conversation:', err);
          alert(`Failed to delete conversation: ${err.error || 'Server error'}`);
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
}