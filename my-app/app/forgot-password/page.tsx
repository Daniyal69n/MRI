'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Brain, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      console.log('Password reset requested for:', email);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 overflow-x-hidden">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {submitted
                ? 'Check your email for password reset instructions'
                : 'Enter your email address and we\'ll send you a link to reset your password'}
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                name="email"
                label="Email Address"
                placeholder="researcher@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" size="lg" className="w-full">
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-green-100 p-4 rounded-lg">
                <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-800">
                  Password reset link has been sent to <strong>{email}</strong>
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Volumetric Analysis of Brain Soft Tissue Constituents
        </p>
      </div>
    </div>
  );
}

