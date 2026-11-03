/**
 * Client-Side Validation Utilities for Civic Connect
 * Standardizes Indian mobile phone numbers and password complexity checks with real-time UI feedback.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string;
  error?: string;
}

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0 to 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  error?: string;
  checks: {
    length: boolean;
    hasLetter: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

const COMMON_WEAK_PASSWORDS = new Set([
  '123456',
  'password',
  '12345678',
  'qwerty',
  '123456789',
  '12345',
  '1234',
  'admin123',
  'password123',
]);

/**
 * Standardize and validate 10-digit Indian mobile numbers (starts with 6, 7, 8, or 9).
 */
export function validateIndianPhone(input: string): PhoneValidationResult {
  if (!input || !input.trim()) {
    return { isValid: false, normalized: '', error: 'Mobile number is required.' };
  }

  // Remove non-digit characters
  let digits = input.replace(/\D/g, '');

  // Strip +91 or 91 country code
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (digits.length !== 10) {
    return {
      isValid: false,
      normalized: digits,
      error: 'Please enter a complete 10-digit mobile number.',
    };
  }

  if (!/^[6-9]/.test(digits)) {
    return {
      isValid: false,
      normalized: digits,
      error: 'Indian mobile numbers must start with 6, 7, 8, or 9.',
    };
  }

  return { isValid: true, normalized: digits };
}

/**
 * Evaluate password strength, complexity score, and individual criterion checks.
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const pwd = (password || '').trim();

  const checks = {
    length: pwd.length >= 6,
    hasLetter: /[a-zA-Z]/.test(pwd),
    hasNumber: /\d/.test(pwd),
    hasSpecial: /[^a-zA-Z0-9]/.test(pwd),
  };

  let score = 0;
  if (checks.length) score++;
  if (checks.hasLetter) score++;
  if (checks.hasNumber) score++;
  if (pwd.length >= 8 && checks.hasSpecial) score++;

  if (COMMON_WEAK_PASSWORDS.has(pwd.toLowerCase())) {
    return {
      isValid: false,
      score: 1,
      label: 'Weak',
      color: 'text-red-600 bg-red-500',
      error: 'This password is too common and easily guessed.',
      checks,
    };
  }

  const isValid = checks.length && checks.hasLetter && checks.hasNumber;

  let label: 'Weak' | 'Fair' | 'Good' | 'Strong' = 'Weak';
  let color = 'text-red-500 bg-red-500';

  if (score >= 4) {
    label = 'Strong';
    color = 'text-emerald-600 bg-emerald-500';
  } else if (score === 3) {
    label = 'Good';
    color = 'text-teal-600 bg-teal-500';
  } else if (score === 2) {
    label = 'Fair';
    color = 'text-amber-600 bg-amber-500';
  }

  let error: string | undefined = undefined;
  if (!checks.length) {
    error = 'Password must be at least 6 characters.';
  } else if (!checks.hasLetter || !checks.hasNumber) {
    error = 'Include both letters and at least one number.';
  }

  return { isValid, score, label, color, error, checks };
}
