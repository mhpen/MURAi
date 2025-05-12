import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, PieChartIcon, LineChartIcon, Filter, Clock, Users, AlertCircle, Activity, ShieldAlert, AlertOctagon, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { CHART_COLORS } from '@/constants/colors';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import KPICard from './KPICard';
import { generateReport } from '@/utils/reportGenerator';
import DownloadButton from '@/components/ui/DownloadButton';
import { API_BASE_URL } from '../../config';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const Overview = ({ isDarkMode }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add refs for the charts
  const sentimentChartRef = useRef(null);
  const detectionChartRef = useRef(null);
  const accuracyChartRef = useRef(null);
  const languageChartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/admin/analytics/overview`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();
        console.log('Raw API response:', result);

        // Transform data with defaults for all fields
        const transformedData = {
          totalFlagged: result?.totalFlagged || 0,
          flaggedContent: {
            total: result?.flaggedContent?.total || 0,
            automated: result?.flaggedContent?.automated || 0,
            userReported: result?.flaggedContent?.userReported || 0,
            weeklyChange: result?.flaggedContent?.weeklyChange || 0
          },
          moderationStats: {
            accuracy: result?.moderationStats?.accuracy || 0,
            truePositives: result?.moderationStats?.truePositives || 0,
            falsePositives: result?.moderationStats?.falsePositives || 0,
            responseTime: result?.moderationStats?.responseTime || 'N/A'
          },
          languageBreakdown: {
            filipino: result?.languageBreakdown?.filipino || 0,
            english: result?.languageBreakdown?.english || 0
          },
          sentimentBreakdown: {
            total: result?.sentimentBreakdown?.total || 0,
            positive: result?.sentimentBreakdown?.positive || 0,
            neutral: result?.sentimentBreakdown?.neutral || 0,
            negative: result?.sentimentBreakdown?.negative || 0
          },
          websiteSources: result?.websiteSources || [],
          additionalStats: {
            pendingReports: result?.additionalStats?.pendingReports || 0,
            totalUsers: result?.additionalStats?.totalUsers || 0,
            reportsLast24H: result?.additionalStats?.reportsLast24H || 0,
            avgResponseTimes: result?.additionalStats?.avgResponseTimes || [],
            highSeverityCount: result?.additionalStats?.highSeverityCount || 0,
            processingCount: result?.additionalStats?.processingCount || 0
          }
        };

        console.log('Transformed data:', transformedData);
        setData(transformedData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add error boundary for calculations
  const calculatePercentage = (part, total) => {
    if (!part || !total) return 0;
    return ((part / total) * 100).toFixed(1);
  };

  // Add safe render check
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p>No data available</p>
      </div>
    );
  }

    // Helper function to get the right color based on mode
    const getColor = (colorObj, type, isDarkMode) => {
        if (isDarkMode && colorObj.darkMode) {
            return colorObj.darkMode[type];
        }
        return colorObj[type];
    };

    // Chart.js options
    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                titleColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                bodyColor: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1,
                padding: 10,
                boxPadding: 4,
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${percentage}%`;
                    }
                }
            }
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000,
            easing: 'easeOutQuart'
        },
        elements: {
            arc: {
                borderWidth: 2
            }
        }
    };

    // Language distribution chart data
    const languageData = {
        labels: ['Filipino', 'English'],
        datasets: [{
      data: [data.languageBreakdown.filipino, data.languageBreakdown.english],
            backgroundColor: [
                isDarkMode 
                    ? 'rgba(156, 163, 175, 0.4)' // Light gray with low opacity for dark mode
                    : 'rgba(75, 85, 99, 0.2)',    // Dark gray with low opacity for light mode
                isDarkMode 
                    ? 'rgba(165, 180, 252, 0.4)'  // Light indigo with low opacity for dark mode
                    : 'rgba(99, 102, 241, 0.2)'   // Indigo with low opacity for light mode
            ],
            borderColor: [
                isDarkMode 
                    ? 'rgba(156, 163, 175, 0.9)' // Light gray with high opacity for dark mode
                    : 'rgba(75, 85, 99, 0.8)',    // Dark gray with high opacity for light mode
                isDarkMode 
                    ? 'rgba(165, 180, 252, 0.9)'  // Light indigo with high opacity for dark mode
                    : 'rgba(99, 102, 241, 0.8)'   // Indigo with high opacity for light mode
            ],
            borderWidth: 2,
            hoverBackgroundColor: [
                isDarkMode 
                    ? 'rgba(156, 163, 175, 0.6)' // Light gray with medium opacity for dark mode
                    : 'rgba(75, 85, 99, 0.4)',    // Dark gray with medium opacity for light mode
                isDarkMode 
                    ? 'rgba(165, 180, 252, 0.6)'  // Light indigo with medium opacity for dark mode
                    : 'rgba(99, 102, 241, 0.4)'   // Indigo with medium opacity for light mode
            ]
        }]
    };

    // Sentiment chart data
    const sentimentData = {
    labels: Object.keys(data.sentimentBreakdown).filter(key => key !== 'total'),
        datasets: [{
      data: Object.entries(data.sentimentBreakdown)
                .filter(([key]) => key !== 'total')
                .map(([_, value]) => value),
            backgroundColor: [
                isDarkMode ? 'rgba(74, 222, 128, 0.25)' : 'rgba(22, 163, 74, 0.15)',    // Positive - muted green
                isDarkMode ? 'rgba(203, 213, 225, 0.25)' : 'rgba(148, 163, 184, 0.15)', // Neutral - muted gray
                isDarkMode ? 'rgba(252, 165, 165, 0.25)' : 'rgba(239, 68, 68, 0.15)'    // Negative - muted red
            ],
            borderColor: [
                isDarkMode ? 'rgba(74, 222, 128, 0.8)' : 'rgba(22, 163, 74, 0.7)',    // Positive - muted green
                isDarkMode ? 'rgba(203, 213, 225, 0.8)' : 'rgba(148, 163, 184, 0.7)', // Neutral - muted gray
                isDarkMode ? 'rgba(252, 165, 165, 0.8)' : 'rgba(239, 68, 68, 0.7)'    // Negative - muted red
            ],
            borderWidth: 2,
            hoverBackgroundColor: [
                isDarkMode ? 'rgba(74, 222, 128, 0.4)' : 'rgba(22, 163, 74, 0.3)',    // Positive - muted green
                isDarkMode ? 'rgba(203, 213, 225, 0.4)' : 'rgba(148, 163, 184, 0.3)', // Neutral - muted gray
                isDarkMode ? 'rgba(252, 165, 165, 0.4)' : 'rgba(239, 68, 68, 0.3)'    // Negative - muted red
            ]
        }]
    };

    // Detection method chart data
    const detectionData = {
        labels: ['Automated', 'User Reports'],
        datasets: [{
      data: [
        data.flaggedContent.automated,
        data.flaggedContent.userReported
      ],
      backgroundColor: isDarkMode 
        ? ['rgba(125, 211, 252, 0.8)', 'rgba(253, 224, 71, 0.8)']
        : ['rgba(14, 165, 233, 0.7)', 'rgba(234, 179, 8, 0.7)'],
      borderWidth: 0
        }]
    };

    // Moderation accuracy chart data
    const accuracyData = {
        labels: ['True Positives', 'False Positives'],
        datasets: [{
      data: [data.moderationStats.truePositives, data.moderationStats.falsePositives],
            backgroundColor: [
                isDarkMode ? 'rgba(134, 239, 172, 0.25)' : 'rgba(34, 197, 94, 0.15)',  // True positives - muted green
                isDarkMode ? 'rgba(254, 202, 202, 0.25)' : 'rgba(220, 38, 38, 0.15)'   // False positives - muted red
            ],
            borderColor: [
                isDarkMode ? 'rgba(134, 239, 172, 0.8)' : 'rgba(34, 197, 94, 0.7)',  // True positives - muted green
                isDarkMode ? 'rgba(254, 202, 202, 0.8)' : 'rgba(220, 38, 38, 0.7)'   // False positives - muted red
            ],
            borderWidth: 2,
            hoverBackgroundColor: [
                isDarkMode ? 'rgba(134, 239, 172, 0.4)' : 'rgba(34, 197, 94, 0.3)',  // True positives - muted green
                isDarkMode ? 'rgba(254, 202, 202, 0.4)' : 'rgba(220, 38, 38, 0.3)'   // False positives - muted red
            ]
        }]
    };

    const handleDownload = async () => {
      if (!data) return;
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        const getChartImage = (ref, title, labels) => {
          try {
            if (!ref.current) {
              console.warn('Chart ref not available');
              return null;
            }
            // Request higher quality canvas
            const canvas = ref.current.canvas;
            const scale = 2; // Double the resolution
            const scaledCanvas = document.createElement('canvas');
            scaledCanvas.width = canvas.width * scale;
            scaledCanvas.height = canvas.height * scale;
            const ctx = scaledCanvas.getContext('2d');
            ctx.scale(scale, scale);
            ctx.drawImage(canvas, 0, 0);
            
            return {
              dataUrl: scaledCanvas.toDataURL('image/png', 1.0),
              title,
              labels
            };
          } catch (err) {
            console.warn('Error getting chart image:', err);
            return null;
          }
        };

        const charts = {
          language: getChartImage(languageChartRef, 'Language Distribution', {
            title: 'Content Language Distribution',
            labels: ['Filipino', 'English']
          }),
          sentiment: getChartImage(sentimentChartRef, 'Sentiment Analysis', {
            title: 'Content Sentiment Distribution',
            labels: ['Positive', 'Neutral', 'Negative']
          }),
          detection: getChartImage(detectionChartRef, 'Detection Methods', {
            title: 'Content Detection Methods',
            labels: ['Automated', 'User Reports']
          }),
          accuracy: getChartImage(accuracyChartRef, 'Moderation Accuracy', {
            title: 'Moderation Decision Accuracy',
            labels: ['True Positives', 'False Positives']
          })
        };

        await generateReport({ 
          ...data,
          charts,
          reportDate: new Date().toLocaleString(),
          isDarkMode
        }, 'overview');
      } catch (error) {
        console.error('Error generating report:', error);
      }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Overview</h2>
              <DownloadButton onClick={handleDownload} isDarkMode={isDarkMode} />
            </div>

            {/* Primary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Users */}
        <KPICard
          isDarkMode={isDarkMode}
          title="Total Users"
          value={data.additionalStats.totalUsers || 0}
          subValue="Active accounts"
          icon={Users}
        />

        {/* 2. Total Flagged */}
                <KPICard
                    isDarkMode={isDarkMode}
          title="Total Flagged"
          value={data.totalFlagged || 0}
          subValue={`${data.flaggedContent.weeklyChange || 0} this week`}
                    icon={Filter}
                />

        {/* 3. User Reports */}
        <KPICard
          isDarkMode={isDarkMode}
          title="User Reports"
          value={data.flaggedContent.userReported || 0}
          subValue="Community reports"
          icon={Users}
        />

        {/* 4. Auto Detection */}
        <KPICard
          isDarkMode={isDarkMode}
          title="Auto Detection"
          value={`${calculatePercentage(data.flaggedContent.automated, data.flaggedContent.total)}%`}
          subValue="Automated flags"
          icon={ShieldAlert}
        />

        {/* 5. Pending Reports */}
        <KPICard
          isDarkMode={isDarkMode}
          title="Pending Reports"
          value={data.additionalStats.pendingReports || 0}
          subValue="Awaiting review"
          icon={AlertCircle}
          className={data.additionalStats.pendingReports > 0 ? "border-yellow-500/50" : ""}
        />

        {/* 6. Accuracy */}
                <KPICard
                    isDarkMode={isDarkMode}
          title="Accuracy"
          value={`${data.moderationStats.accuracy || 0}%`}
          subValue="Moderation accuracy"
          icon={CheckCircle}
        />

        {/* 7. False Positives */}
                <KPICard
                    isDarkMode={isDarkMode}
          title="False Positives"
          value={data.moderationStats.falsePositives || 0}
          subValue="Incorrect flags"
          icon={XCircle}
        />

        {/* 8. 24h Activity */}
                <KPICard
                    isDarkMode={isDarkMode}
          title="24h Reports"
          value={data.additionalStats.reportsLast24H || 0}
          subValue="Last 24 hours"
          icon={Activity}
                />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Language Distribution */}
                <div className={cn(
                    "border rounded-lg p-6",
                    isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5"
                )}>
                    <h3 className="text-lg font-medium mb-4">Language Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            {/* Filipino Stats */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm">Filipino</span>
                  <span className="font-medium">{data.languageBreakdown.filipino} flags</span>
                                </div>
                                <div className="w-full bg-black/5 rounded-full h-2">
                                    <div 
                                        className="h-2 rounded-full" 
                                        style={{ 
                      width: `${(data.languageBreakdown.filipino/(data.languageBreakdown.filipino + data.languageBreakdown.english))*100}%`,
                                            backgroundColor: getColor(CHART_COLORS.primary.filipino, 'main', isDarkMode)
                                        }}
                                    />
                                </div>
                            </div>
                            
                            {/* English Stats */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm">English</span>
                  <span className="font-medium">{data.languageBreakdown.english} flags</span>
                                </div>
                                <div className="w-full bg-black/5 rounded-full h-2">
                                    <div 
                                        className="h-2 rounded-full" 
                                        style={{ 
                      width: `${(data.languageBreakdown.english/(data.languageBreakdown.filipino + data.languageBreakdown.english))*100}%`,
                                            backgroundColor: getColor(CHART_COLORS.primary.english, 'main', isDarkMode)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Language Chart */}
                        <div className="h-[120px] flex items-center justify-center">
                            <Doughnut data={languageData} options={doughnutOptions} ref={languageChartRef} />
                        </div>
                    </div>
                </div>

                {/* Website Sources */}
        <WebsiteSourcesSection 
          data={data} 
          isDarkMode={isDarkMode} 
          calculatePercentage={calculatePercentage}
        />

                {/* Quick Sentiment Overview */}
                <div className={cn(
                    "border rounded-lg p-6",
                    isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5"
                )}>
                    <h3 className="text-lg font-medium mb-4">Quick Sentiment Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
              {Object.entries(data.sentimentBreakdown)
                                .filter(([key]) => key !== 'total')
                                .map(([sentiment, count]) => (
                                <div key={sentiment} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm capitalize">{sentiment}</span>
                                        <span className="font-medium">
                      {((count/data.sentimentBreakdown.total)*100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-black/5 rounded-full h-2">
                                        <div 
                                            className="h-2 rounded-full" 
                                            style={{ 
                        width: `${(count/data.sentimentBreakdown.total)*100}%`,
                                                backgroundColor: sentiment.toLowerCase() === 'positive' 
                                                    ? (isDarkMode ? 'rgba(74, 222, 128, 0.8)' : 'rgba(22, 163, 74, 0.7)')
                                                    : sentiment.toLowerCase() === 'neutral'
                                                        ? (isDarkMode ? 'rgba(203, 213, 225, 0.8)' : 'rgba(148, 163, 184, 0.7)')
                                                        : (isDarkMode ? 'rgba(252, 165, 165, 0.8)' : 'rgba(239, 68, 68, 0.7)')
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Sentiment Chart */}
                        <div className="h-[120px] flex items-center justify-center">
                            <Doughnut data={sentimentData} options={doughnutOptions} ref={sentimentChartRef} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Automated vs Manual Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className={cn(
                    "border rounded-lg p-6",
                    isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5"
                )}>
          <h3 className="text-lg font-medium mb-6">Detection Method Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                        <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Automated Detection</span>
                  <span className="font-medium">{data.flaggedContent.automated} detections</span>
                                </div>
                <div className="relative w-full h-2">
                  <div className="absolute inset-0 bg-black/5 rounded-full" />
                                    <div 
                    className="absolute inset-0 rounded-full transition-all duration-300"
                                        style={{ 
                      width: `${(data.flaggedContent.automated / (data.flaggedContent.automated + data.flaggedContent.userReported) * 100).toFixed(1)}%`,
                                            backgroundColor: isDarkMode ? 'rgba(125, 211, 252, 0.8)' : 'rgba(14, 165, 233, 0.7)'
                                        }}
                                    />
                                </div>
                            </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">User Reports</span>
                  <span className="font-medium">{data.flaggedContent.userReported} reports</span>
                                </div>
                <div className="relative w-full h-2">
                  <div className="absolute inset-0 bg-black/5 rounded-full" />
                                    <div 
                    className="absolute inset-0 rounded-full transition-all duration-300"
                                        style={{ 
                      width: `${(data.flaggedContent.userReported / (data.flaggedContent.automated + data.flaggedContent.userReported) * 100).toFixed(1)}%`,
                                            backgroundColor: isDarkMode ? 'rgba(253, 224, 71, 0.8)' : 'rgba(234, 179, 8, 0.7)'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        
            <div className="h-[160px] flex items-center justify-center">
                            <Doughnut data={detectionData} options={doughnutOptions} ref={detectionChartRef} />
                        </div>
                    </div>
                </div>

                {/* Moderation Accuracy Details */}
                <div className={cn(
                    "border rounded-lg p-6",
                    isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5"
                )}>
                    <h3 className="text-lg font-medium mb-4">Moderation Accuracy Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm">True Positives</span>
                  <span className="font-medium">{data.moderationStats.truePositives} flags</span>
                                </div>
                                <div className="w-full bg-green-100/20 h-2 rounded-full">
                                    <div 
                                        className="h-2 rounded-full" 
                                        style={{ 
                      width: `${(data.moderationStats.truePositives/(data.moderationStats.truePositives + data.moderationStats.falsePositives))*100}%`,
                                            backgroundColor: isDarkMode ? 'rgba(134, 239, 172, 0.8)' : 'rgba(34, 197, 94, 0.7)'
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm">False Positives</span>
                  <span className="font-medium">{data.moderationStats.falsePositives} flags</span>
                                </div>
                                <div className="w-full bg-red-100/20 h-2 rounded-full">
                                    <div 
                                        className="h-2 rounded-full" 
                                        style={{ 
                      width: `${(data.moderationStats.falsePositives/(data.moderationStats.truePositives + data.moderationStats.falsePositives))*100}%`,
                                            backgroundColor: isDarkMode ? 'rgba(254, 202, 202, 0.8)' : 'rgba(220, 38, 38, 0.7)'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Accuracy Chart */}
                        <div className="h-[120px] flex items-center justify-center">
                            <Doughnut data={accuracyData} options={doughnutOptions} ref={accuracyChartRef} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WebsiteSourcesSection = ({ data, isDarkMode, calculatePercentage }) => {
  if (!data.websiteSources || data.websiteSources.length === 0) {
    return (
      <div className={cn(
        "border rounded-lg p-6",
        isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5"
      )}>
        <h3 className="text-lg font-medium mb-4">Website Sources</h3>
        <div className="flex items-center justify-center h-[200px] text-gray-500">
          No website data available
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "border rounded-lg p-6",
      isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5"
    )}>
      <h3 className="text-lg font-medium mb-4">Website Sources</h3>
      <div className="h-[200px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
          {data.websiteSources.map((source, index) => (
            <div key={source.name || index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm truncate flex-1 mr-2">{source.name || 'Unknown'}</span>
                <span className="font-medium whitespace-nowrap">
                  {calculatePercentage(source.count, data.flaggedContent.total)}%
                </span>
              </div>
              <div className="w-full bg-black/5 rounded-full h-2.5">
                <div 
                  className="bg-black/20 h-2.5 rounded-full" 
                  style={{ 
                    width: `${calculatePercentage(source.count, data.flaggedContent.total)}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview; 