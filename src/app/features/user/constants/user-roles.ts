export const ROLE_ADMIN = 'ADMIN';

export const ROLE_DOCTOR = 'DOCTOR';

const ROLE_LABELS: Record<string, string> = {
  [ROLE_ADMIN]: 'Administrador',
  [ROLE_DOCTOR]: 'Médico',
};

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role.charAt(0) + role.slice(1).toLowerCase();
}

// Misma regla que auth-server (ActivateUserRequest / ChangePasswordRequest)
export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const PASSWORD_RULES: readonly { label: string; test: (value: string) => boolean }[] = [
  { label: 'Al menos 8 caracteres', test: value => value.length >= 8 },
  { label: 'Una mayúscula', test: value => /[A-Z]/.test(value) },
  { label: 'Una minúscula', test: value => /[a-z]/.test(value) },
  { label: 'Un número', test: value => /\d/.test(value) },
  { label: 'Un carácter especial (@$!%*?&)', test: value => /[@$!%*?&]/.test(value) },
];
