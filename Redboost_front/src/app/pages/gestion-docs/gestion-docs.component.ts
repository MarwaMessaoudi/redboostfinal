import { Component } from '@angular/core';
import { GestionFolderComponent } from '../gestion-docs/gestion-folder/gestion-folder.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-gestion-docs',
  standalone: true,
  imports: [GestionFolderComponent, CommonModule, HttpClientModule],
  templateUrl: './gestion-docs.component.html',
  styleUrls: ['./gestion-docs.component.scss']
})
export class GestionDocsComponent {
}