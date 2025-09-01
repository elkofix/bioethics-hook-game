import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8C0WtNC6-Al_GZsU93rP_0YBRDdLMTdQ",
  authDomain: "bioethics-149f8.firebaseapp.com",
  projectId: "bioethics-149f8",
  storageBucket: "bioethics-149f8.firebasestorage.app",
  messagingSenderId: "213674127804",
  appId: "1:213674127804:web:660b963a96984f0f18fbb9"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
