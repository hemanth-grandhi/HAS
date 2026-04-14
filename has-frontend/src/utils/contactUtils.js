/**
 * Contact/Phone utilities for international formats
 */

const COUNTRY_CODES = {
  IN: { code: '+91', name: 'India', pattern: /^[6-9]\d{9}$/ },
  US: { code: '+1', name: 'USA', pattern: /^\d{10}$/ },
  UK: { code: '+44', name: 'UK', pattern: /^\d{10}$/ },
  AU: { code: '+61', name: 'Australia', pattern: /^\d{9}$/ },
}

export const formatContactNumber = (input, countryCode = 'IN') => {
  if (!input) return ''
  
  // Remove all non-digits
  const digitsOnly = input.replace(/\D/g, '')
  
  // If already has country code prefix, just validate
  if (input.startsWith('+')) {
    return input
  }
  
  // Add country code prefix
  const country = COUNTRY_CODES[countryCode]
  if (!country) return digitsOnly
  
  return country.code + digitsOnly
}

export const validateContactNumber = (contact, countryCode = 'IN') => {
  if (!contact) return { valid: false, error: 'Contact is required' }
  
  const country = COUNTRY_CODES[countryCode]
  if (!country) return { valid: false, error: 'Invalid country code' }
  
  // Remove spaces and dashes
  const cleaned = contact.replace(/[\s-]/g, '')
  
  // Check if it starts with + and country code
  let digitsOnly = cleaned
  if (cleaned.startsWith('+')) {
    if (!cleaned.startsWith(country.code)) {
      return { valid: false, error: `Number should start with ${country.code}` }
    }
    digitsOnly = cleaned.substring(country.code.length)
  } else {
    digitsOnly = cleaned
  }
  
  if (!country.pattern.test(digitsOnly)) {
    return { valid: false, error: `Invalid ${country.name} phone number format` }
  }
  
  return { valid: true, error: null }
}

export const getCountryCodePrefix = (countryCode = 'IN') => {
  const country = COUNTRY_CODES[countryCode]
  return country ? country.code : '+91'
}

export const formatContactDisplay = (contact) => {
  if (!contact) return '--'
  if (contact.startsWith('+')) return contact
  return '+91' + contact.replace(/\D/g, '')
}
