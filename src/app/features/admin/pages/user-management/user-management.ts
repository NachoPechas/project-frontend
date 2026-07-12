import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { History } from '../../../history/pages/history/history';
import { AutomationService } from '../../../../core/services/automation.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { AdminApiService, UserSession } from '../../../../core/services/api/admin-api.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, History],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagement implements OnInit {
  readonly authService = inject(AuthService);
  readonly automationService = inject(AutomationService);
  private readonly adminApi = inject(AdminApiService);

  searchQuery = signal<string>('');
  statusFilter = signal<string>('Todos los estados');
  selectedUserId = signal<number | null>(null);
  users = signal<UserSession[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  filteredUsers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    return this.users().filter((user) => {
      const matchesSearch = !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        String(user.id).includes(query);

      let matchesStatus = true;
      if (this.statusFilter() === 'Solo Bloqueados') {
        matchesStatus = user.status === 'Bloqueado';
      } else if (this.statusFilter() === 'Con Reservacion Activa') {
        matchesStatus = user.hasActiveBooking;
      }

      return matchesSearch && matchesStatus;
    });
  });

  toggleStatus(user: UserSession): void {
    const newStatusBackend = user.status === 'Activo' ? 'Suspendido' : 'Activo';
    
    this.adminApi.updateUserStatus(user.id, newStatusBackend).subscribe({
      next: () => {
        this.users.update(currentUsers => 
          currentUsers.map(u => 
            u.id === user.id 
              ? { ...u, status: newStatusBackend === 'Suspendido' ? 'Bloqueado' : 'Activo' } 
              : u
          )
        );
      },
      error: (err) => {
        alert('No se pudo actualizar el usuario: ' + err.message);
      }
    });
  }

  selectedUser = computed(() => {
    return this.users().find((user) => user.id === this.selectedUserId()) ?? null;
  });

  ngOnInit(): void {
    this.loadUsers();
    this.automationService.loadNotifications();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminApi.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.users.set([]);
        this.isLoading.set(false);
      },
    });
  }

  inspectUserHistory(id: number): void {
    this.selectedUserId.set(id);
  }

  closeInspection(): void {
    this.selectedUserId.set(null);
  }
}
