/**
 * Password generation utility functions
 */

export interface PasswordOptions {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeSimilar?: boolean; // Exclude similar characters like 0, O, l, 1
}

const DEFAULT_OPTIONS: Required<PasswordOptions> = {
  length: 12,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilar: true,
};

const CHARACTER_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  uppercaseNoSimilar: 'ABCDEFGHJKLMNPQRSTUVWXYZ', // Excludes I, O
  lowercaseNoSimilar: 'abcdefghijkmnpqrstuvwxyz', // Excludes l, o
  numbersNoSimilar: '23456789', // Excludes 0, 1
  symbolsNoSimilar: '!@#$%^&*()_+-=[]{}|;:,.<>?', // Same as symbols
};

/**
 * Generate a random password based on the provided options
 */
export function generatePassword(options: PasswordOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Build character set based on options
  let charset = '';
  
  if (opts.includeUppercase) {
    charset += opts.excludeSimilar 
      ? CHARACTER_SETS.uppercaseNoSimilar 
      : CHARACTER_SETS.uppercase;
  }
  
  if (opts.includeLowercase) {
    charset += opts.excludeSimilar 
      ? CHARACTER_SETS.lowercaseNoSimilar 
      : CHARACTER_SETS.lowercase;
  }
  
  if (opts.includeNumbers) {
    charset += opts.excludeSimilar 
      ? CHARACTER_SETS.numbersNoSimilar 
      : CHARACTER_SETS.numbers;
  }
  
  if (opts.includeSymbols) {
    charset += CHARACTER_SETS.symbolsNoSimilar;
  }
  
  // Ensure we have at least one character from each required set
  if (charset.length === 0) {
    throw new Error('At least one character type must be included');
  }
  
  // Generate password
  let password = '';
  for (let i = 0; i < opts.length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

/**
 * Generate a secure password with default settings
 */
export function generateSecurePassword(length: number = 12): string {
  return generatePassword({
    length,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
  });
}

/**
 * Generate a simple password (no symbols, no similar characters)
 */
export function generateSimplePassword(length: number = 8): string {
  return generatePassword({
    length,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: false,
    excludeSimilar: true,
  });
}

/**
 * Calculate password strength score (0-100)
 */
export function calculatePasswordStrength(password: string): number {
  let score = 0;
  
  // Length scoring
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Character variety scoring
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  
  // Pattern penalties
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 10; // Common sequences
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  if (score < 30) return 'Weak';
  if (score < 60) return 'Fair';
  if (score < 80) return 'Good';
  return 'Strong';
}

/**
 * Get password strength color class
 */
export function getPasswordStrengthColor(score: number): string {
  if (score < 30) return 'text-red-600';
  if (score < 60) return 'text-orange-600';
  if (score < 80) return 'text-yellow-600';
  return 'text-green-600';
}
