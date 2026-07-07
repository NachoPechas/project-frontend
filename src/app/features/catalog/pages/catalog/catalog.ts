import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth.service'; 

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  status: 'available' | 'occupied';
  coverUrl: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog {
  public authService = inject(AuthService);
  // Filtros interactivos conectados con NgModel
  searchQuery = signal('');
  selectedCategory = signal('Todas las categorías');

  // Listado de categorías disponibles
  categories = signal([
    'Todas las categorías', 'Tecnología', 'Ciencia', 'Programación', 'Humanidades', 'Biología', 'Psicología'
  ]);

  // Datos ficticios calcados de tu imagen de referencia
  books = signal<Book[]>([
    {
      id: 1,
      title: 'Inteligencia Artificial: Un Enfoque Moderno',
      author: 'Stuart Russell, Peter Norvig',
      category: 'Tecnología',
      status: 'available',
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60' // Textura abstracta azul
    },
    {
      id: 2,
      title: 'El Algoritmo Maestro: Cómo la búsqueda de l...',
      author: 'Pedro Domingos',
      category: 'Tecnología',
      status: 'occupied',
      coverUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=60' // Retrato corporativo/casual
    },
    {
      id: 3,
      title: 'Breves respuestas a las grandes preguntas',
      author: 'Stephen Hawking',
      category: 'Ciencia',
      status: 'available',
      coverUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=60' // Grabado circular madera
    },
    {
      id: 4,
      title: 'Deep Learning (Adaptive Computation and...',
      author: 'Ian Goodfellow',
      category: 'Tecnología',
      status: 'available',
      coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=60' // Redes/Matriz digital verde-azul
    },
    {
      id: 5,
      title: 'Clean Code: A Handbook of Agile Software...',
      author: 'Robert C. Martin',
      category: 'Programación',
      status: 'available',
      coverUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&auto=format&fit=crop&q=60' // Pantalla de código enfocada
    },
    {
      id: 6,
      title: "Justice: What's the Right Thing to Do?",
      author: 'Michael J. Sandel',
      category: 'Humanidades',
      status: 'occupied',
      coverUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=60' // Estatua de la justicia/Balanza dorada
    },
    {
      id: 7,
      title: 'The Selfish Gene (40th Anniversary Edition)',
      author: 'Richard Dawkins',
      category: 'Biología',
      status: 'available',
      coverUrl: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=400&auto=format&fit=crop&q=60' // Líneas abstractas neuronales
    },
    {
      id: 8,
      title: 'Psychology: A Discovery Experience',
      author: 'Franzoi, Stephen',
      category: 'Psicología',
      status: 'available',
      coverUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&auto=format&fit=crop&q=60' // Silueta abstracta o sombra dramática
    }
  ]);

  // Lógica de filtrado en tiempo real combinando buscador y selector de categoría
  filteredBooks = computed(() => {
    return this.books().filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                            book.author.toLowerCase().includes(this.searchQuery().toLowerCase());
      const matchesCategory = this.selectedCategory() === 'Todas las categorías' || book.category === this.selectedCategory();
      return matchesSearch && matchesCategory;
    });
  });
}
