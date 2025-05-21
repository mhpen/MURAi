import mongoose from 'mongoose';

// Define a schema for model test metrics
const ModelTestMetricSchema = new mongoose.Schema({
  model_type: {
    type: String,
    required: true,
    enum: ['bert', 'roberta']
  },
  text_length: {
    type: Number,
    required: true
  },
  processing_time_ms: {
    type: Number,
    required: true
  },
  is_inappropriate: {
    type: Boolean,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create the model if it doesn't exist
const ModelTestMetric = mongoose.models.ModelTestMetric || mongoose.model('ModelTestMetric', ModelTestMetricSchema);

// Save test metrics
export const saveTestMetrics = async (req, res) => {
  try {
    const { model_type, text_length, processing_time_ms, is_inappropriate, confidence } = req.body;

    // Log the incoming request for debugging
    console.log('Saving test metrics:', { model_type, text_length, processing_time_ms, is_inappropriate, confidence });

    // Validate required fields
    if (!model_type || text_length === undefined || processing_time_ms === undefined ||
        is_inappropriate === undefined || confidence === undefined) {
      console.warn('Missing required fields in test metrics:', req.body);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure model_type is valid
    const validModelType = ['bert', 'roberta'].includes(model_type.toLowerCase())
      ? model_type.toLowerCase()
      : 'roberta';

    // Create and save the metrics
    const testMetric = new ModelTestMetric({
      model_type: validModelType,
      text_length,
      processing_time_ms: Number(processing_time_ms),
      is_inappropriate: Boolean(is_inappropriate),
      confidence: Number(confidence)
    });

    await testMetric.save();
    console.log('Test metrics saved successfully:', testMetric._id);

    return res.status(201).json({
      message: 'Test metrics saved successfully',
      data: testMetric
    });
  } catch (error) {
    console.error('Error saving test metrics:', error);
    return res.status(500).json({
      error: 'Failed to save test metrics',
      details: error.message
    });
  }
};

// Get all test metrics
export const getTestMetrics = async (req, res) => {
  try {
    const metrics = await ModelTestMetric.find().sort({ timestamp: -1 });

    return res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching test metrics:', error);
    return res.status(500).json({
      error: 'Failed to fetch test metrics',
      details: error.message
    });
  }
};

// Get test metrics by model type
export const getTestMetricsByModel = async (req, res) => {
  try {
    const { model_type } = req.params;

    if (!model_type || !['bert', 'roberta'].includes(model_type)) {
      return res.status(400).json({ error: 'Invalid model type' });
    }

    const metrics = await ModelTestMetric.find({ model_type }).sort({ timestamp: -1 });

    return res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching test metrics by model:', error);
    return res.status(500).json({
      error: 'Failed to fetch test metrics by model',
      details: error.message
    });
  }
};

// Get average processing time by model
export const getAverageProcessingTime = async (req, res) => {
  try {
    // Get average processing time for each model
    const bertAvg = await ModelTestMetric.aggregate([
      { $match: { model_type: 'bert' } },
      { $group: { _id: null, avg_time: { $avg: '$processing_time_ms' } } }
    ]);

    const robertaAvg = await ModelTestMetric.aggregate([
      { $match: { model_type: 'roberta' } },
      { $group: { _id: null, avg_time: { $avg: '$processing_time_ms' } } }
    ]);

    // Get count of tests for each model
    const bertCount = await ModelTestMetric.countDocuments({ model_type: 'bert' });
    const robertaCount = await ModelTestMetric.countDocuments({ model_type: 'roberta' });

    // Get latest test for each model
    const bertLatest = await ModelTestMetric.findOne({ model_type: 'bert' }).sort({ timestamp: -1 });
    const robertaLatest = await ModelTestMetric.findOne({ model_type: 'roberta' }).sort({ timestamp: -1 });

    return res.status(200).json({
      bert: {
        avg_processing_time_ms: bertAvg.length > 0 ? bertAvg[0].avg_time : 0,
        test_count: bertCount,
        latest_test: bertLatest
      },
      roberta: {
        avg_processing_time_ms: robertaAvg.length > 0 ? robertaAvg[0].avg_time : 0,
        test_count: robertaCount,
        latest_test: robertaLatest
      }
    });
  } catch (error) {
    console.error('Error calculating average processing time:', error);
    return res.status(500).json({
      error: 'Failed to calculate average processing time',
      details: error.message
    });
  }
};


