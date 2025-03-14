import { Routes } from '@angular/router';
import { StartupInvestmentRequestsComponent } from './startup';

export default [
    { path: '', component: StartupInvestmentRequestsComponent }, 
    { path: '**', redirectTo: '/notfound' }
] as Routes;
