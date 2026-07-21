'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Brain, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addNotification } from '@/lib/notifications';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ 
    emailOrUsername?: string; 
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Basic validation
    const newErrors: { emailOrUsername?: string; password?: string } = {};
    if (!formData.emailOrUsername) {
      newErrors.emailOrUsername = 'Email or Username is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Login failed' });
        setIsLoading(false);
        return;
      }

      // Success - store user data and redirect (admin → Manage Users, others → dashboard)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user));
        addNotification({
          type: 'info',
          title: 'Login Successful',
          message: `Welcome back, ${data.user.firstName} ${data.user.lastName}! You have successfully logged in.`,
        });
      }
      router.push(data.user.isAdmin ? '/dashboard/users' : '/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  return (
    <div className="min-h-screen bg-[#090c11] text-[#e7ebf1] font-sans flex items-center justify-center p-4 sm:p-6 overflow-x-hidden bg-hero-glow">
      <div className="w-full max-w-md">
        <div className="bg-[#10151d] border border-[#232b38] rounded-xl sm:rounded-2xl shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] p-5 sm:p-8 glass-panel-dark glow-border relative z-10">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-tissue-csf/10 p-3 rounded-full shadow-[0_0_15px_rgba(82,232,212,0.3)]">
                <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-tissue-csf" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Brain Analysis System
            </h1>
            <p className="text-sm sm:text-base text-[#8c96a8]">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="text"
                name="emailOrUsername"
                label="Email or Username"
                placeholder="Enter your email or username"
                value={formData.emailOrUsername}
                onChange={handleChange}
                error={errors.emailOrUsername}
                required
              />
              <p className="mt-1 text-xs text-[#5b6576]">
                You can login using either your email address or username
              </p>
            </div>

            <div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-[#8c96a8] hover:text-[#e7ebf1] focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-tissue-csf hover:text-[#6ef0de] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {errors.general && (
              <div className="bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 text-[#ff6b6b] px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full font-mono text-[13.5px] px-[22px] py-[13px] rounded-[3px] border border-tissue-csf bg-tissue-csf text-[#04211d] font-medium hover:bg-[#6ef0de] hover:border-[#6ef0de] hover:-translate-y-[1px] transition-all shadow-[0_0_15px_rgba(82,232,212,0.4)]"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#8c96a8]">
              Don't have an account?{' '}
              <Link href="/register" className="text-tissue-csf hover:text-[#6ef0de] font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-[#5b6576] hover:text-[#8c96a8] font-medium transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

