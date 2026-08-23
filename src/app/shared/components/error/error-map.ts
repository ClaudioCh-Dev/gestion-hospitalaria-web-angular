import {
  GENERIC_ERROR_CODES,
  PROBLEM_CODES,
} from './error-code';

export const PROBLEM_MESSAGES: Record<string, string> = {

  // Generic errors
  [GENERIC_ERROR_CODES.DATA_INTEGRITY_ERROR]:
    'No se pudo completar la operación debido a un conflicto de datos.',

  [GENERIC_ERROR_CODES.VALIDATION_ERROR]:
    'Los datos enviados no son válidos.',

  [GENERIC_ERROR_CODES.INVALID_REQUEST_BODY]:
    'El cuerpo de la solicitud no es válido.',

  [GENERIC_ERROR_CODES.INVALID_PARAMETER]:
    'Uno de los parámetros enviados no es válido.',

  [GENERIC_ERROR_CODES.INVALID_ARGUMENT]:
    'Se recibió un argumento no válido.',

  [GENERIC_ERROR_CODES.INTERNAL_ERROR]:
    'Ocurrió un error interno del servidor.',

  // Patient errors
  [PROBLEM_CODES.PATIENT_NOT_FOUND]:
    'No se encontró el paciente solicitado.',

  [PROBLEM_CODES.PATIENT_DOCUMENT_ALREADY_EXISTS]:
    'El número de documento ya se encuentra registrado.',

  [PROBLEM_CODES.PATIENT_EMAIL_ALREADY_EXISTS]:
    'El correo electrónico ya se encuentra registrado.',

};