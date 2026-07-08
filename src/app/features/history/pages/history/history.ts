import { Component, computed, inject, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { HistoryApiService, HistoryItem } from '../../../../core/services/api/history-api.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History implements OnInit, OnChanges {
  @Input() userId: number | null = null;

  readonly authService = inject(AuthService);
  private readonly historyApi = inject(HistoryApiService);
  private initialized = false;

  selectedType = signal<string>('Todos los tipos');
  startDate = signal<string>('');
  endDate = signal<string>('');
  resourceTypes = signal(['Todos los tipos', 'Prestamo Libro', 'Reserva Puesto', 'Penalizacion']);
  historyRecords = signal<HistoryItem[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  filteredHistory = computed(() => {
    return this.historyRecords().filter((item) => {
      const matchesType = this.selectedType() === 'Todos los tipos' || item.type === this.selectedType();
      const itemDate = new Date(item.date);
      const matchesStartDate = !this.startDate() || itemDate >= new Date(this.startDate());
      const matchesEndDate = !this.endDate() || itemDate <= new Date(this.endDate());

      return matchesType && matchesStartDate && matchesEndDate;
    });
  });

  ngOnInit(): void {
    this.initialized = true;
    this.loadHistory();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && changes['userId']) {
      this.loadHistory();
    }
  }

  loadHistory(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.historyApi.getHistory({ userId: this.userId }).subscribe({
      next: (records) => {
        this.historyRecords.set(records);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.historyRecords.set([]);
        this.isLoading.set(false);
      },
    });
  }
}
