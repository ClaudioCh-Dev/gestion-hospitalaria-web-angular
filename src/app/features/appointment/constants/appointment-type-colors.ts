// Gamas de color de los tipos de cita. La clave es la que guarda el backend
// (AppointmentTypeColor en appointment-ms); las clases van completas para que Tailwind las detecte.
export interface AppointmentTypeColorOption {
  value: string;
  label: string;
  classes: string;
}

export const DEFAULT_APPOINTMENT_TYPE_COLOR = 'blue';

export const APPOINTMENT_TYPE_COLORS: readonly AppointmentTypeColorOption[] = [
  { value: 'blue', label: 'Azul', classes: 'bg-blue-600 text-white' },
  { value: 'indigo', label: 'Índigo', classes: 'bg-indigo-600 text-white' },
  { value: 'violet', label: 'Violeta', classes: 'bg-violet-600 text-white' },
  { value: 'pink', label: 'Rosa', classes: 'bg-pink-600 text-white' },
  { value: 'rose', label: 'Rojo', classes: 'bg-rose-600 text-white' },
  { value: 'orange', label: 'Naranja', classes: 'bg-orange-600 text-white' },
  { value: 'amber', label: 'Ámbar', classes: 'bg-amber-500 text-white' },
  { value: 'emerald', label: 'Verde', classes: 'bg-emerald-600 text-white' },
  { value: 'teal', label: 'Turquesa', classes: 'bg-teal-600 text-white' },
  { value: 'cyan', label: 'Cian', classes: 'bg-cyan-600 text-white' },
];

export function getAppointmentTypeColor(
  value: string | null | undefined,
): AppointmentTypeColorOption {
  return (
    APPOINTMENT_TYPE_COLORS.find(color => color.value === value) ??
    APPOINTMENT_TYPE_COLORS[0]
  );
}
