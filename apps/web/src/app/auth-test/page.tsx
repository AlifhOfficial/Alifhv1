'use client';

import { useState } from 'react';
import { signIn, signUp, signOut, useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

/**
 * Auth Test Page
 * 
 * Development page to test Better Auth integration.
 * Uses Alifh Design System components.
 */
export default function AuthTestPage() {
  const { data: session, isPending } = useSession();
  
  // Sign Up Form State
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  
  // Sign In Form State  
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await signUp.email({
        email: signUpEmail,
        password: signUpPassword,
        name: signUpName,
        callbackURL: '/auth-test',
      });

      if (result.error) {
        setMessage({ type: 'error', text: result.error.message || 'Sign up failed' });
      } else {
        setMessage({ type: 'success', text: 'Account created successfully!' });
        setSignUpEmail('');
        setSignUpPassword('');
        setSignUpName('');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Sign up failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await signIn.email({
        email: signInEmail,
        password: signInPassword,
        callbackURL: '/auth-test',
      });

      if (result.error) {
        setMessage({ type: 'error', text: result.error.message || 'Sign in failed' });
      } else {
        setMessage({ type: 'success', text: 'Signed in successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Sign in failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const result = await signOut();
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error.message || 'Sign out failed' });
      } else {
        setMessage({ type: 'success', text: 'Signed out successfully!' });
        // Clear both forms
        setSignUpEmail('');
        setSignUpPassword('');
        setSignUpName('');
        setSignInEmail('');
        setSignInPassword('');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Sign out failed' });
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-medium text-foreground">🔐 Authentication Test</h1>
          <p className="text-sm text-muted-foreground">
            Better Auth v1.4.6 • Alifh Design System
          </p>
        </div>

        {/* Alert Messages */}
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>
              {message.type === 'success' ? '✅ ' : '❌ '}
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* User Session Display */}
        {session ? (
          <Card>
            <CardHeader>
              <CardTitle>Active Session</CardTitle>
              <CardDescription>Your authentication details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info Grid */}
              <div className="grid gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">User ID</Label>
                  <p className="text-sm font-mono bg-muted px-3 py-2 rounded-lg">
                    {session.user.id}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm bg-muted px-3 py-2 rounded-lg">
                    {session.user.email}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Display Name</Label>
                  <p className="text-sm bg-muted px-3 py-2 rounded-lg">
                    {session.user.name || '—'}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email Verification Status</Label>
                  <div>
                    <Badge variant={session.user.emailVerified ? 'default' : 'secondary'}>
                      {session.user.emailVerified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Session Token</Label>
                  <p className="text-xs font-mono bg-muted px-3 py-2 rounded-lg break-all">
                    {session.session.token.substring(0, 40)}...
                  </p>
                </div>
              </div>

              <Separator />

              {/* Sign Out Button */}
              <Button
                onClick={handleSignOut}
                disabled={loading}
                variant="destructive"
                className="w-full"
              >
                {loading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sign Up Card */}
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Sign up for a new account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="john@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Sign In Card */}
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Sign in to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="john@example.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full" variant="secondary">
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
