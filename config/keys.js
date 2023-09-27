module.exports = {
  APP: {
    NAME: 'Shreeti Multi Vendor E-commerce',
    API_URL: `${process.env.BASE_API_URL}`,
  },
  PORT: process.env.PORT || 8800,
  DATABASE: {
    URI: process.env.MONGODB_URI,
  },
  JWT: {
    // JWT TOKEN
    JWT_TOKEN_SECRET: process.env.JWT_TOKEN_SECRET || 'secret',
  },
  EMAIL: {
    // SMTP_SERVER: process.env.SMTP_SERVER,
    // HOST: process.env.SMTP_EMAIL_HOST,
    // PORT: process.env.SMTP_EMAIL_PORT,
    USER: process.env.SMTP_EMAIL_USER,
    PASSWORD: process.env.SMTP_EMAIL_PASSWORD,
  },
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },
}
