import React, { useState } from 'react';
import { Brain, RefreshCcw, AlertTriangle, CheckCircle2, History, Terminal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const ModelDashboard = ({ isDarkMode }) => {
    const [isRetraining, setIsRetraining] = useState(false);
    const [logs, setLogs] = useState([]);

    const handleRetrain = async () => {
        setIsRetraining(true);
        try {
            // API call to retrain model
            // const response = await retrainModel();
            // Add log
            setLogs(prev => [...prev, {
                timestamp: new Date().toISOString(),
                type: 'info',
                message: 'Model retraining started'
            }]);
            
            // Simulate training time
            setTimeout(() => {
                setLogs(prev => [...prev, {
                    timestamp: new Date().toISOString(),
                    type: 'success',
                    message: 'Model retraining completed successfully'
                }]);
                setIsRetraining(false);
            }, 3000);
        } catch (error) {
            setLogs(prev => [...prev, {
                timestamp: new Date().toISOString(),
                type: 'error',
                message: 'Model retraining failed: ' + error.message
            }]);
            setIsRetraining(false);
        }
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-semibold mb-8">Sentiment Analysis Model</h1>
                
                {/* Model Status Card */}
                <div className={cn(
                    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                )}>
                    <div className={cn(
                        "border rounded-lg p-6",
                        isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5 bg-white"
                    )}>
                        <h3 className="text-sm font-medium mb-2">Model Version</h3>
                        <div className="text-2xl font-semibold">v1.2.3</div>
                        <p className="text-sm text-muted-foreground mt-1">Last updated: 2 days ago</p>
                    </div>

                    <div className={cn(
                        "border rounded-lg p-6",
                        isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5 bg-white"
                    )}>
                        <h3 className="text-sm font-medium mb-2">Accuracy</h3>
                        <div className="text-2xl font-semibold">94.8%</div>
                        <p className="text-sm text-green-500 mt-1">↑ 2.1% from last version</p>
                    </div>

                    <div className={cn(
                        "border rounded-lg p-6",
                        isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5 bg-white"
                    )}>
                        <h3 className="text-sm font-medium mb-2">F1 Score</h3>
                        <div className="text-2xl font-semibold">0.923</div>
                        <p className="text-sm text-green-500 mt-1">↑ 0.015 from last version</p>
                    </div>

                    <div className={cn(
                        "border rounded-lg p-6",
                        isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5 bg-white"
                    )}>
                        <h3 className="text-sm font-medium mb-2">Processing Time</h3>
                        <div className="text-2xl font-semibold">142ms</div>
                        <p className="text-sm text-muted-foreground mt-1">Average per request</p>
                    </div>
                </div>

                {/* Model Controls and Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Training Controls */}
                    <div className={cn(
                        "border rounded-lg p-6",
                        isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5 bg-white"
                    )}>
                        <h3 className="text-lg font-medium mb-4">Model Training</h3>
                        <div className="space-y-4">
                            <Button 
                                className="w-full gap-2" 
                                onClick={handleRetrain}
                                disabled={isRetraining}
                            >
                                <RefreshCcw className={cn(
                                    "h-4 w-4",
                                    isRetraining && "animate-spin"
                                )} />
                                {isRetraining ? "Retraining..." : "Retrain Model"}
                            </Button>
                            
                            <div className="text-sm">
                                <div className="flex justify-between mb-2">
                                    <span>Training Dataset Size</span>
                                    <span className="font-medium">24,892 samples</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Validation Split</span>
                                    <span className="font-medium">20%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className={cn(
                        "border rounded-lg p-6",
                        isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5 bg-white"
                    )}>
                        <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm mb-1">Precision</p>
                                    <p className="text-xl font-semibold">0.918</p>
                                </div>
                                <div>
                                    <p className="text-sm mb-1">Recall</p>
                                    <p className="text-xl font-semibold">0.928</p>
                                </div>
                                <div>
                                    <p className="text-sm mb-1">Support</p>
                                    <p className="text-xl font-semibold">4,978</p>
                                </div>
                                <div>
                                    <p className="text-sm mb-1">ROC AUC</p>
                                    <p className="text-xl font-semibold">0.962</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Model Logs */}
                    <div className={cn(
                        "border rounded-lg p-6",
                        isDarkMode ? "border-white/5 bg-[#1A1A1A]" : "border-black/5 bg-white"
                    )}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Recent Logs</h3>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">View All</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Model Training Logs</DialogTitle>
                                    </DialogHeader>
                                    <div className="max-h-[60vh] overflow-y-auto">
                                        {logs.map((log, index) => (
                                            <div key={index} className="py-2">
                                                <div className="flex items-center gap-2">
                                                    {log.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                                    {log.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                                    {log.type === 'info' && <Terminal className="h-4 w-4 text-blue-500" />}
                                                    <span className="text-sm">{log.message}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="space-y-3">
                            {logs.slice(-3).map((log, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                    {log.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                    {log.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    {log.type === 'info' && <Terminal className="h-4 w-4 text-blue-500" />}
                                    <span>{log.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModelDashboard; 