import React from 'react';
import { BarChart3, PieChartIcon, LineChartIcon, Filter } from 'lucide-react';
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

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const Overview = ({ isDarkMode, mockData }) => {
    // Add console.log to debug
    console.log('Overview Props:', { isDarkMode, mockData });

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
            data: [mockData.languageBreakdown.filipino, mockData.languageBreakdown.english],
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
        labels: Object.keys(mockData.sentimentBreakdown).filter(key => key !== 'total'),
        datasets: [{
            data: Object.entries(mockData.sentimentBreakdown)
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
            data: [mockData.flaggedContent.automated, mockData.flaggedContent.userReported],
            backgroundColor: [
                isDarkMode ? 'rgba(125, 211, 252, 0.25)' : 'rgba(14, 165, 233, 0.15)', // Automated - muted blue
                isDarkMode ? 'rgba(253, 224, 71, 0.25)' : 'rgba(234, 179, 8, 0.15)'    // Manual - muted yellow
            ],
            borderColor: [
                isDarkMode ? 'rgba(125, 211, 252, 0.8)' : 'rgba(14, 165, 233, 0.7)', // Automated - muted blue
                isDarkMode ? 'rgba(253, 224, 71, 0.8)' : 'rgba(234, 179, 8, 0.7)'    // Manual - muted yellow
            ],
            borderWidth: 2,
            hoverBackgroundColor: [
                isDarkMode ? 'rgba(125, 211, 252, 0.4)' : 'rgba(14, 165, 233, 0.3)', // Automated - muted blue
                isDarkMode ? 'rgba(253, 224, 71, 0.4)' : 'rgba(234, 179, 8, 0.3)'    // Manual - muted yellow
            ]
        }]
    };

    // Moderation accuracy chart data
    const accuracyData = {
        labels: ['True Positives', 'False Positives'],
        datasets: [{
            data: [mockData.moderationStats.truePositives, mockData.moderationStats.falsePositives],
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

    return (
        <div className="space-y-8">
            {/* Primary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    isDarkMode={isDarkMode}
                    title="Total Flagged Content"
                    value={mockData.totalFlagged}
                    subValue={`${mockData.flaggedContent.weeklyChange} this week`}
                    icon={Filter}
                />
                <KPICard
                    isDarkMode={isDarkMode}
                    title="Automated vs User Reports"
                    value={`${((mockData.flaggedContent.automated/mockData.flaggedContent.total)*100).toFixed(0)}%`}
                    subValue={`${mockData.flaggedContent.userReported} user reports`}
                    icon={BarChart3}
                />
                <KPICard
                    isDarkMode={isDarkMode}
                    title="Moderation Accuracy"
                    value={`${mockData.moderationStats.accuracy}%`}
                    subValue={`${mockData.moderationStats.falsePositives} false positives`}
                    icon={PieChartIcon}
                />
                <KPICard
                    isDarkMode={isDarkMode}
                    title="Average Response Time"
                    value={mockData.moderationStats.responseTime}
                    subValue="Detection speed"
                    icon={LineChartIcon}
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
                                    <span className="font-medium">{mockData.languageBreakdown.filipino} flags</span>
                                </div>
                                <div className="w-full bg-black/5 rounded-full h-2">
                                    <div 
                                        className="h-2 rounded-full" 
                                        style={{ 
                                            width: `${(mockData.languageBreakdown.filipino/(mockData.languageBreakdown.filipino + mockData.languageBreakdown.english))*100}%`,
                                            backgroundColor: getColor(CHART_COLORS.primary.filipino, 'main', isDarkMode)
                                        }}
                                    />
                                </div>
                            </div>
                            
                            {/* English Stats */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm">English</span>
                                    <span className="font-medium">{mockData.languageBreakdown.english} flags</span>
                                </div>
                                <div className="w-full bg-black/5 rounded-full h-2">
                                    <div 
                                        className="h-2 rounded-full" 
                                        style={{ 
                                            width: `${(mockData.languageBreakdown.english/(mockData.languageBreakdown.filipino + mockData.languageBreakdown.english))*100}%`,
                                            backgroundColor: getColor(CHART_COLORS.primary.english, 'main', isDarkMode)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Language Chart */}
                        <div className="h-[120px] flex items-center justify-center">
                            <Doughnut data={languageData} options={doughnutOptions} />
                        </div>
                    </div>
                </div>

                {/* Website Sources */}
                <div className={cn(
                    "border rounded-lg p-6",
                    isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5"
                )}>
                    <h3 className="text-lg font-medium mb-4">Website Sources</h3>
                    <div className="space-y-3">
                        {mockData.websiteSources.map((source, index) => (
                            <div key={source.name} className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">{source.name}</span>
                                    <span className="font-medium">{((source.count/mockData.flaggedContent.total)*100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-black/5 rounded-full h-2">
                                    <div 
                                        className="bg-black/20 h-2 rounded-full" 
                                        style={{ width: `${(source.count/mockData.flaggedContent.total)*100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Sentiment Overview */}
                <div className={cn(
                    "border rounded-lg p-6",
                    isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5"
                )}>
                    <h3 className="text-lg font-medium mb-4">Quick Sentiment Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            {Object.entries(mockData.sentimentBreakdown)
                                .filter(([key]) => key !== 'total')
                                .map(([sentiment, count]) => (
                                <div key={sentiment} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm capitalize">{sentiment}</span>
                                        <span className="font-medium">
                                            {((count/mockData.sentimentBreakdown.total)*100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-black/5 rounded-full h-2">
                                        <div 
                                            className="h-2 rounded-full" 
                                            style={{ 
                                                width: `${(count/mockData.sentimentBreakdown.total)*100}%`,
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
                            <Doughnut data={sentimentData} options={doughnutOptions} />
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
                    <h3 className="text-lg font-medium mb-4">Detection Method Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm">Automated Detection</span>
                                    <span className="font-medium">{mockData.flaggedContent.automated} flags</span>
                                </div>
                                <div className="w-full bg-black/5 rounded-full h-2">
                                    <div 
                                        className="h-2 rounded-full" 
                                        style={{ 
                                            width: `${(mockData.flaggedContent.automated/mockData.flaggedContent.total)*100}%`,
                                            backgroundColor: isDarkMode ? 'rgba(125, 211, 252, 0.8)' : 'rgba(14, 165, 233, 0.7)'
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm">User Reports</span>
                                    <span className="font-medium">{mockData.flaggedContent.userReported} reports</span>
                                </div>
                                <div className="w-full bg-black/5 rounded-full h-2">
                                    <div 
                                        className="h-2 rounded-full" 
                                        style={{ 
                                            width: `${(mockData.flaggedContent.userReported/mockData.flaggedContent.total)*100}%`,
                                            backgroundColor: isDarkMode ? 'rgba(253, 224, 71, 0.8)' : 'rgba(234, 179, 8, 0.7)'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Detection Method Chart */}
                        <div className="h-[120px] flex items-center justify-center">
                            <Doughnut data={detectionData} options={doughnutOptions} />
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
                                    <span className="font-medium">{mockData.moderationStats.truePositives} flags</span>
                                </div>
                                <div className="w-full bg-green-100/20 h-2 rounded-full">
                                    <div 
                                        className="h-2 rounded-full" 
                                        style={{ 
                                            width: `${(mockData.moderationStats.truePositives/(mockData.moderationStats.truePositives + mockData.moderationStats.falsePositives))*100}%`,
                                            backgroundColor: isDarkMode ? 'rgba(134, 239, 172, 0.8)' : 'rgba(34, 197, 94, 0.7)'
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm">False Positives</span>
                                    <span className="font-medium">{mockData.moderationStats.falsePositives} flags</span>
                                </div>
                                <div className="w-full bg-red-100/20 h-2 rounded-full">
                                    <div 
                                        className="h-2 rounded-full" 
                                        style={{ 
                                            width: `${(mockData.moderationStats.falsePositives/(mockData.moderationStats.truePositives + mockData.moderationStats.falsePositives))*100}%`,
                                            backgroundColor: isDarkMode ? 'rgba(254, 202, 202, 0.8)' : 'rgba(220, 38, 38, 0.7)'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Accuracy Chart */}
                        <div className="h-[120px] flex items-center justify-center">
                            <Doughnut data={accuracyData} options={doughnutOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview; 