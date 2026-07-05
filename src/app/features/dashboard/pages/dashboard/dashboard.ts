import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

interface TimeSlot {
  session: string;
  hours: string;
}

interface Desk {
  id: string;
  status: 'available' | 'occupied' | 'reserved';
  location: string;
  amenities: string[];
  slots: TimeSlot[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  public authService = inject(AuthService);
  // 1. Guardamos el ID del asiento seleccionado actualmente
  selectedDeskId = signal<string>('A12');

  // 2. Base de datos simulada con las características de cada asiento
  desks = signal<Desk[]>([
    { 
      id: 'A12', status: 'available', location: 'Second Floor, North Wing',
      amenities: ['⚡ Power', '📶 Hi-Speed', '💺 Ergonomic'],
      slots: [{ session: 'Morning Session', hours: '10:00 - 14:00' }, { session: 'Evening Session', hours: '16:00 - 20:00' }]
    },
    { 
      id: 'A13', status: 'occupied', location: 'Second Floor, North Wing',
      amenities: ['📶 Hi-Speed', '💺 Ergonomic'],
      slots: [{ session: 'Morning Session', hours: '08:00 - 12:00' }]
    },
    { 
      id: 'A14', status: 'available', location: 'Second Floor, East Wing',
      amenities: ['⚡ Power', '📶 Hi-Speed', '🖥️ Monitor'],
      slots: [{ session: 'Full Day', hours: '09:00 - 18:00' }]
    },
    { 
      id: 'A15', status: 'reserved', location: 'Second Floor, Central Hub',
      amenities: ['📶 Hi-Speed', '🤫 Silent Zone'],
      slots: [{ session: 'Night Session', hours: '20:00 - 23:00' }]
    },
    { 
      id: 'A16', status: 'available', location: 'Second Floor, North Wing',
      amenities: ['⚡ Power', '📶 Hi-Speed'],
      slots: [{ session: 'Morning Session', hours: '10:00 - 14:00' }]
    },
    { 
      id: 'B01', status: 'occupied', location: 'Second Floor, West Corridor',
      amenities: ['📶 Hi-Speed'],
      slots: []
    },
    { 
      id: 'B02', status: 'occupied', location: 'Second Floor, West Corridor',
      amenities: ['⚡ Power', '📶 Hi-Speed'],
      slots: [{ session: 'Evening Session', hours: '16:00 - 20:00' }]
    },
    { 
      id: 'B03', status: 'reserved', location: 'Second Floor, Near Window',
      amenities: ['⚡ Power', '📶 Hi-Speed', '🌅 View'],
      slots: [{ session: 'Morning Session', hours: '10:00 - 14:00' }]
    },
    { 
      id: 'B04', status: 'available', location: 'Second Floor, North Wing',
      amenities: ['📶 Hi-Speed'],
      slots: [{ session: 'Evening Session', hours: '17:00 - 21:00' }]
    },
    { 
      id: 'B05', status: 'available', location: 'Second Floor, North Wing',
      amenities: ['⚡ Power', '💺 Ergonomic'],
      slots: [{ session: 'Morning Session', hours: '10:00 - 14:00' }]
    },
    { 
      id: 'C01', status: 'available', location: 'Second Floor, Entrance Left',
      amenities: ['📶 Hi-Speed'],
      slots: [{ session: 'Quick Study', hours: '12:00 - 14:00' }]
    },
    { 
      id: 'C02', status: 'available', location: 'Second Floor, Entrance Left',
      amenities: ['⚡ Power', '📶 Hi-Speed'],
      slots: [{ session: 'Morning Session', hours: '10:00 - 14:00' }]
    },
    { 
      id: 'C03', status: 'occupied', location: 'Second Floor, Entrance Right',
      amenities: ['📶 Hi-Speed'],
      slots: [{ session: 'Evening Session', hours: '16:00 - 20:00' }]
    },
    { 
      id: 'C04', status: 'available', location: 'Second Floor, Entrance Right',
      amenities: ['⚡ Power', '📶 Hi-Speed', '💺 Ergonomic'],
      slots: [{ session: 'Morning Session', hours: '10:00 - 14:00' }]
    }
  ]);

  // 3. Este Computed busca automáticamente el objeto del escritorio cada vez que 'selectedDeskId' cambia
  selectedDesk = computed(() => {
    return this.desks().find(desk => desk.id === this.selectedDeskId());
  });

  // 4. Método para cambiar el asiento seleccionado al hacer clic
  selectDesk(id: string) {
    this.selectedDeskId.set(id);
  }
}