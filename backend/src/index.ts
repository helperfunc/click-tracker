import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { Request, Response } from 'express';

dotenv.config();

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (serviceAccountPath) {
  try {
    const path = require('path');
    const fullPath = path.resolve(serviceAccountPath);
    console.log('Loading service account from:', fullPath);
    const serviceAccount = require(fullPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
} else {
  console.warn('Firebase service account key not found. Some features may be limited.');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

const verifyToken = async (req: AuthRequest, res: Response, next: Function) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Protected route - Get user info
app.get('/api/user', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userRecord = await admin.auth().getUser(req.user!.uid);
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      createdAt: userRecord.metadata.creationTime
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Protected route - Get user stats from Firestore
app.get('/api/user/stats', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(req.user!.uid).get();
    
    if (!userDoc.exists) {
      return res.json({ clickCount: 0 });
    }
    
    const data = userDoc.data();
    res.json({
      clickCount: data?.clickCount || 0,
      lastUpdated: data?.lastUpdated || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});