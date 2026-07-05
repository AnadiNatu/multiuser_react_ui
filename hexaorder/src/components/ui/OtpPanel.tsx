import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, Smartphone } from 'lucide-react';

import AdminCard from './AdminCard';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface Props {

  title: string;

  description: string;

  type: 'email' | 'sms' | 'phone';

  sendOtp: (value: string) => Promise<any>;

  verifyOtp: (
    value: string,
    otp: string
  ) => Promise<any>;

}

export default function OtpPanel({

  title,

  description,

  type,

  sendOtp,

  verifyOtp,

}: Props) {

  const [value, setValue] = useState('');

  const [otp, setOtp] = useState('');

  const [sending, setSending] = useState(false);

  const [verifying, setVerifying] = useState(false);

  const icon = {

    email: Mail,

    sms: Smartphone,

    phone: Phone,

  };

  const Icon = icon[type];

  const placeholder =

    type === 'email'

      ? 'example@gmail.com'

      : '+91XXXXXXXXXX';

  async function handleSend() {

    if (!value.trim()) {

      toast.error('Please enter a value.');

      return;

    }

    try {

      setSending(true);

      const res = await sendOtp(value);

      toast.success(
        res.message ?? 'OTP sent successfully.'
      );

    } catch (e: any) {

      toast.error(
        e?.response?.data?.message ??
        'Unable to send OTP.'
      );

    } finally {

      setSending(false);

    }

  }

  async function handleVerify() {

    if (!otp.trim()) {

      toast.error('Please enter OTP.');

      return;

    }

    try {

      setVerifying(true);

      const res = await verifyOtp(value, otp);

      toast.success(
        res.message ?? 'OTP verified successfully.'
      );

    } catch (e: any) {

      toast.error(
        e?.response?.data?.message ??
        'Verification failed.'
      );

    } finally {

      setVerifying(false);

    }

  }

  return (

    <AdminCard>

      <div className="flex items-center gap-3 mb-6">

        <Icon className="w-8 h-8 text-brand-green" />

        <div>

          <h3 className="text-xl font-bold text-white">

            {title}

          </h3>

          <p className="text-slate-400 text-sm">

            {description}

          </p>

        </div>

      </div>

      <div className="space-y-4">

        <Input

          label={
            type === 'email'
              ? 'Email Address'
              : 'Phone Number'
          }

          value={value}

          onChange={(e) => setValue(e.target.value)}

          placeholder={placeholder}

        />

        <Button

          className="w-full"

          isLoading={sending}

          onClick={handleSend}

        >

          Send OTP

        </Button>

        <Input

          label="OTP"

          value={otp}

          onChange={(e) => setOtp(e.target.value)}

          placeholder="Enter received OTP"

        />

        <Button

          className="w-full"

          variant="outline"

          isLoading={verifying}

          onClick={handleVerify}

        >

          Verify OTP

        </Button>

      </div>

    </AdminCard>

  );

}