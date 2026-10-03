// Live sync settings for the Combat Resolver.
//
// 1. In the Firebase console, open your project, then Project settings > General > Your apps > Web app.
// 2. Copy the values from the "firebaseConfig" snippet into the matching fields below.
//    databaseURL is required. It appears once you have created a Realtime Database.
// 3. Save and upload this file. The Combat Resolver picks it up on the next page load.
//
// While these fields are empty the Combat Resolver still works, but only on one screen.
window.HBA_FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
