import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface TimeSlot {
  name: string;
  time: string;
  reserved: boolean;
}

interface Desk {
  id: string;
  status: 'available' | 'occupied' | 'reserved';
  slots: TimeSlot[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  
  desks = signal<Desk[]>([
    { 
      id: 'A12', status: 'available', 
      slots: [{ name: 'Morning Session', time: '10:00 - 14:00', reserved: false }, { name: 'Evening Session', time: '16:00 - 20:00', reserved: false }] 
    },
    { 
      id: 'A13', status: 'occupied', 
      slots: [{ name: 'Morning Session', time: '10:00 - 14:00', reserved: true }, { name: 'Evening Session', time: '16:00 - 20:00', reserved: false }] 
    },
    { 
      id: 'A14', status: 'available', 
      slots: [{ name: 'Morning Session', time: '10:00 - 14:00', reserved: false }, { name: 'Evening Session', time: '16:00 - 20:00', reserved: false }] 
    },
    { 
      id: 'A15', status: 'reserved', 
      slots: [{ name: 'Morning Session', time: '10:00 - 14:00', reserved: true }, { name: 'Evening Session', time: '16:00 - 20:00', reserved: true }] 
    },
    { 
      id: 'A16', status: 'available', 
      slots: [{ name: 'Morning Session', time: '10:00 - 14:00', reserved: false }, { name: 'Evening Session', time: '16:00 - 20:00', reserved: false }] 
    },
    { 
      id: 'B01', status: 'occupied', 
      slots: [{ name: 'Morning Session', time: '10:00 - 14:00', reserved: true }, { name: 'Evening Session', time: '16:00 - 20:00', reserved: false }] 
    },
    { 
      id: 'B02', status: 'occupied', 
      slots: [{ name: 'Morning Session', time: '10:00 - 14:00', reserved: true }, { name: 'Evening Session', time: '16:00 - 20:00', reserved: true }] 
    },
    { 
      id: 'B03', status: 'reserved', 
      slots: [{ name: 'Morning Session', time: '10:00 - 14:00', reserved: false }, { name: 'Evening Session', time: '16:00 - 20:00', reserved: true }] 
    }
  ]);

  
  selectedDeskId = signal<string>('A12');
  selectedDate = signal<string>(new Date().toISOString().split('T')[0]); 
  selectedSlotName = signal<string>('Morning Session');

  
  alertMessage = signal<string>('');
  alertType = signal<'success' | 'error'>('success');

  
  selectedDesk = computed(() => 
    this.desks().find(d => d.id === this.selectedDeskId())
  );

  selectDesk(id: string) {
    this.selectedDeskId.set(id);
    this.alertMessage.set(''); 
  }

  
  bookSpace() {
    const deskId = this.selectedDeskId();
    const slotName = this.selectedSlotName();
    const date = this.selectedDate();

    if (!date) {
      this.alertType.set('error');
      this.alertMessage.set('Por favor, selecciona una fecha válida.');
      return;
    }

    
    const currentDesks = this.desks();
    const targetDesk = currentDesks.find(d => d.id === deskId);

    if (targetDesk) {
      
      const targetSlot = targetDesk.slots.find(s => s.name === slotName);

      
      if (!targetSlot || targetSlot.reserved) {
        this.alertType.set('error');
        this.alertMessage.set(`❌ Conflicto: El puesto ${deskId} ya está ocupado en la franja [${slotName}] para la fecha seleccionada.`);
        return;
      }

      
      this.desks.update(allDesks => 
        allDesks.map(desk => {
          if (desk.id === deskId) {
            
            const updatedSlots = desk.slots.map(s => s.name === slotName ? { ...s, reserved: true } : s);
            
            
            const allReserved = updatedSlots.every(s => s.reserved);
            const nextStatus = allReserved ? 'reserved' : 'occupied';

            return {
              ...desk,
              status: nextStatus,
              slots: updatedSlots
            };
          }
          return desk;
        })
      );

      
      this.alertType.set('success');
      this.alertMessage.set(`🎉 ¡Reserva exitosa! Puesto ${deskId} asegurado para el ${date} en la jornada ${slotName}.`);
    }
  }
}
