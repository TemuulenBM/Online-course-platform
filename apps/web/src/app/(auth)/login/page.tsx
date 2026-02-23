'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

// We inline the schema here for now, but in a real app this would come from @ocp/validation
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setServerError('');

    // Simulate API call for now (we'll connect to the real mutation once we test the UI)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // TODO: Call api.auth.login(data) and update Zustand store
      console.log('Login attempt:', data);

      // Simulate success
      router.push('/dashboard');
    } catch (error) {
      setServerError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full animation-fade-in flex flex-col pt-10 lg:pt-0">
      <div className="text-center lg:text-left mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome back</h2>
        <p className="text-gray-500 font-medium text-sm">Please enter your details to sign in.</p>
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

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 ml-1">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <input
              {...register('email')}
              type="email"
              placeholder="Enter your email"
              className={`w-full px-4 py-3.5 rounded-2xl bg-[#F4F5FA] border-2 transition-all duration-200 outline-none
                ${errors.email ? 'border-red-300 focus:border-red-500 focus:bg-white' : 'border-transparent focus:border-[#8A93E5] focus:bg-white focus:shadow-[0_0_0_4px_rgba(138,147,229,0.1)]'}
              `}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs font-medium ml-1 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 ml-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className={`w-full pl-4 pr-12 py-3.5 rounded-2xl bg-[#F4F5FA] border-2 transition-all duration-200 outline-none
                ${errors.password ? 'border-red-300 focus:border-red-500 focus:bg-white' : 'border-transparent focus:border-[#8A93E5] focus:bg-white focus:shadow-[0_0_0_4px_rgba(138,147,229,0.1)]'}
              `}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs font-medium ml-1 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password & Remember Me */}
        <div className="flex items-center justify-between mt-2 pt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-5 h-5">
              <input type="checkbox" className="peer sr-only" disabled={isLoading} />
              <div className="w-full h-full border-2 border-gray-300 rounded-md peer-checked:bg-[#8A93E5] peer-checked:border-[#8A93E5] transition-colors"></div>
              <svg
                className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors select-none">
              Remember me
            </span>
          </label>

          <Link
            href="/forgot-password"
            className="text-sm font-bold text-[#8A93E5] hover:text-indigo-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#2E3035] hover:bg-black text-white py-4 rounded-2xl font-bold tracking-wide transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2 active:scale-[0.98] mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Social Login Divider */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Or continue with
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Google / Apple */}
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-gray-100 hover:bg-gray-50 rounded-2xl font-semibold text-sm text-gray-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-gray-100 hover:bg-gray-50 rounded-2xl font-semibold text-sm text-gray-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.24-.7 3.55-.7 1.34 0 2.59.5 3.47 1.48-2.61 1.61-2.12 5.38.68 6.45-.66 1.83-1.63 3.65-2.78 4.94zm-1.63-14.74c.73-1.01 1.12-2.19 1-3.32-1.05.06-2.29.69-3.09 1.69-.73.88-1.2 2.1-1.04 3.25 1.16.12 2.37-.53 3.13-1.62z" />
            </svg>
            Apple
          </button>
        </div>
      </form>

      <div className="text-center mt-8">
        <p className="text-sm font-medium text-gray-600">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="text-[#8A93E5] font-bold hover:text-indigo-700 transition-colors"
          >
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
