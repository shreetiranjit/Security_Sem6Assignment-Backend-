// External Dependencies
const nodemailer = require('nodemailer')
// Internal Dependencies
const { EMAIL } = require('../config/keys')
const sendEmail = async (toEmail, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL_USER,
        pass: process.env.SMTP_EMAIL_PASSWORD,
      },
    })

    const mailOptions = {
      from: process.env.SMTP_EMAIL_USER,
      to: toEmail,
      subject: subject,
      html: htmlContent,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.response)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

//static email content
const createOTPMailContent = (email, otp) => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shreeti Store - OTP for Registration</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f8f8f8;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #333333;
    }

    p {
      color: #555555;
      line-height: 1.6;
    }

    strong {
      color: #0066cc;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Shreeti Store - Registration OTP</h1>
    <p>Dear valued customer,</p>
    <p>Your One-Time Password (OTP) for registration at Shreeti Store is <strong>${otp}</strong>. It is valid for 10 minutes.</p>
    <p>Thank you for choosing Shreeti Store for your online shopping needs.</p>
    <p>Best Regards,<br>Shreeti Store Team</p>
  </div>
</body>
</html>
`
}
const passwordChangeMailContent = email => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shreeti Store - OTP for Registration</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f8f8f8;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #333333;
    }

    p {
      color: #555555;
      line-height: 1.6;
    }

    strong {
      color: #0066cc;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Shreeti Store - Order Confirmation</h1>
    <p>Dear valued customer,</p>
    <p>Your password has been changed. </p>
    <p>Thank you for choosing Shreeti Store for your online shopping needs.</p>
    <p>Best Regards,<br>Shreeti Store Team</p>
  </div>
</body>
</html>
`
}

//order mail confirmation content
const orderStatusMailContent = text => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shreeti Store - OTP for Registration</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f8f8f8;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #333333;
    }

    p {
      color: #555555;
      line-height: 1.6;
    }

    strong {
      color: #0066cc;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Shreeti Store - Order Confirmation</h1>
    <p>Dear valued customer,</p>
    <p>Your order has been ${text}. </p>
    <p>Thank you for choosing Shreeti Store for your online shopping needs.</p>
    <p>Best Regards,<br>Shreeti Store Team</p>
  </div>
</body>
</html>
`
}

//forgot password mail content
const forgotPasswordShopMailContent = (email, companyName, origin, token) => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shreeti Store - OTP for Registration</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f8f8f8;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #333333;
    }

    p {
      color: #555555;
      line-height: 1.6;
    }

    strong {
      color: #0066cc;
    }
  </style>
</head>
<body>
  <div class="container">
  <div style="margin:auto;background:white;border:1px solid #dedede;width:400px;padding:20px">
          <h1>Shreeti Store -Reset Your Password?</h1>
          <p>Dear valued customer,</p>
          <p>If you have sent password reset request for shop named ${getShop.companyName} click link below which sends you to password reset page.</p>
          <p>If you didn't make this request ignore this email.</p>
          <a href="${origin}/seller/forgot_password/reset_password/${token}">Reset Your Password</a>
          <p>Thank you for choosing Shreeti Store for your online shopping needs.</p>
    <p>Best Regards,<br>Shreeti Store Team</p>
          <hr />
          <h3 style="text-align:center">Shreeti Store</h3>

          <p style="text-align:center; font-size:11px;">Shreeti Store</p>
        </div>

    

    
  </div>
</body>
</html>
`
}

//added forgot password user mail content
const forgotPasswordUserMailContent = (email, username, token) => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shreeti Store - OTP for Registration</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f8f8f8;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #333333;
    }

    p {
      color: #555555;
      line-height: 1.6;
    }

    strong {
      color: #0066cc;
    }
  </style>
</head>
<body>
  <div class="container">
 <div style="margin:auto;background:white;border:1px solid #dedede;width:400px;padding:20px">
        <h1>Shreeti Store -Reset Your Password?</h1>
          <p>Dear valued customer,</p>
        <p>If you have sent password reset request for @${username} copy bold text down there which is your confirmation code.</p>
        <p>If you didn't make this request ignore this email.</p>
        <h2><strong>${token}</strong></h2>
        <hr />
        <h3 style="text-align:center">Shreeti E-commerce Store</h3>
        <p style="text-align:center; font-size:11px;">Shreeti E-commerce store</p>
      </div>

    

    
  </div>
</body>
</html>
`
}
const sendOTPMail = async (email, otp) => {
  const htmlContent = createOTPMailContent(email, otp)
  await sendEmail(email, 'OTP mail sent', htmlContent)
}

const sendOrderConfirmationMail = async text => {
  const htmlContent = orderStatusMailContent(text)
  await sendEmail(text, 'Order Status Changed', htmlContent)
}

const sendForgotPasswordShopMail = async (email, companyName, origin, token) => {
  const htmlContent = forgotPasswordShopMailContent(email, companyName, origin, token)
  await sendEmail(email, 'Forgot Password', htmlContent)
}

const sendForgotPasswordUserMail = async (email, username, token) => {
  const htmlContent = forgotPasswordUserMailContent(email, username, token)
  await sendEmail(email, 'Forgot Password', htmlContent)
}

const sendPasswordChangeMail = async email => {
  const htmlContent = passwordChangeMailContent(email)
  await sendEmail(email, 'Password Changed', htmlContent)
}

module.exports = {
  sendOTPMail,
  sendOrderConfirmationMail,
  sendForgotPasswordShopMail,
  sendForgotPasswordUserMail,
  sendPasswordChangeMail,
}
