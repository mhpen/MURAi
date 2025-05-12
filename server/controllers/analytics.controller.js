import { 
  DetectedText, 
  DetectedWord, 
  Website, 
  ReportedContent,
  Analytics,
  ModelMetrics 
} from '../models/index.js';
import mongoose from 'mongoose';

// Helper function to calculate percentages
const calculatePercentage = (part, total) => {
  return total > 0 ? (part / total) * 100 : 0;
};

// Function to generate analytics with caching
let analyticsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const generateAnalytics = async () => {
  try {
    const date = new Date();
    const websites = await Website.find();

    for (const website of websites) {
      const websiteId = website._id.toString();
      
      // Check cache
      const cachedData = analyticsCache.get(websiteId);
      if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
        console.log(`Using cached analytics for website: ${website.domain}`);
        continue;
      }

      // Get all texts for this website
      const detectedTexts = await DetectedText.find({ website_id: website._id });
      const detectedWords = await DetectedWord.find({ website_id: website._id });
      const reports = await ReportedContent.find({ website_id: website._id });

      // Calculate metrics
      const totalFlaggedTexts = detectedTexts.filter(text => text.is_inappropriate).length;
      const totalReports = reports.length;

      // Language breakdown
      const flaggedByLanguage = {
        Filipino: detectedTexts.filter(text => text.language === 'Filipino' && text.is_inappropriate).length,
        English: detectedTexts.filter(text => text.language === 'English' && text.is_inappropriate).length
      };

      // Sentiment distribution
      const sentimentDistribution = {
        positive: detectedTexts.filter(text => text.sentiment_label === 'positive').length,
        neutral: detectedTexts.filter(text => text.sentiment_label === 'neutral').length,
        negative: detectedTexts.filter(text => text.sentiment_label === 'negative').length
      };

      // Moderation accuracy
      const moderationAccuracy = {
        true_positives: detectedTexts.filter(text => text.validation_status === 'true_positive').length,
        false_positives: detectedTexts.filter(text => text.validation_status === 'false_positive').length
      };

      // Word categories
      const wordCategories = {
        profanity: detectedWords.filter(word => word.category === 'profanity').length,
        slur: detectedWords.filter(word => word.category === 'slur').length,
        sexual: detectedWords.filter(word => word.category === 'sexual').length
      };

      // Top detected words
      const wordFrequencyMap = new Map();
      detectedWords.forEach(word => {
        const key = `${word.word}_${word.language}`;
        wordFrequencyMap.set(key, (wordFrequencyMap.get(key) || 0) + word.frequency);
      });

      const topDetectedWords = Array.from(wordFrequencyMap.entries())
        .map(([key, frequency]) => {
          const [word, language] = key.split('_');
          return { word, frequency, language };
        })
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10);

      // Calculate detection metrics
      const precision = calculatePercentage(moderationAccuracy.true_positives, 
        moderationAccuracy.true_positives + moderationAccuracy.false_positives);
      const recall = calculatePercentage(moderationAccuracy.true_positives, totalFlaggedTexts);
      const f1_score = precision && recall ? 2 * (precision * recall) / (precision + recall) : 0;

      // Create source breakdown
      const sourceBreakdown = new Map();
      detectedTexts.forEach(text => {
        const source = text.source;
        sourceBreakdown.set(source, (sourceBreakdown.get(source) || 0) + 1);
      });

      // Create or update analytics
      const analyticsData = {
        date,
        website_id: website._id,
        metrics: {
          total_flagged_texts: totalFlaggedTexts,
          total_reports: totalReports,
          flagged_by_language: flaggedByLanguage,
          sentiment_distribution: sentimentDistribution,
          moderation_accuracy: moderationAccuracy,
          source_breakdown: Object.fromEntries(sourceBreakdown)
        },
        top_detected_words: topDetectedWords,
        word_categories: wordCategories,
        language_breakdown: flaggedByLanguage,
        detection_metrics: {
          precision,
          recall,
          f1_score
        }
      };

      // Find existing analytics for this website and date
      const existingAnalytics = await Analytics.findOne({
        website_id: website._id,
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999))
        }
      });

      if (existingAnalytics) {
        // Update existing analytics
        await Analytics.findByIdAndUpdate(existingAnalytics._id, analyticsData);
      } else {
        // Create new analytics
        const analytics = new Analytics(analyticsData);
        await analytics.save();
      }

      console.log(`Analytics generated for website: ${website.domain}`);

      analyticsCache.set(websiteId, {
        timestamp: Date.now(),
        data: analyticsData
      });
    }
  } catch (error) {
    console.error('Error generating analytics:', error);
    throw error;
  }
};

// Enhanced change stream setup with error recovery
const setupChangeStreams = async () => {
  const collections = [
    { model: DetectedText, name: 'DetectedText' },
    { model: DetectedWord, name: 'DetectedWord' },
    { model: ReportedContent, name: 'ReportedContent' }
  ];

  for (const { model, name } of collections) {
    let changeStream;
    
    const setupStream = async () => {
      try {
        changeStream = model.watch([], { fullDocument: 'updateLookup' });

        changeStream.on('change', async (change) => {
          console.log(`Change detected in ${name}:`, change.operationType);
          
          // Clear cache for affected website
          if (change.fullDocument && change.fullDocument.website_id) {
            analyticsCache.delete(change.fullDocument.website_id.toString());
          }
          
          try {
            await generateAnalytics();
            console.log(`Analytics updated due to change in ${name}`);
          } catch (error) {
            console.error(`Error updating analytics after ${name} change:`, error);
          }
        });

        changeStream.on('error', async (error) => {
          console.error(`Error in ${name} change stream:`, error);
          await setupStream(); // Attempt to reconnect
        });

        console.log(`Change stream set up for ${name}`);
      } catch (error) {
        console.error(`Error setting up ${name} change stream:`, error);
        setTimeout(setupStream, 5000); // Retry after 5 seconds
      }
    };

    await setupStream();
  }
};

// Real-time metrics aggregation
const getRealTimeMetrics = async (websiteId) => {
  const pipeline = [
    {
      $match: { 
        website_id: new mongoose.Types.ObjectId(websiteId),
        timestamp: { 
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    },
    {
      $group: {
        _id: null,
        totalDetections: { $sum: 1 },
        averageAccuracy: { $avg: "$performance.accuracy" },
        latestMetrics: { $last: "$$ROOT" }
      }
    }
  ];

  const metrics = await ModelMetrics.aggregate(pipeline);
  return metrics[0] || null;
};

// Controller methods with caching
export const getAnalytics = async (req, res) => {
  try {
    const websiteId = req.params.websiteId;
    const query = websiteId ? { website_id: websiteId } : {};
    
    // Check cache first
    if (websiteId && analyticsCache.has(websiteId)) {
      const cachedData = analyticsCache.get(websiteId);
      if ((Date.now() - cachedData.timestamp) < CACHE_DURATION) {
        return res.json(cachedData.data);
      }
    }
    
    const analytics = await Analytics.find(query)
      .sort({ date: -1 })
      .limit(1)
      .populate('website_id', 'domain title');

    if (websiteId) {
      analyticsCache.set(websiteId, {
        timestamp: Date.now(),
        data: analytics
      });
    }

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Error fetching analytics' });
  }
};

export const getAnalyticsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, websiteId } = req.query;

    // Validate dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - (24 * 60 * 60 * 1000));
    const end = endDate ? new Date(endDate) : new Date();

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const query = {
      date: {
        $gte: start,
        $lte: end
      }
    };

    if (websiteId) {
      query.website_id = new mongoose.Types.ObjectId(websiteId);
    }

    const analytics = await Analytics.find(query)
      .sort({ date: -1 })
      .populate('website_id', 'domain title');

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics by date range:', error);
    res.status(500).json({ error: 'Error fetching analytics by date range' });
  }
};

// Add this new function to your existing analytics.controller.js
export const getBubbleChartData = async (req, res) => {
  try {
    const { timeFrame = 'day', websiteId } = req.query;
    console.log('Fetching bubble chart data:', { timeFrame, websiteId });
    
    // First get the available date range
    const dateRange = await DetectedWord.aggregate([
      {
        $group: {
          _id: null,
          minDate: { $min: "$detected_at" },
          maxDate: { $max: "$detected_at" }
        }
      }
    ]);

    if (!dateRange.length) {
      console.log('No data available in database');
      return res.json({ words: [] });
    }

    const maxDate = dateRange[0].maxDate;
    let startDate;

    // Calculate start date based on the most recent data point
    switch (timeFrame) {
      case 'day':
        startDate = new Date(maxDate.getTime() - (24 * 60 * 60 * 1000));
        break;
      case 'week':
        startDate = new Date(maxDate.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case 'month':
        startDate = new Date(maxDate.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      case 'year':
        startDate = new Date(maxDate.getTime() - (365 * 24 * 60 * 60 * 1000));
        break;
      default:
        startDate = new Date(maxDate.getTime() - (24 * 60 * 60 * 1000));
    }

    let query = {
      detected_at: { 
        $gte: startDate,
        $lte: maxDate 
      }
    };

    if (websiteId) {
      query.website_id = new mongoose.Types.ObjectId(websiteId);
    }

    console.log('Query with dates:', {
      startDate: startDate.toISOString(),
      endDate: maxDate.toISOString()
    });

    // Get detected words within the time range
    const detectedWords = await DetectedWord.find(query)
      .populate('website_id', 'domain')
      .lean();

    console.log('Found detected words:', detectedWords.length);

    if (detectedWords.length === 0) {
      // If no data in the time range, expand the query to get all data
      delete query.detected_at;
      const allWords = await DetectedWord.find(query)
        .populate('website_id', 'domain')
        .lean();

      console.log('Found words without date filter:', allWords.length);

      if (allWords.length === 0) {
        return res.json({ 
          words: [],
          message: 'No data available'
        });
      }

      // Process all available words
      detectedWords.push(...allWords);
    }

    // Process the words to aggregate frequencies
    const wordMap = new Map();

    detectedWords.forEach(word => {
      const key = `${word.word}_${word.language}_${word.category}`;
      if (!wordMap.has(key)) {
        wordMap.set(key, {
          word: word.word,
          language: word.language,
          category: word.category || 'unknown',
          severity: word.severity_level || 1,
          count: word.frequency || 1,
          websites: new Set([word.website_id?.domain || 'unknown'])
        });
      } else {
        const existing = wordMap.get(key);
        existing.count += word.frequency || 1;
        existing.severity = Math.max(existing.severity, word.severity_level || 1);
        if (word.website_id?.domain) {
          existing.websites.add(word.website_id.domain);
        }
      }
    });

    // Convert to array and format for response
    const words = Array.from(wordMap.values())
      .map(({ websites, ...item }) => ({
        ...item,
        websites: Array.from(websites),
        size: Math.max(30, Math.min(100, item.count * 2))
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);

    console.log('Sending response with words:', words.length);
    res.json({ 
      words,
      dateRange: {
        start: startDate,
        end: maxDate
      }
    });

  } catch (error) {
    console.error('Error fetching bubble chart data:', error);
    res.status(500).json({ error: 'Error fetching bubble chart data' });
  }
};

// Initialize change streams
setupChangeStreams().catch(console.error);

// Export functions
export const generateInitialAnalytics = generateAnalytics;
export const getRealtimeMetrics = getRealTimeMetrics; 