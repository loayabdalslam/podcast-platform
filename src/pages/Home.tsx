import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to PodcastSocial</h1>
      <p className="mb-8">Create, share, and discover amazing podcasts!</p>
      <div className="space-x-4">
        <Link to="/create" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Create a Podcast
        </Link>
        <Link to="/podcasts" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
          Browse Podcasts
        </Link>
      </div>
    </div>
  );
};

export default Home;