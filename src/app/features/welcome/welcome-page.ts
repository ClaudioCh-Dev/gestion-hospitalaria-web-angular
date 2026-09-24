import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TuiButton, TuiDialogService, TuiIcon } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

import { AuthService } from '@core/services/auth.service';

import { MENU_ITEMS } from '../../layout/menu';
import { getRoleLabel } from '../user/constants/user-roles';

/**
 * Inicio para usuarios sin dashboard ni agenda (destino de respaldo de homeUrl()).
 * Muestra solo las secciones a las que el usuario tiene acceso.
 */
@Component({
  selector: 'app-welcome-page',
  imports: [RouterLink, TuiButton, TuiIcon],
  template: `
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <!-- Saludo -->
      <header class="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
        <p class="text-sm capitalize text-slate-500">{{ today }}</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{{ greeting() }}</h1>
        <p class="mt-1 text-sm text-slate-500">
          Sesión iniciada como <strong class="font-medium text-slate-700">{{ roleLabel() }}</strong>.
        </p>

        <button tuiButton type="button" size="s" appearance="secondary" iconStart="@tui.user" class="mt-4" (click)="openProfile()">
          Mi perfil
        </button>
      </header>

      <!-- Accesos -->
      @if (sections().length) {
        <section>
          <h2 class="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tus accesos</h2>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            @for (section of sections(); track section.route) {
              <a
                class="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-(--tui-background-accent-1) hover:shadow-md"
                [routerLink]="section.route"
              >
                <span
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-(--tui-background-accent-1)"
                >
                  <tui-icon [icon]="section.icon" />
                </span>

                <span class="min-w-0">
                  <span class="block font-medium text-slate-900 group-hover:text-(--tui-background-accent-1)">
                    {{ section.label }}
                  </span>
                  @if (section.description) {
                    <span class="mt-0.5 block text-xs text-slate-500">{{ section.description }}</span>
                  }
                </span>
              </a>
            }
          </div>
        </section>
      } @else {
        <div class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <tui-icon icon="@tui.lock" class="text-2xl text-slate-300" />
          <p class="mt-2 text-sm text-slate-500">
            Tu cuenta aún no tiene secciones asignadas. Contacta al administrador del sistema.
          </p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomePage {
  private readonly authService = inject(AuthService);
  private readonly dialogs = inject(TuiDialogService);

  protected readonly today = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  protected readonly roleLabel = computed(() => getRoleLabel(this.authService.currentUser()?.role ?? ''));

  protected readonly greeting = computed(() => {
    const hour = new Date().getHours();
    const salute = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
    const name = this.authService.currentUser()?.email.split('@')[0];

    return name ? `${salute}, ${name}` : salute;
  });

  protected readonly sections = computed(() =>
    MENU_ITEMS.map((group) => group.item).filter((item) => this.authService.hasAnyPermission(item.permission)),
  );

  // Mismo modal que el menú del avatar (carga diferida)
  protected openProfile(): void {
    import('../profile/components/profile-dialog/profile-dialog').then(({ ProfileDialog }) =>
      this.dialogs.open(new PolymorpheusComponent(ProfileDialog), { label: 'Mi perfil', size: 'm' }).subscribe(),
    );
  }
}
