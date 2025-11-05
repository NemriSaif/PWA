import type { NextPage } from 'next';
import React, { useState } from 'react';
import { Card, Text, Input, Button, Loading, Link } from '@nextui-org/react';
import { Box } from '../components/styles/box';

const ForgotPassword: NextPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send reset email');
      }

      setSuccess(true);
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
            Reset your password
          </Text>
        </Card.Header>

        <Card.Body css={{ py: '$6' }}>
          {success ? (
            <Box css={{ textAlign: 'center', py: '$6' }}>
              <Text size="$lg" css={{ color: '$green600', mb: '$4' }}>
                ✅ Email sent successfully!
              </Text>
              <Text size="$sm" css={{ color: '$accents7', mb: '$6' }}>
                Check your inbox for a password reset link. The link will expire in 1 hour.
              </Text>
              <Link href="/login" css={{ fontSize: '$sm', color: '$green600' }}>
                Return to login
              </Link>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Box css={{ display: 'flex', flexDirection: 'column', gap: '$6' }}>
                <Text size="$sm" css={{ color: '$accents7' }}>
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </Text>

                <Input
                  clearable
                  bordered
                  fullWidth
                  size="lg"
                  label="Email"
                  placeholder="your.email@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  {loading ? <Loading color="currentColor" size="sm" /> : 'Send Reset Link'}
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

export default ForgotPassword;
