import { useState } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '../utils/apiClient';
import { Input, Button, Card, Spacer, Text, Link } from '@nextui-org/react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);

    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please fill all fields.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      // Backend: POST /users  (body: { username, email, password })
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      console.log('🟢 Register request:', payload);
      const res = await apiClient.post('/user', payload);
      console.log('✅ Register success:', res.data);

      setOk('Account created! Redirecting to login…');
      // Small delay so the user can see the success state
      setTimeout(() => router.push('/login'), 700);
    } catch (err: any) {
      console.error('❌ Register error:', err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.';
      setError(Array.isArray(message) ? message.join(', ') : message);
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
        padding: '16px',
      }}
    >
      <Card
        variant="flat"
        css={{
          mw: '420px',
          p: '$10',
          border: '1px solid #1f2937',
          background: '#0f172a',
          borderRadius: '16px',
          boxShadow: '0 0 25px rgba(16, 185, 129, 0.15)',
        }}
        role="region"
        aria-label="Create an account"
      >
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
            <Text h2 css={{ color: '#10b981' }}>
              🌿 JninaTech
            </Text>
            <Text small css={{ color: '#9ca3af' }}>
              Create your account
            </Text>
          </div>

          <Input
            fullWidth
            underlined
            labelPlaceholder="Username"
            aria-label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            css={{
              mb: '$7',
              '& input': { color: '#e5e7eb' },
              '& .nextui-input-main-container': { borderColor: '#10b981' },
            }}
            required
          />

          <Input
            fullWidth
            underlined
            type="email"
            labelPlaceholder="Email"
            aria-label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            css={{
              mb: '$7',
              '& input': { color: '#e5e7eb' },
              '& .nextui-input-main-container': { borderColor: '#10b981' },
            }}
            required
          />

          <Input.Password
            fullWidth
            underlined
            labelPlaceholder="Password"
            aria-label="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            css={{
              mb: '$7',
              '& input': { color: '#e5e7eb' },
              '& .nextui-input-main-container': { borderColor: '#10b981' },
            }}
            required
          />

          <Input.Password
            fullWidth
            underlined
            labelPlaceholder="Confirm password"
            aria-label="Confirm password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            css={{
              mb: '$5',
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
          {ok && (
            <Text css={{ color: '#10b981', textAlign: 'center', mb: '$6' }}>
              {ok}
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
            {loading ? 'Creating…' : 'Create account'}
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
            Already have an account?{' '}
            <Link
              href="/login"
              css={{
                color: '#10b981',
                fontWeight: '600',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Sign in
            </Link>
          </Text>
        </form>
      </Card>
    </main>
  );
}