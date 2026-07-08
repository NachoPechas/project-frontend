import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { ReportData, ReportsApiService } from '../../../../core/services/api/reports-api.service';

interface SuspendedCandidate {
  userId: string;
  name: string;
  missedBookingsCount: number;
  lastViolationDate: string;
  actionRequired: 'Suspender' | 'Suspendido Temporalmente';
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class Analytics implements OnInit {
  public authService = inject(AuthService);
  private readonly reportsApi = inject(ReportsApiService);

  activeLoansCount = signal(0);
  occupiedDesksPercentage = signal(0);
  pendingFinesTotal = signal(0);
  activeUsersCount = signal(0);
  isLoading = signal(false);
  errorMessage = signal('');

  selectedReportType = signal<string>('Todos');
  reports = signal<ReportData[]>([]);

  flaggedUsers = signal<SuspendedCandidate[]>([]);

  filteredReports = computed(() => {
    if (this.selectedReportType() === 'Todos') {
      return this.reports();
    }

    return this.reports().filter((report) => report.type === this.selectedReportType());
  });

  ngOnInit(): void {
    this.loadDashboard();
    this.loadReports();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.reportsApi.getDashboardReport().subscribe({
      next: (dashboard) => {
        const totalSeats = dashboard.seats.available + dashboard.seats.occupied;
        const occupiedPercentage = totalSeats > 0
          ? Math.round((dashboard.seats.occupied / totalSeats) * 100)
          : 0;

        this.activeLoansCount.set(dashboard.loans.active);
        this.occupiedDesksPercentage.set(occupiedPercentage);
        this.pendingFinesTotal.set(dashboard.penalties?.pendingAmount ?? 0);
        this.activeUsersCount.set(dashboard.users.active ?? 0);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
      },
    });
  }

  loadReports(): void {
    this.reportsApi.getReports().subscribe({
      next: (reports) => this.reports.set(reports),
      error: (error: Error) => this.errorMessage.set(error.message),
    });
  }

  triggerSuspension(_userId: string): void {
    this.reportsApi.runSuspensions().subscribe({
      next: () => this.loadDashboard(),
      error: (error: Error) => this.errorMessage.set(error.message),
    });
  }
}
