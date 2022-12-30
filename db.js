import { initializeApp } from "firebase/app";
import "firebase/storage";
// import admin from "firebase-admin";

const firebaseConfig = {
    apiKey: "AIzaSyAHO3yBb3RDIcekCat1rfE67LS3ft0ueHk",
    authDomain: "pwa-lab5.firebaseapp.com",
    projectId: "pwa-lab5",
    storageBucket: "pwa-lab5.appspot.com",
    messagingSenderId: "757024483152",
    appId: "1:757024483152:web:305d90b3b6ea47bf04ee55"
};

// var serviceAccount = require("./certs/pwa-lab5-firebase-adminsdk-ebpgm-8d19c5df7c.json");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

const db = initializeApp(firebaseConfig);
export {
    db
}