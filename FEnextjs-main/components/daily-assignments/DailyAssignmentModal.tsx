import {
  Button,
  Divider,
  Input,
  Modal,
  Text,
  Loading,
  Checkbox,
  Textarea,
} from '@nextui-org/react';
import React, { useState, useEffect } from 'react';
import { Flex } from '../styles/flex';
import { Box } from '../styles/box';
import {
  DailyAssignmentData,
  PersonnelData,
  VehiculeData,
  ChantierData,
  PersonnelAssignment,
  VehiculeAssignment,
} from '../../pages/daily-assignments';

interface DailyAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: DailyAssignmentData) => void;
  initialData?: DailyAssignmentData;
  loading?: boolean;
  personnel: PersonnelData[];
  vehicules: VehiculeData[];
  chantiers: ChantierData[];
}

interface PersonnelRow {
  personnelId: string;
  salary: number;
  notes: string;
  isPayed: boolean;
}

interface VehicleRow {
  vehicleId: string;
  fuelCost: number;
  notes: string;
}

export const DailyAssignmentModal = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  loading,
  personnel,
  vehicules,
  chantiers,
}: DailyAssignmentModalProps) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [chantierId, setChantierId] = useState('');
  const [notes, setNotes] = useState('');
  const [personnelRows, setPersonnelRows] = useState<PersonnelRow[]>([]);
  const [vehicleRows, setVehicleRows] = useState<VehicleRow[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (visible && !initialData) {
      // Reset form for new assignment
      setDate(new Date().toISOString().split('T')[0]);
      setChantierId('');
      setNotes('');
      setPersonnelRows([]);
      setVehicleRows([]);
      setErrors({});
    } else if (initialData) {
      // Populate form for editing
      setDate(new Date(initialData.date).toISOString().split('T')[0]);
      setChantierId(typeof initialData.chantier === 'object' ? initialData.chantier._id : initialData.chantier);
      setNotes(initialData.notes || '');

      // Populate personnel rows
      const pRows = initialData.personnelAssignments?.map(pa => ({
        personnelId: typeof pa.personnel === 'object' ? pa.personnel._id! : pa.personnel,
        salary: pa.salary || 0,
        notes: pa.notes || '',
        isPayed: pa.isPayed || false,
      })) || [];
      setPersonnelRows(pRows);

      // Populate vehicle rows
      const vRows = initialData.vehiculeAssignments?.map(va => {
        // Find the fuel cost for this vehicle from fuelCosts array
        const vehicleRegistration = typeof va.vehicule === 'object' ? va.vehicule.immatriculation : '';
        const fuelCost = initialData.fuelCosts?.find(fc => 
          fc.notes && vehicleRegistration && fc.notes.includes(vehicleRegistration)
        );
        
        return {
          vehicleId: typeof va.vehicule === 'object' ? va.vehicule._id! : va.vehicule,
          fuelCost: fuelCost?.amount || 0,
          notes: va.notes || '',
        };
      }) || [];
      setVehicleRows(vRows);
    }
  }, [visible, initialData]);

  const addPersonnelRow = () => {
    setPersonnelRows([...personnelRows, { personnelId: '', salary: 0, notes: '', isPayed: false }]);
  };

  const removePersonnelRow = (index: number) => {
    setPersonnelRows(personnelRows.filter((_, i) => i !== index));
  };

  const updatePersonnelRow = (index: number, field: keyof PersonnelRow, value: any) => {
    const updated = [...personnelRows];
    updated[index] = { ...updated[index], [field]: value };
    setPersonnelRows(updated);
  };

  const addVehicleRow = () => {
    setVehicleRows([...vehicleRows, { vehicleId: '', fuelCost: 0, notes: '' }]);
  };

  const removeVehicleRow = (index: number) => {
    setVehicleRows(vehicleRows.filter((_, i) => i !== index));
  };

  const updateVehicleRow = (index: number, field: keyof VehicleRow, value: any) => {
    const updated = [...vehicleRows];
    updated[index] = { ...updated[index], [field]: value };
    setVehicleRows(updated);
  };

  const calculateTotals = () => {
    const totalPersonnelCost = personnelRows.reduce((sum, row) => sum + (row.salary || 0), 0);
    const totalFuelCost = vehicleRows.reduce((sum, row) => sum + (row.fuelCost || 0), 0);
    return {
      totalPersonnelCost,
      totalFuelCost,
      totalCost: totalPersonnelCost + totalFuelCost,
    };
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!date) newErrors.date = 'Date is required';
    if (!chantierId) newErrors.chantier = 'Work site is required';
    if (personnelRows.length === 0) newErrors.personnel = 'At least one personnel is required';

    // Check for duplicate personnel
    const personnelIds = personnelRows.map(r => r.personnelId).filter(id => id);
    const duplicatePersonnel = personnelIds.filter((id, index) => personnelIds.indexOf(id) !== index);
    if (duplicatePersonnel.length > 0) {
      newErrors.personnel = 'Duplicate personnel selected';
    }

    // Check for duplicate vehicles
    const vehicleIds = vehicleRows.map(r => r.vehicleId).filter(id => id);
    const duplicateVehicles = vehicleIds.filter((id, index) => vehicleIds.indexOf(id) !== index);
    if (duplicateVehicles.length > 0) {
      newErrors.vehicles = 'Duplicate vehicles selected';
    }

    // Check for empty personnel selections
    if (personnelRows.some(r => !r.personnelId)) {
      newErrors.personnel = 'Please select all personnel';
    }

    // Check for empty vehicle selections if any rows exist
    if (vehicleRows.length > 0 && vehicleRows.some(r => !r.vehicleId)) {
      newErrors.vehicles = 'Please select all vehicles';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const totals = calculateTotals();

    const personnelAssignments: PersonnelAssignment[] = personnelRows.map(row => ({
      personnel: row.personnelId,
      salary: row.salary,
      notes: row.notes,
      isPayed: row.isPayed,
    }));

    const vehiculeAssignments: VehiculeAssignment[] = vehicleRows.map(row => ({
      vehicule: row.vehicleId,
      notes: row.notes,
    }));

    // Create fuel costs with vehicle registration in notes
    const fuelCosts = vehicleRows.map(row => {
      const vehicle = vehicules.find(v => v._id === row.vehicleId);
      return {
        description: `Fuel for ${vehicle?.type || 'vehicle'}`,
        amount: row.fuelCost,
        paymentMethod: 'cash' as const,
        notes: vehicle?.immatriculation || '',
      };
    });

    const data: DailyAssignmentData = {
      ...initialData,
      date,
      chantier: chantierId,
      personnelAssignments,
      vehiculeAssignments,
      fuelCosts,
      notes,
      totalPersonnelCost: totals.totalPersonnelCost,
      totalFuelCost: totals.totalFuelCost,
      totalCost: totals.totalCost,
    };

    onSubmit?.(data);
  };

  const totals = calculateTotals();

  return (
    <Modal
      closeButton
      open={visible}
      onClose={onClose}
      width="900px"
      scroll
      blur
      preventClose={loading}
      css={{
        '@xsMax': {
          width: '95vw',
          margin: '$4',
        },
      }}
    >
      <Modal.Header>
        <Text h4>
          {initialData ? 'Edit Daily Assignment' : 'New Daily Assignment'}
        </Text>
      </Modal.Header>
      <Divider css={{ my: '$5' }} />
      
      <Modal.Body css={{ py: '$8' }}>
        <Flex direction="column" css={{ gap: '$6' }}>
          {/* Date & Work Site */}
          <Flex css={{ gap: '$4', '@xsMax': { flexDirection: 'column' } }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Date"
                type="date"
                bordered
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
                color={errors.date ? 'error' : 'default'}
                helperColor="error"
                helperText={errors.date}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                Work Site *
              </label>
              <select
                value={chantierId}
                onChange={(e) => setChantierId(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: errors.chantier ? '2px solid var(--nextui-colors-error)' : '1px solid var(--nextui-colors-border)',
                  background: 'var(--nextui-colors-background)',
                  color: 'var(--nextui-colors-text)',
                  fontSize: '14px',
                }}
              >
                <option value="">Select work site</option>
                {chantiers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.chantier && (
                <Text size="$xs" color="error" css={{ mt: '$2' }}>
                  {errors.chantier}
                </Text>
              )}
            </div>
          </Flex>

          {/* Personnel Section */}
          <Box>
            <Flex justify="between" align="center" css={{ mb: '$4' }}>
              <Text b size="$lg">Personnel Assignments</Text>
              <Button auto size="sm" onClick={addPersonnelRow} disabled={loading}>
                + Add Personnel
              </Button>
            </Flex>
            {errors.personnel && (
              <Text size="$xs" color="error" css={{ mb: '$2' }}>
                {errors.personnel}
              </Text>
            )}
            <Flex direction="column" css={{ gap: '$3' }}>
              {personnelRows.map((row, index) => (
                <Flex key={index} css={{ gap: '$2', alignItems: 'start', '@xsMax': { flexWrap: 'wrap' } }}>
                  <div style={{ flex: 2, minWidth: '150px' }}>
                    <select
                      value={row.personnelId}
                      onChange={(e) => updatePersonnelRow(index, 'personnelId', e.target.value)}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '12px',
                        border: '1px solid var(--nextui-colors-border)',
                        background: 'var(--nextui-colors-background)',
                        color: 'var(--nextui-colors-text)',
                        fontSize: '14px',
                      }}
                    >
                      <option value="">Select personnel</option>
                      {personnel.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} - {p.role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: '100px' }}>
                    <Input
                      type="number"
                      placeholder="Salary"
                      bordered
                      fullWidth
                      size="sm"
                      value={row.salary}
                      onChange={(e) => updatePersonnelRow(index, 'salary', parseFloat(e.target.value) || 0)}
                      disabled={loading}
                      min={0}
                      step="0.01"
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <Input
                      placeholder="Notes (optional)"
                      bordered
                      fullWidth
                      size="sm"
                      value={row.notes}
                      onChange={(e) => updatePersonnelRow(index, 'notes', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <Checkbox
                    isSelected={row.isPayed}
                    onChange={(checked) => updatePersonnelRow(index, 'isPayed', checked)}
                    isDisabled={loading}
                    size="sm"
                    css={{ mt: '$2' }}
                  >
                    Paid
                  </Checkbox>
                  <Button
                    auto
                    flat
                    color="error"
                    size="sm"
                    onClick={() => removePersonnelRow(index)}
                    disabled={loading}
                    css={{ minWidth: 'auto', px: '$3', mt: '$1' }}
                  >
                    ✕
                  </Button>
                </Flex>
              ))}
              {personnelRows.length === 0 && (
                <Text size="$sm" color="$accents7" css={{ textAlign: 'center', py: '$4' }}>
                  No personnel added yet
                </Text>
              )}
            </Flex>
          </Box>

          {/* Vehicles Section */}
          <Box>
            <Flex justify="between" align="center" css={{ mb: '$4' }}>
              <Text b size="$lg">Vehicle Assignments & Fuel Costs</Text>
              <Button auto size="sm" onClick={addVehicleRow} disabled={loading}>
                + Add Vehicle
              </Button>
            </Flex>
            {errors.vehicles && (
              <Text size="$xs" color="error" css={{ mb: '$2' }}>
                {errors.vehicles}
              </Text>
            )}
            <Flex direction="column" css={{ gap: '$3' }}>
              {vehicleRows.map((row, index) => (
                <Flex key={index} css={{ gap: '$2', alignItems: 'start', '@xsMax': { flexWrap: 'wrap' } }}>
                  <div style={{ flex: 2, minWidth: '150px' }}>
                    <select
                      value={row.vehicleId}
                      onChange={(e) => updateVehicleRow(index, 'vehicleId', e.target.value)}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '12px',
                        border: '1px solid var(--nextui-colors-border)',
                        background: 'var(--nextui-colors-background)',
                        color: 'var(--nextui-colors-text)',
                        fontSize: '14px',
                      }}
                    >
                      <option value="">Select vehicle</option>
                      {vehicules.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.immatriculation} - {v.type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: '100px' }}>
                    <Input
                      type="number"
                      placeholder="Fuel Cost"
                      bordered
                      fullWidth
                      size="sm"
                      value={row.fuelCost}
                      onChange={(e) => updateVehicleRow(index, 'fuelCost', parseFloat(e.target.value) || 0)}
                      disabled={loading}
                      min={0}
                      step="0.01"
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <Input
                      placeholder="Notes (optional)"
                      bordered
                      fullWidth
                      size="sm"
                      value={row.notes}
                      onChange={(e) => updateVehicleRow(index, 'notes', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <Button
                    auto
                    flat
                    color="error"
                    size="sm"
                    onClick={() => removeVehicleRow(index)}
                    disabled={loading}
                    css={{ minWidth: 'auto', px: '$3', mt: '$1' }}
                  >
                    ✕
                  </Button>
                </Flex>
              ))}
              {vehicleRows.length === 0 && (
                <Text size="$sm" color="$accents7" css={{ textAlign: 'center', py: '$4' }}>
                  No vehicles added yet (optional)
                </Text>
              )}
            </Flex>
          </Box>

          {/* General Notes */}
          <Box>
            <Textarea
              label="General Notes (Optional)"
              placeholder="Add any additional notes about this assignment..."
              bordered
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </Box>

          {/* Summary */}
          <Box css={{ 
            p: '$4', 
            borderRadius: '$lg', 
            background: '$accents0',
            border: '1px solid $border'
          }}>
            <Text b size="$lg" css={{ mb: '$3' }}>Cost Summary</Text>
            <Flex direction="column" css={{ gap: '$2' }}>
              <Flex justify="between">
                <Text>Personnel Cost:</Text>
                <Text b>{totals.totalPersonnelCost.toFixed(2)} TND</Text>
              </Flex>
              <Flex justify="between">
                <Text>Fuel Cost:</Text>
                <Text b>{totals.totalFuelCost.toFixed(2)} TND</Text>
              </Flex>
              <Divider css={{ my: '$2' }} />
              <Flex justify="between">
                <Text b size="$lg">Total Cost:</Text>
                <Text b size="$lg" color="$primary">{totals.totalCost.toFixed(2)} TND</Text>
              </Flex>
            </Flex>
          </Box>
        </Flex>
      </Modal.Body>

      <Divider css={{ my: '$5' }} />
      <Modal.Footer>
        <Button auto flat onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button auto onClick={handleSubmit} disabled={loading}>
          {loading ? <Loading color="currentColor" size="sm" /> : (initialData ? 'Update Assignment' : 'Create Assignment')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
