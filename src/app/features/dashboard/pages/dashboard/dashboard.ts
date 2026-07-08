import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Desk, StudySeatsApiService } from '../../../../core/services/api/study-seats-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  readonly authService = inject(AuthService);
  private readonly studySeatsApi = inject(StudySeatsApiService);

  selectedDeskId = signal<string | null>(null);
  selectedSlotId = signal<number | null>(null);
  desks = signal<Desk[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  actionMessage = signal('');

  selectedDesk = computed(() => {
    const selectedId = this.selectedDeskId();
    return this.desks().find((desk) => desk.id === selectedId) ?? this.desks()[0] ?? null;
  });

  ngOnInit(): void {
    this.loadDesks();
  }

  loadDesks(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.studySeatsApi.getSeats().subscribe({
      next: (desks) => {
        this.desks.set(desks);
        const firstDesk = desks[0] ?? null;
        this.selectedDeskId.set(firstDesk?.id ?? null);
        this.selectedSlotId.set(firstDesk?.slots[0]?.id ?? null);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.desks.set([]);
        this.selectedDeskId.set(null);
        this.isLoading.set(false);
      },
    });
  }

  selectDesk(id: string): void {
    const desk = this.desks().find((item) => item.id === id) ?? null;
    this.selectedDeskId.set(id);
    this.selectedSlotId.set(desk?.slots[0]?.id ?? null);
    this.actionMessage.set('');
  }

  selectSlot(id: number): void {
    this.selectedSlotId.set(id);
    this.actionMessage.set('');
  }

  bookSelectedDesk(): void {
    const desk = this.selectedDesk();
    const selectedSlotId = this.selectedSlotId();
    const selectedSlot = desk?.slots.find((slot) => slot.id === selectedSlotId);

    if (!desk || !selectedSlot) {
      this.actionMessage.set('Este puesto no tiene franjas disponibles para reservar.');
      return;
    }

    this.studySeatsApi.reserveSeat({
      seatId: desk.seatId,
      slotId: selectedSlot.id,
      reservationDate: this.studySeatsApi.today(),
      durationMinutes: 120,
    }).subscribe({
      next: () => {
        this.actionMessage.set('Reserva creada correctamente.');
        this.loadDesks();
      },
      error: (error: Error) => {
        this.actionMessage.set(error.message);
      },
    });
  }
}
