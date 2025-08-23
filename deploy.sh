#!/bin/bash

# Deploy script for Click Tracker App

echo "🚀 Starting deployment process..."

# Check if project ID is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Google Cloud Project ID"
    echo "Usage: ./deploy.sh YOUR-PROJECT-ID"
    exit 1
fi

PROJECT_ID=$1

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Deploy frontend to Firebase Hosting
echo "🔥 Deploying frontend to Firebase Hosting..."
firebase deploy --only hosting --project $PROJECT_ID

# Deploy backend to Cloud Run
echo "☁️ Deploying backend to Cloud Run..."
cd backend
gcloud builds submit --config cloudbuild.yaml --project $PROJECT_ID
cd ..

# Deploy Firestore rules
echo "📜 Deploying Firestore security rules..."
firebase deploy --only firestore:rules --project $PROJECT_ID

echo "✅ Deployment complete!"
echo ""
echo "📱 Frontend URL: https://$PROJECT_ID.web.app"
echo "🔧 Backend URL: https://click-tracker-backend-[HASH]-uc.a.run.app"
echo ""
echo "Note: Replace [HASH] with the actual Cloud Run service URL from your Google Cloud Console"