import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import logo from "../../assets/logo.png";
import apiClient from '../../services/api.service';

const AdminLogin = () => {
    const [email, setEmail] = useState(() => localStorage.getItem('rememberedEmail') || '');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('rememberMe') === 'true');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await apiClient.post('/api/users/login', {
                email,
                password
            });

            const data = response.data;

            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.user.role);

            // Handle remember me
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('rememberedEmail');
                localStorage.setItem('rememberMe', 'false');
            }

            // Redirect to dashboard
            navigate('/admin/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            setStatus({
                type: 'error',
                message: error.response?.data?.error || error.message || 'Invalid credentials, please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans">
            <Card className="w-full max-w-[440px] border-black/5 shadow-sm p-8">
                <CardHeader className="space-y-3 flex flex-col items-center p-0 mb-8">
                    <div className="bg-black/2 p-3 rounded-lg ">
                        <img src={logo} alt="MURAi Logo" className="w-12 h-12" />
                    </div>
                    <div className="text-center space-y-2">
                        <CardTitle className="text-3xl font-medium text-black mb-10">
                            MURAi
                        </CardTitle>
                        <h2 className="text-2xl font-medium text-black">
                            Welcome Back, Admin!
                        </h2>
                        <p className="text-sm text-black/60 font-normal">
                            Please sign in to access your dashboard
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {status.message && (
                            <div className={`p-4 rounded-lg text-sm font-medium ${
                                status.type === 'error' 
                                    ? 'bg-red-50 text-red-600 border border-red-200' 
                                    : 'bg-green-50 text-green-600 border border-green-200'
                            }`}>
                                {status.message}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-normal text-black">
                                Email Address
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border-black/10 focus:border-black focus:ring-black font-normal text-sm placeholder:text-black/25"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-normal text-black">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="border-black/10 focus:border-black focus:ring-black font-normal text-sm placeholder:text-black/25"
                                    placeholder="Enter your password"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 text-black/40 hover:text-black"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={setRememberMe}
                                    className="data-[state=checked]:bg-black data-[state=checked]:hover:bg-black/90"
                                />
                                <label htmlFor="remember" className="text-sm text-black/60 font-normal">
                                    Remember me
                                </label>
                            </div>
                            <Button 
                                variant="link" 
                                className="px-0 text-black hover:text-black/70 font-medium"
                            >
                                Forgot Password?
                            </Button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-black hover:bg-black/90 text-white font-medium h-11 mt-2"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLogin;