import type {NextPage} from 'next';
import React, { useEffect, useState } from 'react';
import { offlineGet } from '../utils/apiClient';
import { Card, Grid, Text, Loading } from '@nextui-org/react';
import { Box } from '../components/styles/box';
import { getUserRole, getUserFromStorage } from '../utils/auth';

interface Stats {
  workSites: number;
  employees: number;
  vehicles: number;
  activeAssignments: number;
  lowStock: number;
  totalFuelCost: number;
  stockItems: number;
}

const Dashboard: NextPage = () => {
  const [stats, setStats] = useState<Stats>({
    workSites: 0,
    employees: 0,
    vehicles: 0,
    activeAssignments: 0,
    lowStock: 0,
    totalFuelCost: 0,
    stockItems: 0
  });
  const [loading, setLoading] = useState(true);
  const userRole = getUserRole();
  const user = getUserFromStorage();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch only the resources relevant to the current role to avoid 401/403
        if (userRole === 'manager') {
          const [chantiers, personnel, vehicules, assignments, stock] = await Promise.all([
            offlineGet('/chantier', 'chantier'),
            offlineGet('/personnel', 'personnel'),
            offlineGet('/vehicule', 'vehicule'),
            offlineGet('/daily-assignment', 'daily-assignment'),
            offlineGet('/stock', 'stock'),
          ]);

          const lowStockCount = stock.filter((item: any) => 
            item.minQuantity && item.quantity <= item.minQuantity
          ).length;

          const totalFuel = assignments.reduce((sum: number, assignment: any) => 
            sum + (assignment.totalFuelCost || 0), 0
          );

          setStats({
            workSites: chantiers.length,
            employees: personnel.length,
            vehicles: vehicules.length,
            activeAssignments: assignments.length,
            lowStock: lowStockCount,
            totalFuelCost: totalFuel,
            stockItems: stock.length
          });
        } else if (userRole === 'fournisseur') {
          // Suppliers see their stock and orders; for dashboard show stock count & low stock
          const [stock, assignments] = await Promise.all([
            offlineGet('/stock', 'stock'),
            offlineGet('/daily-assignment', 'daily-assignment').catch(() => []),
          ]);

          const lowStockCount = stock.filter((item: any) => 
            item.minQuantity && item.quantity <= item.minQuantity
          ).length;

          setStats((s) => ({ ...s, lowStock: lowStockCount, stockItems: stock.length }));
        } else if (userRole === 'personnel') {
          // Personnel only see their own assignments
          const myAssignments = await offlineGet('/daily-assignment/my-assignments', 'daily-assignment');
          
          // Get unique work sites from assignments
          const uniqueWorkSites = new Set(myAssignments.map((a: any) => a.chantier?._id || a.chantier).filter(Boolean));

          setStats((s) => ({
            ...s,
            workSites: uniqueWorkSites.size,
            activeAssignments: myAssignments.length,
          }));
        } else {
          // Fallback: attempt to fetch a minimal set
          const [chantiers, assignments] = await Promise.all([
            offlineGet('/chantier', 'chantier').catch(() => []),
            offlineGet('/daily-assignment', 'daily-assignment').catch(() => []),
          ]);
          setStats((s) => ({ ...s, workSites: chantiers.length, activeAssignments: assignments.length }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userRole]);

  if (loading) {
    return (
      <Box css={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh'
      }}>
        <Loading size="xl" />
      </Box>
    );
  }

  return (
    <Box css={{ p: '$6', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <Box css={{ mb: '$8' }}>
        <Text h2 css={{ fontSize: '$2xl', fontWeight: '700', mb: '$2' }}>
          {userRole === 'manager' ? 'Manager Dashboard' : 
           userRole === 'fournisseur' ? 'Supplier Dashboard' : 
           userRole === 'personnel' ? 'Worker Dashboard' : 'Dashboard'}
        </Text>
        <Text css={{ color: '$accents7' }}>
          {userRole === 'manager' ? 'Complete project overview and management' :
           userRole === 'fournisseur' ? 'Manage your stock and orders' :
           userRole === 'personnel' ? `Welcome ${user?.name}, view your assigned work sites` :
           'Project overview and statistics'}
        </Text>
      </Box>

      {/* Stats Grid - Role-based */}
      <Grid.Container gap={2}>
        {/* Manager sees all stats */}
        {userRole === 'manager' && (
          <>
            <Grid xs={6} sm={4} md={3}>
              <Card variant="bordered" css={{ w: '100%', p: '$6' }}>
                <Text css={{
                  fontSize: '$xs',
                  color: '$accents7',
                  mb: '$2',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  Work Sites
                </Text>
                <Text h3 css={{
                  fontSize: '$4xl',
                  fontWeight: '700',
                  color: '$green600',
                  mb: 0
                }}>
                  {stats.workSites}
                </Text>
              </Card>
            </Grid>

            <Grid xs={6} sm={4} md={3}>
              <Card variant="bordered" css={{ w: '100%', p: '$6' }}>
                <Text css={{
                  fontSize: '$xs',
                  color: '$accents7',
                  mb: '$2',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  Employees
                </Text>
                <Text h3 css={{
                  fontSize: '$4xl',
                  fontWeight: '700',
                  color: '$blue600',
                  mb: 0
                }}>
                  {stats.employees}
                </Text>
              </Card>
            </Grid>

            <Grid xs={6} sm={4} md={3}>
              <Card variant="bordered" css={{ w: '100%', p: '$6' }}>
                <Text css={{
                  fontSize: '$xs',
                  color: '$accents7',
                  mb: '$2',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  Vehicles
                </Text>
                <Text h3 css={{
                  fontSize: '$4xl',
                  fontWeight: '700',
                  color: '$purple600',
                  mb: 0
                }}>
                  {stats.vehicles}
                </Text>
              </Card>
            </Grid>

            <Grid xs={6} sm={4} md={3}>
              <Card variant="bordered" css={{ w: '100%', p: '$6' }}>
                <Text css={{
                  fontSize: '$xs',
                  color: '$accents7',
                  mb: '$2',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  Assignments
                </Text>
                <Text h3 css={{
                  fontSize: '$4xl',
                  fontWeight: '700',
                  color: '$cyan600',
                  mb: 0
                }}>
                  {stats.activeAssignments}
                </Text>
              </Card>
            </Grid>
          </>
        )}

        {/* Supplier sees stock and orders */}
        {userRole === 'fournisseur' && (
          <>
            <Grid xs={12} sm={6} md={4}>
              <Card variant="bordered" css={{ w: '100%', p: '$6' }}>
                <Text css={{
                  fontSize: '$xs',
                  color: '$accents7',
                  mb: '$2',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  My Stock Items
                </Text>
                <Text h3 css={{
                  fontSize: '$4xl',
                  fontWeight: '700',
                  color: '$green600',
                  mb: 0
                }}>
                  {stats.stockItems}
                </Text>
              </Card>
            </Grid>
          </>
        )}

        {/* Personnel sees assignments and work sites */}
        {userRole === 'personnel' && (
          <>
            <Grid xs={12} sm={6} md={4}>
              <Card variant="bordered" css={{ w: '100%', p: '$6' }}>
                <Text css={{
                  fontSize: '$xs',
                  color: '$accents7',
                  mb: '$2',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  My Assignments
                </Text>
                <Text h3 css={{
                  fontSize: '$4xl',
                  fontWeight: '700',
                  color: '$cyan600',
                  mb: 0
                }}>
                  {stats.activeAssignments}
                </Text>
              </Card>
            </Grid>

            <Grid xs={12} sm={6} md={4}>
              <Card variant="bordered" css={{ w: '100%', p: '$6' }}>
                <Text css={{
                  fontSize: '$xs',
                  color: '$accents7',
                  mb: '$2',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  Work Sites
                </Text>
                <Text h3 css={{
                  fontSize: '$4xl',
                  fontWeight: '700',
                  color: '$green600',
                  mb: 0
                }}>
                  {stats.workSites}
                </Text>
              </Card>
            </Grid>
          </>
        )}

        {/* Shared stats for all roles */}
        <Grid xs={6} sm={4} md={3}>
          <Card variant="bordered" css={{
            w: '100%',
            p: '$6',
            borderColor: stats.lowStock > 0 ? '$error' : '$border'
          }}>
            <Text css={{
              fontSize: '$xs',
              color: '$accents7',
              mb: '$2',
              textTransform: 'uppercase',
              fontWeight: '600'
            }}>
              Low Stock
            </Text>
            <Text h3 css={{
              fontSize: '$4xl',
              fontWeight: '700',
              color: stats.lowStock > 0 ? '$error' : '$success',
              mb: 0
            }}>
              {stats.lowStock}
            </Text>
          </Card>
        </Grid>

        <Grid xs={6} sm={4} md={3}>
          <Card variant="bordered" css={{ w: '100%', p: '$6' }}>
            <Text css={{
              fontSize: '$xs',
              color: '$accents7',
              mb: '$2',
              textTransform: 'uppercase',
              fontWeight: '600'
            }}>
              Stock Items
            </Text>
            <Text h3 css={{
              fontSize: '$4xl',
              fontWeight: '700',
              color: '$orange600',
              mb: 0
            }}>
              {stats.stockItems}
            </Text>
          </Card>
        </Grid>

        <Grid xs={12} sm={8} md={6}>
          <Card variant="bordered" css={{
            w: '100%',
            p: '$6',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
          }}>
            <Text css={{
              fontSize: '$xs',
              color: 'rgba(255,255,255,0.8)',
              mb: '$2',
              textTransform: 'uppercase',
              fontWeight: '600'
            }}>
              Total Fuel Cost
            </Text>
            <Text h3 css={{
              fontSize: '$4xl',
              fontWeight: '700',
              color: 'white',
              mb: 0
            }}>
              {stats.totalFuelCost.toFixed(2)} TND
            </Text>
          </Card>
        </Grid>
      </Grid.Container>
    </Box>
  );
};

export default Dashboard;