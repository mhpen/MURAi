import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { cn } from "@/lib/utils";

const AdminLayout = ({ children, isDarkMode, toggleDarkMode }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const sidebarProps = {
        isDarkMode,
        toggleDarkMode,
        isSidebarOpen,
        setSidebarOpen,
        isUserMenuOpen,
        setIsUserMenuOpen
    };

    return (
        <div className={cn(
            "h-screen flex",
            isDarkMode ? "bg-[#111111] text-white" : "bg-white text-black"
        )}>
            <Sidebar {...sidebarProps} />
            <div className="flex-1 overflow-auto h-screen">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout; 