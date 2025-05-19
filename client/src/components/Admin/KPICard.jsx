import React from 'react';
import { cn } from "@/lib/utils";

const KPICard = ({
    title,
    value,
    subValue,
    icon: Icon,
    isDarkMode,
    className,
    trend,
    color = "blue",
    showProgress = false,
    progressValue = 0
}) => {
    // Define color variants
    const colorVariants = {
        blue: {
            icon: "text-blue-500",
            bg: isDarkMode ? "bg-blue-900/20" : "bg-blue-50",
            border: isDarkMode ? "border-blue-800/30" : "border-blue-100",
            progress: "bg-blue-500"
        },
        green: {
            icon: "text-green-500",
            bg: isDarkMode ? "bg-green-900/20" : "bg-green-50",
            border: isDarkMode ? "border-green-800/30" : "border-green-100",
            progress: "bg-green-500"
        },
        red: {
            icon: "text-red-500",
            bg: isDarkMode ? "bg-red-900/20" : "bg-red-50",
            border: isDarkMode ? "border-red-800/30" : "border-red-100",
            progress: "bg-red-500"
        },
        amber: {
            icon: "text-amber-500",
            bg: isDarkMode ? "bg-amber-900/20" : "bg-amber-50",
            border: isDarkMode ? "border-amber-800/30" : "border-amber-100",
            progress: "bg-amber-500"
        },
        purple: {
            icon: "text-purple-500",
            bg: isDarkMode ? "bg-purple-900/20" : "bg-purple-50",
            border: isDarkMode ? "border-purple-800/30" : "border-purple-100",
            progress: "bg-purple-500"
        }
    };

    const selectedColor = colorVariants[color] || colorVariants.blue;

    return (
        <div className={cn(
            "border rounded-lg p-6 transition-all duration-200 hover:shadow-md",
            isDarkMode
                ? "border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 hover:border-gray-700"
                : "border-gray-100 bg-white hover:border-gray-200",
            className // Allow custom classes to be passed
        )}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{title}</p>
                    {trend && (
                        <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded-full",
                            trend > 0
                                ? (isDarkMode ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700")
                                : (isDarkMode ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-700")
                        )}>
                            {trend > 0 ? `+${trend}%` : `${trend}%`}
                        </span>
                    )}
                </div>
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    selectedColor.bg
                )}>
                    <Icon className={cn("h-4 w-4", selectedColor.icon)} />
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-2xl font-semibold">{value}</p>
                <p className="text-sm text-muted-foreground">{subValue}</p>

                {showProgress && (
                    <div className="mt-3">
                        <div className={cn(
                            "w-full h-1.5 rounded-full mt-1 overflow-hidden",
                            isDarkMode ? "bg-gray-800" : "bg-gray-100"
                        )}>
                            <div
                                className={cn("h-full rounded-full", selectedColor.progress)}
                                style={{ width: `${progressValue}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KPICard;