import React from 'react';
import { cn } from "@/lib/utils";

const KPICard = ({ title, value, subValue, icon: Icon, isDarkMode, className }) => {
    return (
        <div className={cn(
            "border rounded-lg p-6 transition-all duration-300",
            isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5",
            className // Allow custom classes to be passed
        )}>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-semibold">{value}</p>
                    <p className="text-sm text-muted-foreground">{subValue}</p>
                </div>
                <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
        </div>
    );
};

export default KPICard; 