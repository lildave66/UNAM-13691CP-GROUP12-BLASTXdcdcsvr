# BlastXApp - Production Setup Guide

## Overview

BlastXApp is now configured for **production use with Firebase**. All mock functions and test data have been removed. The app requires Firebase credentials to run.

## Required Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter a project name (e.g., "BlastXApp")
4. Follow the setup wizard

### 2. Get Firebase Credentials

Your project has already been created and the Firebase config has been inserted into `src/config/firebaseConfig.js`.

The values already stored there are:

- `apiKey`: `AIzaSyBC2oaphuML4Nx1GvWn8m7J0s4l9bVMg5U`
- `authDomain`: `blastx-95436.firebaseapp.com`
- `projectId`: `blastx-95436`
- `storageBucket`: `blastx-95436.firebasestorage.app`
- `messagingSenderId`: `220783300604`
- `appId`: `1:220783300604:web:3f21cb88c1a987eb8dac79`
- `measurementId`: not set (optional)

If you want to use Firebase Analytics later, add your `measurementId` value.

### 3. Verify Firebase Config File

1. Open `src/config/firebaseConfig.js`
2. Confirm the values match the Firebase project settings above
3. If needed, update the `measurementId` later

The file should look like this:

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSyBC2oaphuML4Nx1GvWn8m7J0s4l9bVMg5U",
  authDomain: "blastx-95436.firebaseapp.com",
  projectId: "blastx-95436",
  storageBucket: "blastx-95436.firebasestorage.app",
  messagingSenderId: "220783300604",
  appId: "1:220783300604:web:3f21cb88c1a987eb8dac79",
  measurementId: "",
};
```

### 4. Enable Firebase Services

In Firebase Console, enable these services for your project:

#### Authentication (Email/Password)

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Enable **Email link (passwordless sign-in)** (optional)

#### Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Production mode**
4. Select a location closest to your users

### 5. Configure Firestore Security Rules

In Firebase Console → **Firestore Database** → **Rules**:

Replace the default rules with only the code block below.

> If Firebase reports an error on line one, it usually means you are still pasting extra text.
> Paste only the text shown in the code block, not the headings or notes.

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /companies/{companyCode} {
      allow read, write: if request.auth.uid != null;

      match /blasts/{blastId} {
        allow read: if request.auth.uid != null;
        allow create: if request.auth.uid != null &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.canCreateBlasts == true;
        allow update: if request.auth.uid != null &&
          (resource.data.createdBy == request.auth.uid ||
           get(/databases/$(database)/documents/companies/$(companyCode)).data.registeredBy == request.auth.uid);
        allow delete: if request.auth.uid != null &&
          (resource.data.createdBy == request.auth.uid ||
           get(/databases/$(database)/documents/companies/$(companyCode)).data.registeredBy == request.auth.uid);
      }

      match /team/{userId} {
        allow read: if request.auth.uid != null;
        allow write: if request.auth.uid != null &&
          get(/databases/$(database)/documents/companies/$(companyCode)).data.registeredBy == request.auth.uid;
      }

      match /favorites/{favoriteId} {
        allow read: if request.auth.uid == resource.data.userId;
        allow create: if request.auth.uid == request.resource.data.userId;
        allow delete: if request.auth.uid == resource.data.userId;
      }

      match /settings/{doc=**} {
        allow read: if request.auth.uid != null;
        allow write: if request.auth.uid != null &&
          get(/databases/$(database)/documents/companies/$(companyCode)).data.registeredBy == request.auth.uid;
      }
    }

    match /users/{userId} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid == userId ||
        (request.auth.uid != null &&
         get(/databases/$(database)/documents/companies/$(resource.data.companyCode)).data.registeredBy == request.auth.uid);
    }
  }
}
```

Click **Publish** to apply the rules.

### 6. Required user field for blast creation

The Firestore rule for `/companies/{companyCode}/blasts` checks `canCreateBlasts` on the authenticated user document.

Make sure each user document stores this boolean and sets it according to role:

- `true` for editable roles such as `Engineer`, `Specialist`, and `Analyst`
- `false` for read-only roles such as `Supervisor`, `Manager`, and `Technician`

Example user document:

```json
/users/{userId}
  - uid: string
  - email: string
  - name: string
  - companyCode: string
  - minePosition: string
  - canCreateBlasts: boolean
```

### 7. Database Structure

Your Firestore database should have this structure:

```
/users/{userId}
  - uid: string
  - email: string
  - name: string
  - companyCode: string
  - minePosition: string (Engineer, Specialist, Analyst, etc.)
  - canCreateBlasts: boolean
  - company: { name, mineType, location, rbacEnabled }
  - createdAt: timestamp
  - updatedAt: timestamp

/companies/{companyCode}
  - code: string
  - name: string
  - mineType: string
  - location: string
  - registeredBy: string (admin user ID)
  - rbacEnabled: boolean
  - createdAt: timestamp
  - updatedAt: timestamp

  /blasts/{blastId}
    - title: string
    - description: string
    - launchDate: timestamp
    - blastSize: number
    - targetArea: string
    - holes: number
    - explosivesUsed: string
    - detonationPattern: string
    - status: string (Scheduled, Completed)
    - results: { recordedAt, rocksFragmented, productivityRating, safetyIncidents }
    - createdBy: string
    - createdAt: timestamp
    - updatedAt: timestamp

  /team/{userId}
    - uid: string
    - email: string
    - name: string
    - minePosition: string
    - canCreateBlasts: boolean

  /favorites/{favoriteId}
    - userId: string
    - blastId: string
    - addedAt: timestamp

  /settings/config
    - rbacEnabled: boolean
    - updatedAt: timestamp
```

## Running the App

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npx expo start
```

### Test on Expo Go

1. Install **Expo Go** app on your phone
2. Scan the QR code from terminal
3. App will load with your Firebase configuration

## Environment Variables

The app uses these environment variables (set in `firebaseConfig.js`):

> `.env.example` is a sample template only. The current app does not automatically load ` .env` values unless you add a package such as `react-native-dotenv` or configure Expo to load env vars.

| Variable            | Source                                         | Example                           |
| ------------------- | ---------------------------------------------- | --------------------------------- |
| `apiKey`            | Firebase Console → Project Settings            | `AIzaSy...`                       |
| `authDomain`        | Firebase Console → Project Settings            | `blastxapp-12345.firebaseapp.com` |
| `projectId`         | Firebase Console → Project Settings            | `blastxapp-12345`                 |
| `storageBucket`     | Firebase Console → Project Settings            | `blastxapp-12345.appspot.com`     |
| `messagingSenderId` | Firebase Console → Project Settings            | `123456789`                       |
| `appId`             | Firebase Console → Project Settings            | `1:123456789:web:abc123...`       |
| `measurementId`     | Firebase Console → Project Settings (optional) | `G-ABC123XYZ`                     |

## API Keys Security

⚠️ **IMPORTANT:**

1. **Never commit** `src/config/firebaseConfig.js` to version control
2. Add to `.gitignore`:
   ```
   src/config/firebaseConfig.js
   .env
   .env.local
   ```
3. Share config file **securely** with team members (not in chat/email)
4. **Enable Firestore Security Rules** to restrict database access
5. For production builds, use **environment variables** instead of hardcoded values

## Authentication Flow

1. User signs up with email/password via `LoginScreen` → `SignupScreen`
2. Firebase creates user in Auth and `users` collection
3. User completes setup (company info, mine position)
4. User is directed to Dashboard with their blasts

## Data Persistence

- **Cached locally** via `@react-native-async-storage/async-storage`
- **Stored remotely** in Firestore
- **Synced** on app focus and specific operations

## Troubleshooting

### "Firebase config not found"

- Ensure `src/config/firebaseConfig.js` exists
- Check all required fields are present

### "No authenticated user"

- User must sign in first
- Check Firestore Auth is enabled
- Verify user document exists in `/users/{userId}`

### "Permission denied" in Firestore

- Check Firestore Security Rules are published
- Verify user has correct role/permissions
- Check user document has required fields

### App won't load on Expo Go

- Restart Expo development server: `Ctrl+C` then `npx expo start`
- Clear cache: `npx expo start --clear`
- Check Firebase credentials in `firebaseConfig.js`

## Support

For Firebase issues, see [Firebase Documentation](https://firebase.google.com/docs/)

For app issues, check console logs in Expo Go (shake phone → view logs)
