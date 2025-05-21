import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const router = Router();
const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL || 'http://127.0.0.1:8000';

// Text detection routes
router.post('/text', auth, async (req, res) => {
  try {
    const { text, model } = req.body;
    const startTime = Date.now();

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log(`Using mock response for profanity detection with model: ${model || 'roberta'}, text length: ${text.length} chars`);

    // Skip calling the model service and always use mock response in production
    // Create a mock response
    const mockResponse = {
      text: req.body.text,
      is_inappropriate: req.body.text.toLowerCase().includes('gago') ||
                        req.body.text.toLowerCase().includes('putang') ||
                        req.body.text.toLowerCase().includes('bobo'),
      confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7 and 1.0
      processing_time_ms: Math.random() * 50 + 10, // Random processing time between 10 and 60ms
      model_used: req.body.model || 'roberta',
      note: "This is a mock response. The model service is only available when running locally."
    };

    const endTime = Date.now();
    console.log(`Mock response generated in ${endTime - startTime}ms`);

    return res.json(mockResponse);
  } catch (error) {
    console.error('Error generating mock response:', error.message);

    return res.status(500).json({
      error: 'Error generating mock response',
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
    const startTime = Date.now();

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log(`Using mock response for testing with model: ${model || 'roberta'}, text: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);

    // Skip calling the model service and always use mock response in production
    // Create a mock response for testing purposes
    const mockResponse = {
      text: req.body.text,
      is_inappropriate: req.body.text.toLowerCase().includes('gago') ||
                        req.body.text.toLowerCase().includes('putang') ||
                        req.body.text.toLowerCase().includes('bobo'),
      confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7 and 1.0
      processing_time_ms: Math.random() * 50 + 10, // Random processing time between 10 and 60ms
      model_used: req.body.model || 'roberta',
      note: "This is a mock response. The model service is only available when running locally."
    };

    const endTime = Date.now();
    console.log(`Mock response generated in ${endTime - startTime}ms`);
    console.log(`Response: ${JSON.stringify(mockResponse)}`);

    return res.json(mockResponse);
  } catch (error) {
    console.error('Error generating mock response:', error.message);

    return res.status(500).json({
      error: 'Error generating mock response',
      details: error.message
    });
  }
});

// Health check endpoint for the model service
router.get('/model-service-health', async (req, res) => {
  try {
    console.log(`Model service health check - returning mock status`);
    const startTime = Date.now();

    // Get test metrics counts
    const ModelTestMetric = mongoose.models.ModelTestMetric;
    const bertCount = ModelTestMetric ? await ModelTestMetric.countDocuments({ model_type: 'bert' }) : 0;
    const robertaCount = ModelTestMetric ? await ModelTestMetric.countDocuments({ model_type: 'roberta' }) : 0;

    const endTime = Date.now();

    return res.json({
      status: 'mock_mode',
      model_service_url: 'Not available in production',
      response_time_ms: endTime - startTime,
      model_service_status: {
        status: 'mock_mode',
        model_status: 'not_available',
        note: 'The model service is only available when running locally'
      },
      test_metrics: {
        bert_tests_count: bertCount,
        roberta_tests_count: robertaCount,
        total_tests_count: bertCount + robertaCount
      },
      server_time: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating mock health status:', error.message);

    return res.status(500).json({
      status: 'error',
      error: error.message,
      note: 'The model service is only available when running locally',
      server_time: new Date().toISOString()
    });
  }
});

export default router;