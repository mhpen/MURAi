import { 
  DetectedText, 
  DetectedWord, 
  Website, 
  ReportedContent,
  Analytics,
  User
} from '../../models/index.js';
import mongoose from 'mongoose';

export const getAdminOverview = async (req, res) => {
  try {
    console.log('Starting admin overview data fetch...');
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    // Get total counts
    const totalFlagged = await DetectedText.countDocuments({ is_inappropriate: true });
    console.log('Total flagged content:', totalFlagged);

    const weeklyFlagged = await DetectedText.countDocuments({
      is_inappropriate: true,
      detected_at: { $gte: weekAgo }
    });

    // Get automated vs user reports
    const automatedCount = await DetectedText.countDocuments({ 
      detection_method: 'automated'
    });

    // Update user reports count to use source field
    const userReportCount = await DetectedText.countDocuments({
      source: { $in: ['user', 'both'] }  // Count documents where source is either 'user' or 'both'
    });

    // Log the query results for debugging
    console.log('Detection counts:', {
      automated: automatedCount,
      userReports: userReportCount
    });

    // Check distinct values
    const distinctMethods = await DetectedText.distinct('detection_method');
    const distinctSources = await DetectedText.distinct('source');
    console.log('Distinct detection methods:', distinctMethods);
    console.log('Distinct sources:', distinctSources);

    // Add a query to see some sample documents
    const sampleDocs = await DetectedText.find().limit(5).select('detection_method source');
    console.log('Sample documents:', sampleDocs);

    // Get moderation accuracy
    const truePositives = await DetectedText.countDocuments({ validation_status: 'true_positive' });
    const falsePositives = await DetectedText.countDocuments({ validation_status: 'false_positive' });
    const accuracy = truePositives + falsePositives > 0 
      ? (truePositives / (truePositives + falsePositives) * 100).toFixed(1)
      : 0;

    // Get language breakdown with null check
    const languageStats = await DetectedText.aggregate([
      { 
        $match: { 
          is_inappropriate: true,
          language: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get sentiment breakdown with null check
    const sentimentStats = await DetectedText.aggregate([
      {
        $match: {
          sentiment_label: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$sentiment_label',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate average response time (in milliseconds)
    const avgResponseTime = await DetectedText.aggregate([
      {
        $match: { 
          detection_time: { $exists: true, $ne: null },
          validation_time: { $exists: true, $ne: null }
        }
      },
      {
        $project: {
          responseTime: { 
            $subtract: ['$validation_time', '$detection_time'] 
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$responseTime' }
        }
      }
    ]);

    const responseTime = avgResponseTime.length > 0 
      ? `${(avgResponseTime[0].avgTime / 1000).toFixed(2)}s`
      : 'N/A';

    // Process language breakdown with safe defaults
    const languageBreakdown = languageStats.reduce((acc, curr) => {
      if (curr._id) {
        acc[curr._id.toLowerCase()] = curr.count;
      }
      return acc;
    }, { filipino: 0, english: 0 });

    // Process sentiment breakdown with safe defaults
    const sentimentBreakdown = {
      total: sentimentStats.reduce((sum, curr) => sum + (curr.count || 0), 0),
      positive: 0,
      neutral: 0,
      negative: 0,
      ...sentimentStats.reduce((acc, curr) => {
        if (curr._id) {
          acc[curr._id.toLowerCase()] = curr.count;
        }
        return acc;
      }, {})
    };

    const websiteSources = await DetectedText.aggregate([
      {
        $group: {
          _id: '$website_id',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'websites',
          localField: '_id',
          foreignField: '_id',
          as: 'website'
        }
      },
      {
        $unwind: {
          path: '$website',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          name: { $ifNull: ['$website.domain', 'Unknown'] },
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get pending reports count
    const pendingReports = await DetectedText.countDocuments({
      validation_status: { $exists: false }
    });

    // Get total users (excluding admins)
    const totalUsers = await User.countDocuments({
      role: { $ne: 'admin' }
    });

    // Get reports in last 24 hours
    const last24Hours = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const reportsLast24H = await DetectedText.countDocuments({
      detected_at: { $gte: last24Hours }
    });

    // Get average response time trend
    const avgResponseTimes = await DetectedText.aggregate([
      {
        $match: {
          detection_time: { $exists: true },
          validation_time: { $exists: true }
        }
      },
      {
        $project: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$detected_at" } },
          responseTime: {
            $divide: [
              { $subtract: ["$validation_time", "$detection_time"] },
              1000 // Convert to seconds
            ]
          }
        }
      },
      {
        $group: {
          _id: "$date",
          avgTime: { $avg: "$responseTime" }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);

    // Get high severity reports count
    const highSeverityCount = await DetectedText.countDocuments({
      severity_level: { $gte: 4 }, // Assuming severity is 1-5
      validation_status: { $exists: false }
    });

    // Get processing/in-review count
    const processingCount = await DetectedText.countDocuments({
      validation_status: 'in_review'
    });

    const response = {
      totalFlagged: totalFlagged || 0,
      flaggedContent: {
        total: automatedCount + userReportCount,
        automated: automatedCount,
        userReported: userReportCount,
        weeklyChange: weeklyFlagged
      },
      moderationStats: {
        accuracy: parseFloat(accuracy) || 0,
        truePositives: truePositives || 0,
        falsePositives: falsePositives || 0,
        responseTime: responseTime || 'N/A'
      },
      languageBreakdown: languageBreakdown || { filipino: 0, english: 0 },
      sentimentBreakdown: sentimentBreakdown || {
        total: 0,
        positive: 0,
        neutral: 0,
        negative: 0
      },
      websiteSources: websiteSources?.map(source => ({
        name: source.name || 'Unknown',
        count: source.count || 0
      })) || [],
      additionalStats: {
        pendingReports,
        totalUsers,
        reportsLast24H,
        highSeverityCount,
        processingCount,
        avgResponseTimes: avgResponseTimes.map(item => ({
          date: item._id,
          time: item.avgTime.toFixed(2)
        }))
      }
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error getting admin overview:', error);
    res.status(500).json({ error: 'Error fetching admin overview data' });
  }
};

export const getDetailedAnalytics = async (req, res) => {
  try {
    const { timeRange = 'daily', language = 'both' } = req.query;
    console.log('Fetching detailed analytics with:', { timeRange, language });

    const now = new Date();
    let startDate;
    let dateFormat;

    // Calculate start date and format based on time range
    switch (timeRange) {
      case 'yearly':
        startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
        dateFormat = '%Y';
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        dateFormat = '%Y-%m';
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        dateFormat = '%Y-%m-%d';
        break;
      default: // daily
        startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        dateFormat = '%H:00';
    }

    // Language filter condition
    const languageFilter = language === 'both' ? {} : { 
      language: language === 'english' ? 'English' : 'Filipino'
    };

    // Time series data query
    const timeSeriesData = await DetectedText.aggregate([
      {
        $match: {
          detected_at: { $exists: true, $ne: null },
          ...languageFilter
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: '$detected_at'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Sentiment distribution with language filter
    const sentimentData = await DetectedText.aggregate([
      {
        $match: {
          sentiment_label: { $exists: true, $ne: null },
          ...languageFilter
        }
      },
      {
        $group: {
          _id: '$sentiment_label',
          count: { $sum: 1 }
        }
      }
    ]);

    // Word frequency data with proper language filter
    const wordFrequencyData = await DetectedWord.aggregate([
      {
        $match: language !== 'both' ? { 
          language: language === 'english' ? 'English' : 'Filipino'
        } : {}
      },
      {
        $group: {
          _id: '$word',
          count: { $sum: '$frequency' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    console.log('Language filter:', languageFilter);
    console.log('Raw time series data:', timeSeriesData);
    console.log('Raw sentiment data:', sentimentData);
    console.log('Word frequency data:', wordFrequencyData);

    const response = {
      timeSeriesData: timeSeriesData.map(item => ({
        time: item._id,
        count: item.count || 0
      })),
      wordFrequencyData: wordFrequencyData.map(item => ({
        word: item._id,
        count: item.count
      })),
      sentimentData: sentimentData.reduce((acc, curr) => {
        acc[curr._id.toLowerCase()] = curr.count;
        return acc;
      }, {})
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching detailed analytics:', error);
    res.status(500).json({ error: 'Error fetching detailed analytics data' });
  }
};
