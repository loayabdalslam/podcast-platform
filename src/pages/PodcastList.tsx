import React from 'react';

const PodcastList: React.FC = () => {
  // Placeholder for podcast data
  const podcasts = [
    { id: 1, title: 'The Future of AI', author: 'Tech Enthusiast' },
    { id: 2, title: 'Cooking with Spices', author: 'Chef Extraordinaire' },
    { id: 3, title: 'Mindfulness Meditation', author: 'Zen Master' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Podcasts</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {podcasts.map((podcast) => (
          <div key={podcast.id} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">{podcast.title}</h2>
            <p className="text-gray-600">By {podcast.author}</p>
            <div className="mt-4 flex justify-between items-center">
              <button className="text-blue-600 hover:underline">Listen</button>
              <div className="flex items-center space-x-2">
                <button className="text-gray-600 hover:text-red-600">❤️</button>
                <button className="text-gray-600 hover:text-blue-600">💬</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PodcastList;