import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    LogOut,
    ChevronRight,
    Menu,
    Sun,
    Moon,
    Brain,
    FlaskConical,
    PanelLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const Sidebar = ({
    isDarkMode,
    toggleDarkMode,
    isSidebarOpen,
    setSidebarOpen
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    // State for tracking tooltips
    const [showTooltip, setShowTooltip] = useState(null);

    // Check screen size and collapse sidebar on small screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsCollapsed(true);
            }
        };

        // Initial check
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    const isActive = (path) => location.pathname === path;

    // Navigation items grouped by category
    const navigationItems = [
        {
            category: 'Main',
            items: [
                {
                    name: 'Dashboard',
                    path: '/admin/dashboard',
                    icon: <LayoutDashboard className="h-4 w-4" />,
                    section: 'dashboard'
                }
            ]
        },
        {
            category: 'Models',
            items: [
                {
                    name: 'Sentiment Model',
                    path: '/admin/model',
                    icon: <Brain className="h-4 w-4" />,
                    section: 'models'
                },
                {
                    name: 'Test Model',
                    path: '/model-test',
                    icon: <FlaskConical className="h-4 w-4" />,
                    section: 'models'
                }
            ]
        }
    ];

    // Render a navigation item
    const renderNavItem = (item) => (
        <div
            key={item.path}
            className="relative"
            onMouseEnter={() => isCollapsed && setShowTooltip(item.path)}
            onMouseLeave={() => setShowTooltip(null)}
        >
            <Button
                variant={isActive(item.path) ? "default" : "ghost"}
                className={cn(
                    "w-full justify-start gap-3 font-normal",
                    isCollapsed ? "px-3" : "px-4",
                    isActive(item.path)
                        ? isDarkMode
                            ? "bg-primary/20 text-primary hover:bg-primary/30"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        : isDarkMode
                            ? "text-white/70 hover:text-white hover:bg-white/10"
                            : "text-black/70 hover:text-black hover:bg-black/10"
                )}
                onClick={() => navigate(item.path)}
            >
                {item.icon}
                {!isCollapsed && <span>{item.name}</span>}
            </Button>

            {/* Tooltip for collapsed state */}
            {isCollapsed && showTooltip === item.path && (
                <div className={cn(
                    "absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap z-50",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800 shadow-md"
                )}>
                    {item.name}
                </div>
            )}
        </div>
    );

    return (
        <div className={cn(
            "h-screen sticky top-0 flex flex-col transition-all duration-300 z-40",
            isCollapsed ? "w-16" : "w-64",
            !isSidebarOpen && "-translate-x-full md:translate-x-0",
            isDarkMode
                ? "bg-[#111111] border-white/5 text-white/90"
                : "bg-white border-black/5 text-black/90",
            "border-r"
        )}>
            <div className={cn(
                "flex flex-col h-full",
                isCollapsed ? "p-3" : "p-5"
            )}>
                {/* Logo Section */}
                <div className={cn(
                    "flex items-center justify-between mb-6",
                    isCollapsed ? "justify-center" : "justify-between"
                )}>
                    <div className={cn(
                        "flex items-center",
                        isCollapsed ? "justify-center" : "gap-3"
                    )}>
                        <img
                            src={logo}
                            alt="MURAi"
                            className={cn(
                                isCollapsed ? "w-8 h-8" : "w-10 h-10"
                            )}
                        />
                        {!isCollapsed && <span className="text-base font-medium">Admin</span>}
                    </div>

                    {!isCollapsed && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "md:flex",
                                isDarkMode
                                    ? "text-white/70 hover:text-white hover:bg-white/10"
                                    : "text-black/70 hover:text-black hover:bg-black/10"
                            )}
                            onClick={() => setIsCollapsed(true)}
                        >
                            <PanelLeft className="h-4 w-4" />
                        </Button>
                    )}

                    {isCollapsed && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "mt-4 w-full justify-center",
                                isDarkMode
                                    ? "text-white/70 hover:text-white hover:bg-white/10"
                                    : "text-black/70 hover:text-black hover:bg-black/10"
                            )}
                            onClick={() => setIsCollapsed(false)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "md:hidden mb-4",
                        isDarkMode
                            ? "text-white/70 hover:text-white hover:bg-white/10"
                            : "text-black/70 hover:text-black hover:bg-black/10"
                    )}
                    onClick={() => setSidebarOpen(false)}
                >
                    <Menu className="h-4 w-4 mr-2" />
                    {!isCollapsed && <span>Close Menu</span>}
                </Button>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto">
                    <div className="flex-1 space-y-6">
                        {navigationItems.map((category, index) => (
                            <div key={index} className="space-y-1">
                                {!isCollapsed && (
                                    <h3 className={cn(
                                        "px-3 text-xs font-semibold",
                                        isDarkMode ? "text-white/50" : "text-black/50"
                                    )}>
                                        {category.category}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {category.items.map(item => renderNavItem(item))}
                                </div>
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Settings and User Account Sections */}
                <div className="space-y-4 mt-auto">
                    <div className={cn(
                        "border-t pt-4",
                        isDarkMode ? "border-white/5" : "border-black/5"
                    )}>
                        <div
                            className="relative"
                            onMouseEnter={() => isCollapsed && setShowTooltip('theme')}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full gap-3 font-normal",
                                    isCollapsed ? "justify-center px-2" : "justify-start px-4",
                                    isDarkMode
                                        ? "text-white/70 hover:text-white hover:bg-white/10"
                                        : "text-black/70 hover:text-black hover:bg-black/10"
                                )}
                                onClick={toggleDarkMode}
                            >
                                {isDarkMode ? (
                                    <>
                                        <Sun className="h-4 w-4" />
                                        {!isCollapsed && <span>Light Mode</span>}
                                    </>
                                ) : (
                                    <>
                                        <Moon className="h-4 w-4" />
                                        {!isCollapsed && <span>Dark Mode</span>}
                                    </>
                                )}
                            </Button>

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && showTooltip === 'theme' && (
                                <div className={cn(
                                    "absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap z-50",
                                    isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800 shadow-md"
                                )}>
                                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={cn(
                        "border-t pt-4",
                        isDarkMode ? "border-white/5" : "border-black/5"
                    )}>
                        <div
                            className="relative"
                            onMouseEnter={() => isCollapsed && setShowTooltip('logout')}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full gap-3 font-normal",
                                    isCollapsed ? "justify-center px-2" : "justify-start px-4",
                                    isDarkMode
                                        ? "text-white/70 hover:text-white hover:bg-white/10"
                                        : "text-black/70 hover:text-black hover:bg-black/10"
                                )}
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                {!isCollapsed && <span>Logout</span>}
                            </Button>

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && showTooltip === 'logout' && (
                                <div className={cn(
                                    "absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap z-50",
                                    isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800 shadow-md"
                                )}>
                                    Logout
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Version indicator */}
                    <div className={cn(
                        "text-xs text-center mt-4",
                        isDarkMode ? "text-white/30" : "text-black/30"
                    )}>
                        {!isCollapsed && <span>MURAi v1.0.0</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;