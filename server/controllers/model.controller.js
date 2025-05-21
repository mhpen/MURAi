import { ModelMetrics, ModelLog } from '../models/index.js';

// Get all model metrics
export const getModelMetrics = async (req, res) => {
  try {
    const metrics = await ModelMetrics.find().sort({ timestamp: -1 }).limit(10);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching model metrics:', error);
    res.status(500).json({ error: 'Failed to fetch model metrics' });
  }
};

// Get latest model metrics
export const getLatestModelMetrics = async (req, res) => {
  try {
    // Get model_type from query params, default to 'roberta'
    const modelType = req.query.model_type || 'roberta';

    // Find the latest metrics for the specified model type
    const metrics = await ModelMetrics.findOne({ model_type: modelType }).sort({ timestamp: -1 });
    res.json(metrics || {});
  } catch (error) {
    console.error('Error fetching latest model metrics:', error);
    res.status(500).json({ error: 'Failed to fetch latest model metrics' });
  }
};

// Get latest metrics for both models (for comparison)
export const getModelComparison = async (req, res) => {
  try {
    // Get latest metrics for both model types
    const robertaMetrics = await ModelMetrics.findOne({ model_type: 'roberta' }).sort({ timestamp: -1 });
    const bertMetrics = await ModelMetrics.findOne({ model_type: 'bert' }).sort({ timestamp: -1 });

    // Return both sets of metrics
    res.json({
      roberta: robertaMetrics || {},
      bert: bertMetrics || {}
    });
  } catch (error) {
    console.error('Error fetching model comparison:', error);
    res.status(500).json({ error: 'Failed to fetch model comparison' });
  }
};

// Save new model metrics
export const saveModelMetrics = async (req, res) => {
  try {
    const { version, model_type, performance, training_info, confusion_matrix } = req.body;

    if (!version) {
      return res.status(400).json({ error: 'Version is required' });
    }

    // Determine model type from version string if not explicitly provided
    let determinedModelType = model_type;
    if (!determinedModelType) {
      // Check if version string contains 'bert' or 'roberta'
      if (version.toLowerCase().includes('bert')) {
        determinedModelType = 'bert';
      } else if (version.toLowerCase().includes('roberta')) {
        determinedModelType = 'roberta';
      } else {
        determinedModelType = 'roberta'; // Default to roberta
      }
    }

    const newMetrics = new ModelMetrics({
      version,
      model_type: determinedModelType,
      performance,
      training_info,
      confusion_matrix
    });

    await newMetrics.save();

    // Log the metrics save
    await new ModelLog({
      type: 'info',
      message: `New metrics saved for ${determinedModelType} model version ${version}`,
      model_version: version
    }).save();

    res.status(201).json(newMetrics);
  } catch (error) {
    console.error('Error saving model metrics:', error);
    res.status(500).json({ error: 'Failed to save model metrics' });
  }
};

// Get model logs
export const getModelLogs = async (req, res) => {
  try {
    const logs = await ModelLog.find().sort({ timestamp: -1 }).limit(20);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching model logs:', error);
    res.status(500).json({ error: 'Failed to fetch model logs' });
  }
};

// Save model log
export const saveModelLog = async (req, res) => {
  try {
    const { type, message, model_version } = req.body;

    if (!type || !message || !model_version) {
      return res.status(400).json({ error: 'Type, message, and model_version are required' });
    }

    const newLog = new ModelLog({
      type,
      message,
      model_version
    });

    await newLog.save();
    res.status(201).json(newLog);
  } catch (error) {
    console.error('Error saving model log:', error);
    res.status(500).json({ error: 'Failed to save model log' });
  }
};
