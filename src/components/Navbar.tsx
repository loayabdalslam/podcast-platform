import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Navbar: React.FC = () => {
  const [user, setUser] = useState(auth.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
          <Mic size={24} />
          <span>PodcastSocial</span>
        </Link>
        <div className="space-x-4">
          <Link to="/create" className="hover:text-blue-200">Create Podcast</Link>
          <Link to="/podcasts" className="hover:text-blue-200">Podcasts</Link>
          {user ? (
            <>
              <Link to="/profile" className="hover:text-blue-200">Profile</Link>
              <button onClick={handleLogout} className="hover:text-blue-200">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">Login</Link>
              <Link to="/register" className="hover:text-blue-200">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;