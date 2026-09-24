import { provideTaiga } from '@taiga-ui/core';
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, map } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { provideRouter, withViewTransitions } from '@angular/router';
import { TUI_DEFAULT_LANGUAGE, TUI_LANGUAGE } from '@taiga-ui/i18n';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { restoreSession } from './features/auth/session.initializer';
import { DATA_PROVIDERS } from './core/providers/data-providers';

// Formato de moneda (S/) y fechas en español de Perú para los pipes con locale 'es-PE'
registerLocaleData(localeEsPe);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideTaiga(),

    // Textos de Taiga en español, en un chunk aparte (~20 kB fuera del bundle inicial).
    // Hasta que llega (milisegundos) se usa el idioma por defecto de Taiga.
    {
      provide: TUI_LANGUAGE,
      useFactory: () =>
        toSignal(
          from(import('@taiga-ui/i18n/languages/spanish')).pipe(map(m => m.TUI_SPANISH_LANGUAGE)),
          { initialValue: inject(TUI_DEFAULT_LANGUAGE) },
        ),
    },

    provideHttpClient(
      withInterceptors([authInterceptor,errorInterceptor]),
    ),
    provideAppInitializer(restoreSession), // después de provideHttpClient

    // Servicios de datos: HTTP, o mocks con --configuration mock (fileReplacements en angular.json)
    ...DATA_PROVIDERS,

    provideRouter(routes, withViewTransitions()),
  ],
};
