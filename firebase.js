// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// do not expose these keys in a real project, use environmental variables instead
const firebaseConfig = {
  apiKey: "AIzaSyAP0N2WVKuckYYzv_rP-otkUTz-Q4ion2k",
  authDomain: "pantryapp-8e491.firebaseapp.com",
  projectId: "pantryapp-8e491",
  storageBucket: "pantryapp-8e491.appspot.com",
  messagingSenderId: "774588177160",
  appId: "1:774588177160:web:91b8e9dc9f1bced914eabd",
  measurementId: "G-36L8QJRHE3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export {
    app,
    firestore
}