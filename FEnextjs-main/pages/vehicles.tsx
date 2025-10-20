import React, { useEffect, useState } from 'react';
import { offlineGet, apiPost, apiPatch, apiDelete } from '../utils/apiClient';
import { AddVehiculeModal } from '../components/vehicles/AddVehiculeModal';
import { Vehicles } from '../components/vehicles/vehicles';
import { Loading, Text, Button } from '@nextui-org/react';
import { Box } from '../components/styles/box';

// Match your backend schema
export interface VehiculeData {
  _id?: string;
  immatriculation: string;
  marque?: string;
  modele?: string;
  type?: string;
  kilometrage?: number;
  chantier?: string; // You can expand later if you want full Chantier object
}

const API_ENDPOINT = '/vehicule';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<VehiculeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all vehicles using offline-aware API
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await offlineGet<VehiculeData>(API_ENDPOINT, 'vehicule');
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError('Failed to load vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Add a new vehicle
  const handleAddVehicule = async (data: VehiculeData) => {
    try {
      const response = await apiPost<VehiculeData>(API_ENDPOINT, data);
      console.log('Vehicle added:', response);

      // Update list locally
      setVehicles(prev => [...prev, response]);
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  // Edit vehicle
  const handleEditVehicule = async (data: VehiculeData) => {
    if (!data._id) return;
    try {
      const response = await apiPatch<VehiculeData>(`${API_ENDPOINT}/${data._id}`, data);
      setVehicles(prev => prev.map(v => (v._id === data._id ? response : v)));
    } catch (error: any) {
      console.error('Error updating vehicle:', error);
      alert(error.message || 'Failed to update vehicle');
    }
  };

  // Delete vehicle
  const handleDeleteVehicule = async (id: string) => {
    try {
      await apiDelete(`${API_ENDPOINT}/${id}`);
      setVehicles(prev => prev.filter(v => v._id !== id));
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      alert(error.message || 'Failed to delete vehicle');
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
        <Button onClick={fetchVehicles}>Retry</Button>
      </Box>
    );
  }

  return (
    <div>
      <AddVehiculeModal onSubmit={handleAddVehicule} initialData={undefined} />
      <Vehicles 
        vehicles={vehicles} 
        onEdit={handleEditVehicule}
        onDelete={handleDeleteVehicule}
      />
    </div>
  );
};

export default VehiclesPage;
