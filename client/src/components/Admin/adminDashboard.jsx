import { useState, useEffect } from 'react';
import { LayoutDashboard, BarChart3, LineChart, RefreshCcw, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Overview from './Overview';
import DetailedView from './DetailedView';
import api from '@/utils/api';

const AdminDashboard = ({ isDarkMode }) => {
    const [isDetailedView, setIsDetailedView] = useState(false);
    const [summaryStats, setSummaryStats] = useState({
        totalFlagged: 0,
        pendingReports: 0,
        accuracy: 0,
        lastUpdated: new Date()
    });
    const [loading, setLoading] = useState(false);

    // Fetch summary stats for the header banner
    useEffect(() => {
        const fetchSummaryStats = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/api/admin/analytics/summary');
                setSummaryStats({
                    totalFlagged: data?.totalFlagged || 0,
                    pendingReports: data?.pendingReports || 0,
                    accuracy: data?.accuracy || 0,
                    lastUpdated: new Date()
                });
            } catch (error) {
                console.error('Error fetching summary stats:', error);
                // Use default values if API fails
            } finally {
                setLoading(false);
            }
        };

        fetchSummaryStats();
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        // Wait for a short delay to simulate refresh
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col space-y-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <LayoutDashboard className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-semibold">
                                {isDetailedView ? "Detailed Analytics" : "Overview Dashboard"}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    "h-9 gap-2",
                                    isDarkMode
                                        ? "border-gray-700 hover:bg-gray-800"
                                        : "border-gray-200 hover:bg-gray-50"
                                )}
                                onClick={handleRefresh}
                                disabled={loading}
                            >
                                <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
                                Refresh
                            </Button>

                            <Tabs
                                defaultValue={isDetailedView ? "detailed" : "overview"}
                                onValueChange={(value) => setIsDetailedView(value === "detailed")}
                                className="w-full sm:w-auto"
                            >
                                <TabsList className={cn(
                                    "w-full grid grid-cols-2 h-9",
                                    isDarkMode
                                        ? "bg-gray-800/50 border border-gray-700"
                                        : "bg-gray-100 border border-gray-200"
                                )}>
                                    <TabsTrigger
                                        value="overview"
                                        className={cn(
                                            "font-medium text-sm rounded-md transition-all duration-200",
                                            !isDetailedView
                                                ? isDarkMode
                                                    ? "bg-gray-700 text-white shadow-md"
                                                    : "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-500"
                                        )}
                                    >
                                        <LayoutDashboard className="h-4 w-4 mr-2" />
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="detailed"
                                        className={cn(
                                            "font-medium text-sm rounded-md transition-all duration-200",
                                            isDetailedView
                                                ? isDarkMode
                                                    ? "bg-gray-700 text-white shadow-md"
                                                    : "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-500"
                                        )}
                                    >
                                        <BarChart3 className="h-4 w-4 mr-2" />
                                        Detailed
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>

                    {/* Summary Banner */}
                    <div className={cn(
                        "border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 transition-all duration-200",
                        isDarkMode
                            ? "border-gray-800 bg-gray-900/50"
                            : "border-gray-100 bg-white"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                isDarkMode ? "bg-blue-900/20" : "bg-blue-50"
                            )}>
                                <BarChart3 className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Flagged</p>
                                <p className="text-xl font-semibold">{summaryStats.totalFlagged.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                isDarkMode ? "bg-amber-900/20" : "bg-amber-50"
                            )}>
                                <LineChart className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pending Reports</p>
                                <p className="text-xl font-semibold">{summaryStats.pendingReports.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                isDarkMode ? "bg-green-900/20" : "bg-green-50"
                            )}>
                                <Clock className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Last Updated</p>
                                <p className="text-sm font-medium">{summaryStats.lastUpdated.toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {isDetailedView ? (
                    <DetailedView isDarkMode={isDarkMode} />
                ) : (
                    <Overview isDarkMode={isDarkMode} />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
