import React, { useEffect, useState } from 'react';
import { offlineGet, apiPost, apiPatch, apiDelete } from '../utils/apiClient';
import { Employees } from '../components/employees/employees';
import { Loading, Text } from '@nextui-org/react';
import { Box } from '../components/styles/box';

export interface PersonnelData {
  _id?: string;
  name: string;
  role?: string;
  phone?: string;
  cin?: string;
  salary?: number;
  isPayed?: boolean;
  chantier?: string;
  createdAt?: string;
  updatedAt?: string;
}

const API_ENDPOINT = '/personnel';

const EmployeesPage = () => {
  const [personnel, setPersonnel] = useState<PersonnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await offlineGet<PersonnelData>(API_ENDPOINT, 'personnel');
      setPersonnel(data);
    } catch (error) {
      console.error('Error fetching personnel:', error);
      setError('Failed to load personnel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const handleAddPersonnel = async (data: PersonnelData) => {
    try {
      const response = await apiPost<PersonnelData>(API_ENDPOINT, data);
      setPersonnel(prev => [...prev, response]);
      return { success: true, message: 'Personnel added successfully!' };
    } catch (error: any) {
      console.error('Error adding personnel:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to add personnel' 
      };
    }
  };

  const handleEditPersonnel = async (data: PersonnelData) => {
    if (!data._id) return { success: false, message: 'Invalid personnel ID' };
    
    try {
      const response = await apiPatch<PersonnelData>(`${API_ENDPOINT}/${data._id}`, data);
      setPersonnel(prev => prev.map(p => (p._id === data._id ? response : p)));
      return { success: true, message: 'Personnel updated successfully!' };
    } catch (error: any) {
      console.error('Error editing personnel:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to update personnel' 
      };
    }
  };

  const handleDeletePersonnel = async (id: string) => {
    try {
      await apiDelete(`${API_ENDPOINT}/${id}`);
      setPersonnel(prev => prev.filter(p => p._id !== id));
      return { success: true, message: 'Personnel deleted successfully!' };
    } catch (error: any) {
      console.error('Error deleting personnel:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to delete personnel' 
      };
    }
  };

  const handleTogglePayment = async (id: string, isPayed: boolean) => {
    try {
      const response = await apiPatch<PersonnelData>(`${API_ENDPOINT}/${id}`, { isPayed });
      setPersonnel(prev => prev.map(p => (p._id === id ? response : p)));
      return { success: true, message: 'Payment status updated!' };
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to update payment status' 
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
        <button onClick={fetchPersonnel}>Retry</button>
      </Box>
    );
  }

  return (
    <Employees
      personnel={personnel}
      onAdd={handleAddPersonnel}
      onEdit={handleEditPersonnel}
      onDelete={handleDeletePersonnel}
      onTogglePayment={handleTogglePayment}
      onRefresh={fetchPersonnel}
    />
  );
};

export default EmployeesPage;