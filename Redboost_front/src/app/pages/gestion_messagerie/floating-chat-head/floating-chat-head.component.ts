// src/app/floating-chat-head/floating-chat-head.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FloatingChatHeadService, ChatHead } from '../../service/floating-chat-head.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-floating-chat-head',
  templateUrl: './floating-chat-head.component.html',
  styleUrls: ['./floating-chat-head.component.scss']
})
export class FloatingChatHeadComponent implements OnInit, OnDestroy {
  chatHeads: ChatHead[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private floatingChatHeadService: FloatingChatHeadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.floatingChatHeadService.chatHeads$.subscribe(heads => {
        this.chatHeads = heads;
      })
    );
  }

  openChat(conversationId: number): void {
    this.floatingChatHeadService.markAsRead(conversationId);
    this.router.navigate(['/communication'], { queryParams: { conversationId } });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}