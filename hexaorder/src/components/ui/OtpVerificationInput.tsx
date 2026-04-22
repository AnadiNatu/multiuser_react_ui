import React, { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '../../utils/helpers';

interface OtpVerificationInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function OtpVerificationInput({
  length = 6,
  onComplete,
  disabled = false,
  error,
  className,
}: OtpVerificationInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusNext = (index: number) => {
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const focusPrev = (index: number) => {
    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value.slice(-1);
    setValues(newValues);

    if (value && index < length - 1) {
      focusNext(index);
    }

    const otp = newValues.join('');
    if (otp.length === length) {
      onComplete(otp);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        focusPrev(index);
      } else {
        const newValues = [...values];
        newValues[index] = '';
        setValues(newValues);
      }
    } else if (e.key === 'ArrowLeft') {
      focusPrev(index);
    } else if (e.key === 'ArrowRight') {
      focusNext(index);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    const newValues = [...values];
    pasted.split('').forEach((char, i) => {
      if (i < length) newValues[i] = char;
    });
    setValues(newValues);

    const lastFilledIndex = Math.min(pasted.length - 1, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();

    if (pasted.length === length) {
      onComplete(pasted);
    }
  };

  return (
    <div className={className}>
      <div className="flex gap-3 justify-center">
        {values.map((val, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={cn(
              'w-12 h-14 text-center text-xl font-bold border-2 rounded-xl transition-all outline-none',
              'focus:border-brand-green focus:ring-2 focus:ring-brand-green/20',
              'disabled:bg-slate-50 disabled:cursor-not-allowed',
              val ? 'border-brand-green bg-brand-green/5' : 'border-slate-200 bg-white',
              error && 'border-red-400'
            )}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}