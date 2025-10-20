import React, { useEffect, useState } from 'react';
import { offlineGet, apiPost, apiPatch, apiDelete } from '../utils/apiClient';
import { StockList } from '../components/stock/stock-list';
import { Loading, Text } from '@nextui-org/react';
import { Box } from '../components/styles/box';

export interface StockData {
  _id?: string;
  name: string;
  quantity: number;
  unit?: string;
  category?: string;
  fournisseur?: any;
  chantier?: any;
  minQuantity?: number;
  note?: string;
}

const API_ENDPOINT = '/stock';

const StockPage = () => {
  const [stock, setStock] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await offlineGet<StockData>(API_ENDPOINT, 'stock');
      setStock(data);
    } catch (error) {
      console.error('Error fetching stock:', error);
      setError('Failed to load stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleAddStock = async (data: StockData) => {
    try {
      const response = await apiPost<StockData>(API_ENDPOINT, data, 'stock');
      setStock(prev => [...prev, response]);
      return { success: true, message: 'Stock added successfully!' };
    } catch (error: any) {
      console.error('Error adding stock:', error);
      const isQueued = error.message?.includes('queued');
      return { 
        success: isQueued, 
        message: isQueued ? '📝 Stock will be added when online' : (error.response?.data?.message || error.message || 'Failed to add stock')
      };
    }
  };

  const handleEditStock = async (data: StockData) => {
    if (!data._id) return { success: false, message: 'Invalid stock ID' };
    
    try {
      const response = await apiPatch<StockData>(`${API_ENDPOINT}/${data._id}`, data, 'stock');
      setStock(prev => prev.map(s => (s._id === data._id ? response : s)));
      return { success: true, message: 'Stock updated successfully!' };
    } catch (error: any) {
      console.error('Error editing stock:', error);
      const isQueued = error.message?.includes('queued');
      return { 
        success: isQueued, 
        message: isQueued ? '📝 Changes will be saved when online' : (error.message || 'Failed to update stock')
      };
    }
  };

  const handleDeleteStock = async (id: string) => {
    try {
      await apiDelete(`${API_ENDPOINT}/${id}`, 'stock');
      setStock(prev => prev.filter(s => s._id !== id));
      return { success: true, message: 'Stock deleted successfully!' };
    } catch (error: any) {
      console.error('Error deleting stock:', error);
      const isQueued = error.message?.includes('queued');
      return { 
        success: isQueued, 
        message: isQueued ? '📝 Will be deleted when online' : (error.message || 'Failed to delete stock')
      };
    }
  };

  const handleTopUp = async (stockId: string, quantity: number) => {
    try {
      // Find the current stock item
      const currentStock = stock.find(s => s._id === stockId);
      if (!currentStock) {
        return { success: false, message: 'Stock item not found' };
      }

      // Update with new quantity (add to existing)
      const newQuantity = currentStock.quantity + quantity;
      const response = await apiPatch<StockData>(`${API_ENDPOINT}/${stockId}`, {
        quantity: newQuantity
      }, 'stock');

      // Update local state
      setStock(prev => prev.map(s => (s._id === stockId ? response : s)));
      
      return { 
        success: true, 
        message: `Successfully added ${quantity} ${currentStock.unit}. New total: ${newQuantity}` 
      };
    } catch (error: any) {
      console.error('Error topping up stock:', error);
      const isQueued = error.message?.includes('queued');
      return { 
        success: isQueued, 
        message: isQueued ? '📝 Top-up will be saved when online' : (error.response?.data?.message || error.message || 'Failed to top up stock')
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
        <button onClick={fetchStock}>Retry</button>
      </Box>
    );
  }

  return (
    <StockList
      stock={stock}
      onAdd={handleAddStock}
      onEdit={handleEditStock}
      onDelete={handleDeleteStock}
      onRefresh={fetchStock}
      onTopUp={handleTopUp}
    />
  );
};

export default StockPage;
