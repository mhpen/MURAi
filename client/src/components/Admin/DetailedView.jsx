import React, { useState, useEffect, useRef } from 'react';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from '@/constants/colors';
import { ChevronDown, ChevronUp, Download, RefreshCw } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const DetailedView = ({ isDarkMode, mockData, timeSeriesData, wordFrequencyData, sentimentData }) => {
  const [timeRange, setTimeRange] = useState('daily');
  const [selectedLanguage, setSelectedLanguage] = useState('both');
  const [expandedChart, setExpandedChart] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Chart references for exporting
  const sentimentChartRef = useRef(null);
  const wordChartRef = useRef(null);
  const trendChartRef = useRef(null);

  // Helper function to get the right color based on mode
  const getColor = (colorObj, type, isDarkMode) => {
    if (isDarkMode && colorObj.darkMode) {
      return colorObj.darkMode[type];
    }
    return colorObj[type];
  };

  // Simulate data refresh
  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Download chart as image
  const downloadChart = (chartRef, filename) => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = url;
      link.click();
    }
  };

  // Filter data based on selected language
  const filteredWordData = wordFrequencyData.filter(item => {
    if (selectedLanguage === 'both') return true;
    return item[selectedLanguage] > 0;
  });

  // Chart control component
  const ChartControls = ({ title, chartId, chartRef }) => (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="flex items-center gap-2">
        <button 
          className={cn(
            "p-1.5 rounded-md transition-colors",
            isDarkMode 
              ? "hover:bg-white/5 text-white/70 hover:text-white" 
              : "hover:bg-black/5 text-black/70 hover:text-black"
          )}
          onClick={refreshData}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
        </button>
        <button 
          className={cn(
            "p-1.5 rounded-md transition-colors",
            isDarkMode 
              ? "hover:bg-white/5 text-white/70 hover:text-white" 
              : "hover:bg-black/5 text-black/70 hover:text-black"
          )}
          onClick={() => downloadChart(chartRef, chartId)}
        >
          <Download size={16} />
        </button>
        <button 
          className={cn(
            "p-1.5 rounded-md transition-colors",
            isDarkMode 
              ? "hover:bg-white/5 text-white/70 hover:text-white" 
              : "hover:bg-black/5 text-black/70 hover:text-black"
          )}
          onClick={() => setExpandedChart(expandedChart === chartId ? null : chartId)}
        >
          {expandedChart === chartId ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>
    </div>
  );

  // Chart.js options and data
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDarkMode ? CHART_COLORS.monochrome.white[80] : CHART_COLORS.monochrome.black[80],
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
        titleColor: isDarkMode ? CHART_COLORS.monochrome.white[90] : CHART_COLORS.monochrome.black[90],
        bodyColor: isDarkMode ? CHART_COLORS.monochrome.white[70] : CHART_COLORS.monochrome.black[70],
        borderColor: isDarkMode ? CHART_COLORS.monochrome.white[20] : CHART_COLORS.monochrome.black[20],
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y !== undefined ? context.parsed.y : context.parsed;
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode ? CHART_COLORS.monochrome.white[10] : CHART_COLORS.monochrome.black[10],
        },
        ticks: {
          color: isDarkMode ? CHART_COLORS.monochrome.white[60] : CHART_COLORS.monochrome.black[60],
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      y: {
        grid: {
          color: isDarkMode ? CHART_COLORS.monochrome.white[10] : CHART_COLORS.monochrome.black[10],
        },
        ticks: {
          color: isDarkMode ? CHART_COLORS.monochrome.white[60] : CHART_COLORS.monochrome.black[60],
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart'
    }
  };

  // Sentiment data for Pie chart
  const sentimentChartData = {
    labels: sentimentData.map(item => item.name),
    datasets: [{
      data: sentimentData.map(item => item.value),
      backgroundColor: sentimentData.map(item => {
        const sentiment = item.name.toLowerCase();
        if (sentiment === 'positive') {
          return isDarkMode ? 'rgba(74, 222, 128, 0.25)' : 'rgba(22, 163, 74, 0.15)';
        } else if (sentiment === 'neutral') {
          return isDarkMode ? 'rgba(203, 213, 225, 0.25)' : 'rgba(148, 163, 184, 0.15)';
        } else {
          return isDarkMode ? 'rgba(252, 165, 165, 0.25)' : 'rgba(239, 68, 68, 0.15)';
        }
      }),
      borderColor: sentimentData.map(item => {
        const sentiment = item.name.toLowerCase();
        if (sentiment === 'positive') {
          return isDarkMode ? 'rgba(74, 222, 128, 0.8)' : 'rgba(22, 163, 74, 0.7)';
        } else if (sentiment === 'neutral') {
          return isDarkMode ? 'rgba(203, 213, 225, 0.8)' : 'rgba(148, 163, 184, 0.7)';
        } else {
          return isDarkMode ? 'rgba(252, 165, 165, 0.8)' : 'rgba(239, 68, 68, 0.7)';
        }
      }),
      borderWidth: 2,
      hoverBackgroundColor: sentimentData.map(item => {
        const sentiment = item.name.toLowerCase();
        if (sentiment === 'positive') {
          return isDarkMode ? 'rgba(74, 222, 128, 0.4)' : 'rgba(22, 163, 74, 0.3)';
        } else if (sentiment === 'neutral') {
          return isDarkMode ? 'rgba(203, 213, 225, 0.4)' : 'rgba(148, 163, 184, 0.3)';
        } else {
          return isDarkMode ? 'rgba(252, 165, 165, 0.4)' : 'rgba(239, 68, 68, 0.3)';
        }
      })
    }]
  };

  // Word frequency data for Bar chart
  const wordChartData = {
    labels: filteredWordData.map(item => item.word),
    datasets: [
      {
        label: 'Filipino',
        data: filteredWordData.map(item => item.filipino),
        backgroundColor: isDarkMode ? 'rgba(186, 230, 253, 0.25)' : 'rgba(56, 189, 248, 0.15)',
        borderColor: isDarkMode ? 'rgba(186, 230, 253, 0.8)' : 'rgba(56, 189, 248, 0.7)',
        borderWidth: 2,
        borderRadius: 4,
        hoverBackgroundColor: isDarkMode ? 'rgba(186, 230, 253, 0.4)' : 'rgba(56, 189, 248, 0.3)'
      },
      {
        label: 'English',
        data: filteredWordData.map(item => item.english),
        backgroundColor: isDarkMode ? 'rgba(216, 180, 254, 0.25)' : 'rgba(168, 85, 247, 0.15)',
        borderColor: isDarkMode ? 'rgba(216, 180, 254, 0.8)' : 'rgba(168, 85, 247, 0.7)',
        borderWidth: 2,
        borderRadius: 4,
        hoverBackgroundColor: isDarkMode ? 'rgba(216, 180, 254, 0.4)' : 'rgba(168, 85, 247, 0.3)'
      }
    ]
  };

  // Time series data for Line chart
  const trendChartData = {
    labels: timeSeriesData.map(item => item.name),
    datasets: [
      {
        label: 'Filipino',
        data: timeSeriesData.map(item => item.filipino),
        borderColor: isDarkMode ? 'rgba(186, 230, 253, 0.8)' : 'rgba(56, 189, 248, 0.7)',
        backgroundColor: isDarkMode ? 'rgba(186, 230, 253, 0.1)' : 'rgba(56, 189, 248, 0.05)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: isDarkMode ? 'rgba(186, 230, 253, 0.8)' : 'rgba(56, 189, 248, 0.7)',
        pointBorderColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'English',
        data: timeSeriesData.map(item => item.english),
        borderColor: isDarkMode ? 'rgba(216, 180, 254, 0.8)' : 'rgba(168, 85, 247, 0.7)',
        backgroundColor: isDarkMode ? 'rgba(216, 180, 254, 0.1)' : 'rgba(168, 85, 247, 0.05)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: isDarkMode ? 'rgba(216, 180, 254, 0.8)' : 'rgba(168, 85, 247, 0.7)',
        pointBorderColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  // Custom options for each chart type
  const pieOptions = {
    ...chartOptions,
    cutout: '0%',
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const barOptions = {
    ...chartOptions,
    indexAxis: 'y',
    scales: {
      ...chartOptions.scales,
      x: {
        ...chartOptions.scales.x,
        beginAtZero: true
      }
    }
  };

  const lineOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          title: function(context) {
            return `${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}: ${context[0].label}`;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Language Filter */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {['both', 'filipino', 'english'].map((lang) => (
            <Button
              key={lang}
              variant={selectedLanguage === lang ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLanguage(lang)}
              className={cn(
                "capitalize transition-all duration-200",
                selectedLanguage === lang 
                  ? "bg-black/80 text-white hover:bg-black/90" 
                  : "hover:bg-black/5"
              )}
            >
              {lang}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={cn(
        "grid gap-6",
        expandedChart ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
      )}>
        {/* Sentiment Distribution */}
        <div className={cn(
          "border rounded-lg p-6 transition-all duration-300",
          isDarkMode 
            ? "border-white/10 bg-[#1A1A1A] shadow-lg shadow-black/20" 
            : "border-black/5 bg-white shadow-sm",
          expandedChart === 'sentiment' && "lg:col-span-2"
        )}>
          <ChartControls title="Sentiment Distribution" chartId="sentiment" chartRef={sentimentChartRef} />
          <div className={cn(
            "transition-all duration-300",
            expandedChart === 'sentiment' ? "h-[500px]" : "h-[300px]"
          )}>
            <Pie 
              data={sentimentChartData} 
              options={pieOptions} 
              ref={sentimentChartRef}
            />
          </div>
        </div>

        {/* Word Frequency Chart */}
        <div className={cn(
          "border rounded-lg p-6 transition-all duration-300",
          isDarkMode 
            ? "border-white/10 bg-[#1A1A1A] shadow-lg shadow-black/20" 
            : "border-black/5 bg-white shadow-sm",
          expandedChart === 'words' && "lg:col-span-2"
        )}>
          <ChartControls title="Most Flagged Words by Language" chartId="words" chartRef={wordChartRef} />
          <div className={cn(
            "transition-all duration-300",
            expandedChart === 'words' ? "h-[500px]" : "h-[300px]"
          )}>
            <Bar 
              data={wordChartData} 
              options={barOptions} 
              ref={wordChartRef}
            />
          </div>
        </div>

        {/* Time Series Line Chart */}
        <div className={cn(
          "border rounded-lg p-6 transition-all duration-300",
          isDarkMode 
            ? "border-white/10 bg-[#1A1A1A] shadow-lg shadow-black/20" 
            : "border-black/5 bg-white shadow-sm",
          "lg:col-span-2"
        )}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Trend Analysis</h3>
            <div className="flex gap-2">
              {['daily', 'weekly', 'monthly'].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "text-xs transition-all duration-200",
                    timeRange === range 
                      ? "bg-black/80 text-white hover:bg-black/90" 
                      : isDarkMode 
                        ? "border-white/10 hover:bg-white/5" 
                        : "border-black/10 hover:bg-black/5"
                  )}
                  onClick={() => setTimeRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          <div className="h-[300px]">
            <Line 
              data={trendChartData} 
              options={lineOptions} 
              ref={trendChartRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedView; 