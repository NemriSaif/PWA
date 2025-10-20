import React, { useEffect, useState } from 'react';
import { offlineGet } from '../utils/apiClient';
import { FuelCosts } from '../components/fuel-coast';
import { Loading, Text } from '@nextui-org/react';
import { Box } from '../components/styles/box';

interface FuelCostEntry {
  id: string;
  assignmentId: string;
  date: string;
  chantier: string;
  description: string;
  amount: number;
  paymentMethod: string;
  notes: string;
}

const FuelCostsPage = () => {
  const [fuelCosts, setFuelCosts] = useState<FuelCostEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFuelCosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all daily assignments using offline-aware API
      const assignments = await offlineGet('/daily-assignment', 'daily-assignment');

      // Extract all fuel costs from assignments
      const allFuelCosts: FuelCostEntry[] = [];
      assignments.forEach((assignment: any) => {
        if (assignment.fuelCosts && assignment.fuelCosts.length > 0) {
          assignment.fuelCosts.forEach((fuelCost: any, index: number) => {
            allFuelCosts.push({
              id: `${assignment._id}-${index}`,
              assignmentId: assignment._id,
              date: assignment.date,
              chantier: assignment.chantier?.name || assignment.chantier,
              description: fuelCost.description,
              amount: fuelCost.amount,
              paymentMethod: fuelCost.paymentMethod,
              notes: fuelCost.notes || '',
            });
          });
        }
      });

      setFuelCosts(allFuelCosts);
    } catch (error: any) {
      console.error('Error fetching fuel costs:', error);
      setError('Failed to load fuel costs. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelCosts();
  }, []);

  if (loading) {
    return (
      <Box css={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Loading size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box css={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '$8'
      }}>
        <Text h4 color="error">{error}</Text>
        <button onClick={fetchFuelCosts}>Retry</button>
      </Box>
    );
  }

  return <FuelCosts fuelCosts={fuelCosts} onRefresh={fetchFuelCosts} />;
};

export default FuelCostsPage;