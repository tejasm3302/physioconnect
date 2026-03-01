import { CURRENCIES, DEFAULT_CURRENCY } from '../config/constants';

export function formatCurrency(amount, currencyCode = DEFAULT_CURRENCY) {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);

  return `${currency.symbol}${formattedAmount}`;
}

export function getCurrencySymbol(currencyCode = DEFAULT_CURRENCY) {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  return currency.symbol;
}

export default { formatCurrency, getCurrencySymbol };
