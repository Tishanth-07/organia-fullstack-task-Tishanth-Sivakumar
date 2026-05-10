export interface AuthResponse {
  token: string
  email: string
  firstName: string
  lastName: string
  role: 'User' | 'Admin'
}

export interface MessageResponse {
  message: string
}

export interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginForm {
  email: string
  password: string
}

export interface VerifyEmailForm {
  email: string
  code: string
}

export interface ForgotPasswordForm {
  email: string
}

export interface ResetPasswordForm {
  email: string
  code: string
  newPassword: string
  confirmPassword: string
}