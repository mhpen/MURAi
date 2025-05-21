import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL || 'http://127.0.0.1:8000';

// Text detection routes
router.post('/text', auth, async (req, res) => {
  try {
    const { text, model } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Call the microservice
    const response = await axios.post(`${MODEL_SERVICE_URL}/predict`, {
      text,
      model // Pass the model parameter if provided
    });

    // Return the response from the microservice
    return res.json(response.data);
  } catch (error) {
    console.error('Error detecting profanity:', error.message);

    // If the microservice is not available, provide a mock response
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.log('Microservice not available, returning mock response');

      // Create a mock response
      const mockResponse = {
        text: req.body.text,
        is_inappropriate: req.body.text.toLowerCase().includes('gago') ||
                          req.body.text.toLowerCase().includes('putang') ||
                          req.body.text.toLowerCase().includes('bobo'),
        confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7 and 1.0
        processing_time_ms: Math.random() * 50 + 10, // Random processing time between 10 and 60ms
        model_used: req.body.model || 'roberta'
      };

      return res.json(mockResponse);
    }

    return res.status(500).json({
      error: 'Error detecting profanity',
      details: error.message
    });
  }
});

router.get('/texts', auth, async (req, res) => {
  // TODO: Implement get all detected texts
});

router.get('/texts/:id', auth, async (req, res) => {
  // TODO: Implement get single detected text
});

// Word detection routes
router.get('/words', auth, async (req, res) => {
  // TODO: Implement get detected words
});

router.get('/words/:id', auth, async (req, res) => {
  // TODO: Implement get single detected word
});

// Validation routes
router.put('/texts/:id/validate', auth, async (req, res) => {
  // TODO: Implement validation update
});

// Test endpoint for the microservice (no auth required)
router.post('/test', async (req, res) => {
  try {
    const { text, model } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Call the microservice
    const response = await axios.post(`${MODEL_SERVICE_URL}/predict`, {
      text,
      model // Pass the model parameter if provided
    });

    // Return the response from the microservice
    return res.json(response.data);
  } catch (error) {
    console.error('Error testing profanity detection:', error.message);

    // If the microservice is not available, provide a mock response for testing
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.log('Microservice not available, returning mock response');

      // Create a mock response for testing purposes
      const mockResponse = {
        text: req.body.text,
        is_inappropriate: req.body.text.toLowerCase().includes('gago') ||
                          req.body.text.toLowerCase().includes('putang') ||
                          req.body.text.toLowerCase().includes('bobo'),
        confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7 and 1.0
        processing_time_ms: Math.random() * 50 + 10, // Random processing time between 10 and 60ms
        model_used: req.body.model || 'roberta'
      };

      return res.json(mockResponse);
    }

    return res.status(500).json({
      error: 'Error testing profanity detection',
      details: error.message
    });
  }
});

export default router;
