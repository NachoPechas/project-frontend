import { Routes } from '@angular/router';

import { Login } from './features/auth/pages/login/login';
import { Dashboard } from './features/dashboard/pages/dashboard/dashboard';
import { Resources } from './features/resources/pages/resources/resources';
import { Catalog } from './features/catalog/pages/catalog/catalog'; 
import { History } from './features/history/pages/history/history';
import { UserManagement } from './features/admin/pages/user-management/user-management';
import { Analytics } from './features/admin/pages/analytics/analytics'; 
import { roleGuard } from './core/guards/role.guard';  



export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
    
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [roleGuard(['admin', 'student'])],
  },
  {
    path: 'resources',
    component: Resources,
    canActivate: [roleGuard(['admin', 'student'])],
  },
  {
    path: 'catalog',
    component: Catalog,
    canActivate: [roleGuard(['admin', 'student'])],
  },
  {
    path: 'history',
    component: History,
    canActivate: [roleGuard(['admin', 'student'])],

  },
  {
    path: 'user-management',
    component: UserManagement,
    canActivate: [roleGuard(['admin'])],
  },
  {
    path: 'analytics',
    component: Analytics,
    canActivate: [roleGuard(['admin'])],
  }
];