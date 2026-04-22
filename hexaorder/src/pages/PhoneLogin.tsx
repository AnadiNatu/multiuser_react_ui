import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Button } from '../components/ui/Button';
import { Widget } from '../components/ui/Widget';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { OtpVerificationInput } from '../components/ui/OtpVerificationInput';
import { Package, Smartphone, ArrowLeft } from 'lucide-react';
import { authService } from '@/features/auth/authService';
import { phoneLogin } from '@/features/auth/authSlice'; // ✅ FIXED

type Step = 'phone' | 'otp';

export default function PhoneLogin() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const status = useAppSelector((state) => state.auth.status);
  const error = useAppSelector((state) => state.auth.error);

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError('');
    setSendLoading(true);

    try {
      await authService.sendPhoneOtp(phone);
      setStep('otp');
    } catch (err: any) {
      setSendError(err.message || 'Failed to send OTP');
    } finally {
      setSendLoading(false);
    }
  };

  const handleOtpComplete = async (otp: string) => {
    setOtpError('');

    const result = await dispatch(phoneLogin({ phone, otp }));

    if (phoneLogin.fulfilled.match(result)) {
      navigate('/dashboard');
    } else {
      setOtpError((result.payload as string) || 'Invalid OTP'); // ✅ FIXED
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-blue/20 via-slate-50 to-emerald-50 p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-green rounded-2xl shadow-lg mb-4">
            <Package className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Phone Sign In</h1>
        </div>

        <Widget>

          {(error || sendError) && (
            <Alert variant="error">{sendError || error}</Alert>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Smartphone className="w-5 h-5" />}
                required
              />

              <Button type="submit" fullWidth isLoading={sendLoading}>
                Send OTP
              </Button>

              <Link to="/login" className="flex justify-center gap-2 text-sm">
                <ArrowLeft className="w-4 h-4" /> Back
              </Link>
            </form>
          ) : (
            <div className="space-y-4">
              <OtpVerificationInput
                onComplete={handleOtpComplete}
                disabled={status === 'loading'}
                error={otpError}
              />

              <button onClick={handleSendOtp}>Resend OTP</button>
              <button onClick={() => setStep('phone')}>Change number</button>
            </div>
          )}

        </Widget>
      </div>
    </div>
  );
}