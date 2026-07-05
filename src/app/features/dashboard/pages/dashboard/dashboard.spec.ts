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
  // RF_01: Base de datos simulada de escritorios con sus franjas horarias (Slots)
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

  // RF_03: Estado de la selección del formulario de reserva
  selectedDeskId = signal<string>('A12');
  selectedDate = signal<string>(new Date().toISOString().split('T')[0]); // Fecha actual por defecto
  selectedSlotName = signal<string>('Morning Session');

  // Mensajes para el usuario (RF_04)
  alertMessage = signal<string>('');
  alertType = signal<'success' | 'error'>('success');

  // Obtiene el escritorio seleccionado en tiempo real usando un Computed Signal
  selectedDesk = computed(() => 
    this.desks().find(d => d.id === this.selectedDeskId())
  );

  selectDesk(id: string) {
    this.selectedDeskId.set(id);
    this.alertMessage.set(''); // Limpia alertas al cambiar de puesto
  }

  // RF_03, RF_04 & RF_02: Flujo Completo de Reserva
  bookSpace() {
    const deskId = this.selectedDeskId();
    const slotName = this.selectedSlotName();
    const date = this.selectedDate();

    if (!date) {
      this.alertType.set('error');
      this.alertMessage.set('Por favor, selecciona una fecha válida.');
      return;
    }

    // Encuentra el puesto en la lista
    const currentDesks = this.desks();
    const targetDesk = currentDesks.find(d => d.id === deskId);

    if (targetDesk) {
      // Busca la franja horaria seleccionada dentro de ese puesto
      const targetSlot = targetDesk.slots.find(s => s.name === slotName);

      // RF_04: Validación de conflictos y disponibilidad
      if (!targetSlot || targetSlot.reserved) {
        this.alertType.set('error');
        this.alertMessage.set(`❌ Conflicto: El puesto ${deskId} ya está ocupado en la franja [${slotName}] para la fecha seleccionada.`);
        return;
      }

      // Si pasa la validación, actualizamos el estado (RF_02)
      this.desks.update(allDesks => 
        allDesks.map(desk => {
          if (desk.id === deskId) {
            // Marcamos el slot como reservado
            const updatedSlots = desk.slots.map(s => s.name === slotName ? { ...s, reserved: true } : s);
            
            // Determinamos el nuevo estado global del mapa para ese puesto
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

      // Informamos el éxito claramente al usuario (RF_04)
      this.alertType.set('success');
      this.alertMessage.set(`🎉 ¡Reserva exitosa! Puesto ${deskId} asegurado para el ${date} en la jornada ${slotName}.`);
    }
  }
}
