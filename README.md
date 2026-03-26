# ScamWatch

Community-powered scam reporting and awareness platform built with React + Firebase.

## Setup

### 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add project** and follow the steps
3. Enable **Authentication** → Sign-in methods → turn on **Email/Password** and **Google**
4. Enable **Firestore Database** → Start in **production mode**

### 2. Get your Firebase config

Firebase Console → Project Settings → Your Apps → click the web icon (`</>`) → copy the config object.

### 3. Add your config

Open `src/firebase.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
};
```

### 4. Deploy Firestore security rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project
firebase deploy --only firestore:rules
```

Or paste the contents of `firestore.rules` directly in the Firebase Console under Firestore → Rules.

### 5. Install and run

```bash
npm install
npm start
```

---

## Project structure

```
src/
  firebase.js           # Firebase init + exports
  App.jsx               # Router + auth wrapper
  index.css             # Global styles + design tokens
  context/
    AuthContext.jsx     # Auth state provider + hook
  pages/
    Auth.jsx            # Login / signup page
    Feed.jsx            # Main scam feed
  components/
    Navbar.jsx          # Top nav with auth state
    ScamCard.jsx        # Individual scam report card
    ReportModal.jsx     # Report submission modal
```

## Firestore data model

Each document in the `scams` collection:

```js
{
  title: string,           // Short scam title
  type: string,            // Category (Investment, Romance, etc.)
  channel: string,         // How it was delivered (WhatsApp, SMS, etc.)
  severity: string,        // "High" | "Medium" | "Low"
  excerpt: string,         // Auto-generated short preview
  description: string,     // Full description
  avoidanceTip: string,    // How to avoid
  amountLost: string,      // Optional reported loss
  reporterId: string,      // Firebase Auth UID
  reporterName: string,    // Display name or email prefix
  helpfulVotes: string[],  // Array of UIDs who found it helpful
  createdAt: Timestamp,    // Firestore server timestamp
}
```

## Next steps

- [ ] Add pagination / infinite scroll to the feed
- [ ] Add a scam detail page (`/scam/:id`)
- [ ] Add moderation queue for report review
- [ ] Add AI-generated tip enhancement (OpenRouter + Claude)
- [ ] Add email notifications for new reports in a category
- [ ] Add a "trending scams" section