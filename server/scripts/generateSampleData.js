import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  Website,
  DetectedText,
  DetectedWord,
  ModelLog,
  ModelMetrics,
  ReportedContent,
  SystemLog,
  User
} from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

// More realistic website data
const websiteDomains = [
  'facebook.com', 'twitter.com', 'instagram.com', 'tiktok.com', 'youtube.com',
  'reddit.com', 'linkedin.com', 'pinterest.com', 'tumblr.com', 'discord.com',
  'twitch.tv', 'snapchat.com', 'whatsapp.com', 'telegram.org', 'messenger.com'
];

const websiteTitles = [
  'Facebook', 'Twitter', 'Instagram', 'TikTok', 'YouTube',
  'Reddit', 'LinkedIn', 'Pinterest', 'Tumblr', 'Discord',
  'Twitch', 'Snapchat', 'WhatsApp', 'Telegram', 'Messenger'
];

const categories = ['social_media', 'video_sharing', 'messaging', 'professional', 'gaming'];
const languages = ['Filipino', 'English'];
const contentTypes = ['comment', 'post', 'title'];
const wordCategories = ['profanity', 'slur', 'sexual'];

// Sample inappropriate words
const inappropriateWords = {
  Filipino: ['putangina', 'gago', 'bobo', 'tanga', 'ulol', 'tarantado', 'inutil', 'hayop', 'demonyo', 'peste'],
  English: ['stupid', 'idiot', 'fool', 'dumb', 'moron', 'jerk', 'dummy', 'loser', 'weirdo', 'creep']
};

// Sample text content
const sampleTexts = {
  Filipino: [
    'Ang galing mo naman!',
    'Hindi ko maintindihan ang ginagawa mo.',
    'Bakit ganyan ka mag-isip?',
    'Tama na yan!',
    'Sino ba ang may pakana nito?'
  ],
  English: [
    'What are you doing?',
    'This is unacceptable!',
    'I cannot believe this.',
    'Stop this nonsense!',
    'Who is responsible for this?'
  ]
};

const generateRandomDate = (start = new Date(2023, 0, 1)) => {
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create websites
    const websites = await Promise.all(
      websiteDomains.map(async (domain, index) => {
        const website = new Website({
          domain,
          title: websiteTitles[index],
          category: categories[Math.floor(Math.random() * categories.length)],
          created_at: generateRandomDate(),
          is_active: Math.random() > 0.1 // 90% chance of being active
        });
        return website.save();
      })
    );
    console.log('Created sample websites');

    // Create detected texts
    const detectedTexts = await Promise.all(
      Array(30).fill(null).map(async (_, index) => {
        const language = languages[Math.floor(Math.random() * languages.length)];
        const baseText = sampleTexts[language][Math.floor(Math.random() * sampleTexts[language].length)];
        const inappropriateWord = Math.random() > 0.5 ? 
          ` ${inappropriateWords[language][Math.floor(Math.random() * inappropriateWords[language].length)]}` : 
          '';

        const text = new DetectedText({
          website_id: websites[Math.floor(Math.random() * websites.length)]._id,
          text_content: baseText + inappropriateWord,
          sentiment_score: Math.random() * 2 - 1,
          sentiment_label: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)],
          language,
          detected_at: generateRandomDate(),
          detection_method: ['automated', 'manual'][Math.floor(Math.random() * 2)],
          source: ['user', 'automated', 'both'][Math.floor(Math.random() * 3)],
          is_inappropriate: inappropriateWord !== '',
          validation_status: ['true_positive', 'false_positive', 'unverified'][Math.floor(Math.random() * 3)],
          content_type: contentTypes[Math.floor(Math.random() * contentTypes.length)]
        });
        return text.save();
      })
    );
    console.log('Created sample detected texts');

    // Create detected words
    await Promise.all(
      Array(30).fill(null).map(async (_, index) => {
        const language = languages[Math.floor(Math.random() * languages.length)];
        const word = new DetectedWord({
          word: inappropriateWords[language][Math.floor(Math.random() * inappropriateWords[language].length)],
          website_id: websites[Math.floor(Math.random() * websites.length)]._id,
          detected_texts_id: detectedTexts[Math.floor(Math.random() * detectedTexts.length)]._id,
          language,
          detected_at: generateRandomDate(),
          frequency: Math.floor(Math.random() * 20) + 1,
          category: wordCategories[Math.floor(Math.random() * wordCategories.length)],
          severity_level: Math.floor(Math.random() * 5) + 1
        });
        return word.save();
      })
    );
    console.log('Created sample detected words');

    // Create reported contents
    await Promise.all(
      Array(30).fill(null).map(async (_, index) => {
        const language = languages[Math.floor(Math.random() * languages.length)];
        const baseText = sampleTexts[language][Math.floor(Math.random() * sampleTexts[language].length)];
        const inappropriateWord = inappropriateWords[language][Math.floor(Math.random() * inappropriateWords[language].length)];

        const report = new ReportedContent({
          user_id: (await User.findOne({ role: 'admin' }))._id,
          website_id: websites[Math.floor(Math.random() * websites.length)]._id,
          content_text: `${baseText} ${inappropriateWord}`,
          report_reason: `Contains inappropriate word: ${inappropriateWord}`,
          content_type: contentTypes[Math.floor(Math.random() * contentTypes.length)],
          language,
          report_timestamp: generateRandomDate(),
          status: ['pending', 'reviewed', 'dismissed'][Math.floor(Math.random() * 3)],
          verified: Math.random() > 0.3
        });
        return report.save();
      })
    );
    console.log('Created sample reported contents');

    // Create model metrics
    await Promise.all(
      Array(30).fill(null).map(async (_, index) => {
        const metrics = new ModelMetrics({
          timestamp: generateRandomDate(),
          version: `1.${Math.floor(index / 10) + 1}.${index % 10}`,
          performance: {
            accuracy: 0.75 + (Math.random() * 0.2),
            precision: 0.70 + (Math.random() * 0.25),
            recall: 0.65 + (Math.random() * 0.3),
            f1_score: 0.68 + (Math.random() * 0.27)
          },
          training_info: {
            dataset_size: 5000 + (Math.floor(Math.random() * 15000)),
            training_duration: `${Math.floor(Math.random() * 180) + 60} minutes`
          },
          confusion_matrix: {
            TP: Math.floor(Math.random() * 1000) + 500,
            FP: Math.floor(Math.random() * 200) + 50,
            TN: Math.floor(Math.random() * 1000) + 500,
            FN: Math.floor(Math.random() * 200) + 50
          }
        });
        return metrics.save();
      })
    );
    console.log('Created sample model metrics');

    // Create model logs
    await Promise.all(
      Array(30).fill(null).map(async (_, index) => {
        const log = new ModelLog({
          timestamp: generateRandomDate(),
          type: ['info', 'error', 'warning'][Math.floor(Math.random() * 3)],
          message: [
            'Model training completed successfully',
            'New version deployment started',
            'Performance threshold reached',
            'Dataset validation completed',
            'Error in prediction pipeline',
            'Warning: High false positive rate detected'
          ][Math.floor(Math.random() * 6)],
          model_version: `1.${Math.floor(index / 10) + 1}.${index % 10}`
        });
        return log.save();
      })
    );
    console.log('Created sample model logs');

    // Create system logs
    await Promise.all(
      Array(30).fill(null).map(async (_, index) => {
        const log = new SystemLog({
          timestamp: generateRandomDate(),
          user_id: (await User.findOne({ role: 'admin' }))._id,
          action: ['login', 'detection_run', 'report_reviewed', 'model_updated', 'config_changed'][Math.floor(Math.random() * 5)],
          target: ['user', 'text', 'website', 'model', 'system'][Math.floor(Math.random() * 5)],
          target_id: websites[Math.floor(Math.random() * websites.length)]._id,
          status: ['success', 'failed'][Math.floor(Math.random() * 2)],
          message: [
            'User authentication successful',
            'Content detection completed',
            'Report verification finished',
            'System configuration updated',
            'Backup process completed',
            'Database maintenance performed'
          ][Math.floor(Math.random() * 6)],
          severity: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)]
        });
        return log.save();
      })
    );
    console.log('Created sample system logs');

    console.log('Successfully generated all sample data');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error generating sample data:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

generateSampleData(); 