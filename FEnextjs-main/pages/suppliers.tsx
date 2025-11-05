import React, { useEffect, useState } from 'react';
import { Suppliers } from '../components/suppliers/suppliers';
import { Loading, Text } from '@nextui-org/react';
import { Box } from '../components/styles/box';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface SupplierData {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
}

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch users with role=fournisseur
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          role: 'fournisseur'
        }
      });
      
      setSuppliers(response.data);
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
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        ...data,
        role: 'fournisseur',
        password: 'defaultPassword123' // You should prompt for password
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuppliers(prev => [...prev, response.data.user]);
      return { success: true, message: 'Supplier added successfully!' };
    } catch (error: any) {
      console.error('Error adding supplier:', error);
      const isQueued = error.message?.includes('queued');
      return { 
        success: false, 
        message: error.message || 'Failed to add supplier'
      };
    }
  };

  const handleEditSupplier = async (data: SupplierData) => {
    if (!data._id) return { success: false, message: 'Invalid supplier ID' };
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${API_BASE_URL}/auth/users/${data._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuppliers(prev => prev.map(s => (s._id === data._id ? response.data : s)));
      return { success: true, message: 'Supplier updated successfully!' };
    } catch (error: any) {
      console.error('Error editing supplier:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to update supplier'
      };
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/auth/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuppliers(prev => prev.filter(s => s._id !== id));
      return { success: true, message: 'Supplier deleted successfully!' };
    } catch (error: any) {
      console.error('Error deleting supplier:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to delete supplier'
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
