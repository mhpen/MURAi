// Mock data for the admin dashboard
export const mockData = {
    totalFlagged: 1247,
    languageBreakdown: {
        filipino: 734,
        english: 513
    },
    sentimentBreakdown: {
        total: 1247,
        positive: 312,
        neutral: 561,
        negative: 374
    },
    flaggedContent: {
        total: 1247,
        automated: 1156,
        userReported: 91,
        dailyAverage: 42,
        weeklyChange: "+12.5%",
        monthlyTotal: 1247
    },
    moderationStats: {
        truePositives: 1156,
        falsePositives: 91,
        accuracy: 95.8,
        responseTime: "1.2s"
    },
    websiteSources: [
        { name: "Website 1", count: 450 },
        { name: "Website 2", count: 350 },
        { name: "Website 3", count: 250 },
        { name: "Others", count: 197 }
    ]
};

// Time series data for trend analysis
export const timeSeriesData = [
    { name: 'Mon', filipino: 65, english: 45 },
    { name: 'Tue', filipino: 75, english: 55 },
    { name: 'Wed', filipino: 85, english: 40 },
    { name: 'Thu', filipino: 70, english: 65 },
    { name: 'Fri', filipino: 90, english: 50 },
    { name: 'Sat', filipino: 60, english: 35 },
    { name: 'Sun', filipino: 80, english: 45 },
];

// Word frequency data
export const wordFrequencyData = [
    { word: 'Word 1', filipino: 156, english: 98 },
    { word: 'Word 2', filipino: 142, english: 87 },
    { word: 'Word 3', filipino: 125, english: 76 },
    { word: 'Word 4', filipino: 118, english: 65 },
    { word: 'Word 5', filipino: 95, english: 54 },
];

// Sentiment distribution data
export const sentimentData = [
    { name: 'Positive', value: 312 },
    { name: 'Neutral', value: 561 },
    { name: 'Negative', value: 374 },
]; 