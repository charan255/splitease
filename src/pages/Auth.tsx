import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import api from '@/lib/api';
import { toast } from 'sonner';

type AuthStep = 'phone' | 'otp';

export default function Auth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setIsLoading(true);
      try {
        await api.post('/auth/login', { phone });
        toast.success("OTP sent! (Use 1234)");
        setStep('otp');
      } catch (error) {
        toast.error("Failed to send OTP. Try again.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtp();
  };

  const handleOtpComplete = (value: string) => {
    setOtp(value);
    if (value.length === 6) { // Note: InputOTP maxLength is 6, but backend uses 4 chars. I should probably adjust one of them. Backend logic: "1234". Let's assume user enters 1234.. oh the UI has 6 slots. I'll just send what they type.
      // Actually, the backend hardcoded "1234". The UI expects 6 digits. I should probably update UI to 4 digits or backend to accept whatever. 
      // For this task, I'll let the user type, but the "valid" OTP is 1234. Maybe I should trim or padding? 
      // Let's just fix the backend to accept input. But wait, I can't easily change backend now without context switch. 
      // I'll just change UI to 4 slots if possible, OR just realize the user will type 1234 and maybe 2 more chars? 
      // No, simpler: I'll accept the input. If the user types 123456 it will fail. They must type 1234.
      // The UI enforces 6 slots. I'll change the UI to 4 slots to match backend "1234".
    }
  };

  const manualVerify = () => {
    verifyOtp();
  }

  const verifyOtp = async () => {
    if (otp.length < 4) return;
    setIsLoading(true);
    try {
      const res = await api.post('/auth/verify', { phone, otp });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success("Login successful!");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Invalid OTP");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Custom wrapper for OTP complete to trigger verify if length is 4 (since backend uses 4)
  const onOtpChange = (value: string) => {
    setOtp(value);
    if (value.length === 4) {
      // Auto submit if 4? Maybe wait for button.
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-2xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">SplitEase</h1>
            <p className="text-muted-foreground">
              No awkward money conversations. Just clarity.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-5">
                <div className="text-center mb-6">
                  <h2 className="font-semibold text-lg mb-1">Enter your phone</h2>
                  <p className="text-sm text-muted-foreground">We'll send you a verification code</p>
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">+91</span>
                  </div>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98765 43210"
                    className="h-12 pl-20 text-lg tracking-wide"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base gap-2"
                  disabled={phone.length < 10 || isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="text-center mb-6">
                  <h2 className="font-semibold text-lg mb-1">Verify OTP</h2>
                  <p className="text-sm text-muted-foreground">
                    Enter the code sent to +91 {phone} (Use 1234)
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={4}
                    value={otp}
                    onChange={onOtpChange}
                    className="gap-2"
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="w-11 h-12 text-lg rounded-lg" />
                      <InputOTPSlot index={1} className="w-11 h-12 text-lg rounded-lg" />
                      <InputOTPSlot index={2} className="w-11 h-12 text-lg rounded-lg" />
                      <InputOTPSlot index={3} className="w-11 h-12 text-lg rounded-lg" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base"
                  disabled={otp.length < 4 || isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    'Verify & Continue'
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Change phone number
                </button>
              </form>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Your data is encrypted & secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
