import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

type AuthMode = 'signin' | 'signup';
type AuthState = 'idle' | 'loading' | 'success' | 'error';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [state, setState] = useState<AuthState>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
    setState('idle');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setState('loading');
    setError('');
    setSuccessMessage('');
    
    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          setSuccessMessage('Successfully signed in!');
          setState('success');
          setTimeout(() => {
            onAuthSuccess();
            handleClose();
          }, 1500);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          setSuccessMessage('Account created successfully! You can now sign in.');
          setState('success');
          setTimeout(() => {
            setMode('signin');
            resetForm();
          }, 2000);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setState('error');
      
      // Handle specific error messages
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message.includes('User already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
        setTimeout(() => setMode('signin'), 2000);
      } else if (error.message.includes('Password should be at least 6 characters')) {
        setError('Password must be at least 6 characters long.');
      } else if (error.message.includes('Unable to validate email address')) {
        setError('Please enter a valid email address.');
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }
      
      setTimeout(() => setState('idle'), 3000);
    }
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] border border-gray-600 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <User className="w-6 h-6 text-[#00bfff] mr-3" />
            <h2 className="text-2xl font-bold text-white">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        {state === 'success' && successMessage && (
          <div className="mb-6 p-4 bg-green-500 bg-opacity-20 border border-green-500 border-opacity-20 rounded-xl">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-300 text-sm font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {state === 'error' && error && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-20 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-300 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-gray-300 font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-3 bg-[#333333] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00bfff] focus:border-transparent transition-all duration-300"
                disabled={state === 'loading' || state === 'success'}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-gray-300 font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-12 pr-4 py-3 bg-[#333333] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00bfff] focus:border-transparent transition-all duration-300"
                disabled={state === 'loading' || state === 'success'}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirm Password Field (Sign Up Only) */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-300 font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-4 py-3 bg-[#333333] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00bfff] focus:border-transparent transition-all duration-300"
                  disabled={state === 'loading' || state === 'success'}
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={state === 'loading' || state === 'success'}
            className="w-full py-3 bg-gradient-to-r from-[#00bfff] to-purple-500 text-white font-semibold rounded-xl hover:from-[#0099cc] hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {state === 'loading' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
              </span>
            ) : state === 'success' ? (
              <span className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Success!
              </span>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Mode Switch */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={switchMode}
              className="ml-2 text-[#00bfff] hover:text-blue-300 font-medium transition-colors duration-200"
              disabled={state === 'loading' || state === 'success'}
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Info Text */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            {mode === 'signin' 
              ? 'Sign in to save and sync your research across devices'
              : 'Create an account to save your research and access it anywhere'
            }
          </p>
        </div>
      </div>
    </div>
  );
};