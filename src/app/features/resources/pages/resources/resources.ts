import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth.service';

interface BookCopy {
  id: string;
  title: string;
  author: string;
  status: 'Available' | 'On Loan' | 'In Maintenance';
  physicalCondition: 'Excellent' | 'Good' | 'Damaged';
}

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './resources.html',
  styleUrl: './resources.css'
})
export class Resources {
  public authService = inject(AuthService);
  // RF_05: Buscador por identificador único
  searchId = signal('');
  
  // Datos simulados (Mocks) iniciales de los ejemplares
  books = signal<BookCopy[]>([
    { id: 'BK-001', title: 'Cien años de soledad', author: 'Gabriel García Márquez', status: 'Available', physicalCondition: 'Excellent' },
    { id: 'BK-002', title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', status: 'On Loan', physicalCondition: 'Good' },
    { id: 'BK-003', title: 'El Alquimista', author: 'Paulo Coelho', status: 'Available', physicalCondition: 'Good' },
    { id: 'BK-004', title: 'El código Da Vinci', author: 'Dan Brown', status: 'Available', physicalCondition: 'Damaged' }, // RF_09 Auto-bloqueado idealmente
  ]);

  // Selección para el panel lateral de revisión de estado
  selectedBookId = signal<string>('BK-001');
  
  // Estado para el formulario de actualización (RF_08)
  newCondition = signal<'Excellent' | 'Good' | 'Damaged'>('Excellent');

  // Computed signal para obtener el libro seleccionado en tiempo real
  currentBook = computed(() => 
    this.books().find(b => b.id === this.selectedBookId())
  );

  // Filtrado dinámico por ID Único (RF_05)
  filteredBooks = computed(() => {
    const term = this.searchId().trim().toUpperCase();
    if (!term) return this.books();
    return this.books().filter(b => b.id.toUpperCase().includes(term));
  });

  selectBook(id: string) {
    this.selectedBookId.set(id);
    const book = this.currentBook();
    if (book) {
      this.newCondition.set(book.physicalCondition);
    }
  }

  // RF_08 & RF_09: Registro de estado físico y Bloqueo Automático
  updateCondition() {
    const targetId = this.selectedBookId();
    const condition = this.newCondition();

    this.books.update(allBooks => 
      allBooks.map(book => {
        if (book.id === targetId) {
          // RF_09: Si el sistema detecta "Damaged", cambia automáticamente a "In Maintenance"
          const nextStatus = condition === 'Damaged' ? 'In Maintenance' : book.status === 'In Maintenance' ? 'Available' : book.status;
          return {
            ...book,
            physicalCondition: condition,
            status: nextStatus
          };
        }
        return book;
      })
    );
  }
}
