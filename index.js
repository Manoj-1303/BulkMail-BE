const express = require('express');
const cors = require('cors');
const app = express();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
require('dotenv').config();

app.use(cors({
    origin: ["http://localhost:5173", "https://bulk-mail-fe.vercel.app"]
}));

app.use(express.json());

mongoose.connect(process.env.PASS_KEY).then(function () {
    console.log("Connected to DB");
}).catch(function (err) {
    console.error("Full DB Error:", err);
});

const credential = mongoose.model("credential", {}, "bulkmail");

app.post("/sendemail", (req, res) => {
    var msg = req.body.msg;
    var subject = req.body.subject;
    var emailList = req.body.emails;

    credential.find().then(function (data) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: data[0].toJSON().user,
                pass: data[0].toJSON().pass
            }
        });

        new Promise(async (resolve, reject) => {
            try {
                for (var i = 0; i < emailList.length; i++) {
                    await transporter.sendMail({
                        from: 'manojharibabu13@gmail.com',
                        to: emailList[i],
                        subject: subject,
                        text: msg,
                    });
                    console.log("Email sent to " + emailList[i]);
                }
                resolve("Success");
            }
            catch (error) {
                console.log("NODEMAILER ERROR: ", error); 
                reject("Failed");
            }
        }).then(function () {
            res.send(true);
        }).catch(function () {
            res.send(false);
        })
    }).catch(function (error) {
        console.error("Error finding credentials", error);
        res.send(false);
    });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});