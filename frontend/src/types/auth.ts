/**
 * Response structure after a successful authentication (Login).
 */
export interface AuthResponse {
  /** JWT access token */
  token: string;
  /** User's email address */
  email: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** System authorization role */
  role: 'User' | 'Admin';
}

/**
 * Standard API response for operations that only return a message.
 */
export interface MessageResponse {
  message: string;
}

// ── Form Data Interfaces ──────────────────────────────────────────────────

/** Data collected during user registration */
export interface RegisterForm {
  firstName:       string;
  lastName:        string;
  email:           string;
  password:        string;
  confirmPassword: string;
}

/** Credentials used for user login */
export interface LoginForm {
  email:    string;
  password: string;
}

/** Data required for email verification (OTP) */
export interface VerifyEmailForm {
  email: string;
  code:  string;
}

/** Data required to request a password reset */
export interface ForgotPasswordForm {
  email: string;
}

/** Data required to complete a password reset */
export interface ResetPasswordForm {
  email:           string;
  code:            string;
  newPassword:     string;
  confirmPassword: string;
}