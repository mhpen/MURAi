import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateReport } from '@/utils/reportGenerator';
import DownloadButton from '@/components/ui/DownloadButton';
import API_URL from '@/config/api';

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

const DetailedView = ({ isDarkMode }) => {
  const [timeRange, setTimeRange] = useState('daily');
  const [language, setLanguage] = useState('both');
  const [expandedChart, setExpandedChart] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  // Time series data for Line chart
  const trendChartData = {
    labels: data?.timeSeriesData?.map(item => item.time) || [],
    datasets: [{
      label: 'Detections',
      data: data?.timeSeriesData?.map(item => item.count) || [],
      borderColor: isDarkMode ? 'rgba(186, 230, 253, 0.8)' : 'rgba(56, 189, 248, 0.7)',
      backgroundColor: isDarkMode ? 'rgba(186, 230, 253, 0.1)' : 'rgba(56, 189, 248, 0.05)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  // Sentiment data for Pie chart
  const sentimentChartData = {
    labels: Object.keys(data?.sentimentData || {}),
    datasets: [{
      data: Object.values(data?.sentimentData || {}),
      backgroundColor: [
        isDarkMode ? 'rgba(74, 222, 128, 0.8)' : 'rgba(22, 163, 74, 0.7)', // Positive
        isDarkMode ? 'rgba(203, 213, 225, 0.8)' : 'rgba(148, 163, 184, 0.7)', // Neutral
        isDarkMode ? 'rgba(252, 165, 165, 0.8)' : 'rgba(239, 68, 68, 0.7)' // Negative
      ],
      borderWidth: 0
    }]
  };

  // Word frequency data for Bar chart
  const wordChartData = {
    labels: data?.wordFrequencyData?.map(item => item.word) || [],
    datasets: [{
      label: 'Frequency',
      data: data?.wordFrequencyData?.map(item => item.count) || [],
        backgroundColor: isDarkMode ? 'rgba(186, 230, 253, 0.25)' : 'rgba(56, 189, 248, 0.15)',
        borderColor: isDarkMode ? 'rgba(186, 230, 253, 0.8)' : 'rgba(56, 189, 248, 0.7)',
        borderWidth: 2,
      borderRadius: 4
    }]
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
    maintainAspectRatio: false,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          title: function(context) {
            return `Time: ${context[0].label}`;
          },
          label: function(context) {
            return `Count: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        ...chartOptions.scales.x,
        title: {
          display: true,
          text: timeRange === 'daily' ? 'Hour' : 'Date'
        }
      },
      y: {
        ...chartOptions.scales.y,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Detections'
        }
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/admin/analytics/detailed`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch detailed analytics');
        }

        const result = await response.json();
        console.log('Raw API response:', result);
        console.log('Time series data:', result.timeSeriesData);
        
        if (!result.timeSeriesData || result.timeSeriesData.length === 0) {
          console.warn('No time series data received');
        }

        setData(result);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownload = async () => {
    if (!data) return;
    
    try {
      // Wait for all charts to be rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get chart canvases
      const charts = {
        trend: trendChartRef.current?.canvas?.toDataURL(),
        sentiment: sentimentChartRef.current?.canvas?.toDataURL(),
        words: wordChartRef.current?.canvas?.toDataURL()
      };

      await generateReport({ 
        ...data,
        charts,
        reportDate: new Date().toLocaleString()
      }, 'detailed');
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

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
        <p className="text-red-500">Error: {error}</p>
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

  console.log('Trend chart data:', trendChartData);
  console.log('Sentiment chart data:', sentimentChartData);

  // Before rendering the Line chart
  console.log('Trend chart data being passed to Line component:', trendChartData);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Detailed Analysis</h2>
        <DownloadButton onClick={handleDownload} isDarkMode={isDarkMode} />
        </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>

        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">Both Languages</SelectItem>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="filipino">Filipino</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

        {/* Time Series Chart - Moved to bottom, full width */}
        <div className={cn(
          "border rounded-lg p-6 transition-all duration-300",
          isDarkMode 
            ? "border-white/10 bg-[#1A1A1A] shadow-lg shadow-black/20" 
            : "border-black/5 bg-white shadow-sm",
          "md:col-span-2" // Always full width
        )}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Trend Analysis</h3>
            <div className="flex gap-2">
              {['daily', 'weekly', 'monthly', 'yearly'].map((range) => (
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