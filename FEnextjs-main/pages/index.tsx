import type { NextPage } from 'next';
import React from 'react';
import { Card, Grid, Text, Button, Container } from '@nextui-org/react';
import { Box } from '../components/styles/box';
import { useRouter } from 'next/router';

const Landing: NextPage = () => {
  const router = useRouter();

  return (
    <Box css={{ minHeight: '100vh', background: '$background' }}>
      {/* Navigation */}
      <Box
        css={{
          borderBottom: '1px solid $border',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Container css={{ maxWidth: '1200px', py: '$4', px: '$6' }}>
          <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text b size="$xl" css={{ color: '$green600' }}>
              JninaTech
            </Text>
            <Box css={{ display: 'flex', gap: '$4' }}>
              <Button auto flat onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button auto color="success" onClick={() => router.push('/signup')}>
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container css={{ maxWidth: '1200px', py: '$24', px: '$6', '@xsMax': { py: '$16' } }}>
        <Box css={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <Text
            h1
            css={{
              fontSize: '3.5rem',
              fontWeight: '700',
              lineHeight: '1.2',
              mb: '$8',
              '@xsMax': { fontSize: '2.5rem' },
            }}
          >
            Construction Project Management
            <Text span css={{ color: '$green600' }}> Simplified</Text>
          </Text>
          <Text
            size="$xl"
            css={{
              color: '$accents8',
              mb: '$12',
              lineHeight: '1.6',
              '@xsMax': { fontSize: '$lg' },
            }}
          >
            Streamline your construction operations with powerful tools for project tracking,
            workforce management, and resource optimization.
          </Text>
          <Box css={{ display: 'flex', gap: '$4', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              size="lg"
              color="success"
              css={{ px: '$12', fontSize: '$lg' }}
              onClick={() => router.push('/signup')}
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              bordered
              color="success"
              css={{ px: '$12', fontSize: '$lg' }}
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Features Section */}
      <Box css={{ background: '$accents0', py: '$24', '@xsMax': { py: '$16' } }}>
        <Container css={{ maxWidth: '1200px', px: '$6' }}>
          <Box css={{ textAlign: 'center', mb: '$16' }}>
            <Text h2 css={{ fontSize: '$4xl', fontWeight: '700', mb: '$4', '@xsMax': { fontSize: '$2xl' } }}>
              Everything You Need to Manage Construction
            </Text>
            <Text size="$lg" css={{ color: '$accents8', maxWidth: '600px', margin: '0 auto' }}>
              Comprehensive tools designed specifically for construction project management
            </Text>
          </Box>

          <Grid.Container gap={3}>
            <Grid xs={12} sm={6} md={4}>
              <Card variant="bordered" css={{ p: '$8', height: '100%', borderRadius: '$lg' }}>
                <Box css={{ mb: '$4' }}>
                  <Box
                    css={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '$lg',
                      background: '$green100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: '$6',
                    }}
                  >
                    <Text css={{ fontSize: '24px', color: '$green600' }}>📊</Text>
                  </Box>
                </Box>
                <Text h4 css={{ fontSize: '$lg', fontWeight: '600', mb: '$3' }}>
                  Real-time Analytics
                </Text>
                <Text css={{ color: '$accents7', lineHeight: '1.6' }}>
                  Monitor project progress, resource allocation, and costs with live dashboards and insights
                </Text>
              </Card>
            </Grid>

            <Grid xs={12} sm={6} md={4}>
              <Card variant="bordered" css={{ p: '$8', height: '100%', borderRadius: '$lg' }}>
                <Box css={{ mb: '$4' }}>
                  <Box
                    css={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '$lg',
                      background: '$blue100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: '$6',
                    }}
                  >
                    <Text css={{ fontSize: '24px', color: '$blue600' }}>👥</Text>
                  </Box>
                </Box>
                <Text h4 css={{ fontSize: '$lg', fontWeight: '600', mb: '$3' }}>
                  Workforce Management
                </Text>
                <Text css={{ color: '$accents7', lineHeight: '1.6' }}>
                  Track personnel, manage assignments, and optimize your team&apos;s productivity
                </Text>
              </Card>
            </Grid>

            <Grid xs={12} sm={6} md={4}>
              <Card variant="bordered" css={{ p: '$8', height: '100%', borderRadius: '$lg' }}>
                <Box css={{ mb: '$4' }}>
                  <Box
                    css={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '$lg',
                      background: '$purple100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: '$6',
                    }}
                  >
                    <Text css={{ fontSize: '24px', color: '$purple600' }}>🚗</Text>
                  </Box>
                </Box>
                <Text h4 css={{ fontSize: '$lg', fontWeight: '600', mb: '$3' }}>
                  Fleet Management
                </Text>
                <Text css={{ color: '$accents7', lineHeight: '1.6' }}>
                  Monitor vehicles, track fuel consumption, and schedule maintenance efficiently
                </Text>
              </Card>
            </Grid>

            <Grid xs={12} sm={6} md={4}>
              <Card variant="bordered" css={{ p: '$8', height: '100%', borderRadius: '$lg' }}>
                <Box css={{ mb: '$4' }}>
                  <Box
                    css={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '$lg',
                      background: '$orange100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: '$6',
                    }}
                  >
                    <Text css={{ fontSize: '24px', color: '$orange600' }}>📦</Text>
                  </Box>
                </Box>
                <Text h4 css={{ fontSize: '$lg', fontWeight: '600', mb: '$3' }}>
                  Inventory Control
                </Text>
                <Text css={{ color: '$accents7', lineHeight: '1.6' }}>
                  Manage materials, tools, and supplies with automatic stock level alerts
                </Text>
              </Card>
            </Grid>

            <Grid xs={12} sm={6} md={4}>
              <Card variant="bordered" css={{ p: '$8', height: '100%', borderRadius: '$lg' }}>
                <Box css={{ mb: '$4' }}>
                  <Box
                    css={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '$lg',
                      background: '$cyan100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: '$6',
                    }}
                  >
                    <Text css={{ fontSize: '24px', color: '$cyan600' }}>📱</Text>
                  </Box>
                </Box>
                <Text h4 css={{ fontSize: '$lg', fontWeight: '600', mb: '$3' }}>
                  Offline Capability
                </Text>
                <Text css={{ color: '$accents7', lineHeight: '1.6' }}>
                  Work seamlessly even without internet connection, data syncs automatically
                </Text>
              </Card>
            </Grid>

            <Grid xs={12} sm={6} md={4}>
              <Card variant="bordered" css={{ p: '$8', height: '100%', borderRadius: '$lg' }}>
                <Box css={{ mb: '$4' }}>
                  <Box
                    css={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '$lg',
                      background: '$pink100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: '$6',
                    }}
                  >
                    <Text css={{ fontSize: '24px', color: '$pink600' }}>📈</Text>
                  </Box>
                </Box>
                <Text h4 css={{ fontSize: '$lg', fontWeight: '600', mb: '$3' }}>
                  Advanced Reporting
                </Text>
                <Text css={{ color: '$accents7', lineHeight: '1.6' }}>
                  Generate comprehensive reports and gain actionable insights for better decisions
                </Text>
              </Card>
            </Grid>
          </Grid.Container>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container css={{ maxWidth: '1200px', py: '$24', px: '$6', textAlign: 'center' }}>
        <Box css={{ maxWidth: '700px', margin: '0 auto' }}>
          <Text h2 css={{ fontSize: '$4xl', fontWeight: '700', mb: '$6', '@xsMax': { fontSize: '$2xl' } }}>
            Ready to Transform Your Construction Management?
          </Text>
          <Text size="$lg" css={{ color: '$accents8', mb: '$10', lineHeight: '1.6' }}>
            Join leading construction companies that trust JninaTech for their project management needs
          </Text>
          <Button
            size="lg"
            color="success"
            css={{ px: '$16', fontSize: '$lg' }}
            onClick={() => router.push('/signup')}
          >
            Get Started Today
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box css={{ borderTop: '1px solid $border', py: '$8' }}>
        <Container css={{ maxWidth: '1200px', px: '$6' }}>
          <Text size="$sm" css={{ color: '$accents7', textAlign: 'center' }}>
            © 2025 JninaTech. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
