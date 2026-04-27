import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Widget } from '../components/ui/Widget';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Package, Mail, Phone, Lock, CheckCircle } from 'lucide-react';
import { apiService, API_ENDPOINTS } from '../services/apiService';

type Step = 'request' | 'verify' | 'success';
type Method = 'email' | 'sms';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('request');
  const [method, setMethod] = useState<Method>('email');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const res = await apiService.postQuery<any>(API_ENDPOINTS.PASSWORD_FORGOT, {
        email: identifier,
        method,
      });
      setInfo(res.message || 'OTP sent successfully');
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await apiService.postQuery<any>(API_ENDPOINTS.PASSWORD_RESET, {
        identifier,
        otp,
        newPassword,
      });
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-blue/20 via-slate-50 to-emerald-50 p-4">
        <Widget className="max-w-md w-full shadow-2xl text-center p-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset!</h2>
          <p className="text-slate-500 mb-6">Your password has been successfully reset.</p>
          <Button onClick={() => navigate('/login')} fullWidth>
            Sign In
          </Button>
        </Widget>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-blue/20 via-slate-50 to-emerald-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-green rounded-2xl shadow-lg mb-4">
            <Package className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            {step === 'request' ? 'Forgot Password' : 'Enter OTP'}
          </h1>
          <p className="text-slate-500 mt-2">
            {step === 'request'
              ? 'Enter your email to receive a reset OTP'
              : 'Enter the OTP and choose a new password'}
          </p>
        </div>

        <Widget className="shadow-2xl">
          {error && <Alert variant="error" className="mb-4">{error}</Alert>}
          {info && <Alert variant="info" className="mb-4">{info}</Alert>}

          {step === 'request' ? (
            <form onSubmit={handleRequest} className="space-y-4">
              {/* Method toggle */}
              <div className="flex p-1 bg-slate-100 rounded-lg mb-2">
                {(['email', 'sms'] as Method[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      method === m
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {m === 'email' ? 'Via Email' : 'Via SMS'}
                  </button>
                ))}
              </div>

              <Input
                label="Email Address"
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="name@company.com"
                required
              />

              <Button type="submit" fullWidth size="lg" isLoading={loading}>
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <Input
                label="OTP Code"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                required
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                placeholder="Min 8 characters"
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                placeholder="Repeat password"
                required
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('request')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" isLoading={loading} className="flex-1">
                  Reset Password
                </Button>
              </div>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-slate-500">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-green hover:text-brand-green/80"
            >
              Sign in
            </Link>
          </p>
        </Widget>
      </div>
    </div>
  );
}
