import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    LogOut,
    ChevronDown,
    User,
    Menu,
    Sun,
    Moon,
    Brain
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const Sidebar = ({ 
    isDarkMode, 
    toggleDarkMode, 
    isSidebarOpen, 
    setSidebarOpen,
    isUserMenuOpen,
    setIsUserMenuOpen 
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className={cn(
            "w-64 h-screen sticky top-0 flex flex-col transition-all duration-300 z-40",
            !isSidebarOpen && "-translate-x-full md:translate-x-0",
            isDarkMode 
                ? "bg-[#111111] border-white/5 text-white/90" 
                : "bg-white border-black/5 text-black/90",
            "border-r"
        )}>
            <div className="p-6 flex flex-col h-full">
                {/* Logo Section */}
                <div className="mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="MURAi" className="w-10 h-10" />
                        <span className="text-base font-medium">Admin</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "md:hidden",
                            isDarkMode 
                                ? "text-white/70 hover:text-white hover:bg-white/10" 
                                : "text-black/70 hover:text-black hover:bg-black/10"
                        )}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1">
                    <div className="flex-1 space-y-2">
                        <Button
                            variant={isActive("/admin/dashboard") ? "default" : "ghost"}
                            className={cn(
                                "w-full justify-start gap-3 font-normal",
                                isActive("/admin/dashboard")
                                    ? isDarkMode 
                                        ? "bg-white/10 text-white hover:bg-white/15" 
                                        : "bg-black/10 text-black hover:bg-black/15"
                                    : isDarkMode
                                        ? "text-white/70 hover:text-white hover:bg-white/10"
                                        : "text-black/70 hover:text-black hover:bg-black/10"
                            )}
                            onClick={() => navigate('/admin/dashboard')}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Button>
                        
                        <Button
                            variant={isActive("/admin/model") ? "default" : "ghost"}
                            className={cn(
                                "w-full justify-start gap-3 font-normal",
                                isActive("/admin/model")
                                    ? isDarkMode 
                                        ? "bg-white/10 text-white hover:bg-white/15" 
                                        : "bg-black/10 text-black hover:bg-black/15"
                                    : isDarkMode
                                        ? "text-white/70 hover:text-white hover:bg-white/10"
                                        : "text-black/70 hover:text-black hover:bg-black/10"
                            )}
                            onClick={() => navigate('/admin/model')}
                        >
                            <Brain className="h-4 w-4" />
                            Sentiment Model
                        </Button>
                    </div>
                </nav>

                {/* Settings and User Account Sections */}
                <div className="space-y-4">
                    <div className={cn(
                        "border-t pt-4",
                        isDarkMode ? "border-white/5" : "border-black/5"
                    )}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 font-normal",
                                isDarkMode 
                                    ? "text-white/70 hover:text-white hover:bg-white/10" 
                                    : "text-black/70 hover:text-black hover:bg-black/10"
                            )}
                            onClick={toggleDarkMode}
                        >
                            {isDarkMode ? (
                                <>
                                    <Sun className="h-4 w-4" />
                                    Light Mode
                                </>
                            ) : (
                                <>
                                    <Moon className="h-4 w-4" />
                                    Dark Mode
                                </>
                            )}
                        </Button>
                    </div>

                    <div className={cn(
                        "border-t pt-4",
                        isDarkMode ? "border-white/5" : "border-black/5"
                    )}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 font-normal",
                                isDarkMode 
                                    ? "text-white/70 hover:text-white hover:bg-white/10" 
                                    : "text-black/70 hover:text-black hover:bg-black/10"
                            )}
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar; 