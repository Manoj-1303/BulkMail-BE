const express = require('express');
const cors = require('cors');
const app = express();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://manojh:123@ac-hepfqjc-shard-00-00.zehkuft.mongodb.net:27017,ac-hepfqjc-shard-00-01.zehkuft.mongodb.net:27017,ac-hepfqjc-shard-00-02.zehkuft.mongodb.net:27017/passkey?ssl=true&replicaSet=atlas-1qyl8q-shard-0&authSource=admin&appName=Manoj').then(function () {
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
                resolve("Success")
            }
            catch (error) {
                reject("Failed");
            }
        }).then(function () {
            res.send(true);
        }).catch(function () {
            res.send(false);
        })
    }).catch(function (error) {
        console.error("Error finding credentials", error);
    });

})
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});