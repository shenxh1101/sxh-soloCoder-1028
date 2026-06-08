import type { Currency } from '@/types/travel'

const exchangeRates: Record<Currency, number> = {
  CNY: 1,
  USD: 7.2,
  EUR: 7.8,
  JPY: 0.048,
  GBP: 9.1
}

export const currencySymbols: Record<Currency, string> = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  GBP: '£'
}

export const currencyNames: Record<Currency, string> = {
  CNY: '人民币',
  USD: '美元',
  EUR: '欧元',
  JPY: '日元',
  GBP: '英镑'
}

export const convertCurrency = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number => {
  const amountInCNY = amount * exchangeRates[fromCurrency]
  return Number((amountInCNY / exchangeRates[toCurrency]).toFixed(2))
}

export const formatCurrency = (amount: number, currency: Currency): string => {
  return `${currencySymbols[currency]}${amount.toLocaleString()}`
}

export const getAvailableCurrencies = (): Currency[] => {
  return ['CNY', 'USD', 'EUR', 'JPY', 'GBP']
}
