import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD35akNF9YFhRl0E69BKWBdmEOwFWHuh6Y",
  authDomain: "bytebank-app-fc4ce.firebaseapp.com",
  projectId: "bytebank-app-fc4ce",
  storageBucket: "bytebank-app-fc4ce.firebasestorage.app",
  messagingSenderId: "828019232363",
  appId: "1:828019232363:web:fbb5f78ff54a46daa2eb2e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
