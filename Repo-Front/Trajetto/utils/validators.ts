// ─── Máscaras ────────────────────────────────────────────

export const maskName = (text: string) =>
  text.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');

export const maskBirthDate = (text: string) => {
  const cleaned = text.replace(/\D/g, '');
  if (cleaned.length >= 5) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  } else if (cleaned.length >= 3) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }
  return cleaned;
};

export const maskTelephone = (text: string) => {
  const cleaned = text.replace(/\D/g, '');
  if (cleaned.length <= 2)  return cleaned;
  if (cleaned.length <= 6)  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

// Converte DD/MM/YYYY → YYYY-MM-DD para o backend
export const toBirthDateISO = (date: string) => {
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
};

// Converte YYYY-MM-DD → DD/MM/YYYY para exibir
export const fromBirthDateISO = (date: string) => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

// ─── Validações ──────────────────────────────────────────

export const validateName = (value: string, label: string) => {
  if (!value.trim()) return `${label} is required`;
  if (value.trim().length < 2) return `${label}: at least 2 characters`;
  return null;
};

export const validateBirthDate = (value: string) => {
  if (!value) return 'Birth date is required';
  const [day, month, year] = value.split('/');
  if (!day || !month || !year || year.length < 4) return 'Enter a valid date (DD/MM/YYYY)';
  const d = new Date(`${year}-${month}-${day}`);
  if (isNaN(d.getTime())) return 'Invalid date';
  const age = new Date().getFullYear() - d.getFullYear();
  if (age < 13) return 'You must be at least 13 years old';
  if (age > 120) return 'Invalid date';
  return null;
};

export const validateTelephone = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  if (!value) return 'Phone number is required';
  if (cleaned.length < 10 || cleaned.length > 11) return 'Enter a valid phone number';
  return null;
};

export const validateEmail = (value: string) => {
  if (!value) return 'Email is required';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(value)) return 'Enter a valid email';
  return null;
};

export const validateCountry = (value: string) => {
  if (!value) return 'Select a country';
  return null;
};

export const validatePassword = (value: string) => {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'At least 8 characters';
  if (!/[A-Z]/.test(value)) return 'At least one uppercase letter';
  if (!/[a-z]/.test(value)) return 'At least one lowercase letter';
  if (!/[0-9]/.test(value)) return 'At least one number';
  if (!/[^A-Za-z0-9]/.test(value)) return 'At least one special character';
  return null;
};

export const passwordStrength = (password: string) => ({
  length:    password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number:    /[0-9]/.test(password),
  special:   /[^A-Za-z0-9]/.test(password),
});

// ─── Validação do formulário completo ────────────────────

export interface RegisterFields {
  firstName: string;
  lastName: string;
  birthDate: string;
  telephone: string;
  email: string;
  country: string;
  password: string;
}

export const validateRegisterForm = (fields: RegisterFields) => {
  const errors: Record<string, string> = {};
  const checks = [
    ['firstName', validateName(fields.firstName, 'First name')],
    ['lastName',  validateName(fields.lastName, 'Last name')],
    ['birthDate', validateBirthDate(fields.birthDate)],
    ['telephone', validateTelephone(fields.telephone)],
    ['email',     validateEmail(fields.email)],
    ['country',   validateCountry(fields.country)],
    ['password',  validatePassword(fields.password)],
  ] as const;

  checks.forEach(([field, error]) => {
    if (error) errors[field] = error;
  });

  return errors;
};

export interface ProfileFields {
  firstName: string;
  lastName: string;
  birthDate: string;
  telephone: string;
  email: string;
  country: string;
}

export const validateProfileForm = (fields: ProfileFields) => {
  const errors: Record<string, string> = {};
  const checks = [
    ['firstName', validateName(fields.firstName, 'First name')],
    ['lastName',  validateName(fields.lastName, 'Last name')],
    ['birthDate', validateBirthDate(fields.birthDate)],
    ['telephone', validateTelephone(fields.telephone)],
    ['email',     validateEmail(fields.email)],
    ['country',   validateCountry(fields.country)],
  ] as const;

  checks.forEach(([field, error]) => {
    if (error) errors[field] = error;
  });

  return errors;
};