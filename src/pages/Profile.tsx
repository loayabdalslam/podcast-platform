import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const [user, setUser] = useState(auth.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">User Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Username</h2>
          <p>{user.displayName || 'N/A'}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Email</h2>
          <p>{user.email}</p>
        </div>
        {/* You can add more user-specific information here */}
      </div>
    </div>
  );
};

export default Profile;