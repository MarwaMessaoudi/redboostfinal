import { Routes } from '@angular/router';
import { Startup } from './startup';

export default [
    { path: '', component: Startup }, 
    { path: '**', redirectTo: '/notfound' }
] as Routes;
