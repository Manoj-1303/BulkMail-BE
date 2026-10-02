require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.BREVO_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Brevo SMTP Connection Error:', error);
  } else {
    console.log('Brevo SMTP Server is connected and ready to send');
  }
});

app.get('/', (req, res) => {
  res.send('Bulk mail backend service is running with Brevo');
});

app.post('/sendmail', async (req, res) => {
  try {
    const { subject, msg, emaildata } = req.body;

    if (!emaildata || !emaildata.length) {
      return res.status(400).json({ success: false, error: 'No emails provided' });
    }

    await transporter.sendMail({
      from: `"Bulk Mail App" <${process.env.SENDER_EMAIL}>`,
      to: emaildata, 
      subject: subject || 'No Subject',
      html: `
        <h3>Hello,</h3>
        <p>${msg}</p>
        <br/>
        <p>Regards,<br/>Bulk Mail App</p>
      `,
    });

    res.json({
      success: true,
      count: emaildata.length,
    });
  } catch (err) {
    console.error('Full Error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});