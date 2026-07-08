import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { CatalogApiService, CatalogBook } from '../../../../core/services/api/catalog-api.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog implements OnInit {
  readonly authService = inject(AuthService);
  private readonly catalogApi = inject(CatalogApiService);

  searchQuery = signal('');
  selectedCategory = signal('Todas las categorias');
  books = signal<CatalogBook[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  categories = computed(() => {
    const categories = new Set(this.books().map((book) => book.category).filter(Boolean));
    return ['Todas las categorias', ...Array.from(categories).sort()];
  });

  filteredBooks = computed(() => {
    const search = this.searchQuery().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.books().filter((book) => {
      const matchesSearch = !search ||
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search);
      const matchesCategory = category === 'Todas las categorias' || book.category === category;

      return matchesSearch && matchesCategory;
    });
  });

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.catalogApi.getBooks().subscribe({
      next: (books) => {
        this.books.set(books);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.books.set([]);
        this.isLoading.set(false);
      },
    });
  }
}
