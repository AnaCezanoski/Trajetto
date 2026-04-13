export const maskName = (text: string) => {
  return text.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
};

export const maskDate = (text: string) => {
  const cleaned = text.replace(/\D/g, '');

  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
};

export const maskPhone = (text: string) => {
  const cleaned = text.replace(/\D/g, '');

  if (cleaned.length <= 2) return `(${cleaned}`;
  if (cleaned.length <= 7)
    return `(${cleaned.slice(0, 2)})${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)})${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password: string) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-]).{8,}$/.test(password);
};

export const validateName = (text: string) => {
  return /^[A-Za-zÀ-ÿ\s]+$/.test(text);
};