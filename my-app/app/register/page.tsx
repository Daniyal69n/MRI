'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Brain, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    contactNumber: '',
    password: '',
    pmdcNumber: '',
    specialization: '',
    privacyConsent: false,
  });
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    contactNumber?: string;
    password?: string;
    pmdcNumber?: string;
    specialization?: string;
    privacyConsent?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Basic validation
    const newErrors: typeof errors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }
    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.privacyConsent) {
      newErrors.privacyConsent = 'You must agree to the Privacy Guidelines';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Registration failed' });
        setIsLoading(false);
        return;
      }

      // Success - redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  return (
    <div className="min-h-screen bg-[#090c11] text-[#e7ebf1] font-sans flex items-center justify-center p-4 sm:p-6 py-12 overflow-x-hidden bg-hero-glow">
      <div className="w-full max-w-2xl">
        <div className="bg-[#10151d] border border-[#232b38] rounded-xl sm:rounded-2xl shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] p-5 sm:p-8 glass-panel-dark glow-border relative z-10">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-tissue-csf/10 p-3 rounded-full shadow-[0_0_15px_rgba(82,232,212,0.3)]">
                <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-tissue-csf" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-sm sm:text-base text-[#8c96a8]">Register as a researcher</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="text"
                name="firstName"
                label="First Name"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
              />
              <Input
                type="text"
                name="lastName"
                label="Last Name"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                required
              />
            </div>

            <Input
              type="text"
              name="username"
              label="Username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              required
            />

            <Input
              type="email"
              name="email"
              label="Email Address"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <Input
              type="tel"
              name="contactNumber"
              label="Contact Number"
              placeholder="Contact Number"
              value={formData.contactNumber}
              onChange={handleChange}
              error={errors.contactNumber}
              required
            />

            <div>
              <label className="block text-sm font-medium text-[#8c96a8] mb-1">
                Specialization <span className="text-[#ff6b6b]">*</span>
              </label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 text-base border rounded-lg bg-[#090c11]/50 text-[#e7ebf1] focus:outline-none focus:ring-2 focus:ring-tissue-csf focus:border-transparent transition-all shadow-inner ${
                  errors.specialization ? 'border-[#ff6b6b] focus:ring-[#ff6b6b]' : 'border-[#232b38] hover:border-[#5b6576]'
                }`}
                required
              >
                <option value="" className="bg-[#10151d]">Select Specialization</option>
                <option value="Medical Officer" className="bg-[#10151d]">Medical Officer</option>
                <option value="Radiologist" className="bg-[#10151d]">Radiologist</option>
                <option value="Neurologist" className="bg-[#10151d]">Neurologist</option>
                <option value="Researcher" className="bg-[#10151d]">Researcher</option>
              </select>
              {errors.specialization && (
                <p className="mt-1 text-sm text-[#ff6b6b]">{errors.specialization}</p>
              )}
            </div>

            <Input
              type="text"
              name="pmdcNumber"
              label="PMDC Number (Optional)"
              placeholder="PMDC Registration Number"
              value={formData.pmdcNumber}
              onChange={handleChange}
              error={errors.pmdcNumber}
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                label="Password"
                placeholder="Password (min. 6 characters)"
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

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    name="privacyConsent"
                    checked={formData.privacyConsent}
                    onChange={handleChange}
                    className="peer appearance-none w-5 h-5 border border-[#232b38] rounded bg-[#090c11]/50 checked:bg-tissue-csf checked:border-tissue-csf transition-all cursor-pointer shadow-inner"
                  />
                  <CheckCircle className="absolute w-3.5 h-3.5 text-[#04211d] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <div className="text-sm leading-snug">
                  <span className="text-[#8c96a8] group-hover:text-[#e7ebf1] transition-colors">
                    I agree to the Terms of Service and acknowledge the HIPAA/GDPR Privacy Guidelines for handling medical imaging data.
                  </span>
                  {errors.privacyConsent && (
                    <p className="mt-1 text-xs text-[#ff6b6b]">{errors.privacyConsent}</p>
                  )}
                </div>
              </label>
            </div>

            {errors.general && (
              <div className="bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 text-[#ff6b6b] px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full font-mono text-[13.5px] px-[22px] py-[13px] rounded-[3px] border border-tissue-csf bg-tissue-csf text-[#04211d] font-medium hover:bg-[#6ef0de] hover:border-[#6ef0de] hover:-translate-y-[1px] transition-all shadow-[0_0_15px_rgba(82,232,212,0.4)]"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#8c96a8]">
              Already have an account?{' '}
              <Link href="/login" className="text-tissue-csf hover:text-[#6ef0de] font-medium transition-colors">
                Sign in
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

