import express from "express";
import path from 'path';
import fse from 'fs-extra';
import webpush from "web-push";
import cors from "cors";
import multer from "multer";
import {
    ref,
    uploadBytes,
    listAll,
} from "firebase/storage";
import { storage, database } from "./public/js/db.js";
import {
    ref as databaseRef,
    set,
    getDatabase,
    onValue
} from "firebase/database";
import { v4 as uuidv4 } from 'uuid';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadPath = path.join(__dirname, "public", "uploads");
let subscriptions = [];

const memoStorage = multer.memoryStorage();
const upload = multer({ memoStorage });

const httpPort = 8080

const app = express()
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')))

app.listen(httpPort, function () {
    updateSubscriptions();
    console.log(`Listening on port ${httpPort}!`)
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

let updateSubscriptions = () => {
    const db = getDatabase();
    var ref = databaseRef(db, "subscriptions/");
    onValue(ref, (subs) => {
        subs.forEach(function (sub) {
            subscriptions.push(sub.val());
        });
    });
}

app.post("/addPicture", upload.single("image"), async (req, res) => {
    const file = req.file;
    const imageRef = ref(storage, file.originalname);
    const metatype = { contentType: file.mimetype, name: file.originalname };
    await uploadBytes(imageRef, file.buffer)
        .then((snapshot) => {
            subscriptions.forEach(async sub => {
                try {
                    webpush.setVapidDetails(
                        'mailto:iva.maric@fer.hr',
                        'BApIAn-RdczDwpKrImGICSl9Tct_MLBz6dZkJtVRj3KKxPirbfnZine7CZZHjvAuYFK7UdeEuPlCXK7LiUBUt8w',
                        'FxxD21KmXqgUY1gnPY2AOH78UBz9Se5r3_-WEqQBz2E');
                    await webpush.sendNotification(sub, JSON.stringify({
                        title: 'Photo uploaded',
                        body: 'Your pic is uploaded or a friend shared his/her!',
                        redirectUrl: '/'
                    }));
                } catch (error) {
                    console.error(error);
                }
            });
            res.json({
                success: true,
                id: req.body.id
            });
        })
        .catch((error) => {
            console.log(error);
            res.json({
                success: false,
                error: {
                    message: 'Upload failed. Check error message in console.'
                }
            });
        });
});

app.get("/snaps", async (req, res) => {
    const listRef = ref(storage);
    let snaps = [];
    await listAll(listRef)
        .then((pics) => {
            snaps = pics.items.map((item) => {
                const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${item._location.bucket}/o/${item._location.path_}?alt=media`;
                return {
                    url: publicUrl,
                    name: item._location.path_,
                };
            });
            res.send(snaps);
        })
        .catch((err) => {
            res.json({
                success: false,
                error: {
                    message: 'Download failed. Probably internet connection invalid.'
                }
            });
        });
});

app.post('/subscriptions', (req, res) => {
    let sub = req.body.sub;
    const db = getDatabase();
    var ref = "subscriptions/" + uuidv4();
    set(databaseRef(db, ref), sub);
    res.status(200).json({
        success: true
    });
});

app.get('/subscriptions', function (req, res) {
    return res.status(200).json({ subscriptions })
})