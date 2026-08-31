import * as CryptoJS from 'crypto-js'

export const encryptUrl = (url: number) => {
  const encryptData = CryptoJS.AES.encrypt(url.toString(), 'Secret Passphrase').toString()

  return encodeURIComponent(encryptData)
}

export const decryptUrl = (url: string) => {
  const decodeData = decodeURIComponent(url)

  return CryptoJS.AES.decrypt(decodeData, 'Secret Passphrase').toString(CryptoJS.enc.Utf8)
}
