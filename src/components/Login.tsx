import React, { useState } from 'react';
import { Shield, Lock, User, Key, Eye, EyeOff, RefreshCw, Mail, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'sms' | 'email' | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  const { login, verify2FA, resend2FA, pending2FA } = useAuth();

  // Countdown timer for resend
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(username, password);
    if (result.success) {
      setDeliveryMethod(result.deliveryMethod || null);
      setDemoOtp(result.demoOtp || null);
      setStep('2fa');
      setResendTimer(60); // 60 seconds cooldown
    } else {
      setError(result.message || 'Invalid username or password');
    }
    setIsLoading(false);
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await verify2FA(twoFactorCode);
    if (result.success) {
      onLogin();
    } else {
      setError(result.message || 'Invalid verification code');
    }
    setIsLoading(false);
  };

  const handleResendCode = async () => {
    setError('');
    setIsLoading(true);

    const result = await resend2FA();
    if (result.success) {
      setResendTimer(60);
      setDemoOtp(result.demoOtp || null);
      setError('');
    } else {
      setError(result.message || 'Failed to resend code');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00A3FF] rounded-2xl shadow-[0_0_30px_rgba(0,163,255,0.4)] mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">ATM_GUARD</h1>
          <p className="text-sm text-[var(--text-secondary)]">Security Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8">
          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Welcome Back</h2>
                <p className="text-sm text-[var(--text-secondary)]">Enter your credentials to continue</p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-[#FF4444]/10 border border-[#FF4444]/30 text-[#FF4444] text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[#00A3FF]"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[#00A3FF]"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#00A3FF] text-white rounded-xl font-medium hover:bg-[#00A3FF]/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={handle2FASubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#00FF9D]/10 rounded-full mb-4">
                  <Key className="w-6 h-6 text-[#00FF9D]" />
                </div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Two-Factor Authentication</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Enter the 6-digit code sent to your {deliveryMethod === 'sms' ? 'phone' : 'email'}
                </p>
                {pending2FA && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
                    {deliveryMethod === 'sms' ? (
                      <>
                        <Smartphone className="w-4 h-4" />
                        <span>SMS sent to registered number</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Code sent to {pending2FA.user.email}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-[#FF4444]/10 border border-[#FF4444]/30 text-[#FF4444] text-sm">
                  {error}
                </div>
              )}

              {/* Demo OTP Display */}
              {demoOtp && (
                <div className="p-4 rounded-xl bg-[#00FF9D]/10 border border-[#00FF9D]/30">
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Your verification code:</p>
                  <p className="text-2xl font-mono font-bold text-[#00FF9D] tracking-[0.3em]">{demoOtp}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-1">This is shown for demo purposes only</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-[#00A3FF]"
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || twoFactorCode.length !== 6}
                className="w-full py-3 bg-[#00FF9D] text-black rounded-xl font-medium hover:bg-[#00FF9D]/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Back to login
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || isLoading}
                  className="flex items-center gap-1.5 text-sm text-[#00A3FF] hover:text-[#00A3FF]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-[var(--text-secondary)] mt-6">
          © 2026 ATM Guard Security Systems
        </p>
      </div>
    </div>
  );
};
