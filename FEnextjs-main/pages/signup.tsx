import type { NextPage } from 'next';
import React, { useState } from 'react';
import { Card, Text, Input, Button, Loading, Link, Spacer } from '@nextui-org/react';
import { Box } from '../components/styles/box';
import { useRouter } from 'next/router';

const Signup: NextPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'manager',
    phone: '',
    company: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone || undefined,
          company: formData.company || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Store token and user info
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
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
              Create an account
            </Text>
            <Text size="$lg" css={{ color: '$accents8' }}>
              Get started with JninaTech today
            </Text>
          </Box>

          <form onSubmit={handleSignup}>
            <Box css={{ display: 'flex', flexDirection: 'column', gap: '$5' }}>
              <Input
                clearable
                bordered
                fullWidth
                size="lg"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                css={{ fontSize: '16px' }}
              />

              <Input
                clearable
                bordered
                fullWidth
                size="lg"
                label="Email"
                placeholder="Enter your email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                css={{ fontSize: '16px' }}
              />

              <Input
                clearable
                bordered
                fullWidth
                size="lg"
                label="Phone (Optional)"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                css={{ fontSize: '16px' }}
              />

              {/* Role Selector */}
              <Box>
                <Text size="$sm" css={{ mb: '$2', color: '$accents8', fontWeight: '500' }}>
                  Role
                </Text>
                <select
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '2px solid var(--nextui-colors-border)',
                    background: 'var(--nextui-colors-background)',
                    color: 'var(--nextui-colors-text)',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--nextui-colors-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--nextui-colors-border)'}
                >
                  <option value="manager">Manager</option>
                  <option value="fournisseur">Supplier</option>
                </select>
              </Box>

              {/* Company field - show only for suppliers */}
              {formData.role === 'fournisseur' && (
                <Input
                  clearable
                  bordered
                  fullWidth
                  size="lg"
                  label="Company Name"
                  placeholder="Enter your company name"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  css={{ fontSize: '16px' }}
                />
              )}

              <Input.Password
                clearable
                bordered
                fullWidth
                size="lg"
                label="Password"
                placeholder="Create a password (min. 6 characters)"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                css={{ fontSize: '16px' }}
              />

              <Input.Password
                clearable
                bordered
                fullWidth
                size="lg"
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
                css={{ fontSize: '16px' }}
              />

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
                {loading ? <Loading color="currentColor" size="sm" /> : 'Create Account'}
              </Button>
            </Box>
          </form>

          <Spacer y={1.5} />

          <Box css={{ textAlign: 'center' }}>
            <Text size="$sm" css={{ color: '$accents7' }}>
              Already have an account?{' '}
              <Link href="/login" css={{ color: '$green600', fontWeight: '500' }}>
                Sign in
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
            Start managing your construction projects efficiently
          </Text>
          <Text size="$lg" css={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.7' }}>
            Join construction companies using JninaTech to streamline operations, manage workforce, and optimize resources.
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default Signup;
