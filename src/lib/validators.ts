// CPF/CNPJ validation utilities

export function formatCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, '')
  
  if (digits.length <= 11) {
    // CPF: 000.000.000-00
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  } else {
    // CNPJ: 00.000.000/0000-00
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
  }
}

export function validateCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  
  if (digits.length !== 11) return false
  
  // Check for known invalid CPFs (all same digits)
  if (/^(\d)\1{10}$/.test(digits)) return false
  
  // Validate first check digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i)
  }
  let remainder = sum % 11
  const d1 = remainder < 2 ? 0 : 11 - remainder
  
  if (parseInt(digits[9]) !== d1) return false
  
  // Validate second check digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i)
  }
  remainder = sum % 11
  const d2 = remainder < 2 ? 0 : 11 - remainder
  
  if (parseInt(digits[10]) !== d2) return false
  
  return true
}

export function validateCnpj(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '')
  
  if (digits.length !== 14) return false
  
  // Check for known invalid CNPJs (all same digits)
  if (/^(\d)\1{13}$/.test(digits)) return false
  
  // Validate first check digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights1[i]
  }
  let remainder = sum % 11
  const d1 = remainder < 2 ? 0 : 11 - remainder
  
  if (parseInt(digits[12]) !== d1) return false
  
  // Validate second check digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * weights2[i]
  }
  remainder = sum % 11
  const d2 = remainder < 2 ? 0 : 11 - remainder
  
  if (parseInt(digits[13]) !== d2) return false
  
  return true
}

export function validateCpfCnpj(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  
  if (digits.length === 11) {
    return validateCpf(digits)
  } else if (digits.length === 14) {
    return validateCnpj(digits)
  }
  
  return false
}

export function getCpfCnpjError(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  
  if (digits.length === 0) return null // Empty is OK (optional field)
  
  if (digits.length < 11) return 'CPF deve ter 11 dígitos'
  if (digits.length > 11 && digits.length < 14) return 'CNPJ deve ter 14 dígitos'
  if (digits.length > 14) return 'CPF/CNPJ inválido'
  
  if (digits.length === 11 && !validateCpf(digits)) return 'CPF inválido'
  if (digits.length === 14 && !validateCnpj(digits)) return 'CNPJ inválido'
  
  return null
}
