import type { NextPage } from 'next';
import React, { useState } from 'react';
import { Text, Input, Button, Loading, Link, Spacer } from '@nextui-org/react';
import { Box } from '../components/styles/box';
import { useRouter } from 'next/router';

const Login: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store token and user info
      // Normalize the user data to match frontend expectations
      const normalizedUser = {
        _id: data.user.id || data.user._id, // Backend might return 'id' or '_id'
        name: data.user.name,
        email: data.user.email || data.user.phone, // Personnel use phone as email
        role: data.user.role.toLowerCase(), // Normalize role to lowercase
        phone: data.user.phone,
        company: data.user.company,
      };

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      console.log('Login successful:',  {
        token: data.access_token?.substring(0, 20) + '...',
        user: normalizedUser
      });

      // Redirect based on role
      const role = normalizedUser.role;
      if (role === 'personnel') {
        router.push('/daily-assignments');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      css={{
        minHeight: '100vh',
        display: 'flex',
        background: '$background',
      }}
    >
      {/* Left Side - Form */}
      <Box
        css={{
          flex: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: '$6',
          py: '$10',
          '@mdMax': { flex: '1 1 100%' },
        }}
      >
        <Box css={{ maxWidth: '440px', width: '100%' }}>
          <Box css={{ mb: '$10' }}>
            <Text h1 css={{ fontSize: '$3xl', fontWeight: '700', mb: '$2' }}>
              Welcome back
            </Text>
            <Text size="$lg" css={{ color: '$accents8' }}>
              Sign in to your account to continue
            </Text>
          </Box>

          <form onSubmit={handleLogin}>
            <Box css={{ display: 'flex', flexDirection: 'column', gap: '$5' }}>
              <Input
                clearable
                bordered
                fullWidth
                size="lg"
                label="Email or Phone"
                placeholder="Enter your email or phone number"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                css={{ fontSize: '16px' }}
              />

              <Input.Password
                clearable
                bordered
                fullWidth
                size="lg"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                css={{ fontSize: '16px' }}
              />

              <Box css={{ textAlign: 'right' }}>
                <Link href="/forgot-password" css={{ fontSize: '$sm', color: '$green600' }}>
                  Forgot password?
                </Link>
              </Box>

              {error && (
                <Text color="error" size="$sm">
                  {error}
                </Text>
              )}

              <Button
                type="submit"
                color="success"
                size="lg"
                css={{ mt: '$2' }}
                disabled={loading}
              >
                {loading ? <Loading color="currentColor" size="sm" /> : 'Sign In'}
              </Button>
            </Box>
          </form>

          <Spacer y={1.5} />

          <Box css={{ textAlign: 'center' }}>
            <Text size="$sm" css={{ color: '$accents7' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" css={{ color: '$green600', fontWeight: '500' }}>
                Sign up
              </Link>
            </Text>
          </Box>

          <Spacer y={1} />

          <Box css={{ textAlign: 'center' }}>
            <Link href="/" css={{ fontSize: '$sm', color: '$accents7' }}>
              ← Back to home
            </Link>
          </Box>
        </Box>
      </Box>

      {/* Right Side - Branding */}
      <Box
        css={{
          flex: '1',
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: '$10',
          '@mdMax': { display: 'none' },
        }}
      >
        <Box css={{ maxWidth: '500px', color: 'white' }}>
          <Text h2 css={{ fontSize: '$4xl', fontWeight: '700', color: 'white', mb: '$6' }}>
            Manage construction projects with confidence
          </Text>
          <Text size="$lg" css={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.7' }}>
            Access your dashboard to track progress, manage your team, and optimize resource allocation in real-time.
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
