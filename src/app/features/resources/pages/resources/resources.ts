import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { BookCopy, BookCopyCondition, ResourcesApiService } from '../../../../core/services/api/resources-api.service';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './resources.html',
  styleUrl: './resources.css'
})
export class Resources implements OnInit {
  readonly authService = inject(AuthService);
  private readonly resourcesApi = inject(ResourcesApiService);

  searchId = signal('');
  books = signal<BookCopy[]>([]);
  selectedBookId = signal<number | null>(null);
  newCondition = signal<BookCopyCondition>('Excellent');
  isLoading = signal(false);
  errorMessage = signal('');
  actionMessage = signal('');

  currentBook = computed(() => {
    const selectedId = this.selectedBookId();
    return this.books().find((book) => book.id === selectedId) ?? null;
  });

  filteredBooks = computed(() => {
    const term = this.searchId().trim().toUpperCase();

    if (!term) {
      return this.books();
    }

    return this.books().filter((book) =>
      book.copyCode.toUpperCase().includes(term) ||
      String(book.id).includes(term)
    );
  });

  ngOnInit(): void {
    this.loadCopies();
  }

  loadCopies(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.resourcesApi.getCopies().subscribe({
      next: (copies) => {
        this.books.set(copies);
        this.selectBook(copies[0]?.id ?? null);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.books.set([]);
        this.selectedBookId.set(null);
        this.isLoading.set(false);
      },
    });
  }

  selectBook(id: number | null): void {
    this.selectedBookId.set(id);
    const book = this.currentBook();

    if (book) {
      this.newCondition.set(book.physicalCondition);
    }
  }

  updateCondition(): void {
    const targetId = this.selectedBookId();

    if (!targetId) {
      return;
    }

    this.resourcesApi.updatePhysicalCondition(targetId, this.newCondition()).subscribe({
      next: (updatedBook) => {
        this.books.update((books) => books.map((book) => book.id === targetId ? updatedBook : book));
        this.actionMessage.set('Estado fisico actualizado correctamente.');
      },
      error: (error: Error) => {
        this.actionMessage.set(error.message);
      },
    });
  }

  setNewCondition(condition: string): void {
    if (condition === 'Excellent' || condition === 'Good' || condition === 'Damaged') {
      this.newCondition.set(condition);
    }
  }
}
