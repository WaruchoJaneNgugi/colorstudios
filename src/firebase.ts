import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAmyn9ferBPeTs_7BRkbouQmlIvXqftbX8",
  authDomain: "colorstudios-6c158.firebaseapp.com",
  projectId: "colorstudios-6c158",
  storageBucket: "colorstudios-6c158.firebasestorage.app",
  messagingSenderId: "341465766804",
  appId: "1:341465766804:web:5dd5fc217bbb7681d9cd81",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
