import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { History } from '../../../history/pages/history/history';
import { AutomationService } from '../../../../core/services/automation.service';
import { AuthService } from '../../../../core/services/auth.service';
interface UserSession {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  status: 'Activo' | 'Bloqueado';
  hasActiveBooking: boolean;
  activeBookingDetails?: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, History],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagement {
  public authService = inject(AuthService);
  public automationService = inject(AutomationService);
  // Filtros de administración reactivos
  searchQuery = signal<string>('');
  statusFilter = signal<string>('Todos los estados'); 

  // Estado para controlar qué usuario se está inspeccionando
  selectedUserId = signal<string | null>(null);

  // Listado maestro de usuarios
  users = signal<UserSession[]>([
    {
      id: 'U-9401',
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@unilibrary.edu',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
      status: 'Activo',
      hasActiveBooking: true,
      activeBookingDetails: 'Desk A12 (Floor 2)'
    },
    {
      id: 'U-8824',
      name: 'Laura Sofía Gómez',
      email: 'laura.gomez@unilibrary.edu',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
      status: 'Bloqueado',
      hasActiveBooking: false
    },
    {
      id: 'U-7152',
      name: 'Andrés Felipe Ruiz',
      email: 'andres.ruiz@unilibrary.edu',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=60',
      status: 'Activo',
      hasActiveBooking: true,
      activeBookingDetails: 'Libro: Deep Learning (Ian Goodfellow)'
    },
    {
      id: 'U-6409',
      name: 'Mariana Silva',
      email: 'mariana.silva@unilibrary.edu',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60',
      status: 'Activo',
      hasActiveBooking: false
    }
  ]);

  // Lógica de filtrado combinado mediante Computed Signals
  filteredUsers = computed(() => {
    return this.users().filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                            user.id.toLowerCase().includes(this.searchQuery().toLowerCase());
      
      let matchesStatus = true;
      if (this.statusFilter() === 'Solo Bloqueados') {
        matchesStatus = user.status === 'Bloqueado';
      } else if (this.statusFilter() === 'Con Reservación Activa') {
        matchesStatus = user.hasActiveBooking === true;
      }

      return matchesSearch && matchesStatus;
    });
  });

  // Obtener el objeto completo del usuario seleccionado
  selectedUser = computed(() => {
    return this.users().find(u => u.id === this.selectedUserId()) || null;
  });

  inspectUserHistory(id: string) {
    this.selectedUserId.set(id);
  }

  closeInspection() {
    this.selectedUserId.set(null);
  }
}