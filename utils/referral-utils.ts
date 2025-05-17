// utils/helpers.ts

/**
 * Generates a unique referral number
 * Format: REF-YYYYMMDD-XXXX where XXXX is a random 4-digit number
 */
export function generateReferralNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${year}${month}${day}`;
  
  // Generate a random 4-digit number
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  
  return `REF-${dateString}-${randomNum}`;
}