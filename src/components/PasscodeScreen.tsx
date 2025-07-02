
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { validatePasscode, setCurrentUser } from '../utils/auth';
import { toast } from 'sonner';

interface PasscodeScreenProps {
  onAuthenticate: (passcode: string) => void;
}

const PasscodeScreen: React.FC<PasscodeScreenProps> = ({ onAuthenticate }) => {
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      onAuthenticate(passcode);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v13a2 2 0 002 2z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Secure Automation & Safety Solutions
          </CardTitle>
          <p className="text-gray-600">Enter your passcode to access the admin dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="password"
                placeholder="Enter your passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="text-center text-lg tracking-wider"
                maxLength={4}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || passcode.length !== 4}
            >
              {isLoading ? 'Verifying...' : 'Access Dashboard'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Authorized personnel only</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasscodeScreen;
