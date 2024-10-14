import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Create a short podcast scenario (max 200 words) about "${title}" with the following keywords: ${keywords}. Include speaker names in the format [SPEAKER_NAME]: before their lines.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setScenario(text);
      
      // Extract speaker names
      const speakerSet = new Set(text.match(/\[([^\]]+)\]/g)?.map(name => name.slice(1, -1)) || []);
      setSpeakers(Array.from(speakerSet));
    } catch (error) {
      console.error('Error generating scenario:', error);
      setError('An error occurred while generating the scenario. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateVoices = async () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContext.current;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    const speakerLines = scenario.split('\n').filter(line => line.trim() !== '');
    let currentTime = 0;

    for (const line of speakerLines) {
      const [speaker, text] = line.split(':');
      if (speaker && text) {
        const utterance = new SpeechSynthesisUtterance(text.trim());
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.voice = speechSynthesis.getVoices()[Math.floor(Math.random() * speechSynthesis.getVoices().length)];

        await new Promise<void>(resolve => {
          utterance.onend = () => resolve();
          speechSynthesis.speak(utterance);
        });

        currentTime += utterance.text.length * 0.06; // Approximate duration based on text length
      }
    }

    const finalBuffer = ctx.createBuffer(2, ctx.sampleRate * currentTime, ctx.sampleRate);

    // Export the audio buffer to a WAV file
    const wavBlob = await audioBufferToWav(finalBuffer);
    const url = URL.createObjectURL(wavBlob);
    setAudioUrl(url);
  };

  const audioBufferToWav = (buffer: AudioBuffer): Promise<Blob> => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new ArrayBuffer(length);
    const view = new DataView(out);
    const channels = [];
    let sample;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);
    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164);
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Promise(resolve => {
      const blob = new Blob([out], { type: 'audio/wav' });
      resolve(blob);
    });

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
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