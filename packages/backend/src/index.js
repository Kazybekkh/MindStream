import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mindstream backend is running' });
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('start-stream', async (data) => {
    console.log('Stream started:', data);
    // TODO: Initialize AssemblyAI transcription
    // TODO: Initialize theme analysis
  });

  socket.on('audio-data', async (audioData) => {
    // TODO: Forward audio to AssemblyAI
    console.log('Received audio data');
  });

  socket.on('stop-stream', () => {
    console.log('Stream stopped');
    // TODO: Clean up transcription and analysis
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Mindstream backend running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
});
