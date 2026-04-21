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
  if (!value.trim()) return `${label} é obrigatório`;
  if (value.trim().length < 2) return `${label}: pelo menos 2 caracteres`;
  return null;
};

export const validateBirthDate = (value: string) => {
  if (!value) return 'Data de nascimento é obrigatória';

  const [dayStr, monthStr, yearStr] = value.split('/');

  if (!dayStr || !monthStr || !yearStr || yearStr.length < 4) {
    return 'Insira uma data válida';
  }

  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);

  // Validação básica numérica
  if (
    isNaN(day) || isNaN(month) || isNaN(year) ||
    day < 1 || day > 31 ||
    month < 1 || month > 12 ||
    year < 1900 || year > new Date().getFullYear()
  ) {
    return 'Data inválida';
  }

  // Validação real da data (ex: 31/02 não pode)
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return 'Data inválida';
  }

  // Cálculo de idade correto (considerando mês/dia)
  const today = new Date();
  let age = today.getFullYear() - year;

  const hasHadBirthdayThisYear =
    today.getMonth() > (month - 1) ||
    (today.getMonth() === (month - 1) && today.getDate() >= day);

  if (!hasHadBirthdayThisYear) {
    age--;
  }

  if (age < 13) return 'Você precisa ter pelo menos 13 anos de idade';
  if (age > 120) return 'Data inválida';

  return null;
};

export const validateTelephone = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  if (!value) return 'Telefone é obrigatório';
  if (cleaned.length < 10 || cleaned.length > 11) return 'Insira um telefone válido';
  return null;
};

export const validateEmail = (value: string) => {
  if (!value) return 'O e-mail é obrigatório';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(value)) return 'Insira um e-mail válido';
  return null;
};

export const validateCountry = (value: string) => {
  if (!value) return 'Selecione um país';
  return null;
};

export const validatePassword = (value: string) => {
  if (!value) return 'A senha é obrigatória';
  if (value.length < 8) return 'Pelo menos 8 caracteres';
  if (!/[A-Z]/.test(value)) return 'Pelo menos uma letra maiúscula';
  if (!/[a-z]/.test(value)) return 'Pelo menos uma letra minúscula';
  if (!/[0-9]/.test(value)) return 'Pelo menos um número';
  if (!/[^A-Za-z0-9]/.test(value)) return 'Pelo menos um caractere especial';
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
    ['firstName', validateName(fields.firstName, 'Nome')],
    ['lastName',  validateName(fields.lastName, 'Sobrenome')],
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
    ['firstName', validateName(fields.firstName, 'Nome')],
    ['lastName',  validateName(fields.lastName, 'Sobrenome')],
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