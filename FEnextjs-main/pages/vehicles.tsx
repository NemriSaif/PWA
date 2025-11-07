import React, { useEffect, useState } from 'react';
import { offlineGet, apiPost, apiPatch, apiDelete } from '../utils/apiClient';
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
  chantier?: string | { _id: string; name: string; location: string }; // Can be ObjectId or populated object
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
      // Build clean data object - only include fields that have values
      const cleanData: any = {
        immatriculation: data.immatriculation,
      };

      // Only add optional fields if they have non-empty values
      if (data.marque) cleanData.marque = data.marque;
      if (data.modele) cleanData.modele = data.modele;
      if (data.type) cleanData.type = data.type;
      if (data.kilometrage !== undefined && data.kilometrage !== null && data.kilometrage >= 0) {
        cleanData.kilometrage = data.kilometrage;
      }

      console.log('Adding vehicle with data:', cleanData);
      const response = await apiPost<VehiculeData>(API_ENDPOINT, cleanData, 'vehicule');
      console.log('Vehicle added successfully:', response);

      // Update list locally
      setVehicles(prev => [...prev, response]);
      alert('✅ Vehicle added successfully!');
    } catch (error: any) {
      console.error('Error adding vehicle:', error);
      if (error.message?.includes('queued')) {
        alert('📝 Vehicle will be added when online');
      } else {
        alert('❌ ' + (error.message || 'Failed to add vehicle'));
      }
    }
  };

  // Edit vehicle
  const handleEditVehicule = async (data: VehiculeData) => {
    if (!data._id) return;
    try {
      // Build clean data object - only include fields that have values
      const cleanData: any = {};

      // Only add fields that are present and non-empty
      if (data.immatriculation) cleanData.immatriculation = data.immatriculation;
      if (data.marque) cleanData.marque = data.marque;
      if (data.modele) cleanData.modele = data.modele;
      if (data.type) cleanData.type = data.type;
      if (data.kilometrage !== undefined && data.kilometrage !== null && data.kilometrage >= 0) {
        cleanData.kilometrage = data.kilometrage;
      }

      console.log('Updating vehicle ID:', data._id);
      console.log('Update payload:', cleanData);
      
      const response = await apiPatch<VehiculeData>(`${API_ENDPOINT}/${data._id}`, cleanData, 'vehicule');
      console.log('Vehicle updated successfully:', response);
      
      setVehicles(prev => prev.map(v => (v._id === data._id ? response : v)));
      alert('✅ Vehicle updated successfully!');
    } catch (error: any) {
      console.error('Error updating vehicle:', error);
      if (error.message?.includes('queued')) {
        alert('📝 Changes will be saved when online');
      } else {
        alert('❌ ' + (error.message || 'Failed to update vehicle'));
      }
    }
  };

  // Delete vehicle
  const handleDeleteVehicule = async (id: string) => {
    try {
      await apiDelete(`${API_ENDPOINT}/${id}`, 'vehicule');
      setVehicles(prev => prev.filter(v => v._id !== id));
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      if (error.message?.includes('queued')) {
        alert('📝 Vehicle will be deleted when online');
      } else {
        alert(error.message || 'Failed to delete vehicle');
      }
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
    <Vehicles 
      vehicles={vehicles} 
      onAdd={handleAddVehicule}
      onEdit={handleEditVehicule}
      onDelete={handleDeleteVehicule}
    />
  );
};

export default VehiclesPage;
