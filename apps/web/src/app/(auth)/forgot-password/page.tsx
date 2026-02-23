'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setServerError('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Call api.auth.forgotPassword(data) here
      console.log('Forgot password request for:', data.email);

      // Show success state
      setIsSubmitted(true);
    } catch (error) {
      setServerError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full animation-fade-in flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm border-2 border-green-200">
          <MailCheck className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Check your email
        </h2>
        <p className="text-gray-500 font-medium text-sm max-w-[300px] mb-8">
          We have sent password recovery instructions to your email address.
        </p>
        <Link
          href="/login"
          className="w-full bg-[#2E3035] hover:bg-black text-white py-4 rounded-2xl font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full animation-fade-in flex flex-col">
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-6 self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="text-center lg:text-left mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Forgot password?
        </h2>
        <p className="text-gray-500 font-medium text-sm">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100">
            <span className="shrink-0 bg-red-100 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">
              !
            </span>
            {serverError}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 ml-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="Enter your email"
            className={`w-full px-4 py-3.5 rounded-2xl bg-[#F4F5FA] border-2 transition-all duration-200 outline-none
              ${errors.email ? 'border-red-300 focus:border-red-500 focus:bg-white' : 'border-transparent focus:border-[#8A93E5] focus:bg-white focus:shadow-[0_0_0_4px_rgba(138,147,229,0.1)]'}
            `}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-xs font-medium ml-1 mt-1">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#2E3035] hover:bg-black text-white py-4 rounded-2xl font-bold tracking-wide transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2 active:scale-[0.98] mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
}
