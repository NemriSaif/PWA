import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AddVehiculeModal } from '../components/vehicles/AddVehiculeModal';
import { Vehicles } from '../components/vehicles/vehicles';

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

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<VehiculeData[]>([]);
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/vehicule`;

  // Load all vehicles
  const fetchVehicles = async () => {
    try {
      const response = await axios.get<VehiculeData[]>(API_URL);
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Add a new vehicle
  const handleAddVehicule = async (data: VehiculeData) => {
    try {
      const response = await axios.post<VehiculeData>(API_URL, data);
      console.log('Vehicle added:', response.data);

      // Update list locally
      setVehicles(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  return (
    <div>
      <AddVehiculeModal onSubmit={handleAddVehicule} initialData={undefined} />
      <Vehicles vehicles={vehicles} />
    </div>
  );
};

export default VehiclesPage;
