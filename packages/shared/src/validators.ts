import { z } from 'zod';

export const ngPhoneSchema = z
  .string()
  .trim()
  .regex(/^(0)[7-9][0-1]\d{8}$/, 'Enter a valid Nigerian mobile number');

export const pinSchema = z.string().regex(/^\d{4}$/, 'PIN must be 4 digits');

export const emailSchema = z.string().email('Enter a valid email');

export const passwordSchema = z
  .string()
  .min(8, 'Minimum 8 characters')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[0-9]/, 'Include a number');

export const amountSchema = z
  .number()
  .positive()
  .min(50, 'Minimum amount is ₦50');

export const loginSchema = z.object({
  identifier: z.string().min(5, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  fullName: z.string().min(3, 'Enter your full name'),
  email: emailSchema,
  phone: ngPhoneSchema,
  password: passwordSchema,
  referralCode: z.string().optional(),
});

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});
