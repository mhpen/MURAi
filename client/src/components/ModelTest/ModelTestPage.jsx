import React, { useState } from 'react';
import { Brain, AlertTriangle, CheckCircle2, Clock, Loader2, FlaskConical, TestTube, Beaker } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { predictProfanity, saveTestMetrics } from '@/services/modelTestService';

const ModelTestPage = ({ isDarkMode }) => {
    const [inputText, setInputText] = useState('');
    const [selectedModel, setSelectedModel] = useState('roberta');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        setInputText(e.target.value);
    };

    const handleModelChange = (value) => {
        setSelectedModel(value);
    };

    const sampleTexts = [
        "Magandang umaga sa inyong lahat!",
        "Putang ina mo, ang sama ng ugali mo!",
        "Salamat sa tulong mo kaibigan.",
        "Gago ka ba? Hindi ko maintindihan ang sinasabi mo.",
        "Masarap ang pagkain sa restaurant na ito."
    ];

    const loadSampleText = () => {
        const randomIndex = Math.floor(Math.random() * sampleTexts.length);
        setInputText(sampleTexts[randomIndex]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!inputText.trim()) {
            setError('Please enter some text to analyze');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Call the API to predict profanity
            const response = await predictProfanity(inputText, selectedModel);

            // Save the response time to the database
            try {
                await saveTestMetrics({
                    model_type: selectedModel,
                    text_length: inputText.length,
                    processing_time_ms: response.processing_time_ms,
                    is_inappropriate: response.is_inappropriate,
                    confidence: response.confidence
                });
            } catch (dbError) {
                console.error('Failed to save metrics to database:', dbError);
                // Continue anyway, this is not critical
            }

            setResult(response);
        } catch (err) {
            console.error('Error predicting profanity:', err);
            setError(err.message || 'An error occurred while analyzing the text');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <FlaskConical className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-semibold">Tagalog Profanity Detection Test</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-9 gap-2",
                                isDarkMode
                                    ? "border-gray-700 hover:bg-gray-800"
                                    : "border-gray-200 hover:bg-gray-50"
                            )}
                            onClick={() => window.location.href = '/admin/dashboard'}
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                </div>

                <div className={cn(
                    "border rounded-lg p-6 mb-6 transition-all duration-200",
                    isDarkMode
                        ? "border-gray-800 bg-gray-900/50"
                        : "border-gray-100 bg-white"
                )}>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Select Model
                            </label>
                            <Tabs
                                defaultValue={selectedModel}
                                value={selectedModel}
                                onValueChange={handleModelChange}
                                className="w-full sm:w-auto"
                            >
                                <TabsList className={cn(
                                    "w-full grid grid-cols-2 h-10",
                                    isDarkMode
                                        ? "bg-gray-800/50 border border-gray-700"
                                        : "bg-gray-100 border border-gray-200"
                                )}>
                                    <TabsTrigger
                                        value="bert"
                                        className={cn(
                                            "font-medium text-sm rounded-md transition-all duration-200",
                                            selectedModel === "bert"
                                                ? isDarkMode
                                                    ? "bg-gray-700 text-white shadow-md"
                                                    : "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-500"
                                        )}
                                    >
                                        <TestTube className="h-4 w-4 mr-2" />
                                        BERT
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="roberta"
                                        className={cn(
                                            "font-medium text-sm rounded-md transition-all duration-200",
                                            selectedModel === "roberta"
                                                ? isDarkMode
                                                    ? "bg-gray-700 text-white shadow-md"
                                                    : "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-500"
                                        )}
                                    >
                                        <Beaker className="h-4 w-4 mr-2" />
                                        RoBERTa
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="inputText" className="block text-sm font-medium">
                                    Enter Text to Analyze
                                </label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={loadSampleText}
                                    className={cn(
                                        "text-xs",
                                        isDarkMode
                                            ? "border-gray-700 hover:bg-gray-800"
                                            : "border-gray-200 hover:bg-gray-50"
                                    )}
                                >
                                    Load Sample Text
                                </Button>
                            </div>
                            <Textarea
                                id="inputText"
                                value={inputText}
                                onChange={handleInputChange}
                                placeholder="Enter Tagalog text to check for profanity..."
                                className={cn(
                                    "min-h-[120px]",
                                    isDarkMode
                                        ? "bg-gray-800 border-gray-700"
                                        : "bg-white border-gray-200"
                                )}
                                required
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                type="submit"
                                className="w-full sm:w-auto"
                                disabled={loading || !inputText.trim()}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <FlaskConical className="h-4 w-4 mr-2" />
                                        Analyze Text
                                    </>
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                    "w-full sm:w-auto",
                                    isDarkMode
                                        ? "border-gray-700 hover:bg-gray-800"
                                        : "border-gray-200 hover:bg-gray-50"
                                )}
                                onClick={() => {
                                    setInputText('');
                                    setResult(null);
                                    setError(null);
                                }}
                            >
                                Clear
                            </Button>
                        </div>
                    </form>
                </div>

                {error && (
                    <div className={cn(
                        "border rounded-lg p-4 mb-6 flex items-start gap-3",
                        isDarkMode
                            ? "border-red-900/50 bg-red-900/20"
                            : "border-red-100 bg-red-50"
                    )}>
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-red-700 dark:text-red-400">Error</h3>
                            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {result && (
                    <div className={cn(
                        "border rounded-lg p-6 transition-all duration-200",
                        isDarkMode
                            ? "border-gray-800 bg-gray-900/50"
                            : "border-gray-100 bg-white"
                    )}>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            Analysis Result
                            {result.is_inappropriate ? (
                                <span className="text-sm px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                    Inappropriate
                                </span>
                            ) : (
                                <span className="text-sm px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    Appropriate
                                </span>
                            )}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={cn(
                                "p-4 rounded-lg",
                                isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
                            )}>
                                <div className="flex items-start gap-3">
                                    {result.is_inappropriate ? (
                                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                                    ) : (
                                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                    )}
                                    <div>
                                        <h3 className="font-medium">Prediction</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {result.is_inappropriate
                                                ? "The text contains inappropriate content"
                                                : "The text appears to be appropriate"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={cn(
                                "p-4 rounded-lg",
                                isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
                            )}>
                                <div className="flex items-start gap-3">
                                    <Brain className="h-5 w-5 text-blue-500 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium">Confidence</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {(result.confidence * 100).toFixed(2)}% confidence in prediction
                                        </p>
                                        <div className={cn(
                                            "w-full h-2 rounded-full mt-2 overflow-hidden",
                                            isDarkMode ? "bg-gray-700" : "bg-gray-200"
                                        )}>
                                            <div
                                                className={cn(
                                                    "h-full rounded-full",
                                                    result.is_inappropriate ? "bg-red-500" : "bg-green-500"
                                                )}
                                                style={{ width: `${result.confidence * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={cn(
                                "p-4 rounded-lg",
                                isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
                            )}>
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-purple-500 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium">Processing Time</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {result.processing_time_ms.toFixed(2)} ms
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={cn(
                                "p-4 rounded-lg",
                                isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
                            )}>
                                <div className="flex items-start gap-3">
                                    {result.model_used === 'bert' ? (
                                        <TestTube className="h-5 w-5 text-amber-500 mt-0.5" />
                                    ) : (
                                        <Beaker className="h-5 w-5 text-amber-500 mt-0.5" />
                                    )}
                                    <div>
                                        <h3 className="font-medium">Model Used</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {result.model_used.toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModelTestPage;
