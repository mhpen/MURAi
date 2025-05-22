import React, { useState, useEffect, useRef } from 'react';
import {
    Brain,
    RefreshCcw,
    AlertTriangle,
    CheckCircle2,
    History,
    Terminal,
    BarChart3,
    PieChart,
    LayoutDashboard,
    LineChart,
    Filter,
    Clock,
    Info,
    Trophy
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { getLatestModelMetrics, getModelLogs, getModelComparison, retrainModel, getRetrainingStatus } from '@/services/modelService';
import { getLocalLatestModelMetrics, getLocalModelComparison } from '@/services/localMetricsService';
import { formatDistanceToNow } from 'date-fns';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Radar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ModelDashboard = ({ isDarkMode }) => {
    const [isRetraining, setIsRetraining] = useState(false);
    const [logs, setLogs] = useState([]);
    const [logFilter, setLogFilter] = useState('all'); // 'all', 'info', 'success', 'error', 'warning'
    const [selectedModel, setSelectedModel] = useState('roberta'); // Default to RoBERTa
    const [metrics, setMetrics] = useState({
        version: 'Loading...',
        timestamp: new Date(),
        model_type: 'roberta',
        performance: {
            accuracy: 0,
            precision: 0,
            recall: 0,
            f1_score: 0
        },
        training_info: {
            dataset_size: 0,
            training_duration: '0'
        },
        confusion_matrix: {
            TP: 0,
            FP: 0,
            TN: 0,
            FN: 0
        }
    });
    const [comparisonData, setComparisonData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Chart refs for export
    const performanceChartRef = useRef(null);
    const comparisonChartRef = useRef(null);
    const confusionMatrixRef = useRef(null);

    // Fetch metrics and logs on component mount or when selected model changes
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Try to fetch from API first, fall back to local data if that fails
                try {
                    // Fetch metrics for the selected model
                    const metricsData = await getLatestModelMetrics(selectedModel);
                    const comparison = await getModelComparison();

                    if (metricsData && Object.keys(metricsData).length > 0) {
                        setMetrics(metricsData);
                    } else {
                        // Fall back to local data
                        setMetrics(getLocalLatestModelMetrics(selectedModel));
                    }

                    if (comparison && Object.keys(comparison).length > 0) {
                        setComparisonData(comparison);
                    } else {
                        // Fall back to local data
                        setComparisonData(getLocalModelComparison());
                    }
                } catch (apiError) {
                    console.log('API fetch failed, using local data:', apiError);
                    // Use local data
                    setMetrics(getLocalLatestModelMetrics(selectedModel));
                    setComparisonData(getLocalModelComparison());
                }

                // Try to fetch logs
                try {
                    const logsData = await getModelLogs();
                    if (logsData && logsData.length > 0) {
                        setLogs(logsData.map(log => ({
                            type: log.type === 'error' ? 'error' : log.type === 'warning' ? 'warning' : 'info',
                            message: log.message,
                            timestamp: new Date(log.timestamp)
                        })));
                    } else {
                        // No logs exist, set empty array
                        setLogs([]);
                    }
                } catch (logsError) {
                    console.log('Logs fetch failed:', logsError);
                    setLogs([]);
                }
            } catch (err) {
                console.error('Error fetching model data:', err);
                setError('Failed to load model data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedModel]);

    // This function is no longer needed as we're using the Tabs component's onValueChange
    // The Tabs component directly updates the selectedModel state

    // Prepare chart data for performance metrics
    const performanceChartData = {
        labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
        datasets: [
            {
                label: `${selectedModel.toUpperCase()} Performance`,
                data: metrics ? [
                    metrics.performance?.accuracy || 0,
                    metrics.performance?.precision || 0,
                    metrics.performance?.recall || 0,
                    metrics.performance?.f1_score || 0
                ] : [0, 0, 0, 0],
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
            }
        ]
    };

    // Prepare chart data for model comparison
    const comparisonChartData = {
        labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
        datasets: [
            {
                label: 'RoBERTa',
                data: comparisonData?.roberta ? [
                    comparisonData.roberta.performance?.accuracy || 0,
                    comparisonData.roberta.performance?.precision || 0,
                    comparisonData.roberta.performance?.recall || 0,
                    comparisonData.roberta.performance?.f1_score || 0
                ] : [0, 0, 0, 0],
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
            },
            {
                label: 'BERT',
                data: comparisonData?.bert ? [
                    comparisonData.bert.performance?.accuracy || 0,
                    comparisonData.bert.performance?.precision || 0,
                    comparisonData.bert.performance?.recall || 0,
                    comparisonData.bert.performance?.f1_score || 0
                ] : [0, 0, 0, 0],
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
            }
        ]
    };

    // Prepare confusion matrix data
    const confusionMatrixData = {
        labels: ['True Positives', 'False Positives', 'True Negatives', 'False Negatives'],
        datasets: [
            {
                label: `${selectedModel.toUpperCase()} Confusion Matrix`,
                data: metrics ? [
                    metrics.confusion_matrix?.TP || 0,
                    metrics.confusion_matrix?.FP || 0,
                    metrics.confusion_matrix?.TN || 0,
                    metrics.confusion_matrix?.FN || 0
                ] : [0, 0, 0, 0],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1,
            }
        ]
    };

    // Chart options
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: isDarkMode ? '#fff' : '#333'
                }
            },
            title: {
                display: true,
                text: 'Model Performance Metrics',
                color: isDarkMode ? '#fff' : '#333'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 1,
                ticks: {
                    color: isDarkMode ? '#ccc' : '#666'
                },
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }
            },
            x: {
                ticks: {
                    color: isDarkMode ? '#ccc' : '#666'
                },
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: isDarkMode ? '#fff' : '#333'
                }
            },
            title: {
                display: true,
                text: 'Confusion Matrix',
                color: isDarkMode ? '#fff' : '#333'
            }
        }
    };

    // Function to check retraining status periodically
    const checkRetrainingStatus = async (modelType) => {
        try {
            const statusData = await getRetrainingStatus(modelType);

            if (statusData.status === 'completed') {
                // Retraining completed successfully
                setLogs(prev => {
                    // Check if we already have this log to avoid duplicates
                    const exists = prev.some(log =>
                        log.type === 'success' &&
                        log.message.includes(`${modelType.toUpperCase()} model retraining completed`)
                    );

                    if (!exists) {
                        return [...prev, {
                            timestamp: new Date().toISOString(),
                            type: 'success',
                            message: `${modelType.toUpperCase()} model retraining completed successfully`
                        }];
                    }
                    return prev;
                });
                setIsRetraining(false);

                // Refresh metrics data
                const metricsData = await getLatestModelMetrics(modelType);
                if (metricsData) {
                    setMetrics(metricsData);
                }

                // Refresh comparison data
                const comparison = await getModelComparison();
                if (comparison) {
                    setComparisonData(comparison);
                }

                return true;
            } else if (statusData.status === 'failed') {
                // Retraining failed
                setLogs(prev => {
                    // Check if we already have this log to avoid duplicates
                    const exists = prev.some(log =>
                        log.type === 'error' &&
                        log.message.includes(`${modelType.toUpperCase()} model retraining failed`)
                    );

                    if (!exists) {
                        return [...prev, {
                            timestamp: new Date().toISOString(),
                            type: 'error',
                            message: `${modelType.toUpperCase()} model retraining failed`
                        }];
                    }
                    return prev;
                });
                setIsRetraining(false);
                return true;
            } else if (statusData.status === 'processing') {
                // Still processing, continue checking
                return false;
            }

            return false;
        } catch (error) {
            console.error('Error checking retraining status:', error);
            return true; // Stop checking on error
        }
    };

    const handleRetrain = async () => {
        setIsRetraining(true);
        try {
            // Call the API to start retraining
            const response = await retrainModel(selectedModel);
            console.log('Retraining started:', response);

            // Add log for retraining started
            setLogs(prev => [...prev, {
                timestamp: new Date().toISOString(),
                type: 'info',
                message: `${selectedModel.toUpperCase()} model retraining started`
            }]);

            // Set up periodic status check
            const statusCheckInterval = setInterval(async () => {
                const isDone = await checkRetrainingStatus(selectedModel);
                if (isDone) {
                    clearInterval(statusCheckInterval);
                }
            }, 10000); // Check every 10 seconds

            // Clear interval after 30 minutes (failsafe)
            setTimeout(() => {
                clearInterval(statusCheckInterval);
                if (isRetraining) {
                    setIsRetraining(false);
                    setLogs(prev => [...prev, {
                        timestamp: new Date().toISOString(),
                        type: 'warning',
                        message: `${selectedModel.toUpperCase()} model retraining status check timed out`
                    }]);
                }
            }, 30 * 60 * 1000);

        } catch (error) {
            console.error('Error starting retraining:', error);
            setLogs(prev => [...prev, {
                timestamp: new Date().toISOString(),
                type: 'error',
                message: `${selectedModel.toUpperCase()} model retraining failed: ` + error.message
            }]);
            setIsRetraining(false);
        }
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <LayoutDashboard className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-semibold">Tagalog Profanity Detection Model</h1>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Tabs
                            defaultValue={selectedModel}
                            value={selectedModel}
                            onValueChange={value => setSelectedModel(value)}
                            className="w-full sm:w-auto"
                        >
                            <TabsList className={cn(
                                "w-full grid grid-cols-2 h-10",
                                isDarkMode
                                    ? "bg-gray-800/50 border border-gray-700"
                                    : "bg-gray-100 border border-gray-200"
                            )}>
                                <TabsTrigger
                                    value="bert"
                                    className={cn(
                                        "font-medium text-sm rounded-md transition-all duration-200",
                                        selectedModel === "bert"
                                            ? isDarkMode
                                                ? "bg-gray-700 text-white shadow-md"
                                                : "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500"
                                    )}
                                >
                                    <Brain className="h-4 w-4 mr-2" />
                                    BERT
                                </TabsTrigger>
                                <TabsTrigger
                                    value="roberta"
                                    className={cn(
                                        "font-medium text-sm rounded-md transition-all duration-200",
                                        selectedModel === "roberta"
                                            ? isDarkMode
                                                ? "bg-gray-700 text-white shadow-md"
                                                : "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500"
                                    )}
                                >
                                    <Brain className="h-4 w-4 mr-2" />
                                    RoBERTa
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-10 gap-2 px-4",
                                isDarkMode
                                    ? "border-gray-700 hover:bg-gray-800"
                                    : "border-gray-200 hover:bg-gray-50"
                            )}
                            onClick={() => {
                                setLoading(true);
                                // Try to refresh data from API, fall back to local data
                                Promise.all([
                                    getLatestModelMetrics(selectedModel).catch(() => getLocalLatestModelMetrics(selectedModel)),
                                    getModelComparison().catch(() => getLocalModelComparison())
                                ]).then(([metricsData, comparison]) => {
                                    setMetrics(metricsData);
                                    setComparisonData(comparison);
                                    setLoading(false);
                                }).catch(() => {
                                    // If all fails, use local data
                                    setMetrics(getLocalLatestModelMetrics(selectedModel));
                                    setComparisonData(getLocalModelComparison());
                                    setLoading(false);
                                });
                            }}
                            disabled={loading}
                        >
                            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {/* Model Status Cards */}
                <div className={cn(
                    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                )}>
                    <div className={cn(
                        "border rounded-lg p-6 transition-all duration-200 flex flex-col",
                        isDarkMode
                            ? "border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 hover:border-gray-700"
                            : "border-gray-100 bg-white hover:shadow-md hover:border-gray-200"
                    )}>
                        <div className="flex items-start justify-between">
                            <h3 className="text-sm font-medium mb-2">Model Version</h3>
                            <History className="h-4 w-4 text-primary opacity-70" />
                        </div>
                        <div className="text-2xl font-semibold mt-2">{metrics.version}</div>
                        <p className="text-sm text-muted-foreground mt-auto pt-2">
                            Last updated: {metrics.timestamp ? formatDistanceToNow(new Date(metrics.timestamp), { addSuffix: true }) : 'Unknown'}
                        </p>
                    </div>

                    <div className={cn(
                        "border rounded-lg p-6 transition-all duration-200 flex flex-col",
                        isDarkMode
                            ? "border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 hover:border-gray-700"
                            : "border-gray-100 bg-white hover:shadow-md hover:border-gray-200"
                    )}>
                        <div className="flex items-start justify-between">
                            <h3 className="text-sm font-medium mb-2">Accuracy</h3>
                            <BarChart3 className="h-4 w-4 text-blue-500 opacity-70" />
                        </div>
                        <div className="text-2xl font-semibold mt-2">
                            {metrics.performance?.accuracy ? `${(metrics.performance.accuracy * 100).toFixed(1)}%` : 'N/A'}
                        </div>
                        <div className={cn(
                            "w-full h-2 rounded-full mt-2 overflow-hidden",
                            isDarkMode ? "bg-gray-800" : "bg-gray-100"
                        )}>
                            <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${metrics.performance?.accuracy ? metrics.performance.accuracy * 100 : 0}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-auto pt-2">
                            Overall prediction accuracy
                        </p>
                    </div>

                    <div className={cn(
                        "border rounded-lg p-6 transition-all duration-200 flex flex-col",
                        isDarkMode
                            ? "border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 hover:border-gray-700"
                            : "border-gray-100 bg-white hover:shadow-md hover:border-gray-200"
                    )}>
                        <div className="flex items-start justify-between">
                            <h3 className="text-sm font-medium mb-2">F1 Score</h3>
                            <LineChart className="h-4 w-4 text-green-500 opacity-70" />
                        </div>
                        <div className="text-2xl font-semibold mt-2">
                            {metrics.performance?.f1_score ? metrics.performance.f1_score.toFixed(3) : 'N/A'}
                        </div>
                        <div className={cn(
                            "w-full h-2 rounded-full mt-2 overflow-hidden",
                            isDarkMode ? "bg-gray-800" : "bg-gray-100"
                        )}>
                            <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${metrics.performance?.f1_score ? metrics.performance.f1_score * 100 : 0}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-auto pt-2">
                            Precision/recall balance
                        </p>
                    </div>

                    <div className={cn(
                        "border rounded-lg p-6 transition-all duration-200 flex flex-col",
                        isDarkMode
                            ? "border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 hover:border-gray-700"
                            : "border-gray-100 bg-white hover:shadow-md hover:border-gray-200"
                    )}>
                        <div className="flex items-start justify-between">
                            <h3 className="text-sm font-medium mb-2">Dataset Size</h3>
                            <Brain className="h-4 w-4 text-purple-500 opacity-70" />
                        </div>
                        <div className="text-2xl font-semibold mt-2">
                            {metrics.training_info?.dataset_size ? metrics.training_info.dataset_size.toLocaleString() : 'N/A'}
                        </div>
                        <p className="text-sm text-muted-foreground mt-auto pt-2">
                            Training samples used
                        </p>
                    </div>
                </div>

                {/* Model Controls and Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Training Controls */}
                    <div className={cn(
                        "border rounded-lg p-6 transition-all duration-200",
                        isDarkMode
                            ? "border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 hover:border-gray-700"
                            : "border-gray-100 bg-white hover:shadow-md hover:border-gray-200"
                    )}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Model Training</h3>
                            <RefreshCcw className="h-4 w-4 text-primary opacity-70" />
                        </div>
                        <div className="space-y-5">
                            <Button
                                className={cn(
                                    "w-full gap-2 h-10 font-medium",
                                    isRetraining ? "bg-amber-600 hover:bg-amber-700" : ""
                                )}
                                onClick={handleRetrain}
                                disabled={isRetraining}
                            >
                                <RefreshCcw className={cn(
                                    "h-4 w-4",
                                    isRetraining && "animate-spin"
                                )} />
                                {isRetraining ? "Retraining..." : "Retrain Model"}
                            </Button>

                            <div className={cn(
                                "rounded-lg p-4",
                                isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
                            )}>
                                <h4 className="text-sm font-medium mb-3">Training Configuration</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Dataset Size</span>
                                        <span className="font-medium">
                                            {metrics.training_info?.dataset_size
                                                ? `${metrics.training_info.dataset_size.toLocaleString()} samples`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Validation Split</span>
                                        <span className="font-medium">
                                            {selectedModel === 'roberta' ? '20%' : '15%'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Batch Size</span>
                                        <span className="font-medium">
                                            {selectedModel === 'roberta' ? '8' : '16'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Learning Rate</span>
                                        <span className="font-medium">2e-5</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Training Duration</span>
                                        <span className="font-medium">
                                            {metrics.training_info?.training_duration || 'N/A'}
                                        </span>
                                    </div>
                                    {metrics.training_info?.epochs && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Epochs</span>
                                            <span className="font-medium">
                                                {metrics.training_info.epochs}
                                                {metrics.training_info.best_epoch &&
                                                    ` (Best: ${metrics.training_info.best_epoch})`}
                                            </span>
                                        </div>
                                    )}
                                    {metrics.training_info?.gpu_used && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">GPU Used</span>
                                            <span className="font-medium">
                                                {metrics.training_info.gpu_used}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className={cn(
                        "border rounded-lg p-6 transition-all duration-200",
                        isDarkMode
                            ? "border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 hover:border-gray-700"
                            : "border-gray-100 bg-white hover:shadow-md hover:border-gray-200"
                    )}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Performance Metrics</h3>
                            <BarChart3 className="h-4 w-4 text-primary opacity-70" />
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="h-[200px]">
                                <Bar
                                    data={performanceChartData}
                                    options={barOptions}
                                    ref={performanceChartRef}
                                />
                            </div>
                            <div className={cn(
                                "grid grid-cols-2 gap-4 p-4 rounded-lg",
                                isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
                            )}>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Precision</p>
                                    <p className="text-xl font-semibold">
                                        {metrics.performance?.precision ? metrics.performance.precision.toFixed(3) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Recall</p>
                                    <p className="text-xl font-semibold">
                                        {metrics.performance?.recall ? metrics.performance.recall.toFixed(3) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Confusion Matrix */}
                    <div className={cn(
                        "border rounded-lg p-6 transition-all duration-200",
                        isDarkMode
                            ? "border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 hover:border-gray-700"
                            : "border-gray-100 bg-white hover:shadow-md hover:border-gray-200"
                    )}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Confusion Matrix</h3>
                            <PieChart className="h-4 w-4 text-primary opacity-70" />
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="h-[200px]">
                                <Pie
                                    data={confusionMatrixData}
                                    options={pieOptions}
                                    ref={confusionMatrixRef}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className={cn(
                                    "p-3 rounded-md flex flex-col",
                                    isDarkMode ? "bg-green-900/20" : "bg-green-50"
                                )}>
                                    <p className={cn(
                                        "text-sm font-medium",
                                        isDarkMode ? "text-green-300" : "text-green-700"
                                    )}>True Positives</p>
                                    <p className={cn(
                                        "text-xl font-semibold",
                                        isDarkMode ? "text-green-400" : "text-green-600"
                                    )}>
                                        {metrics.confusion_matrix?.TP ? metrics.confusion_matrix.TP.toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                                <div className={cn(
                                    "p-3 rounded-md flex flex-col",
                                    isDarkMode ? "bg-yellow-900/20" : "bg-yellow-50"
                                )}>
                                    <p className={cn(
                                        "text-sm font-medium",
                                        isDarkMode ? "text-yellow-300" : "text-yellow-700"
                                    )}>False Positives</p>
                                    <p className={cn(
                                        "text-xl font-semibold",
                                        isDarkMode ? "text-yellow-400" : "text-yellow-600"
                                    )}>
                                        {metrics.confusion_matrix?.FP ? metrics.confusion_matrix.FP.toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                                <div className={cn(
                                    "p-3 rounded-md flex flex-col",
                                    isDarkMode ? "bg-blue-900/20" : "bg-blue-50"
                                )}>
                                    <p className={cn(
                                        "text-sm font-medium",
                                        isDarkMode ? "text-blue-300" : "text-blue-700"
                                    )}>True Negatives</p>
                                    <p className={cn(
                                        "text-xl font-semibold",
                                        isDarkMode ? "text-blue-400" : "text-blue-600"
                                    )}>
                                        {metrics.confusion_matrix?.TN ? metrics.confusion_matrix.TN.toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                                <div className={cn(
                                    "p-3 rounded-md flex flex-col",
                                    isDarkMode ? "bg-red-900/20" : "bg-red-50"
                                )}>
                                    <p className={cn(
                                        "text-sm font-medium",
                                        isDarkMode ? "text-red-300" : "text-red-700"
                                    )}>False Negatives</p>
                                    <p className={cn(
                                        "text-xl font-semibold",
                                        isDarkMode ? "text-red-400" : "text-red-600"
                                    )}>
                                        {metrics.confusion_matrix?.FN ? metrics.confusion_matrix.FN.toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Model Logs */}
                    <div className={cn(
                        "border rounded-lg p-6 transition-all duration-200 lg:col-span-3",
                        isDarkMode
                            ? "border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 hover:border-gray-700"
                            : "border-gray-100 bg-white hover:shadow-md hover:border-gray-200"
                    )}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <Terminal className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-medium">Model Training Logs</h3>
                                {isRetraining && (
                                    <div className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 animate-pulse">
                                        Retraining in progress
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Log Type Filter */}
                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "h-8 px-2 text-xs rounded-md",
                                            logFilter === 'all'
                                                ? "bg-white dark:bg-gray-700 shadow-sm"
                                                : "text-muted-foreground"
                                        )}
                                        onClick={() => setLogFilter('all')}
                                    >
                                        All
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "h-8 px-2 text-xs rounded-md",
                                            logFilter === 'info'
                                                ? "bg-white dark:bg-gray-700 shadow-sm text-blue-500"
                                                : "text-muted-foreground"
                                        )}
                                        onClick={() => setLogFilter('info')}
                                    >
                                        <Info className="h-3 w-3 mr-1" />
                                        Info
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "h-8 px-2 text-xs rounded-md",
                                            logFilter === 'success'
                                                ? "bg-white dark:bg-gray-700 shadow-sm text-green-500"
                                                : "text-muted-foreground"
                                        )}
                                        onClick={() => setLogFilter('success')}
                                    >
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Success
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "h-8 px-2 text-xs rounded-md",
                                            logFilter === 'error'
                                                ? "bg-white dark:bg-gray-700 shadow-sm text-red-500"
                                                : "text-muted-foreground"
                                        )}
                                        onClick={() => setLogFilter('error')}
                                    >
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Error
                                    </Button>
                                </div>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                "h-8",
                                                isDarkMode
                                                    ? "border-gray-700 hover:bg-gray-800"
                                                    : "border-gray-200 hover:bg-gray-50"
                                            )}
                                        >
                                            View All
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <Terminal className="h-5 w-5" />
                                                Model Training Logs
                                            </DialogTitle>
                                        </DialogHeader>

                                        {/* Log filters in dialog */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-sm text-muted-foreground">Filter:</span>
                                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn(
                                                        "h-8 px-3 text-xs rounded-md",
                                                        logFilter === 'all'
                                                            ? "bg-white dark:bg-gray-700 shadow-sm"
                                                            : "text-muted-foreground"
                                                    )}
                                                    onClick={() => setLogFilter('all')}
                                                >
                                                    All
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn(
                                                        "h-8 px-3 text-xs rounded-md",
                                                        logFilter === 'info'
                                                            ? "bg-white dark:bg-gray-700 shadow-sm text-blue-500"
                                                            : "text-muted-foreground"
                                                    )}
                                                    onClick={() => setLogFilter('info')}
                                                >
                                                    <Info className="h-3 w-3 mr-1" />
                                                    Info
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn(
                                                        "h-8 px-3 text-xs rounded-md",
                                                        logFilter === 'success'
                                                            ? "bg-white dark:bg-gray-700 shadow-sm text-green-500"
                                                            : "text-muted-foreground"
                                                    )}
                                                    onClick={() => setLogFilter('success')}
                                                >
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Success
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn(
                                                        "h-8 px-3 text-xs rounded-md",
                                                        logFilter === 'error'
                                                            ? "bg-white dark:bg-gray-700 shadow-sm text-red-500"
                                                            : "text-muted-foreground"
                                                    )}
                                                    onClick={() => setLogFilter('error')}
                                                >
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    Error
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn(
                                                        "h-8 px-3 text-xs rounded-md",
                                                        logFilter === 'warning'
                                                            ? "bg-white dark:bg-gray-700 shadow-sm text-yellow-500"
                                                            : "text-muted-foreground"
                                                    )}
                                                    onClick={() => setLogFilter('warning')}
                                                >
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    Warning
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="max-h-[60vh] overflow-y-auto border rounded-lg">
                                            {logs
                                                .filter(log => logFilter === 'all' || log.type === logFilter)
                                                .map((log, index) => (
                                                <div key={index} className={cn(
                                                    "py-3 px-4 border-b last:border-0 flex items-start gap-3",
                                                    log.type === 'error'
                                                        ? "bg-red-50/50 dark:bg-red-900/10"
                                                        : log.type === 'warning'
                                                            ? "bg-yellow-50/50 dark:bg-yellow-900/10"
                                                            : log.type === 'success'
                                                                ? "bg-green-50/50 dark:bg-green-900/10"
                                                                : ""
                                                )}>
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                                        log.type === 'error'
                                                            ? "bg-red-100 dark:bg-red-900/20"
                                                            : log.type === 'warning'
                                                                ? "bg-yellow-100 dark:bg-yellow-900/20"
                                                                : log.type === 'success'
                                                                    ? "bg-green-100 dark:bg-green-900/20"
                                                                    : "bg-blue-100 dark:bg-blue-900/20"
                                                    )}>
                                                        {log.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                                        {log.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                                                        {log.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                                        {log.type === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{log.message}</p>
                                                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(log.timestamp).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {logs.filter(log => logFilter === 'all' || log.type === logFilter).length === 0 && (
                                                <div className="py-8 text-center text-muted-foreground">
                                                    No logs matching the selected filter
                                                </div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-4 text-center text-muted-foreground">Loading logs...</div>
                        ) : error ? (
                            <div className="py-4 text-center text-red-500">{error}</div>
                        ) : logs.length === 0 ? (
                            <div className="py-4 text-center text-muted-foreground">No logs available</div>
                        ) : (
                            <div className={cn(
                                "rounded-lg border overflow-hidden",
                                isDarkMode ? "border-gray-800" : "border-gray-200"
                            )}>
                                {logs
                                    .filter(log => logFilter === 'all' || log.type === logFilter)
                                    .slice(0, 5)
                                    .map((log, index) => (
                                    <div key={index} className={cn(
                                        "flex items-start gap-3 p-4 border-b last:border-0",
                                        log.type === 'error'
                                            ? "bg-red-50/50 dark:bg-red-900/10"
                                            : log.type === 'warning'
                                                ? "bg-yellow-50/50 dark:bg-yellow-900/10"
                                                : log.type === 'success'
                                                    ? "bg-green-50/50 dark:bg-green-900/10"
                                                    : isDarkMode ? "bg-gray-800/50" : "bg-white"
                                    )}>
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                            log.type === 'error'
                                                ? "bg-red-100 dark:bg-red-900/20"
                                                : log.type === 'warning'
                                                    ? "bg-yellow-100 dark:bg-yellow-900/20"
                                                    : log.type === 'success'
                                                        ? "bg-green-100 dark:bg-green-900/20"
                                                        : "bg-blue-100 dark:bg-blue-900/20"
                                        )}>
                                            {log.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                            {log.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                                            {log.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                            {log.type === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{log.message}</p>
                                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {logs.filter(log => logFilter === 'all' || log.type === logFilter).length === 0 && (
                                    <div className="py-8 text-center text-muted-foreground">
                                        No logs matching the selected filter
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Model Comparison Section */}
                <div className="mt-12">
                    <div className="flex items-center gap-3 mb-6">
                        <LineChart className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">
                            Model Comparison
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8">
                            {/* Performance Comparison */}
                            <div className={cn(
                                "border rounded-lg p-6 transition-all duration-200",
                                isDarkMode
                                    ? "border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 hover:border-gray-700"
                                    : "border-gray-100 bg-white hover:shadow-md hover:border-gray-200"
                            )}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold">
                                        BERT vs RoBERTa Performance
                                    </h3>
                                    <BarChart3 className="h-4 w-4 text-primary opacity-70" />
                                </div>
                                <div className="h-[400px]">
                                    <Bar
                                        data={comparisonChartData}
                                        options={{
                                            ...barOptions,
                                            plugins: {
                                                ...barOptions.plugins,
                                                title: {
                                                    ...barOptions.plugins.title,
                                                    text: 'BERT vs RoBERTa Performance Comparison'
                                                }
                                            }
                                        }}
                                        ref={comparisonChartRef}
                                    />
                                </div>
                            </div>

                            {/* Best Model Analysis */}
                            <div className={cn(
                                "border rounded-lg p-6 transition-all duration-200",
                                isDarkMode
                                    ? "border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 hover:border-gray-700"
                                    : "border-gray-100 bg-white hover:shadow-md hover:border-gray-200"
                            )}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold">
                                        Best Model Analysis
                                    </h3>
                                    <Brain className="h-4 w-4 text-primary opacity-70" />
                                </div>

                                {comparisonData && (
                                    <>
                                        {/* Best Model Summary Card */}
                                        <div className={cn(
                                            "mb-6 p-5 rounded-lg border",
                                            isDarkMode
                                                ? "bg-gray-800/30 border-gray-700"
                                                : "bg-blue-50 border-blue-100"
                                        )}>
                                            {(() => {
                                                // Calculate which model is better overall
                                                const bertScore = comparisonData.bert?.performance?.f1_score || 0;
                                                const robertaScore = comparisonData.roberta?.performance?.f1_score || 0;
                                                const bestModel = robertaScore >= bertScore ? 'RoBERTa' : 'BERT';
                                                const bestModelColor = bestModel === 'RoBERTa' ? 'green' : 'blue';
                                                const difference = Math.abs(robertaScore - bertScore).toFixed(4);
                                                const percentDiff = bertScore > 0 ? (Math.abs(robertaScore - bertScore) / bertScore * 100).toFixed(1) : 0;

                                                return (
                                                    <div className="flex items-start gap-4">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                                                            bestModel === 'RoBERTa'
                                                                ? isDarkMode ? "bg-green-900/30" : "bg-green-100"
                                                                : isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                                                        )}>
                                                            <Trophy className={cn(
                                                                "h-6 w-6",
                                                                bestModel === 'RoBERTa' ? "text-green-500" : "text-blue-500"
                                                            )} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="text-lg font-semibold">
                                                                    {bestModel}
                                                                </h4>
                                                                <div className={cn(
                                                                    "text-xs px-2 py-0.5 rounded-full",
                                                                    bestModel === 'RoBERTa'
                                                                        ? isDarkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700"
                                                                        : isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
                                                                )}>
                                                                    Best Model
                                                                </div>
                                                            </div>
                                                            <p className="text-sm">
                                                                {bestModel} outperforms {bestModel === 'RoBERTa' ? 'BERT' : 'RoBERTa'} by <span className="font-medium">{difference}</span> F1 score points ({percentDiff}% improvement).
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className={cn(
                                                "rounded-lg p-5",
                                                isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
                                            )}>
                                                <h4 className="text-md font-medium mb-4 flex items-center gap-2">
                                                    <span>Performance Metrics</span>
                                                </h4>
                                                <div className="space-y-4">
                                                    {['accuracy', 'precision', 'recall', 'f1_score'].map(metric => {
                                                        const bertValue = comparisonData.bert?.performance?.[metric] || 0;
                                                        const robertaValue = comparisonData.roberta?.performance?.[metric] || 0;
                                                        const bestModel = robertaValue >= bertValue ? 'RoBERTa' : 'BERT';
                                                        const difference = Math.abs(robertaValue - bertValue).toFixed(4);
                                                        const percentDiff = bertValue > 0 ? (difference / bertValue * 100).toFixed(1) : 0;

                                                        return (
                                                            <div key={metric} className="flex flex-col">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="capitalize text-sm font-medium">{metric.replace('_', ' ')}</span>
                                                                    <div className="flex items-center">
                                                                        <div className={cn(
                                                                            "text-xs px-2 py-0.5 rounded-full font-medium",
                                                                            bestModel === 'RoBERTa'
                                                                                ? isDarkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700"
                                                                                : isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
                                                                        )}>
                                                                            {bestModel} +{percentDiff}%
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs mt-1">
                                                                    <div className="flex-1 flex items-center gap-2">
                                                                        <span className="text-blue-500 font-medium w-16">BERT:</span>
                                                                        <div className="flex-1 h-3 bg-blue-100 dark:bg-blue-900/20 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-blue-500 rounded-full"
                                                                                style={{ width: `${bertValue * 100}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        <span className="w-12 text-right">{bertValue.toFixed(3)}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs mt-1">
                                                                    <div className="flex-1 flex items-center gap-2">
                                                                        <span className="text-green-500 font-medium w-16">RoBERTa:</span>
                                                                        <div className="flex-1 h-3 bg-green-100 dark:bg-green-900/20 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-green-500 rounded-full"
                                                                                style={{ width: `${robertaValue * 100}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        <span className="w-12 text-right">{robertaValue.toFixed(3)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className={cn(
                                                "rounded-lg p-5",
                                                isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
                                            )}>
                                                <h4 className="text-md font-medium mb-4">Confusion Matrix Comparison</h4>
                                                <div className="space-y-4">
                                                    {['TP', 'FP', 'TN', 'FN'].map(metric => {
                                                        const bertValue = comparisonData.bert?.confusion_matrix?.[metric] || 0;
                                                        const robertaValue = comparisonData.roberta?.confusion_matrix?.[metric] || 0;

                                                        // For TP and TN, higher is better; for FP and FN, lower is better
                                                        const isBetterHigher = metric === 'TP' || metric === 'TN';
                                                        const bestModel = isBetterHigher
                                                            ? (robertaValue >= bertValue ? 'RoBERTa' : 'BERT')
                                                            : (robertaValue <= bertValue ? 'RoBERTa' : 'BERT');

                                                        const difference = Math.abs(robertaValue - bertValue).toFixed(0);
                                                        const percentDiff = bertValue > 0 ? (Math.abs(robertaValue - bertValue) / bertValue * 100).toFixed(1) : 0;

                                                        // Calculate max value for relative bar sizing
                                                        const maxValue = Math.max(bertValue, robertaValue);
                                                        const bertPercent = maxValue > 0 ? (bertValue / maxValue) * 100 : 0;
                                                        const robertaPercent = maxValue > 0 ? (robertaValue / maxValue) * 100 : 0;

                                                        return (
                                                            <div key={metric} className="flex flex-col">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="text-sm font-medium">
                                                                        {metric === 'TP' ? 'True Positives' :
                                                                         metric === 'FP' ? 'False Positives' :
                                                                         metric === 'TN' ? 'True Negatives' : 'False Negatives'}
                                                                    </span>
                                                                    <div className="flex items-center">
                                                                        <div className={cn(
                                                                            "text-xs px-2 py-0.5 rounded-full font-medium",
                                                                            bestModel === 'RoBERTa'
                                                                                ? isDarkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700"
                                                                                : isDarkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
                                                                        )}>
                                                                            {bestModel} {isBetterHigher ? '+' : '-'}{percentDiff}%
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs mt-1">
                                                                    <div className="flex-1 flex items-center gap-2">
                                                                        <span className="text-blue-500 font-medium w-16">BERT:</span>
                                                                        <div className="flex-1 h-3 bg-blue-100 dark:bg-blue-900/20 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-blue-500 rounded-full"
                                                                                style={{ width: `${bertPercent}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        <span className="w-12 text-right">{bertValue.toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs mt-1">
                                                                    <div className="flex-1 flex items-center gap-2">
                                                                        <span className="text-green-500 font-medium w-16">RoBERTa:</span>
                                                                        <div className="flex-1 h-3 bg-green-100 dark:bg-green-900/20 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-green-500 rounded-full"
                                                                                style={{ width: `${robertaPercent}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        <span className="w-12 text-right">{robertaValue.toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className={cn(
                                    "mt-6 p-5 rounded-lg border",
                                    isDarkMode
                                        ? "bg-gray-800/30 border-gray-700"
                                        : "bg-blue-50 border-blue-100"
                                )}>
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                                            isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                                        )}>
                                            <Brain className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-md font-medium mb-2">Conclusion</h4>
                                            <p className="text-sm">
                                                {comparisonData && comparisonData.roberta?.performance?.f1_score >= (comparisonData.bert?.performance?.f1_score || 0)
                                                    ? "The RoBERTa model outperforms BERT for Tagalog profanity detection, showing better overall metrics especially in F1 score and precision. This suggests that RoBERTa's pretraining approach and larger parameter space is more effective for capturing the nuances of Tagalog language patterns in this specific task."
                                                    : "The BERT model performs better for Tagalog profanity detection in this dataset, with stronger metrics across most performance indicators. This suggests that BERT's architecture may be more suitable for this specific language task, possibly due to its efficient parameter utilization for the Tagalog language context."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModelDashboard;