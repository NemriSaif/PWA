import type {NextPage} from 'next';
import React, { useEffect, useState } from 'react';
import { offlineGet } from '../utils/apiClient';
import { Card, Grid, Text, Button, Badge, Loading, Progress } from '@nextui-org/react';
import { Box } from '../components/styles/box';
import { useRouter } from 'next/router';

const Home: NextPage = () => {
   const router = useRouter();
   const [stats, setStats] = useState({
      workSites: 0,
      employees: 0,
      vehicles: 0,
      activeAssignments: 0,
      lowStock: 0,
      suppliers: 0,
      totalFuelCost: 0,
      stockItems: 0,
   });
   const [loading, setLoading] = useState(true);
   const [fuelByChantier, setFuelByChantier] = useState<any[]>([]);
   const [stockLevels, setStockLevels] = useState<any[]>([]);

   useEffect(() => {
      const fetchStats = async () => {
         try {
            const [chantiers, personnel, vehicules, assignments, stock, fournisseurs] = await Promise.all([
               offlineGet('/chantier', 'chantier'),
               offlineGet('/personnel', 'personnel'),
               offlineGet('/vehicule', 'vehicule'),
               offlineGet('/daily-assignment', 'daily-assignment'),
               offlineGet('/stock', 'stock'),
               offlineGet('/fournisseur', 'fournisseur'),
            ]);

            const lowStockCount = stock.filter((item: any) => 
               item.minQuantity && item.quantity <= item.minQuantity
            ).length;

            // Calculate total fuel cost
            const totalFuel = assignments.reduce((sum: number, assignment: any) => {
               return sum + (assignment.totalFuelCost || 0);
            }, 0);

            // Fuel by chantier
            const fuelMap = new Map();
            assignments.forEach((assignment: any) => {
               const chantierName = assignment.chantier?.name || 'Unknown';
               const currentCost = fuelMap.get(chantierName) || 0;
               fuelMap.set(chantierName, currentCost + (assignment.totalFuelCost || 0));
            });
            const fuelData = Array.from(fuelMap.entries()).map(([name, cost]) => ({ name, cost }));

            // Stock levels (top 5 critical items)
            const criticalStock = stock
               .filter((item: any) => item.minQuantity)
               .map((item: any) => ({
                  name: item.name,
                  current: item.quantity,
                  min: item.minQuantity,
                  percentage: Math.min(100, (item.quantity / item.minQuantity) * 100),
                  status: item.quantity <= item.minQuantity ? 'low' : 'ok'
               }))
               .sort((a: any, b: any) => a.percentage - b.percentage)
               .slice(0, 5);

            setStats({
               workSites: chantiers.length,
               employees: personnel.length,
               vehicles: vehicules.length,
               activeAssignments: assignments.length,
               lowStock: lowStockCount,
               suppliers: fournisseurs.length,
               totalFuelCost: totalFuel,
               stockItems: stock.length,
            });
            setFuelByChantier(fuelData);
            setStockLevels(criticalStock);
         } catch (error) {
            console.error('Error fetching stats:', error);
         } finally {
            setLoading(false);
         }
      };

      fetchStats();
   }, []);

   if (loading) {
      return (
         <Box css={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Loading size="xl" />
         </Box>
      );
   }

   return (
      <Box css={{ px: '$12', py: '$8', '@xsMax': { px: '$6' } }}>
         {/* Header */}
         <Box css={{ mb: '$10' }}>
            <Text
               h1
               css={{
                  fontSize: '$3xl',
                  fontWeight: '$bold',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: '$4',
               }}
            >
               🌳 Welcome to JninaTech
            </Text>
            <Text size="$lg" color="$gray600">
               Construction Management Dashboard
            </Text>
         </Box>

         {/* Stats Grid */}
         <Grid.Container gap={2} justify="flex-start">
            <Grid xs={12} sm={6} md={4}>
               <Card 
                  isPressable 
                  isHoverable 
                  variant="bordered"
                  onClick={() => router.push('/work-sites')}
                  css={{ w: '100%', p: '$10', borderColor: '$green600' }}
               >
                  <Card.Body css={{ p: 0 }}>
                     <Text css={{ color: '$green700', fontSize: '$sm', mb: '$2' }}>
                        🏗️ Work Sites
                     </Text>
                     <Text h2 css={{ m: 0, fontSize: '$4xl', fontWeight: '$bold', color: '$green600' }}>
                        {stats.workSites}
                     </Text>
                     <Text css={{ color: '$accents6', fontSize: '$xs', mt: '$4' }}>
                        Active construction sites
                     </Text>
                  </Card.Body>
               </Card>
            </Grid>

            <Grid xs={12} sm={6} md={4}>
               <Card 
                  isPressable 
                  isHoverable 
                  variant="bordered"
                  onClick={() => router.push('/employees')}
                  css={{ w: '100%', p: '$10' }}
               >
                  <Card.Body css={{ p: 0 }}>
                     <Text css={{ color: '$accents7', fontSize: '$sm', mb: '$2' }}>
                        👷 Employees
                     </Text>
                     <Text h2 css={{ m: 0, fontSize: '$4xl', fontWeight: '$bold' }}>
                        {stats.employees}
                     </Text>
                     <Text css={{ color: '$accents6', fontSize: '$xs', mt: '$4' }}>
                        Total workforce
                     </Text>
                  </Card.Body>
               </Card>
            </Grid>

            <Grid xs={12} sm={6} md={4}>
               <Card 
                  isPressable 
                  isHoverable 
                  variant="bordered"
                  onClick={() => router.push('/vehicles')}
                  css={{ w: '100%', p: '$10' }}
               >
                  <Card.Body css={{ p: 0 }}>
                     <Text css={{ color: '$accents7', fontSize: '$sm', mb: '$2' }}>
                        🚗 Vehicles
                     </Text>
                     <Text h2 css={{ m: 0, fontSize: '$4xl', fontWeight: '$bold' }}>
                        {stats.vehicles}
                     </Text>
                     <Text css={{ color: '$accents6', fontSize: '$xs', mt: '$4' }}>
                        Fleet size
                     </Text>
                  </Card.Body>
               </Card>
            </Grid>

            <Grid xs={12} sm={6} md={4}>
               <Card 
                  isPressable 
                  isHoverable 
                  variant="bordered"
                  onClick={() => router.push('/daily-assignments')}
                  css={{ w: '100%', p: '$10' }}
               >
                  <Card.Body css={{ p: 0 }}>
                     <Text css={{ color: '$accents7', fontSize: '$sm', mb: '$2' }}>
                        📋 Daily Assignments
                     </Text>
                     <Text h2 css={{ m: 0, fontSize: '$4xl', fontWeight: '$bold' }}>
                        {stats.activeAssignments}
                     </Text>
                     <Text css={{ color: '$accents6', fontSize: '$xs', mt: '$4' }}>
                        Total assignments
                     </Text>
                  </Card.Body>
               </Card>
            </Grid>

            <Grid xs={12} sm={6} md={4}>
               <Card 
                  isPressable 
                  isHoverable 
                  variant="bordered"
                  onClick={() => router.push('/stock')}
                  css={{ w: '100%', p: '$10', borderColor: stats.lowStock > 0 ? '$error' : '$border' }}
               >
                  <Card.Body css={{ p: 0 }}>
                     <Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '$2' }}>
                        <Text css={{ color: '$accents7', fontSize: '$sm' }}>
                           ⚠️ Low Stock Items
                        </Text>
                        {stats.lowStock > 0 && (
                           <Badge color="error" size="sm">{stats.lowStock}</Badge>
                        )}
                     </Box>
                     <Text h2 css={{ m: 0, fontSize: '$4xl', fontWeight: '$bold', color: stats.lowStock > 0 ? '$error' : '$green600' }}>
                        {stats.lowStock}
                     </Text>
                     <Text css={{ color: '$accents6', fontSize: '$xs', mt: '$4' }}>
                        {stats.lowStock > 0 ? 'Needs restocking' : 'All stock levels OK'}
                     </Text>
                  </Card.Body>
               </Card>
            </Grid>

            <Grid xs={12} sm={6} md={4}>
               <Card 
                  isPressable 
                  isHoverable 
                  variant="bordered"
                  onClick={() => router.push('/fuel-costs')}
                  css={{ w: '100%', p: '$10', borderColor: '$green600' }}
               >
                  <Card.Body css={{ p: 0 }}>
                     <Text css={{ color: '$green700', fontSize: '$sm', mb: '$2' }}>
                        ⛽ Total Fuel Costs
                     </Text>
                     <Text h2 css={{ m: 0, fontSize: '$4xl', fontWeight: '$bold', color: '$green600' }}>
                        {stats.totalFuelCost.toFixed(0)}
                     </Text>
                     <Text css={{ color: '$accents6', fontSize: '$xs', mt: '$4' }}>
                        TND spent on fuel
                     </Text>
                  </Card.Body>
               </Card>
            </Grid>
         </Grid.Container>

         {/* Reports Section */}
         <Box css={{ mt: '$12' }}>
            <Text h3 css={{ mb: '$6', color: '$green700' }}>📊 Dashboard Reports</Text>
            <Grid.Container gap={2}>
               {/* Fuel Usage by Chantier */}
               <Grid xs={12} md={6}>
                  <Card variant="bordered" css={{ w: '100%', p: '$10' }}>
                     <Card.Header>
                        <Text b size="$lg">⛽ Fuel Usage per Work Site</Text>
                     </Card.Header>
                     <Card.Body css={{ py: '$6' }}>
                        {fuelByChantier.length === 0 ? (
                           <Text color="$accents7">No fuel data available</Text>
                        ) : (
                           <Box css={{ display: 'flex', flexDirection: 'column', gap: '$6' }}>
                              {fuelByChantier.map((item, index) => (
                                 <Box key={index}>
                                    <Box css={{ display: 'flex', justifyContent: 'space-between', mb: '$2' }}>
                                       <Text size="$sm" b>{item.name}</Text>
                                       <Text size="$sm" color="$green600" b>{item.cost.toFixed(2)} TND</Text>
                                    </Box>
                                    <Progress
                                       value={(item.cost / Math.max(...fuelByChantier.map(f => f.cost))) * 100}
                                       color="success"
                                       size="sm"
                                    />
                                 </Box>
                              ))}
                           </Box>
                        )}
                     </Card.Body>
                  </Card>
               </Grid>

               {/* Stock Levels */}
               <Grid xs={12} md={6}>
                  <Card variant="bordered" css={{ w: '100%', p: '$10' }}>
                     <Card.Header>
                        <Text b size="$lg">📦 Current Stock Levels</Text>
                     </Card.Header>
                     <Card.Body css={{ py: '$6' }}>
                        {stockLevels.length === 0 ? (
                           <Text color="$accents7">No stock data available</Text>
                        ) : (
                           <Box css={{ display: 'flex', flexDirection: 'column', gap: '$6' }}>
                              {stockLevels.map((item, index) => (
                                 <Box key={index}>
                                    <Box css={{ display: 'flex', justifyContent: 'space-between', mb: '$2' }}>
                                       <Text size="$sm" b>{item.name}</Text>
                                       <Text size="$sm" color={item.status === 'low' ? '$error' : '$green600'} b>
                                          {item.current} / {item.min}
                                       </Text>
                                    </Box>
                                    <Progress
                                       value={item.percentage}
                                       color={item.status === 'low' ? 'error' : 'success'}
                                       size="sm"
                                    />
                                 </Box>
                              ))}
                           </Box>
                        )}
                     </Card.Body>
                  </Card>
               </Grid>

               {/* Project Summary */}
               <Grid xs={12}>
                  <Card variant="bordered" css={{ w: '100%', p: '$10', borderColor: '$green600' }}>
                     <Card.Header>
                        <Text b size="$lg">📈 Project Summary</Text>
                     </Card.Header>
                     <Card.Body>
                        <Grid.Container gap={2}>
                           <Grid xs={12} sm={4}>
                              <Box css={{ textAlign: 'center', py: '$8' }}>
                                 <Text h2 css={{ color: '$green600', mb: '$2' }}>{stats.workSites}</Text>
                                 <Text size="$sm" color="$accents7">Active Projects</Text>
                              </Box>
                           </Grid>
                           <Grid xs={12} sm={4}>
                              <Box css={{ textAlign: 'center', py: '$8' }}>
                                 <Text h2 css={{ color: '$blue600', mb: '$2' }}>{stats.stockItems}</Text>
                                 <Text size="$sm" color="$accents7">Total Stock Items</Text>
                              </Box>
                           </Grid>
                           <Grid xs={12} sm={4}>
                              <Box css={{ textAlign: 'center', py: '$8' }}>
                                 <Text h2 css={{ color: '$purple600', mb: '$2' }}>{stats.suppliers}</Text>
                                 <Text size="$sm" color="$accents7">Active Suppliers</Text>
                              </Box>
                           </Grid>
                        </Grid.Container>
                     </Card.Body>
                  </Card>
               </Grid>
            </Grid.Container>
         </Box>

         {/* Quick Actions */}
         <Box css={{ mt: '$12' }}>
            <Text h3 css={{ mb: '$6', color: '$green700' }}>🚀 Quick Actions</Text>
            <Grid.Container gap={2}>
               <Grid xs={12} sm={6} md={3}>
                  <Button
                     auto
                     css={{ w: '100%', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
                     onClick={() => router.push('/daily-assignments')}
                  >
                     Create Assignment
                  </Button>
               </Grid>
               <Grid xs={12} sm={6} md={3}>
                  <Button
                     auto
                     css={{ w: '100%' }}
                     color="success"
                     flat
                     onClick={() => router.push('/work-sites')}
                  >
                     Manage Work Sites
                  </Button>
               </Grid>
               <Grid xs={12} sm={6} md={3}>
                  <Button
                     auto
                     css={{ w: '100%' }}
                     bordered
                     color="success"
                     onClick={() => router.push('/stock')}
                  >
                     Check Inventory
                  </Button>
               </Grid>
               <Grid xs={12} sm={6} md={3}>
                  <Button
                     auto
                     css={{ w: '100%' }}
                     flat
                     onClick={() => router.push('/fuel-costs')}
                  >
                     View Fuel Costs
                  </Button>
               </Grid>
            </Grid.Container>
         </Box>
      </Box>
   );
};

export default Home;
