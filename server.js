import express from "express";
import path from 'path';
import fs from "fs";
import fse from 'fs-extra';
import webpush from "web-push";
import cors from "cors";
import multer from "multer";
import {
    ref,
    uploadBytes,
    listAll,
    deleteObject,
} from "firebase/storage";
import storage from "./db.js";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadPath = path.join(__dirname, "public", "uploads");
const subscription = 'subscriptions.json';
let subscriptions = [];

const memoStorage = multer.memoryStorage();
const upload = multer({ memoStorage });

const httpPort = 8080

const app = express()
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')))

app.listen(httpPort, function () {
    console.log(`Listening on port ${httpPort}!`)
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'))
});

var uploadSnaps = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            let fn = file.originalname.replaceAll(":", "-");
            cb(null, fn);
        },
    })
}).single("image");

app.post("/images", function (req, res) {
    uploadSnaps(req, res, async function (err) {
        if (err) {
            console.log(err);
            res.json({
                success: false,
                error: {
                    message: 'Upload failed. Check error message in console.'
                }
            });
        } else {
            subscriptions.forEach(async sub => {
                try {
                    webpush.setVapidDetails(
                        'mailto:iva.maric@fer.hr',
                        'BApIAn-RdczDwpKrImGICSl9Tct_MLBz6dZkJtVRj3KKxPirbfnZine7CZZHjvAuYFK7UdeEuPlCXK7LiUBUt8w',
                        'FxxD21KmXqgUY1gnPY2AOH78UBz9Se5r3_-WEqQBz2E');
                    await webpush.sendNotification(sub, JSON.stringify({
                        title: 'Photo uploaded',
                        body: 'Your pic is uploaded or a friend shared his/her!',
                        redirectUrl: '/snaps'
                    }));
                } catch (error) {
                    console.error(error);
                }
            });
            res.json({
                success: true,
                id: req.body.id
            });
        }
    });
});

app.post("/addPicture", upload.single("image"), async (req, res) => {
    const file = req.file;
    console.log(file)
    const imageRef = ref(storage, file.originalname);
    const metatype = { contentType: file.mimetype, name: file.originalname };
    await uploadBytes(imageRef, file.buffer)
        .then((snapshot) => {
            res.send("uploaded!");
        })
        .catch((error) => console.log(error.message));
});

app.get("/snaps", function (req, res) {
    let files = fse.readdirSync(uploadPath);
    files = files.reverse().slice(0, 10);
    res.json({
        files
    });
});

app.post('/subscriptions', (req, res) => {
    let sub = req.body.sub;
    subscriptions.push(sub);
    fs.writeFileSync(subscription, JSON.stringify(subscriptions));
    res.status(200).json({
        success: true
    });
});

app.get('/subscriptions', function (req, res) {
    return res.status(200).json({ subscriptions })
})