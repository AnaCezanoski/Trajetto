export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string | null;
  country: string | null;
  telephone: string | null;
  isAdmin: boolean;
  travelerProfile: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
  country: string;
  telephone: string;
}