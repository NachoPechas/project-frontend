import { Injectable, signal, computed } from '@angular/core';

// Interfaces para estructurar los requisitos
export interface NotificationAlert {
  id: string;
  userId: string;
  userName: string;
  type: 'Vencimiento (RF_06)' | 'Retraso/Multa (RF_07)' | 'Lista de Espera (RF_15)';
  message: string;
  date: string;
}

export interface WaitingList {
  resourceId: string; // ID del Libro o Desk
  resourceName: string;
  usersInLine: { userId: string; userName: string; joinedAt: string; status: 'Esperando' | 'Asignado (Confirmación Pendiente)' }[];
}

@Injectable({
  providedIn: 'root'
})
export class AutomationService {
  // RF_06 & RF_07: Listado central de notificaciones automáticas lanzadas
  notifications = signal<NotificationAlert[]>([
    {
      id: 'NT-01',
      userId: 'U-9401',
      userName: 'Carlos Mendoza',
      type: 'Vencimiento (RF_06)',
      message: 'Tu préstamo del libro "Inteligencia Artificial" vence hoy a las 18:00.',
      date: 'Hoy'
    },
    {
      id: 'NT-02',
      userId: 'U-8824',
      userName: 'Laura Sofía Gómez',
      type: 'Retraso/Multa (RF_07)',
      message: 'Retraso de 3 días acumulados en el recurso "Clean Code". Multa actual: $5.000 COP.',
      date: 'Ayer'
    }
  ]);

  // RF_14 & RF_15: Simulación de Lista de Espera de Recursos
  waitingLists = signal<WaitingList[]>([
    {
      resourceId: 'A12',
      resourceName: 'Cubículo de Estudio Desk A12',
      usersInLine: [
        { userId: 'U-6409', userName: 'Mariana Silva', joinedAt: '10:15 AM', status: 'Asignado (Confirmación Pendiente)' },
        { userId: 'U-1122', userName: 'Kevin Duarte', joinedAt: '10:30 AM', status: 'Esperando' }
      ]
    }
  ]);

  // RF_13: Simulación de puestos en riesgo de liberación por inasistencia (Tolerancia 15 min)
  absenteeismDesks = signal([
    { id: 'B02', user: 'Diego Torres', reservedTime: '14:00', minutesPassed: 18, status: 'Tiempo de tolerancia excedido' },
    { id: 'C03', user: 'Paula Ortiz', reservedTime: '14:15', minutesPassed: 8, status: 'Esperando usuario' }
  ]);

  // --- MÉTODOS DE ACCIÓN / AUTOMATIZACIÓN SIMULADA ---

  // RF_13: Liberar puesto automáticamente y notificar
  releaseDesk(deskId: string) {
    this.absenteeismDesks.update(desks => desks.filter(d => d.id !== deskId));
    // Aquí conectarías con el mapa global para cambiar el estado del Desk a 'available'
  }

  // RF_15: Confirmar asignación antes del tiempo límite o pasar al siguiente estudiante
  confirmOrSkipWaitingList(resourceId: string, userId: string, confirmed: boolean) {
    this.waitingLists.update(lists => {
      return lists.map(list => {
        if (list.resourceId === resourceId) {
          if (confirmed) {
            // El usuario acepta el recurso, se saca de la lista de espera
            list.usersInLine = list.usersInLine.filter(u => u.userId !== userId);
          } else {
            // El tiempo límite expiró o rechazó. Se remueve y el siguiente pasa a confirmar
            list.usersInLine = list.usersInLine.filter(u => u.userId !== userId);
            if (list.usersInLine.length > 0) {
              list.usersInLine[0].status = 'Asignado (Confirmación Pendiente)';
            }
          }
        }
        return list;
      });
    });
  }
}