require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Bulk mail backend service is running with Brevo API');
});
app.post('/sendmail', async (req, res) => {
  try {
    const { subject, msg, emaildata } = req.body;
    if (!emaildata || !emaildata.length) {
      return res.status(400).json({ success: false, error: 'No emails provided' });
    }
    const formattedRecipients = emaildata.map(email => ({ email: String(email).trim() }));
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Bulk Mail App',
          email: process.env.SENDER_EMAIL,
        },
        to: formattedRecipients,
        subject: subject || 'No Subject',
        htmlContent: `
          <h3>Hello,</h3>
          <p>${msg}</p>
          <br/>
          <p>Regards,<br/>Bulk Mail App</p>
        `,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );
    console.log('Brevo response:', response.data);
    res.json({
      success: true,
      count: emaildata.length,
    });
  } catch (err) {
    const errorDetails = err.response?.data || err.message;
    console.error('Brevo API Error:', errorDetails);
    res.status(500).json({
      success: false,
      error: errorDetails,
    });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});