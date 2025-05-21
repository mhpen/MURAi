import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ModelLog } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to execute a command and return a promise
const execCommand = (command, options = {}) => {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.warn(`Command stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
};

// Helper function to save a log entry
const saveLog = async (type, message, modelVersion) => {
  try {
    const newLog = new ModelLog({
      type,
      message,
      model_version: modelVersion
    });
    await newLog.save();
    return newLog;
  } catch (error) {
    console.error('Error saving log:', error);
    throw error;
  }
};

// Retrain model
export const retrainModel = async (req, res) => {
  try {
    const { model_type } = req.body;
    
    if (!model_type || !['bert', 'roberta'].includes(model_type)) {
      return res.status(400).json({ error: 'Valid model_type (bert or roberta) is required' });
    }
    
    // Log the start of retraining
    const modelVersion = model_type === 'bert' ? 'bert-tagalog-v1.0.0' : 'roberta-tagalog-v1.0.0';
    await saveLog('info', `${model_type.toUpperCase()} model retraining started`, modelVersion);
    
    // Send initial response to client
    res.status(202).json({ 
      message: `${model_type.toUpperCase()} model retraining started`,
      status: 'processing'
    });
    
    // Determine which script to run based on model type
    const scriptName = model_type === 'bert' ? 'train_bert_simple.py' : 'train_roberta.py';
    const microservicesDir = path.resolve(__dirname, '../../microservices/tagalog_profanity_detector');
    const venvPath = model_type === 'bert' ? 'bert_venv' : 'roberta_venv';
    
    // Construct the command to run the training script
    // For Windows
    const activateCmd = process.platform === 'win32' 
      ? `${venvPath}\\Scripts\\activate.bat && `
      : `source ${venvPath}/bin/activate && `;
    
    const command = `cd ${microservicesDir} && ${activateCmd} python ${scriptName}`;
    
    console.log(`Executing command: ${command}`);
    
    // Execute the training script
    execCommand(command)
      .then(async (stdout) => {
        console.log('Training completed successfully');
        console.log(stdout);
        
        // Log successful completion
        await saveLog('success', `${model_type.toUpperCase()} model retraining completed successfully`, modelVersion);
      })
      .catch(async (error) => {
        console.error('Error during training:', error);
        
        // Log error
        await saveLog('error', `${model_type.toUpperCase()} model retraining failed: ${error.message}`, modelVersion);
      });
      
  } catch (error) {
    console.error('Error initiating model retraining:', error);
    // Don't send response here as we've already sent the initial response
    
    // Log error
    const modelVersion = req.body.model_type === 'bert' ? 'bert-tagalog-v1.0.0' : 'roberta-tagalog-v1.0.0';
    await saveLog('error', `Error initiating model retraining: ${error.message}`, modelVersion);
  }
};

// Get retraining status
export const getRetrainingStatus = async (req, res) => {
  try {
    const { model_type } = req.query;
    
    if (!model_type || !['bert', 'roberta'].includes(model_type)) {
      return res.status(400).json({ error: 'Valid model_type (bert or roberta) is required' });
    }
    
    // Get the latest log for this model
    const modelVersion = model_type === 'bert' ? 'bert-tagalog-v1.0.0' : 'roberta-tagalog-v1.0.0';
    const latestLog = await ModelLog.findOne({ 
      model_version: modelVersion 
    }).sort({ timestamp: -1 });
    
    if (!latestLog) {
      return res.status(404).json({ error: 'No retraining logs found for this model' });
    }
    
    // Determine status based on the latest log
    let status = 'unknown';
    if (latestLog.type === 'info' && latestLog.message.includes('started')) {
      status = 'processing';
    } else if (latestLog.type === 'success') {
      status = 'completed';
    } else if (latestLog.type === 'error') {
      status = 'failed';
    }
    
    res.json({
      status,
      latestLog
    });
    
  } catch (error) {
    console.error('Error getting retraining status:', error);
    res.status(500).json({ error: 'Failed to get retraining status' });
  }
};
