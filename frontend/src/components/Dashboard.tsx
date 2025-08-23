import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc, increment } from 'firebase/firestore';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [clickCount, setClickCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      // Add a small delay to ensure auth token is fully available
      const timer = setTimeout(() => {
        fetchClickCount();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const fetchClickCount = async () => {
    if (!currentUser) {
      console.log('No current user available');
      return;
    }
    
    try {
      console.log('Fetching click count for user:', currentUser.uid);
      console.log('User authenticated:', !!currentUser);
      
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setClickCount(userDoc.data().clickCount || 0);
        console.log('Successfully fetched click count:', userDoc.data().clickCount || 0);
      } else {
        console.log('User document does not exist, initializing with 0');
        setClickCount(0);
      }
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching click count:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      setLoading(false);
    }
  };

  const handleClick = async () => {
    if (!currentUser) {
      console.error('No authenticated user');
      return;
    }

    try {
      console.log('Attempting to update click count for user:', currentUser.uid);
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        email: currentUser.email,
        clickCount: increment(1),
        lastUpdated: new Date()
      }, { merge: true });
      
      setClickCount(prevCount => prevCount + 1);
      console.log('Click count updated successfully');
    } catch (error: any) {
      console.error('Error updating click count:', error);
      console.error('Error details:', error?.code, error?.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Click Tracker Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
      
      <div className="user-info">
        <p>Welcome, {currentUser?.email}</p>
      </div>

      <div className="click-section">
        <button onClick={handleClick} className="track-button">
          Click Me!
        </button>
        <div className="stats">
          <h2>Your Click Count</h2>
          <p className="count">{clickCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;