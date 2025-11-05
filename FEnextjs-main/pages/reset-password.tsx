import type { NextPage } from 'next';
import React, { useState } from 'react';
import { Card, Text, Input, Button, Loading, Link } from '@nextui-org/react';
import { Box } from '../components/styles/box';
import { useRouter } from 'next/router';

const ResetPassword: NextPage = () => {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token as string,
          newPassword: password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Box
        css={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          px: '$6',
        }}
      >
        <Card
          css={{
            maxWidth: '420px',
            width: '100%',
            p: '$10',
          }}
        >
          <Card.Body css={{ textAlign: 'center', py: '$8' }}>
            <Text size="$lg" css={{ color: '$error', mb: '$4' }}>
              ❌ Invalid Reset Link
            </Text>
            <Text size="$sm" css={{ color: '$accents7', mb: '$6' }}>
              This password reset link is invalid or has expired.
            </Text>
            <Link href="/forgot-password" css={{ fontSize: '$sm', color: '$green600' }}>
              Request a new reset link
            </Link>
          </Card.Body>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      css={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        px: '$6',
      }}
    >
      <Card
        css={{
          maxWidth: '420px',
          width: '100%',
          p: '$10',
        }}
      >
        <Card.Header css={{ flexDirection: 'column', alignItems: 'flex-start', pb: '$8' }}>
          <Text
            h2
            css={{
              fontSize: '$2xl',
              fontWeight: '$bold',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: '$4',
            }}
          >
            🌳 JninaTech
          </Text>
          <Text size="$lg" css={{ color: '$accents7' }}>
            Choose a new password
          </Text>
        </Card.Header>

        <Card.Body css={{ py: '$6' }}>
          {success ? (
            <Box css={{ textAlign: 'center', py: '$6' }}>
              <Text size="$lg" css={{ color: '$green600', mb: '$4' }}>
                ✅ Password reset successfully!
              </Text>
              <Text size="$sm" css={{ color: '$accents7', mb: '$6' }}>
                Redirecting to login...
              </Text>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Box css={{ display: 'flex', flexDirection: 'column', gap: '$6' }}>
                <Input.Password
                  clearable
                  bordered
                  fullWidth
                  size="lg"
                  label="New Password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <Input.Password
                  clearable
                  bordered
                  fullWidth
                  size="lg"
                  label="Confirm New Password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                {error && (
                  <Text color="error" size="$sm">
                    {error}
                  </Text>
                )}

                <Button
                  type="submit"
                  css={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    mt: '$4',
                  }}
                  size="lg"
                  disabled={loading}
                >
                  {loading ? <Loading color="currentColor" size="sm" /> : 'Reset Password'}
                </Button>
              </Box>
            </form>
          )}
        </Card.Body>

        <Card.Footer css={{ flexDirection: 'column', gap: '$4', pt: '$6' }}>
          <Link href="/login" css={{ fontSize: '$sm', color: '$accents7' }}>
            ← Back to login
          </Link>
        </Card.Footer>
      </Card>
    </Box>
  );
};

export default ResetPassword;
