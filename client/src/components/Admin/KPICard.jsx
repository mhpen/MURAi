import React from 'react';
import { cn } from "@/lib/utils";

const KPICard = ({ title, value, subValue, icon: Icon, isDarkMode }) => {
    return (
        <div className={cn(
            "border rounded-lg p-6",
            isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5"
        )}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="mt-2">
                <div className="text-2xl font-semibold">{value}</div>
                <p className="text-sm text-muted-foreground mt-1">{subValue}</p>
            </div>
        </div>
    );
};

export default KPICard; 