import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAHO3yBb3RDIcekCat1rfE67LS3ft0ueHk",
    authDomain: "pwa-lab5.firebaseapp.com",
    projectId: "pwa-lab5",
    storageBucket: "pwa-lab5.appspot.com",
    messagingSenderId: "757024483152",
    appId: "1:757024483152:web:305d90b3b6ea47bf04ee55"
};

const firebaseApp = initializeApp(firebaseConfig);

// Get a reference to the storage service, which is used to create references in your storage bucket
export default getStorage(firebaseApp);