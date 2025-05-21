import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';
import { ModelLog } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * Script to import training logs from the training.log file into the MongoDB database
 */
const importTrainingLogs = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Path to the training log file
    const logFilePath = path.join(__dirname, '..', '..', 'microservices', 'tagalog_profanity_detector', 'training.log');
    console.log(`Reading log file from: ${logFilePath}`);

    // Read the log file
    const logContent = fs.readFileSync(logFilePath, 'utf8');
    const logLines = logContent.split('\n').filter(line => line.trim() !== '');

    // Extract important log entries
    const importantLogEntries = [];
    const logPatterns = [
      { pattern: /Starting training/, type: 'info', importance: 'high' },
      { pattern: /Training complete/, type: 'info', importance: 'high' },
      { pattern: /Epoch \d+\/\d+ completed/, type: 'info', importance: 'medium' },
      { pattern: /Results for Epoch \d+/, type: 'info', importance: 'medium' },
      { pattern: /Accuracy: ([\d\.]+)/, type: 'info', importance: 'high' },
      { pattern: /F1 Score: ([\d\.]+)/, type: 'info', importance: 'high' },
      { pattern: /Best model saved/, type: 'info', importance: 'medium' },
      { pattern: /New best F1 score/, type: 'info', importance: 'high' },
      { pattern: /Training Summary/, type: 'info', importance: 'high' },
      { pattern: /Final Validation Metrics/, type: 'info', importance: 'high' },
      { pattern: /Test Set Metrics/, type: 'info', importance: 'high' },
      { pattern: /Model saved to/, type: 'info', importance: 'high' },
      { pattern: /WARNING/, type: 'warning', importance: 'high' },
      { pattern: /ERROR/, type: 'error', importance: 'high' },
      { pattern: /Failed to/, type: 'error', importance: 'high' }
    ];

    // Process log lines
    for (let i = 0; i < logLines.length; i++) {
      const line = logLines[i];
      
      // Extract timestamp and log level if available
      const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) - (\w+) -/);
      
      if (timestampMatch) {
        const timestamp = new Date(timestampMatch[1].replace(',', '.'));
        const logLevel = timestampMatch[2].toLowerCase();
        const message = line.substring(line.indexOf('-', line.indexOf('-') + 1) + 2).trim();
        
        // Check if this is an important log entry
        for (const pattern of logPatterns) {
          if (pattern.pattern.test(message) && pattern.importance === 'high') {
            // For certain patterns, combine with the next line for more context
            let fullMessage = message;
            if (message.includes('Results for Epoch') || 
                message.includes('Accuracy:') || 
                message.includes('F1 Score:')) {
              // Look ahead a few lines to get more context
              for (let j = 1; j <= 5 && i + j < logLines.length; j++) {
                const nextLine = logLines[i + j];
                if (nextLine.includes('Accuracy:') || 
                    nextLine.includes('F1 Score:') || 
                    nextLine.includes('Precision:') || 
                    nextLine.includes('Recall:')) {
                  fullMessage += ' | ' + nextLine.substring(nextLine.indexOf('-', nextLine.indexOf('-') + 1) + 2).trim();
                }
              }
            }
            
            importantLogEntries.push({
              timestamp,
              type: logLevel === 'error' ? 'error' : logLevel === 'warning' ? 'warning' : 'info',
              message: fullMessage,
              model_version: 'bert-base-multilingual-uncased'
            });
            break;
          }
        }
      }
    }

    // Sort log entries by timestamp
    importantLogEntries.sort((a, b) => a.timestamp - b.timestamp);

    // Remove duplicates
    const uniqueEntries = [];
    const seenMessages = new Set();
    
    for (const entry of importantLogEntries) {
      const key = `${entry.message}-${entry.timestamp.getTime()}`;
      if (!seenMessages.has(key)) {
        seenMessages.add(key);
        uniqueEntries.push(entry);
      }
    }

    console.log(`Found ${uniqueEntries.length} important log entries`);

    // Save to database
    if (uniqueEntries.length > 0) {
      await ModelLog.insertMany(uniqueEntries);
      console.log(`Imported ${uniqueEntries.length} log entries to database`);
    } else {
      console.log('No important log entries found to import');
    }

    // Get count of logs after import
    const count = await ModelLog.countDocuments();
    console.log(`Current model logs count: ${count}`);
  } catch (error) {
    console.error('Error importing training logs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
importTrainingLogs()
  .then(() => {
    console.log('Script execution completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
