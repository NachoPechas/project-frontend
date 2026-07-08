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
        this.selectedDeskId.set(desks[0]?.id ?? null);
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
    this.selectedDeskId.set(id);
    this.actionMessage.set('');
  }

  bookSelectedDesk(): void {
    const desk = this.selectedDesk();
    const firstSlot = desk?.slots[0];

    if (!desk || !firstSlot) {
      this.actionMessage.set('Este puesto no tiene franjas disponibles para reservar.');
      return;
    }

    this.studySeatsApi.reserveSeat({
      seatId: desk.seatId,
      slotId: firstSlot.id,
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
