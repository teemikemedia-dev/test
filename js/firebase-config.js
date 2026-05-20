import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSWg6WtWb2KBO9c09a03o7nviOP_bRuhc",
  authDomain: "teemikemedia-dashboard.firebaseapp.com",
  databaseURL: "https://teemikemedia-dashboard-default-rtdb.firebaseio.com",
  projectId: "teemikemedia-dashboard",
  storageBucket: "teemikemedia-dashboard.firebasestorage.app",
  messagingSenderId: "756618817299",
  appId: "1:756618817299:web:f2e9e474f3b186e5cff4e6",
  measurementId: "G-YG7BBXXVZ1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

isSupported()
  .then((supported) => {
    if(supported){
      getAnalytics(app);
    }
  })
  .catch(() => {});

export {
  app,
  auth,
  database,
  firebaseConfig
};
