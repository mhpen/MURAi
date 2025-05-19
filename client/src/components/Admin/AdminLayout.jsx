import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { cn } from "@/lib/utils";
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const AdminLayout = ({ children, isDarkMode, toggleDarkMode }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    // State for mobile detection
    const [isMobile, setIsMobile] = useState(false);

    // Check if we're on mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        // Initial check
        checkMobile();

        // Add event listener
        window.addEventListener('resize', checkMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const sidebarProps = {
        isDarkMode,
        toggleDarkMode,
        isSidebarOpen,
        setSidebarOpen
    };

    return (
        <div className={cn(
            "h-screen flex relative",
            isDarkMode ? "bg-[#111111] text-white" : "bg-white text-black"
        )}>
            {/* Mobile sidebar backdrop */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar {...sidebarProps} />

            <div className="flex-1 overflow-auto h-screen">
                {/* Mobile menu toggle */}
                {isMobile && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "fixed top-4 left-4 z-50 md:hidden",
                            isDarkMode
                                ? "bg-gray-800/50 hover:bg-gray-800 text-white"
                                : "bg-white/50 hover:bg-white text-black shadow-md"
                        )}
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </Button>
                )}

                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;