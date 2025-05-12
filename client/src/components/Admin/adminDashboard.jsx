import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Overview from './Overview';
import DetailedView from './DetailedView';

const AdminDashboard = ({ isDarkMode }) => {
    const [isDetailedView, setIsDetailedView] = useState(false);
    
    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-semibold">
                        {isDetailedView ? "Detailed Analytics" : "Overview Dashboard"}
                    </h1>
                    <Button
                        variant="outline"
                        className={cn(
                            "gap-2",
                            isDarkMode ? "border-white/5 hover:bg-white/5" : "border-black/5 hover:bg-black/5"
                        )}
                        onClick={() => setIsDetailedView(!isDetailedView)}
                    >
                        {isDetailedView ? "Show Overview" : "Show Details"}
                        <ArrowRight className="h-4 w-4" />
                    </Button>
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
