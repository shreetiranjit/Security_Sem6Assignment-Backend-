//setting up expressError class to handle errors
class expressError extends Error {
  constructor(message, statusCode) {
    super()
    this.message = message
    this.statusCode = statusCode
  }
}

module.exports = expressError
