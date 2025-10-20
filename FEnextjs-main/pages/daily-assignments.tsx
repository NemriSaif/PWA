import React, { useEffect, useState } from 'react';
import { offlineGet, apiPost, apiPatch, apiDelete } from '../utils/apiClient';
import { DailyAssignments } from '../components/daily-assignments/daily-assignments';
import { Loading, Text } from '@nextui-org/react';
import { Box } from '../components/styles/box';

export interface PersonnelData {
  _id: string;
  name: string;
  role?: string;
  salary?: number;
}

export interface VehiculeData {
  _id: string;
  name: string;
  type?: string;
  plateNumber?: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [assignmentsData, personnelData, vehiculesData, chantiersData] = await Promise.all([
        offlineGet<DailyAssignmentData>('/daily-assignment', 'daily-assignment'),
        offlineGet<PersonnelData>('/personnel', 'personnel'),
        offlineGet<VehiculeData>('/vehicule', 'vehicule'),
        offlineGet<ChantierData>('/chantier', 'chantier'),
      ]);

      setAssignments(assignmentsData);
      setPersonnel(personnelData);
      setVehicules(vehiculesData);
      setChantiers(chantiersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAddAssignment = async (data: DailyAssignmentData) => {
    try {
      const response = await apiPost<DailyAssignmentData>('/daily-assignment', data, 'daily-assignment');
      setAssignments(prev => [response, ...prev]);
      return { success: true, message: 'Assignment created successfully!' };
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      const isQueued = error.message?.includes('queued');
      return {
        success: isQueued,
        message: isQueued ? '📝 Assignment will be created when online' : (error.message || 'Failed to create assignment')
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
      onAdd={handleAddAssignment}
      onEdit={handleEditAssignment}
      onDelete={handleDeleteAssignment}
      onMarkPaid={handleMarkPersonnelPaid}
      onRefresh={fetchAll}
    />
  );
};

export default DailyAssignmentsPage;