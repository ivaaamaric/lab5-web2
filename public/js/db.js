import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAHO3yBb3RDIcekCat1rfE67LS3ft0ueHk",
    authDomain: "pwa-lab5.firebaseapp.com",
    projectId: "pwa-lab5",
    storageBucket: "pwa-lab5.appspot.com",
    messagingSenderId: "757024483152",
    appId: "1:757024483152:web:305d90b3b6ea47bf04ee55",
    databaseURL: "https://pwa-lab5-default-rtdb.europe-west1.firebasedatabase.app"
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);
const database = getDatabase(firebaseApp);

export {
    database,
    storage
};