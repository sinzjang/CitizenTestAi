const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const textToSpeech = require('@google-cloud/text-to-speech');
const speech = require('@google-cloud/speech');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize Google Cloud clients
const ttsClient = new textToSpeech.TextToSpeechClient();
const sttClient = new speech.SpeechClient();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Text-to-Speech endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'en-US-Neural2-A', languageCode = 'en-US' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Construct the request
    const request = {
      input: { text },
      voice: {
        languageCode,
        name: voice,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0,
      },
    };

    // Perform the text-to-speech request
    const [response] = await ttsClient.synthesizeSpeech(request);

    // Convert audio content to base64
    const audioBase64 = response.audioContent.toString('base64');

    res.json({
      success: true,
      audioData: audioBase64,
      audioFormat: 'mp3',
      voice: voice,
      text: text
    });

  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ 
      error: 'Text-to-speech conversion failed',
      details: error.message 
    });
  }
});

// Speech-to-Text endpoint
app.post('/api/stt', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const { languageCode = 'en-US', model = 'latest_short' } = req.body;
    const audioFilePath = req.file.path;

    // Read the audio file
    const audioBytes = fs.readFileSync(audioFilePath).toString('base64');

    // Configure the request
    const request = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: 'WEBM_OPUS', // Common format from web recordings
        sampleRateHertz: 48000,
        languageCode: languageCode,
        model: model,
        enableAutomaticPunctuation: true,
      },
    };

    // Perform the speech-to-text request
    const [response] = await sttClient.recognize(request);
    
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    // Clean up uploaded file
    fs.unlinkSync(audioFilePath);

    res.json({
      success: true,
      transcription: transcription,
      confidence: response.results[0]?.alternatives[0]?.confidence || 0,
      languageCode: languageCode
    });

  } catch (error) {
    console.error('STT Error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: 'Speech-to-text conversion failed',
      details: error.message 
    });
  }
});

// List available voices endpoint
app.get('/api/voices', async (req, res) => {
  try {
    const [response] = await ttsClient.listVoices({});
    const voices = response.voices;

    // Filter and format voices
    const formattedVoices = voices
      .filter(voice => voice.name.includes('Neural2') || voice.name.includes('WaveNet'))
      .map(voice => ({
        name: voice.name,
        languageCode: voice.languageCodes[0],
        gender: voice.ssmlGender,
        type: voice.name.includes('Neural2') ? 'Neural2' : 'WaveNet'
      }));

    res.json({
      success: true,
      voices: formattedVoices
    });

  } catch (error) {
    console.error('Voices Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch voices',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TTS/STT Backend Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🎤 TTS endpoint: http://localhost:${PORT}/api/tts`);
  console.log(`🗣️  STT endpoint: http://localhost:${PORT}/api/stt`);
  console.log(`🎵 Voices endpoint: http://localhost:${PORT}/api/voices`);
});

module.exports = app;
