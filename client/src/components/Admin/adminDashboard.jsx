import { useState } from 'react';
import { LayoutDashboard, BarChart3, RefreshCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Overview from './Overview';
import DetailedView from './DetailedView';

const AdminDashboard = ({ isDarkMode }) => {
    const [isDetailedView, setIsDetailedView] = useState(false);
    const [loading, setLoading] = useState(false);

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
