import { useState } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '../utils/apiClient';
import { Input, Button, Card, Spacer, Text, Link } from '@nextui-org/react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('🟢 Sending login request:', form);
      const response = await apiClient.post('/auth/login', form);

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }

      router.push('/');
    } catch (err: any) {
      console.error('❌ Login error:', err);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #0d1117, #000)',
      }}
    >
      <Card
        variant="flat"
        css={{
          mw: '400px',
          p: '$10',
          border: '1px solid #1f2937',
          background: '#0f172a',
          borderRadius: '16px',
          boxShadow: '0 0 25px rgba(16, 185, 129, 0.15)',
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <Text h2 css={{ color: '#10b981' }}>
              🌿 JninaTech
            </Text>
            <Text small css={{ color: '#9ca3af' }}>
              Welcome back! Please sign in
            </Text>
          </div>

          <Input
            fullWidth
            underlined
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            css={{
              mb: '$8',
              '& input': { color: '#e5e7eb' },
              '& .nextui-input-main-container': { borderColor: '#10b981' },
            }}
            required
          />
          <Input.Password
            fullWidth
            underlined
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            css={{
              mb: '$8',
              '& input': { color: '#e5e7eb' },
              '& .nextui-input-main-container': { borderColor: '#10b981' },
            }}
            required
          />

          {error && (
            <Text css={{ color: '#ef4444', textAlign: 'center', mb: '$6' }}>
              {error}
            </Text>
          )}

          <Button
            shadow
            color="success"
            type="submit"
            disabled={loading}
            css={{
              w: '100%',
              h: '48px',
              fontWeight: '600',
              background: '#10b981',
              '&:hover': { background: '#16a34a' },
            }}
          >
            {loading ? 'Logging in…' : 'Login'}
          </Button>

          <Spacer y={0.5} />

          <Text
            small
            css={{
              textAlign: 'center',
              color: '#9ca3af',
              mt: '$6',
              fontSize: '13px',
            }}
          >
            Don’t have an account?{' '}
            <Link
              href="/register"
              css={{
                color: '#10b981',
                fontWeight: '600',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Register here
            </Link>
          </Text>
        </form>
      </Card>
    </main>
  );
}