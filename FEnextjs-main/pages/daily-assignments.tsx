import React, { useEffect, useState } from 'react';
import { offlineGet, apiPost, apiPatch, apiDelete } from '../utils/apiClient';
import { DailyAssignments } from '../components/daily-assignments/daily-assignments';
import { Loading, Text } from '@nextui-org/react';
import { Box } from '../components/styles/box';
import { getUserRole } from '../utils/auth';
import { StockData } from './stock';

export interface PersonnelData {
  _id: string;
  name: string;
  role?: string;
  salary?: number;
}

export interface VehiculeData {
  _id: string;
  marque: string;           // Brand (e.g., "Mercedes")
  modele: string;           // Model (e.g., "Actros")
  type?: string;            // Type (e.g., "Dump Truck")
  immatriculation?: string; // Registration/Plate number (e.g., "TUN-1234")
}

export interface ChantierData {
  _id: string;
  name: string;
  location: string;
}

export interface PersonnelAssignment {
  personnel: string | PersonnelData;
  isPayed: boolean;
  salary: number;
  notes?: string;
}

export interface VehiculeAssignment {
  vehicule: string | VehiculeData;
  notes?: string;
}

export interface FuelCost {
  description: string;
  amount: number;
  vehicule?: string | VehiculeData; // Link to vehicle
  paymentMethod: 'cash' | 'credit_card' | 'check' | 'other';
  notes?: string;
}

export interface DailyAssignmentData {
  _id?: string;
  date: string;
  chantier: string | ChantierData;
  personnelAssignments: PersonnelAssignment[];
  vehiculeAssignments: VehiculeAssignment[];
  fuelCosts: FuelCost[];
  totalPersonnelCost?: number;
  totalFuelCost?: number;
  totalCost?: number;
  notes?: string;
}

const DailyAssignmentsPage = () => {
  const [assignments, setAssignments] = useState<DailyAssignmentData[]>([]);
  const [personnel, setPersonnel] = useState<PersonnelData[]>([]);
  const [vehicules, setVehicules] = useState<VehiculeData[]>([]);
  const [chantiers, setChantiers] = useState<ChantierData[]>([]);
  const [stock, setStock] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userRole = getUserRole();
  const isPersonnel = userRole === 'personnel';

  console.log('👤 Current user role:', userRole);
  console.log('📦 Stock items loaded:', stock.length);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (isPersonnel) {
        // Personnel only see their own assignments
        const assignmentsData = await offlineGet<DailyAssignmentData>('/daily-assignment/my-assignments', 'daily-assignment');
        setAssignments(assignmentsData);
        // No need to fetch personnel/vehicules/chantiers for read-only view
      } else {
        // Managers see all assignments and resources
        const [assignmentsData, personnelData, vehiculesData, chantiersData, stockData] = await Promise.all([
          offlineGet<DailyAssignmentData>('/daily-assignment', 'daily-assignment'),
          offlineGet<PersonnelData>('/personnel', 'personnel'),
          offlineGet<VehiculeData>('/vehicule', 'vehicule'),
          offlineGet<ChantierData>('/chantier', 'chantier'),
          offlineGet<StockData>('/stock', 'stock'),
        ]);

        setAssignments(assignmentsData);
        setPersonnel(personnelData);
        setVehicules(vehiculesData);
        setChantiers(chantiersData);
        setStock(stockData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddAssignment = async (data: DailyAssignmentData & { stockUsage?: any[] }) => {
    try {
      console.log('🔍 Creating assignment with data:', data);
      console.log('📦 Stock usage:', data.stockUsage);
      
      // Update stock quantities if stockUsage is provided
      if (data.stockUsage && data.stockUsage.length > 0) {
        console.log('🔄 Processing stock consumption...');
        for (const usage of data.stockUsage) {
          const stockItem = stock.find(s => s._id === usage.stockId);
          console.log(`📦 Consuming stock: ${stockItem?.name}, Quantity: ${usage.quantityUsed}`);
          if (stockItem) {
            try {
              // Use the new consume endpoint instead of PATCH
              const updatedStock = await apiPost<StockData>(
                `/stock/${usage.stockId}/consume`, 
                { quantityUsed: usage.quantityUsed },
                'stock'
              );
              console.log('✅ Stock consumed successfully:', updatedStock);
              // Update local stock state
              setStock(prev => prev.map(s => 
                s._id === usage.stockId ? updatedStock : s
              ));
            } catch (stockError: any) {
              console.error('❌ Error consuming stock:', stockError);
              console.error('📄 Stock error details:', stockError.response?.data);
              throw new Error(`Failed to consume stock: ${stockError.response?.data?.message || stockError.message}`);
            }
          }
        }
      }
      
      // Remove stockUsage from the data before sending to backend
      const { stockUsage, ...assignmentData } = data;
      console.log('📝 Creating assignment without stockUsage field...');
      const response = await apiPost<DailyAssignmentData>('/daily-assignment', assignmentData, 'daily-assignment');
      console.log('✅ Assignment created successfully:', response);
      setAssignments(prev => [response, ...prev]);
      return { success: true, message: 'Assignment created successfully!' };
    } catch (error: any) {
      console.error('❌ Error creating assignment:', error);
      console.error('📄 Full error:', error);
      console.error('📄 Error response:', error.response?.data);
      const isQueued = error.message?.includes('queued');
      return {
        success: isQueued,
        message: isQueued ? '📝 Assignment will be created when online' : (error.response?.data?.message || error.message || 'Failed to create assignment')
      };
    }
  };

  const handleEditAssignment = async (data: DailyAssignmentData) => {
    if (!data._id) return { success: false, message: 'Invalid assignment ID' };

    try {
      const response = await apiPatch<DailyAssignmentData>(
        `/daily-assignment/${data._id}`,
        data,
        'daily-assignment'
      );
      setAssignments(prev => prev.map(a => (a._id === data._id ? response : a)));
      return { success: true, message: 'Assignment updated successfully!' };
    } catch (error: any) {
      console.error('Error updating assignment:', error);
      const isQueued = error.message?.includes('queued');
      return {
        success: isQueued,
        message: isQueued ? '📝 Changes will be saved when online' : (error.message || 'Failed to update assignment')
      };
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await apiDelete(`/daily-assignment/${id}`, 'daily-assignment');
      setAssignments(prev => prev.filter(a => a._id !== id));
      return { success: true, message: 'Assignment deleted successfully!' };
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      const isQueued = error.message?.includes('queued');
      return {
        success: isQueued,
        message: isQueued ? '📝 Will be deleted when online' : (error.message || 'Failed to delete assignment')
      };
    }
  };

  const handleMarkPersonnelPaid = async (assignmentId: string, personnelId: string) => {
    try {
      const response = await apiPatch<DailyAssignmentData>(
        `/daily-assignment/${assignmentId}/personnel/${personnelId}/pay`,
        {},
        'daily-assignment'
      );
      setAssignments(prev => prev.map(a => (a._id === assignmentId ? response : a)));
      return { success: true, message: 'Personnel marked as paid!' };
    } catch (error: any) {
      console.error('Error marking as paid:', error);
      const isQueued = error.message?.includes('queued');
      return {
        success: isQueued,
        message: isQueued ? '📝 Will update when online' : (error.message || 'Failed to mark as paid')
      };
    }
  };

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
        <button onClick={fetchAll}>Retry</button>
      </Box>
    );
  }

  return (
    <DailyAssignments
      assignments={assignments}
      personnel={personnel}
      vehicules={vehicules}
      chantiers={chantiers}
      stock={stock}
      onAdd={handleAddAssignment}
      onEdit={handleEditAssignment}
      onDelete={handleDeleteAssignment}
      onMarkPaid={handleMarkPersonnelPaid}
      onRefresh={fetchAll}
      readOnly={isPersonnel}
    />
  );
};

export default DailyAssignmentsPage;