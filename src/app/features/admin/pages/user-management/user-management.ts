import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { History } from '../../../history/pages/history/history';
import { AutomationService } from '../../../../core/services/automation.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { AdminApiService, UserSession } from '../../../../core/services/api/admin-api.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, ReactiveFormsModule, History],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagement implements OnInit {
  private readonly DEBUG = true;
  readonly authService = inject(AuthService);
  readonly automationService = inject(AutomationService);
  private readonly adminApi = inject(AdminApiService);
  private readonly fb = inject(FormBuilder);

  searchQuery = signal<string>('');
  statusFilter = signal<string>('Todos los estados');
  selectedUserId = signal<number | null>(null);
  users = signal<UserSession[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  registerSuccessMessage = signal('');
  registerErrorMessage = signal('');
  isRegistering = signal(false);
  registrationForm: FormGroup;
  fieldErrors = signal<Record<string, string>>({});

  filteredUsers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    return this.users().filter((user) => {
      const matchesSearch = !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        String(user.id).includes(query);

      let matchesStatus = true;
      if (this.statusFilter() === 'Solo Bloqueados') {
        matchesStatus = user.status === 'Bloqueado';
      } else if (this.statusFilter() === 'Con Reservacion Activa') {
        matchesStatus = user.hasActiveBooking;
      }

      return matchesSearch && matchesStatus;
    });
  });

  constructor() {
    this.registrationForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      confirmPassword: ['', [Validators.required]],
      role: ['estudiante', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  toggleStatus(user: UserSession): void {
    const newStatusBackend = user.status === 'Activo' ? 'Suspendido' : 'Activo';

    this.adminApi.updateUserStatus(user.id, newStatusBackend).subscribe({
      next: () => {
        this.users.update(currentUsers =>
          currentUsers.map(u =>
            u.id === user.id
              ? { ...u, status: newStatusBackend === 'Suspendido' ? 'Bloqueado' : 'Activo' }
              : u
          )
        );
      },
      error: (err) => {
        alert('No se pudo actualizar el usuario: ' + err.message);
      }
    });
  }

  selectedUser = computed(() => {
    return this.users().find((user) => user.id === this.selectedUserId()) ?? null;
  });

  ngOnInit(): void {
    this.loadUsers();
    this.automationService.loadNotifications();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminApi.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.users.set([]);
        this.isLoading.set(false);
      },
    });
  }

  registerUser(): void {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      const invalidFields = this.getInvalidFieldMessages();
      this.fieldErrors.set(invalidFields);
      this.registerErrorMessage.set('Corrige los errores del formulario antes de enviar.');
      if (this.DEBUG) {
        console.log('[UserManagement] Formulario inválido, no se envía:', invalidFields);
      }
      return;
    }

    this.isRegistering.set(true);
    this.registerErrorMessage.set('');
    this.registerSuccessMessage.set('');
    this.fieldErrors.set({});

    const payload = {
      nombre: this.registrationForm.value.nombre,
      email: this.registrationForm.value.email,
      password: this.registrationForm.value.password,
      confirmPassword: this.registrationForm.value.confirmPassword,
      role: this.registrationForm.value.role,
    };

    const safePayload = {
      ...payload,
      password: '***',
      confirmPassword: '***',
    };

    if (this.DEBUG) {
      console.log('[UserManagement] Submit del formulario. Payload a enviar:', safePayload);
    }

    this.adminApi.registerUser(payload).subscribe({
      next: (response) => {
        if (this.DEBUG) {
          console.log('[UserManagement] Respuesta exitosa del registro:', response);
        }
        this.registerSuccessMessage.set('Usuario registrado correctamente.');
        this.registrationForm.reset({ nombre: '', email: '', password: '', confirmPassword: '', role: 'estudiante' });
        this.loadUsers();
        this.isRegistering.set(false);
      },
      error: (error: any) => {
        if (this.DEBUG) {
          console.error('[UserManagement] Error en el registro:', error);
        }

        const backend = error?.error;

        if (backend?.errors && typeof backend.errors === 'object') {
          this.fieldErrors.set(backend.errors);
          this.registerErrorMessage.set(backend.message || 'Corrige los errores de validación.');
        } else if (backend?.message) {
          this.registerErrorMessage.set(backend.message);
        } else if (typeof error?.message === 'string') {
          this.registerErrorMessage.set(error.message);
        } else {
          this.registerErrorMessage.set('No se pudo registrar el usuario.');
        }

        this.isRegistering.set(false);
      }
    });
  }

  private getInvalidFieldMessages(): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    const nombreControl = this.registrationForm.get('nombre');
    const emailControl = this.registrationForm.get('email');
    const passwordControl = this.registrationForm.get('password');
    const confirmControl = this.registrationForm.get('confirmPassword');

    const validationFailures: string[] = [];

    if (nombreControl?.hasError('required')) {
      fieldErrors['nombre'] = 'El nombre es obligatorio.';
      validationFailures.push('nombre:required');
    }

    if (emailControl?.hasError('required')) {
      fieldErrors['email'] = 'El correo es obligatorio.';
      validationFailures.push('email:required');
    } else if (emailControl?.hasError('email')) {
      fieldErrors['email'] = 'Ingresa un correo válido.';
      validationFailures.push('email:email');
    }

    if (passwordControl?.hasError('required')) {
      fieldErrors['password'] = 'La contraseña es obligatoria.';
      validationFailures.push('password:required');
    } else if (passwordControl?.hasError('minlength')) {
      fieldErrors['password'] = 'Mínimo 8 caracteres.';
      validationFailures.push('password:minlength');
    } else if (passwordControl?.hasError('pattern')) {
      fieldErrors['password'] = 'La contraseña debe incluir mayúscula y número.';
      validationFailures.push('password:pattern');
    }

    if (confirmControl?.hasError('required')) {
      fieldErrors['confirmPassword'] = 'Confirma la contraseña.';
      validationFailures.push('confirmPassword:required');
    } else if (confirmControl?.hasError('mismatch')) {
      fieldErrors['confirmPassword'] = 'Las contraseñas no coinciden.';
      validationFailures.push('confirmPassword:mismatch');
    }

    if (this.DEBUG) {
      console.log('[UserManagement] Validadores fallando:', validationFailures);
    }

    return fieldErrors;
  }

  inspectUserHistory(id: number): void {
    this.selectedUserId.set(id);
  }

  closeInspection(): void {
    this.selectedUserId.set(null);
  }
}
