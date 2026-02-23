'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

// We inline the schema here for now
const registerSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setServerError('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Call api.auth.register(data) here
      console.log('Register attempt:', data);

      // Simulate success and redirect
      router.push('/dashboard');
    } catch (error) {
      setServerError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full animation-fade-in flex flex-col pt-6 lg:pt-0">
      <div className="text-center lg:text-left mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Create an account
        </h2>
        <p className="text-gray-500 font-medium text-sm">
          Join us and start your learning journey.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100">
            <span className="shrink-0 bg-red-100 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">
              !
            </span>
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* First Name Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('firstName')}
              type="text"
              placeholder="John"
              className={`w-full px-4 py-3.5 rounded-2xl bg-[#F4F5FA] border-2 transition-all duration-200 outline-none
                ${errors.firstName ? 'border-red-300 focus:border-red-500 focus:bg-white' : 'border-transparent focus:border-[#8A93E5] focus:bg-white focus:shadow-[0_0_0_4px_rgba(138,147,229,0.1)]'}
              `}
              disabled={isLoading}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs font-medium ml-1 mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('lastName')}
              type="text"
              placeholder="Doe"
              className={`w-full px-4 py-3.5 rounded-2xl bg-[#F4F5FA] border-2 transition-all duration-200 outline-none
                ${errors.lastName ? 'border-red-300 focus:border-red-500 focus:bg-white' : 'border-transparent focus:border-[#8A93E5] focus:bg-white focus:shadow-[0_0_0_4px_rgba(138,147,229,0.1)]'}
              `}
              disabled={isLoading}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs font-medium ml-1 mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email Field */}
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

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 ml-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#8A93E5] hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold tracking-wide transition-all shadow-[0_4px_14px_0_rgba(138,147,229,0.3)] hover:shadow-[0_6px_20px_rgba(138,147,229,0.4)] flex items-center justify-center gap-2 active:scale-[0.98] mt-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating account...
            </>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm font-medium text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[#8A93E5] font-bold hover:text-indigo-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
