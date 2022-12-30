import express from "express";
import multer from "multer";
import path from 'path';
import fs from "fs";
import fse from 'fs-extra';
import webpush from "web-push";
import cors from 'cors';
import { Storage } from '@google-cloud/storage';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const upload = path.join(__dirname, "public", "uploads");
const subscription = 'subscriptions.json';
let subscriptions = [];

const httpPort = 8080

const app = express()
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')))

const storage = new Storage({
    keyFilename: "./certs/pwa-lab5-firebase-adminsdk-ebpgm-8d19c5df7c.json",
});

app.listen(httpPort, function () {
    console.log(`Listening on port ${httpPort}!`)
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'))
});

var uploadSnaps = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, upload);
        },
        filename: function (req, file, cb) {
            let fn = file.originalname.replaceAll(":", "-");
            cb(null, fn);
        },
    })
}).single("image");

var uploadImage = async (filename) => {
    await storage.bucket(bucketName).upload(filename, {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: true,
        // By setting the option `destination`, you can change the name of the
        // object you are uploading to a bucket.
        metadata: {
            // Enable long-lived HTTP caching headers
            // Use only if the contents of the file will never change
            // (If the contents will change, use cacheControl: 'no-cache')
            cacheControl: 'public, max-age=31536000',
        },
    })
}

app.post("/images", function (req, res) {
    uploadImage(req.body.snap)
        .then(console.log("ok"))
        .catch(err => console.log(err))

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

app.get("/snaps", function (req, res) {
    let files = fse.readdirSync(upload);
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