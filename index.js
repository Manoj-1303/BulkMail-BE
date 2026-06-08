require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "https://bulk-mail-fe.vercel.app"]
}));

app.use(express.json());

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
app.get('/', (req, res) => {
    res.send("Bulk mail backend service is running with SendGrid");
});

app.post("/sendmail", async (req, res) => {
    try {
        const { subject, msg, emaildata } = req.body;

        if (!emaildata || !emaildata.length) {
            return res.status(400).json({ success: false, error: "No emails provided" });
        }

        await sgMail.sendMultiple({
            to: emaildata,
            from: process.env.SENDER_EMAIL,
            subject: subject,
            html: `
            <h3>Hello,</h3>
            <p>${msg}</p>
            <br/>
            <p>Regards,<br/>Bulk Mail App</p>`
        });
        res.json({
            success: true, 
            count: emaildata.length
        });
    } catch (err) {
        console.error("Full Error:", err);
        if (err.response) {
            console.error('SendGrid response body:', err.response.body);
        }
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});