export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone) {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function validatePassword(password) {
  return password && password.length >= 6;
}

export function validateRequired(value) {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

export function validateCardNumber(cardNumber) {
  const cleaned = cardNumber.replace(/\s/g, '');
  return /^\d{16}$/.test(cleaned);
}

export function validateExpiry(expiry) {
  const [month, year] = expiry.split('/');
  if (!month || !year) return false;
  
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  if (monthNum < 1 || monthNum > 12) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  
  if (yearNum < currentYear) return false;
  if (yearNum === currentYear && monthNum < currentMonth) return false;
  
  return true;
}

export function validateCVV(cvv) {
  return /^\d{3,4}$/.test(cvv);
}

export function validateUPI(upiId) {
  return /^[\w.\-]+@[\w]+$/.test(upiId);
}

export function getCardType(cardNumber) {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';
  if (/^(?:2131|1800|35)/.test(cleaned)) return 'jcb';
  
  return null;
}

export function formatCardNumber(value) {
  const cleaned = value.replace(/\D/g, '').substring(0, 16);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : '';
}

export function formatExpiry(value) {
  const cleaned = value.replace(/\D/g, '').substring(0, 4);
  if (cleaned.length >= 2) {
    return cleaned.substring(0, 2) + '/' + cleaned.substring(2);
  }
  return cleaned;
}

export default {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
  validateCardNumber,
  validateExpiry,
  validateCVV,
  validateUPI,
  getCardType,
  formatCardNumber,
  formatExpiry
};
