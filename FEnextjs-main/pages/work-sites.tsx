import React, { useEffect, useState } from 'react';
import { WorkSites } from '../components/work-site/work-sites';
import { Loading, Text } from '@nextui-org/react';
import { Box } from '../components/styles/box';
import { offlineGet, apiPost, apiPatch, apiDelete } from '../utils/apiClient';

export interface WorkSiteData {
  _id?: string;
  name: string;
  location: string;
  note?: string;
  startDate?: string;
  endDate?: string;
  personnelAssignments?: { personnel: string; date: string }[];
  vehiculeAssignments?: { vehicule: string; date: string }[];
}

const API_ENDPOINT = '/chantier';
const WorkSitesPage = () => {
  const [workSites, setWorkSites] = useState<WorkSiteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkSites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await offlineGet<WorkSiteData>(API_ENDPOINT, 'chantier');
      setWorkSites(data);
    } catch (error) {
      console.error('Error fetching work sites:', error);
      setError('Failed to load work sites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkSites();
  }, []);

  const handleAddWorkSite = async (data: WorkSiteData) => {
    try {
      const response = await apiPost<WorkSiteData>(API_ENDPOINT, {
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      });
      setWorkSites(prev => [...prev, response]);
      return { success: true, message: 'Work site added successfully!' };
    } catch (error: any) {
      console.error('Error adding work site:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to add work site' 
      };
    }
  };

  const handleEditWorkSite = async (data: WorkSiteData) => {
    if (!data._id) return { success: false, message: 'Invalid work site ID' };
    
    try {
      const response = await apiPatch<WorkSiteData>(`${API_ENDPOINT}/${data._id}`, {
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      });
      setWorkSites(prev => prev.map(w => (w._id === data._id ? response : w)));
      return { success: true, message: 'Work site updated successfully!' };
    } catch (error: any) {
      console.error('Error editing work site:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to update work site' 
      };
    }
  };

  const handleDeleteWorkSite = async (id: string) => {
    try {
      await apiDelete(`${API_ENDPOINT}/${id}`);
      setWorkSites(prev => prev.filter(w => w._id !== id));
      return { success: true, message: 'Work site deleted successfully!' };
    } catch (error: any) {
      console.error('Error deleting work site:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to delete work site' 
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
        <button onClick={fetchWorkSites}>Retry</button>
      </Box>
    );
  }

  return (
    <WorkSites
      workSites={workSites}
      onAdd={handleAddWorkSite}
      onEdit={handleEditWorkSite}
      onDelete={handleDeleteWorkSite}
      onRefresh={fetchWorkSites}
    />
  );
};

export default WorkSitesPage;