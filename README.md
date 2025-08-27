# Click Tracker App

A modern web application demonstrating full-stack development with React, Firebase, and Google Cloud Platform.

<img width="485" height="611" alt="image" src="https://github.com/user-attachments/assets/29d557b2-3fbe-4f20-865e-8df568c7a4fc" />

<img width="1059" height="888" alt="image" src="https://github.com/user-attachments/assets/d0b98cb4-9359-474e-967d-a83940e8d8f2" />

https://userclickcounts.web.app/login

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

**Link Firebase to Google Cloud (Important!):**
1. Go to Firebase Console → Project Settings → General
2. Scroll to "Google Cloud Platform (GCP) resource location"
3. If showing "Not set", click and select a region (e.g., `us-central1`)
4. This creates the corresponding Google Cloud project
5. Wait 2-3 minutes, then check https://console.cloud.google.com/ - your Firebase project should appear

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

**Setup Steps:**
1. Complete all Firebase and Google Cloud setup above
2. Create GitHub Secrets (Repository → Settings → Secrets and variables → Actions):
   - `GCP_PROJECT_ID`: Your Firebase project ID (e.g., `userclickcounts`)
   - `GCP_SA_KEY`: Base64-encoded service account JSON key
   - `FIREBASE_TOKEN`: Get with `firebase login:ci`
   - `VITE_FIREBASE_API_KEY`: Your Firebase API key
   - `VITE_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain (e.g., `userclickcounts.firebaseapp.com`)
   - `VITE_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket (e.g., `userclickcounts.firebasestorage.app`)
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
   - `VITE_FIREBASE_APP_ID`: Your Firebase app ID

**The workflow file `.github/workflows/deploy.yml` is already included:**
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

**Create Google Cloud Service Account for GitHub Actions:**

1. **Ensure Firebase project appears in Google Cloud:**
   - Go to: https://console.cloud.google.com/
   - Your Firebase project should be listed (if not, complete the "Link Firebase to Google Cloud" step above)

2. **Create Service Account:**
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=YOUR-FIREBASE-PROJECT-ID
   - Click "Create Service Account"
   - Name: `github-actions-deployer`
   - Description: `Service account for GitHub Actions deployment`

3. **Add Required Roles** (click "Add Another Role" for each):
   ```
   Cloud Build Editor
   Cloud Run Admin
   Storage Admin
   Service Account User
   Service Usage Admin
   Cloud Build Service Account
   Firebase Admin SDK Administrator Service Agent
   ```

4. **Enable Required APIs** in your Firebase project:
   - Cloud Build API: https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=YOUR-PROJECT-ID
   - Cloud Run API: https://console.cloud.google.com/apis/library/run.googleapis.com?project=YOUR-PROJECT-ID
   - Cloud Resource Manager API: https://console.cloud.google.com/apis/library/cloudresourcemanager.googleapis.com?project=YOUR-PROJECT-ID

5. **Create JSON Key:**
   - Service Account → Keys → Add Key → Create New Key → JSON
   - Download and save the JSON file securely

6. **Convert to Base64** (Windows PowerShell):
   ```powershell
   $content = Get-Content -Path "path\to\your\service-account-key.json" -Raw
   $encoded = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))
   $encoded | Set-Clipboard
   ```

## Accessing Your Deployed Application

After the GitHub Actions workflow completes successfully, you can access your application at:

### Live URLs:

1. **Frontend Application** (React):
   - Primary: `https://YOUR-PROJECT-ID.web.app`
   - Alternative: `https://YOUR-PROJECT-ID.firebaseapp.com`
   - Example: `https://userclickcounts.web.app`

2. **Backend API** (Node.js/Express):
   - URL Format: `https://SERVICE-NAME-PROJECT-NUMBER.REGION.run.app`
   - Where to find these values:
     - **SERVICE-NAME**: `click-tracker-backend` (defined in cloudbuild.yaml)
     - **PROJECT-NUMBER**: Your Firebase project number (find in Firebase Console → Project Settings)
     - **REGION**: `us-central1` (defined in cloudbuild.yaml)
   - Example: `https://click-tracker-backend-945172033364.us-central1.run.app`
   - Health Check: `https://click-tracker-backend-945172033364.us-central1.run.app/health`

### Testing Your Application:

1. **Basic Functionality Test**:
   - Visit the frontend URL
   - Sign up for a new account or login
   - Click the "Click Me!" button
   - Verify the counter increases
   - Logout and login again to verify persistence

2. **API Endpoints** (requires authentication):
   - `GET /health` - Public health check
   - `GET /api/user` - Get authenticated user info
   - `GET /api/user/stats` - Get user's click statistics

### Finding Your Backend URL:

**Option 1: From GitHub Actions Output**
- Go to your GitHub Actions run
- Look at the "Deploy Backend to Cloud Run" step output
- Find the line: `Service URL: https://...`

**Option 2: From Google Cloud Console**
- Visit: `https://console.cloud.google.com/run?project=YOUR-PROJECT-ID`
- Click on `click-tracker-backend`
- Copy the URL shown at the top

**Option 3: Using gcloud CLI**
```bash
gcloud run services describe click-tracker-backend --region=us-central1 --format='value(status.url)'
```

### Monitoring & Debugging:

- **GitHub Actions**: `https://github.com/YOUR-USERNAME/YOUR-REPO/actions`
- **Firebase Console**: `https://console.firebase.google.com/project/YOUR-PROJECT-ID`
- **Cloud Run Logs**: `https://console.cloud.google.com/run?project=YOUR-PROJECT-ID`
- **Firestore Data**: `https://console.firebase.google.com/project/YOUR-PROJECT-ID/firestore`


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

### Firestore Security Rules
```javascript
// Current rules in firestore.rules
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```
- Users can only access their own data
- No unauthenticated access allowed
- Each user's data is isolated by their UID

### API Authentication
- **Protected endpoints** require Firebase Auth token in header:
  ```
  Authorization: Bearer <firebase-id-token>
  ```
- **Backend verification** using Firebase Admin SDK:
  - Validates token authenticity
  - Extracts user UID for data access
  - Rejects expired or invalid tokens

### Security Best Practices Implemented
1. **Environment Variables**: 
   - Sensitive data stored in `.env` files (gitignored)
   - Service account keys never committed to repository
   
2. **Data Validation**:
   - User input sanitized by Firebase SDK
   - TypeScript provides type safety
   
3. **Network Security**:
   - HTTPS enforced on all endpoints
   - Firebase Hosting provides SSL certificates
   - Cloud Run provides managed TLS
   
4. **CORS Configuration**:
   - Currently allows all origins (development)
   - **TODO for production**: Restrict to your domain:
   ```javascript
   app.use(cors({ origin: 'https://userclickcounts.web.app' }));
   ```

### Additional Security Notes
- See `SECURITY.md` for comprehensive security documentation
- Regular dependency updates recommended (`npm audit`)
- Monitor Firebase Authentication logs for suspicious activity

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
