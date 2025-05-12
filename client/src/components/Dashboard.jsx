import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ isDarkMode }) => {
    const navigate = useNavigate();

    return (
        <div className={cn(
            "min-h-screen",
            isDarkMode ? "bg-[#111111] text-white" : "bg-white text-black"
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-semibold">Public Dashboard</h1>
                    <Button
                        variant="outline"
                        className={cn(
                            "gap-2",
                            isDarkMode ? "border-white/5 hover:bg-white/5" : "border-black/5 hover:bg-black/5"
                        )}
                        onClick={() => navigate('/admin/login')}
                    >
                        Admin Login
                    </Button>
                </div>

                {/* Add your public dashboard content here */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Example cards */}
                    <div className={cn(
                        "border rounded-lg p-6",
                        isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5"
                    )}>
                        <h2 className="text-lg font-medium mb-4">Statistics</h2>
                        {/* Add your statistics content */}
                    </div>

                    <div className={cn(
                        "border rounded-lg p-6",
                        isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5"
                    )}>
                        <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
                        {/* Add your recent activity content */}
                    </div>

                    <div className={cn(
                        "border rounded-lg p-6",
                        isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5"
                    )}>
                        <h2 className="text-lg font-medium mb-4">Overview</h2>
                        {/* Add your overview content */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 