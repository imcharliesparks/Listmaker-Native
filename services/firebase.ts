// Import the functions you need from the SDKs you need

import {initializeApp} from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

const firebaseConfig = {

    apiKey: "AIzaSyBviteAkD56KcbfzI7bC04e-Yokmbp57hs",

    authDomain: "listmaker-8e57e.firebaseapp.com",

    projectId: "listmaker-8e57e",

    storageBucket: "listmaker-8e57e.firebasestorage.app",

    messagingSenderId: "674512917094",

    appId: "1:674512917094:web:b0a3b351c974f230d293a7"

};


// Initialize Firebase

export const FIREBASE_APP = initializeApp(firebaseConfig);
// @ts-ignore
export const FIREBASE_AUTH = getAuth(firebaseConfig);