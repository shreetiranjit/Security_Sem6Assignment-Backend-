const crypto = require('crypto')

// Function to generate a valid key
const generateValidKey = (key, algorithm) => {
  const keyLength = crypto.getCiphers().includes(algorithm) ? 64 : 32
  return crypto.createHash('sha256').update(String(key)).digest('hex').slice(0, keyLength)
}

// Encrypting text
const encryptData = (data, key, algorithm) => {
  try {
    console.log('data', data)

    const iv = crypto.randomBytes(16)
    // Ensure the key length is correct for the algorithm
    const validKey = generateValidKey(key, algorithm)
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(validKey, 'hex'), iv)
    let encrypted = cipher.update(data, 'utf-8', 'hex')
    encrypted += cipher.final('hex')
    console.log('enn', encrypted)

    return { encrypted, iv: iv.toString('hex') }
  } catch (error) {
    throw error
  }
}

// Function to decrypt data
const decryptData = (encryptedData, key, algorithm, iv) => {
  try {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(generateValidKey(key, algorithm), 'hex'), Buffer.from(iv, 'hex'))
    let decrypted = decipher.update(encryptedData, 'hex', 'utf-8')
    decrypted += decipher.final('utf-8')
    return decrypted
  } catch (error) {
    throw error
  }
}

module.exports = {
  encryptData,
  decryptData,
}
