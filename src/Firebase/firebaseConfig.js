import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCiEtKBQCbIsaTKI_wHX-t0xZbhFfmK1Ew",
  authDomain: "livemap-99d57.firebaseapp.com",
  projectId: "livemap-99d57",
  storageBucket: "livemap-99d57.firebasestorage.app",
  messagingSenderId: "471021720634",
  appId: "1:471021720634:web:2a8c4e10ce80f043e65103",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();