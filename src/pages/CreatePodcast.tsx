import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {Say} from 'say'; // Make sure you have the say library installed
const say = new Say('darwin' || 'win32' || 'linux')

const API_KEY = 'AIzaSyAsSlXadDzi9k6XuEjFA2oiTV59PaBXBZA';
const genAI = new GoogleGenerativeAI(API_KEY);

const CreatePodcast: React.FC = () => {
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [scenario, setScenario] = useState('');
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const audioContext = useRef<AudioContext | null>(null);

  const generateScenario = async () => {
    if (!title || !keywords) {
      setError('Please provide both a title and keywords.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Create a short podcast scenario (max 200 words) about "${title}" with the following keywords: ${keywords}. Include speaker names in the format [SPEAKER_NAME]: before their lines.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      setScenario(text);

      // Extract speaker names
      const speakerSet = new Set(text.match(/\[([^\]]+)\]/g)?.map((name) => name.slice(1, -1)) || []);
      setSpeakers(Array.from(speakerSet));
    } catch (error) {
      console.error('Error generating scenario:', error);
      setError('An error occurred while generating the scenario. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateVoices = async () => {
    if (!scenario) return;

    // Break scenario into speaker lines
    const speakerLines = scenario.split('\n').filter((line) => line.trim() !== '');
    const audioBuffers: Blob[] = []; // Store all audio blobs

    for (const line of speakerLines) {
      const [speaker, text] = line.split(':');
      if (speaker && text) {
        const textToSpeak = text.trim();
        const audioFileName = `${speaker.trim()}_speech.wav`; // Generate unique filename for each speaker

        // Use the say library to export the spoken audio
        await new Promise<void>((resolve, reject) => {
          say.say(textToSpeak, speaker, 1, (err) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              console.log(`Text has been saved to ${audioFileName}.`);
              audioBuffers.push(new Blob([audioFileName], { type: 'audio/wav' })); // Collect audio buffers
              resolve();
            }
          });
        });
      }
    }

    // Combine all audio blobs into a single Blob
    const combinedAudio = new Blob(audioBuffers, { type: 'audio/wav' });
    const url = URL.createObjectURL(combinedAudio);
    setAudioUrl(url); // Set the combined audio URL for playback
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Create a Podcast</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Podcast Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Keywords (comma-separated)"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <button
        onClick={generateScenario}
        disabled={isLoading}
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Generating...' : 'Generate Scenario'}
      </button>
      {scenario && (
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Generated Scenario:</h2>
          <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">{scenario}</pre>
        </div>
      )}
      {speakers.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Speakers:</h2>
          <ul className="list-disc pl-5">
            {speakers.map((speaker, index) => (
              <li key={index}>{speaker}</li>
            ))}
          </ul>
          <button
            onClick={generateVoices}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
          >
            Generate Voices
          </button>
        </div>
      )}
      {audioUrl && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Generated Podcast:</h2>
          <audio controls src={audioUrl} className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default CreatePodcast;
