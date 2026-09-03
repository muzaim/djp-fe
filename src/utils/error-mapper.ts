/**
 * Extract human-readable error messages from NestJS backend API errors
 */
export function extractErrorMessage(err: any): string {
  if (!err)
    return 'Terjadi kesalahan sistem.'

  const message = err?.data?.message || err?.response?._data?.message || err?.message

  if (Array.isArray(message)) {
    return message.join(', ')
  }

  if (typeof message === 'string') {
    return message
  }

  return 'Gagal memproses permintaan, silakan periksa kembali data Anda.'
}

/**
 * Extract field-level errors for binding directly to Vuetify input error-messages
 */
export function extractFieldErrors(err: any): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  const messages = err?.data?.message || err?.response?._data?.message || err?.message

  if (Array.isArray(messages)) {
    messages.forEach(msg => {
      if (typeof msg === 'string') {
        const lowerMsg = msg.toLowerCase()
        if (lowerMsg.includes('email'))
          fieldErrors.email = msg
        else if (lowerMsg.includes('name') || lowerMsg.includes('nama'))
          fieldErrors.name = msg
        else if (lowerMsg.includes('code') || lowerMsg.includes('kode'))
          fieldErrors.code = msg
        else if (lowerMsg.includes('password'))
          fieldErrors.password = msg
        else if (lowerMsg.includes('phone'))
          fieldErrors.phoneNumber = msg
      }
      else if (msg && typeof msg === 'object' && msg.field && msg.errors) {
        fieldErrors[msg.field] = Array.isArray(msg.errors) ? msg.errors.join(', ') : String(msg.errors)
      }
    })
  }

  return fieldErrors
}
