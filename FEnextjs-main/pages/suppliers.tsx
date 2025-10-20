import React, { useEffect, useState } from 'react';
import { offlineGet, apiPost, apiPatch, apiDelete } from '../utils/apiClient';
import { Suppliers } from '../components/suppliers/suppliers';
import { Loading, Text } from '@nextui-org/react';
import { Box } from '../components/styles/box';

export interface SupplierData {
  _id?: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  category?: string;
  note?: string;
}

const API_ENDPOINT = '/fournisseur';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await offlineGet<SupplierData>(API_ENDPOINT, 'fournisseur');
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError('Failed to load suppliers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddSupplier = async (data: SupplierData) => {
    try {
      const response = await apiPost<SupplierData>(API_ENDPOINT, data, 'fournisseur');
      setSuppliers(prev => [...prev, response]);
      return { success: true, message: 'Supplier added successfully!' };
    } catch (error: any) {
      console.error('Error adding supplier:', error);
      const isQueued = error.message?.includes('queued');
      return { 
        success: isQueued, 
        message: isQueued ? '📝 Supplier will be added when online' : (error.message || 'Failed to add supplier')
      };
    }
  };

  const handleEditSupplier = async (data: SupplierData) => {
    if (!data._id) return { success: false, message: 'Invalid supplier ID' };
    
    try {
      const response = await apiPatch<SupplierData>(`${API_ENDPOINT}/${data._id}`, data, 'fournisseur');
      setSuppliers(prev => prev.map(s => (s._id === data._id ? response : s)));
      return { success: true, message: 'Supplier updated successfully!' };
    } catch (error: any) {
      console.error('Error editing supplier:', error);
      const isQueued = error.message?.includes('queued');
      return { 
        success: isQueued, 
        message: isQueued ? '📝 Changes will be saved when online' : (error.message || 'Failed to update supplier')
      };
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      await apiDelete(`${API_ENDPOINT}/${id}`, 'fournisseur');
      setSuppliers(prev => prev.filter(s => s._id !== id));
      return { success: true, message: 'Supplier deleted successfully!' };
    } catch (error: any) {
      console.error('Error deleting supplier:', error);
      const isQueued = error.message?.includes('queued');
      return { 
        success: isQueued, 
        message: isQueued ? '📝 Will be deleted when online' : (error.message || 'Failed to delete supplier')
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
        <button onClick={fetchSuppliers}>Retry</button>
      </Box>
    );
  }

  return (
    <Suppliers
      suppliers={suppliers}
      onAdd={handleAddSupplier}
      onEdit={handleEditSupplier}
      onDelete={handleDeleteSupplier}
      onRefresh={fetchSuppliers}
    />
  );
};

export default SuppliersPage;
