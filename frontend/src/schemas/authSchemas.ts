import { z } from 'zod'

/**
 * Authentication Schemas
 * Defines the validation logic for all user-facing auth forms.
 * Enforces strict security requirements and consistent error messaging.
 */

// ── Shared Rules ────────────────────────────────────────────────────────────

/**
 * Password Complexity Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one numeric digit
 * - At least one special symbol
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/\d/, 'Must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least one symbol')

/**
 * OTP Verification Code Rules:
 * - Exactly 6 characters
 * - Numeric digits only
 */
const otpCodeSchema = z
  .string()
  .length(6, 'Code must be exactly 6 digits')
  .regex(/^\d+$/, 'Code must contain only digits')

// ── Form Schemas ────────────────────────────────────────────────────────────

/**
 * Registration Schema
 * Validates full user profile creation details.
 */
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name must be 50 characters or less')
      .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be 50 characters or less')
      .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

/**
 * Login Schema
 * Basic credentials validation for session entry.
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

/**
 * Verify Email Schema
 * Validation for the account activation code.
 */
export const verifyEmailSchema = z.object({
  code: otpCodeSchema,
})

/**
 * Forgot Password Schema
 * Validation for the initial recovery request.
 */
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
})

/**
 * Reset Password Schema
 * Validates the final step of the recovery flow.
 */
export const resetPasswordSchema = z
  .object({
    code: otpCodeSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ── TypeScript Types ────────────────────────────────────────────────────────

export type RegisterSchema       = z.infer<typeof registerSchema>
export type LoginSchema          = z.infer<typeof loginSchema>
export type VerifyEmailSchema    = z.infer<typeof verifyEmailSchema>
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordSchema  = z.infer<typeof resetPasswordSchema>