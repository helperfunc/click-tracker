# Click Tracker App

A modern web application demonstrating full-stack development with React, Firebase, and Google Cloud Platform.

## Features

- **User Authentication**: Email/password authentication using Firebase Auth
- **Click Tracking**: Records and displays per-user button click counts
- **Real-time Data**: Uses Firestore for real-time data synchronization
- **Secure Backend API**: Node.js/Express API with Firebase Admin SDK authentication
- **Modern UI**: React with TypeScript and responsive design
- **Cloud Deployment**: Frontend on Firebase Hosting, backend on Cloud Run

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React App    │────▶│  Firebase Auth   │────▶│   Firestore     │
│ (Firebase Host)│     │                  │     │   Database      │
└────────┬────────┘     └──────────────────┘     └─────────────────┘
         │                                                  ▲
         │                                                  │
         ▼                                                  │
┌─────────────────┐     ┌──────────────────┐              │
│  Node.js API   │────▶│ Firebase Admin   │──────────────┘
│  (Cloud Run)   │     │      SDK         │
└─────────────────┘     └──────────────────┘
```

## Prerequisites

- Node.js 18+ and npm
- Google Cloud Platform account
- Firebase project
- gcloud CLI installed and configured
- Firebase CLI installed (`npm install -g firebase-tools`)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd click-tracker-app
```

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Register a web app and get configuration

**Firebase CLI Setup:**
```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project (run once in project root)
firebase init

# Deploy Firestore security rules
firebase deploy --only firestore:rules
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in the frontend directory:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Backend Setup

```bash
cd backend
npm install
```

1. Generate a Firebase service account key:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `service-account-key.json` in the backend directory

2. Create `.env` file in the backend directory:

```env
PORT=3001
FIREBASE_SERVICE_ACCOUNT_KEY=./service-account-key.json
```

### 5. Local Development

Start both frontend and backend in separate terminals:

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:3001
```

**Quick Start (Alternative):**
```bash
# Install dependencies for both services
npm run install:all

# Start both services simultaneously
npm run dev:all
```

## Deployment

### Prerequisites

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Install Google Cloud SDK: [Download here](https://cloud.google.com/sdk/docs/install)
3. Login to both:
   ```bash
   firebase login
   gcloud auth login
   ```

### Deploy Everything

**Option 1: Local Deployment (requires gcloud CLI)**
```bash
chmod +x deploy.sh
./deploy.sh YOUR-PROJECT-ID
```

Or deploy components individually:

### Deploy Frontend to Firebase Hosting

```bash
cd frontend
npm run build
firebase deploy --only hosting --project YOUR-PROJECT-ID
```

### Deploy Backend to Cloud Run

```bash
cd backend
gcloud builds submit --config cloudbuild.yaml --project YOUR-PROJECT-ID
```

### Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules --project YOUR-PROJECT-ID
```

**Option 2: GitHub Actions Deployment (recommended for Windows)**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Google Cloud
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          
      - name: Setup Google Cloud SDK
        uses: google-github-actions/setup-gcloud@v2
        
      - name: Install Firebase CLI
        run: npm install -g firebase-tools
          
      - name: Build Frontend
        run: cd frontend && npm install && npm run build
        
      - name: Deploy Frontend to Firebase Hosting
        run: firebase deploy --only hosting --token ${{ secrets.FIREBASE_TOKEN }}
        
      - name: Deploy Backend to Cloud Run
        run: cd backend && gcloud builds submit --config cloudbuild.yaml
```

**Required GitHub Secrets:**
- `GCP_PROJECT_ID`: Your Google Cloud project ID
- `GCP_SA_KEY`: Service account JSON key (base64 encoded)
- `FIREBASE_TOKEN`: Firebase deployment token

**Common GitHub Actions Issues:**

1. **"Dependencies lock file is not found" Error:**
   - This happens when using `cache: 'npm'` without package-lock.json
   - Solution: Remove the cache line or commit package-lock.json files

2. **"Permission denied" or "User is forbidden from accessing bucket" Error:**
   - Check service account has ALL required roles:
     - **Cloud Build Editor**
     - **Cloud Run Admin**  
     - **Storage Admin**
     - **Service Account User**
     - **Service Usage Admin** (for accessing Cloud Build bucket)
     - **Cloud Build Service Account** (alternative to Service Usage Admin)

3. **"Firebase project not found" Error:**
   - Verify `GCP_PROJECT_ID` secret matches your Firebase project ID
   - Check Firebase project is properly initialized

4. **"Invalid token" Error:**
   - Regenerate Firebase CI token: `firebase login:ci`
   - Update `FIREBASE_TOKEN` secret with new token

5. **"You do not currently have an active account selected" Error:**
   - This means gcloud authentication failed
   - Check that `GCP_SA_KEY` is properly base64 encoded
   - Verify the service account JSON is valid
   - Ensure proper authentication action is used in workflow

**How to create service account with proper permissions:**

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click "Create Service Account"
3. Name: `github-actions-deployer`
4. Add ALL these roles (click "Add Another Role" for each):
   ```
   Cloud Build Editor
   Cloud Run Admin
   Storage Admin
   Service Account User
   Service Usage Admin
   Cloud Build Service Account
   ```
5. Create JSON key: Service Account → Keys → Add Key → JSON


## Environment Variables

### Frontend (.env)
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID

### Backend (.env)
- `PORT`: Server port (default: 3001)
- `FIREBASE_SERVICE_ACCOUNT_KEY`: Path to service account JSON file

## API Endpoints

### Public Endpoints
- `GET /health` - Health check endpoint

### Protected Endpoints (Requires Firebase Auth Token)
- `GET /api/user` - Get authenticated user information
- `GET /api/user/stats` - Get user's click statistics

### Authentication
Include Firebase ID token in Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## Security Considerations

1. **Firestore Rules**: Only authenticated users can read/write their own data
2. **API Authentication**: All API endpoints (except health check) require valid Firebase tokens
3. **Environment Variables**: Never commit `.env` files or service account keys
4. **CORS**: Backend configured to accept requests from any origin (configure for production)
5. **HTTPS**: Both Firebase Hosting and Cloud Run provide HTTPS by default

## Project Structure

```
click-tracker-app/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── firebase/        # Firebase configuration
│   │   └── App.tsx          # Main app component
│   └── package.json
├── backend/                  # Node.js API
│   ├── src/
│   │   └── index.ts         # Express server
│   ├── Dockerfile           # Container configuration
│   └── package.json
├── firebase.json            # Firebase configuration
├── firestore.rules          # Security rules
└── README.md
```

## Troubleshooting

### Common Issues

1. **"Permission denied" error in Firestore**
   - Check that you're authenticated
   - Verify Firestore rules are deployed

2. **Backend API returns 401/403**
   - Ensure you're sending valid Firebase ID token
   - Check service account key configuration

3. **Deployment fails**
   - Verify GCP project ID is correct
   - Ensure billing is enabled on GCP
   - Check you have necessary permissions

## License

MIT