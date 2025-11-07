import {
  Button,
  Divider,
  Input,
  Modal,
  Text,
  Loading,
  Checkbox,
  Textarea,
  Card,
  Badge,
  Progress,
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
import { StockData } from '../../pages/stock';

interface StepWizardModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: DailyAssignmentData & { stockUsage: StockUsageItem[] }) => void;
  initialData?: DailyAssignmentData;
  loading?: boolean;
  personnel: PersonnelData[];
  vehicules: VehiculeData[];
  chantiers: ChantierData[];
  stock: StockData[];
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

interface StockUsageItem {
  stockId: string;
  quantityUsed: number;
}

type Step = 1 | 2 | 3 | 4 | 5;

export const StepWizardModal = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  loading,
  personnel,
  vehicules,
  chantiers,
  stock,
}: StepWizardModalProps) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [chantierId, setChantierId] = useState('');
  const [notes, setNotes] = useState('');
  const [personnelRows, setPersonnelRows] = useState<PersonnelRow[]>([]);
  const [vehicleRows, setVehicleRows] = useState<VehicleRow[]>([]);
  const [stockUsage, setStockUsage] = useState<StockUsageItem[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (visible && !initialData) {
      // Reset form for new assignment
      setCurrentStep(1);
      setDate(new Date().toISOString().split('T')[0]);
      setChantierId('');
      setNotes('');
      setPersonnelRows([]);
      setVehicleRows([]);
      setStockUsage([]);
      setErrors({});
    } else if (initialData) {
      // Populate form for editing
      setDate(new Date(initialData.date).toISOString().split('T')[0]);
      setChantierId(typeof initialData.chantier === 'object' ? initialData.chantier._id : initialData.chantier);
      setNotes(initialData.notes || '');

      const pRows = initialData.personnelAssignments?.map(pa => ({
        personnelId: typeof pa.personnel === 'object' ? pa.personnel._id! : pa.personnel,
        salary: pa.salary || 0,
        notes: pa.notes || '',
        isPayed: pa.isPayed || false,
      })) || [];
      setPersonnelRows(pRows);

      const vRows = initialData.vehiculeAssignments?.map(va => {
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

  const addStockUsage = () => {
    setStockUsage([...stockUsage, { stockId: '', quantityUsed: 0 }]);
  };

  const removeStockUsage = (index: number) => {
    setStockUsage(stockUsage.filter((_, i) => i !== index));
  };

  const updateStockUsage = (index: number, field: keyof StockUsageItem, value: any) => {
    const updated = [...stockUsage];
    updated[index] = { ...updated[index], [field]: value };
    setStockUsage(updated);
  };

  const calculateTotals = () => {
    const totalPersonnelCost = personnelRows.reduce((sum, row) => sum + (row.salary || 0), 0);
    const totalFuelCost = vehicleRows.reduce((sum, row) => sum + (row.fuelCost || 0), 0);
    const totalStockCost = stockUsage.reduce((sum, item) => {
      const stockItem = stock.find(s => s._id === item.stockId);
      return sum + ((stockItem?.price || 0) * item.quantityUsed);
    }, 0);
    return {
      totalPersonnelCost,
      totalFuelCost,
      totalStockCost,
      totalCost: totalPersonnelCost + totalFuelCost + totalStockCost,
    };
  };

  const validateStep = (step: Step): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!date) newErrors.date = 'Date is required';
      if (!chantierId) newErrors.chantier = 'Work site is required';
    }

    if (step === 2) {
      if (personnelRows.length === 0) {
        newErrors.personnel = 'At least one personnel is required';
      } else {
        const personnelIds = personnelRows.map(r => r.personnelId).filter(id => id);
        const duplicatePersonnel = personnelIds.filter((id, index) => personnelIds.indexOf(id) !== index);
        if (duplicatePersonnel.length > 0) {
          newErrors.personnel = 'Duplicate personnel selected';
        }
        if (personnelRows.some(r => !r.personnelId)) {
          newErrors.personnel = 'Please select all personnel';
        }
      }
    }

    if (step === 3) {
      if (vehicleRows.length > 0) {
        const vehicleIds = vehicleRows.map(r => r.vehicleId).filter(id => id);
        const duplicateVehicles = vehicleIds.filter((id, index) => vehicleIds.indexOf(id) !== index);
        if (duplicateVehicles.length > 0) {
          newErrors.vehicles = 'Duplicate vehicles selected';
        }
        if (vehicleRows.some(r => !r.vehicleId)) {
          newErrors.vehicles = 'Please select all vehicles';
        }
      }
    }

    if (step === 4) {
      if (stockUsage.length > 0) {
        const stockIds = stockUsage.map(r => r.stockId).filter(id => id);
        const duplicateStock = stockIds.filter((id, index) => stockIds.indexOf(id) !== index);
        if (duplicateStock.length > 0) {
          newErrors.stock = 'Duplicate stock items selected';
        }
        if (stockUsage.some(r => !r.stockId)) {
          newErrors.stock = 'Please select all stock items';
        }
        // Validate quantity doesn't exceed available stock
        for (const usage of stockUsage) {
          const stockItem = stock.find(s => s._id === usage.stockId);
          if (stockItem && usage.quantityUsed > stockItem.quantity) {
            newErrors.stock = `Not enough ${stockItem.name} in stock (Available: ${stockItem.quantity})`;
            break;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((currentStep + 1) as Step);
      setErrors({});
    }
  };

  const handlePrevious = () => {
    setCurrentStep((currentStep - 1) as Step);
    setErrors({});
  };

  const handleSubmit = () => {
    if (!validateStep(5)) return;

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

    const fuelCosts = vehicleRows.map(row => {
      const vehicle = vehicules.find(v => v._id === row.vehicleId);
      return {
        description: `Fuel for ${vehicle?.type || 'vehicle'}`,
        amount: row.fuelCost,
        paymentMethod: 'cash' as const,
        notes: vehicle?.immatriculation || '',
      };
    });

    const data: DailyAssignmentData & { stockUsage: StockUsageItem[] } = {
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
      stockUsage,
    };

    onSubmit?.(data);
  };

  const getProgressPercentage = () => {
    return ((currentStep - 1) / 4) * 100;
  };

  const getSelectedChantier = () => {
    return chantiers.find(c => c._id === chantierId);
  };

  const totals = calculateTotals();

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Box>
            <Text h4 css={{ mb: '$6', textAlign: 'center' }}>📍 Step 1: Select Work Site & Date</Text>
            <Card variant="bordered" css={{ p: '$8' }}>
              <Flex direction="column" css={{ gap: '$6' }}>
                <div>
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
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                    Work Site / Chantier *
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
                        {c.name} - {c.location}
                      </option>
                    ))}
                  </select>
                  {errors.chantier && (
                    <Text size="$xs" color="error" css={{ mt: '$2' }}>
                      {errors.chantier}
                    </Text>
                  )}
                </div>
                {chantierId && (
                  <Card variant="flat" css={{ p: '$6', bg: '$primary', color: 'white' }}>
                    <Text b css={{ color: 'white', mb: '$2' }}>✓ Selected Work Site:</Text>
                    <Text css={{ color: 'white' }}>{getSelectedChantier()?.name}</Text>
                    <Text size="$sm" css={{ color: 'white', opacity: 0.9 }}>
                      📍 {getSelectedChantier()?.location}
                    </Text>
                  </Card>
                )}
              </Flex>
            </Card>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Text h4 css={{ mb: '$6', textAlign: 'center' }}>👷 Step 2: Assign Personnel & Salaries</Text>
            <Card variant="bordered" css={{ p: '$8' }}>
              <Flex direction="column" css={{ gap: '$6' }}>
                <Flex justify="between" align="center">
                  <Text b size="$lg">Personnel Assignments</Text>
                  <Button auto size="sm" onClick={addPersonnelRow} disabled={loading}>
                    + Add Personnel
                  </Button>
                </Flex>
                {errors.personnel && (
                  <Text size="$xs" color="error">
                    {errors.personnel}
                  </Text>
                )}
                <Flex direction="column" css={{ gap: '$4' }}>
                  {personnelRows.map((row, index) => {
                    const selectedPerson = personnel.find(p => p._id === row.personnelId);
                    return (
                      <Card key={index} variant="bordered" css={{ p: '$6' }}>
                        <Flex direction="column" css={{ gap: '$3' }}>
                          <Flex css={{ gap: '$2', alignItems: 'start', '@xsMax': { flexDirection: 'column' } }}>
                            <div style={{ flex: 2, minWidth: '150px' }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>
                                Personnel
                              </label>
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
                            <div style={{ flex: 1, minWidth: '120px' }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>
                                Daily Salary (TND)
                              </label>
                              <Input
                                type="number"
                                placeholder="0.00"
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
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>
                                Notes
                              </label>
                              <Input
                                placeholder="Optional"
                                bordered
                                fullWidth
                                size="sm"
                                value={row.notes}
                                onChange={(e) => updatePersonnelRow(index, 'notes', e.target.value)}
                                disabled={loading}
                              />
                            </div>
                            <Button
                              auto
                              flat
                              color="error"
                              size="sm"
                              onClick={() => removePersonnelRow(index)}
                              disabled={loading}
                              css={{ minWidth: 'auto', px: '$3', mt: '$7' }}
                            >
                              ✕
                            </Button>
                          </Flex>
                          <Flex css={{ gap: '$2', alignItems: 'center' }}>
                            <Checkbox
                              isSelected={row.isPayed}
                              onChange={(checked) => updatePersonnelRow(index, 'isPayed', checked)}
                              isDisabled={loading}
                              size="sm"
                            >
                              <Text size="$sm">Mark as Paid</Text>
                            </Checkbox>
                          </Flex>
                          {selectedPerson && (
                            <Card variant="flat" css={{ p: '$4', bg: '$accents1' }}>
                              <Text b size="$sm">✓ Selected: {selectedPerson.name}</Text>
                              <Text size="$xs" color="$accents7">Role: {selectedPerson.role}</Text>
                            </Card>
                          )}
                        </Flex>
                      </Card>
                    );
                  })}
                  {personnelRows.length === 0 && (
                    <Card variant="flat" css={{ p: '$12', textAlign: 'center' }}>
                      <Text size="$sm" color="$accents7">
                        No personnel added yet. Click &quot;+ Add Personnel&quot; to begin.
                      </Text>
                    </Card>
                  )}
                </Flex>
                {personnelRows.length > 0 && (
                  <Card variant="flat" css={{ p: '$6', bg: '$success', color: 'white' }}>
                    <Flex justify="between" align="center">
                      <Text b css={{ color: 'white' }}>Total Personnel Cost:</Text>
                      <Text b size="$lg" css={{ color: 'white' }}>{totals.totalPersonnelCost.toFixed(2)} TND</Text>
                    </Flex>
                  </Card>
                )}
              </Flex>
            </Card>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Text h4 css={{ mb: '$6', textAlign: 'center' }}>🚛 Step 3: Assign Vehicles & Fuel Costs</Text>
            <Card variant="bordered" css={{ p: '$8' }}>
              <Flex direction="column" css={{ gap: '$6' }}>
                <Flex justify="between" align="center">
                  <Text b size="$lg">Vehicle Assignments</Text>
                  <Button auto size="sm" onClick={addVehicleRow} disabled={loading}>
                    + Add Vehicle
                  </Button>
                </Flex>
                {errors.vehicles && (
                  <Text size="$xs" color="error">
                    {errors.vehicles}
                  </Text>
                )}
                <Flex direction="column" css={{ gap: '$4' }}>
                  {vehicleRows.map((row, index) => {
                    const selectedVehicle = vehicules.find(v => v._id === row.vehicleId);
                    return (
                      <Card key={index} variant="bordered" css={{ p: '$6' }}>
                        <Flex direction="column" css={{ gap: '$3' }}>
                          <Flex css={{ gap: '$2', alignItems: 'start', '@xsMax': { flexDirection: 'column' } }}>
                            <div style={{ flex: 2, minWidth: '150px' }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>
                                Vehicle
                              </label>
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
                                    {v.immatriculation} - {v.type} ({v.marque} {v.modele})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div style={{ flex: 1, minWidth: '120px' }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>
                                Fuel Cost (TND)
                              </label>
                              <Input
                                type="number"
                                placeholder="0.00"
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
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>
                                Notes
                              </label>
                              <Input
                                placeholder="Optional"
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
                              css={{ minWidth: 'auto', px: '$3', mt: '$7' }}
                            >
                              ✕
                            </Button>
                          </Flex>
                          {selectedVehicle && (
                            <Card variant="flat" css={{ p: '$4', bg: '$accents1' }}>
                              <Text b size="$sm">✓ Selected: {selectedVehicle.immatriculation}</Text>
                              <Text size="$xs" color="$accents7">
                                {selectedVehicle.marque} {selectedVehicle.modele} - {selectedVehicle.type}
                              </Text>
                            </Card>
                          )}
                        </Flex>
                      </Card>
                    );
                  })}
                  {vehicleRows.length === 0 && (
                    <Card variant="flat" css={{ p: '$12', textAlign: 'center' }}>
                      <Text size="$sm" color="$accents7">
                        No vehicles added yet. Click &quot;+ Add Vehicle&quot; or skip this step.
                      </Text>
                    </Card>
                  )}
                </Flex>
                {vehicleRows.length > 0 && (
                  <Card variant="flat" css={{ p: '$6', bg: '$warning', color: 'white' }}>
                    <Flex justify="between" align="center">
                      <Text b css={{ color: 'white' }}>Total Fuel Cost:</Text>
                      <Text b size="$lg" css={{ color: 'white' }}>{totals.totalFuelCost.toFixed(2)} TND</Text>
                    </Flex>
                  </Card>
                )}
              </Flex>
            </Card>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Text h4 css={{ mb: '$6', textAlign: 'center' }}>📦 Step 4: Select Stock Materials</Text>
            <Card variant="bordered" css={{ p: '$8' }}>
              <Flex direction="column" css={{ gap: '$6' }}>
                <Flex justify="between" align="center">
                  <Text b size="$lg">Stock Usage</Text>
                  <Button auto size="sm" onClick={addStockUsage} disabled={loading}>
                    + Add Stock Item
                  </Button>
                </Flex>
                {errors.stock && (
                  <Text size="$xs" color="error">
                    {errors.stock}
                  </Text>
                )}
                <Flex direction="column" css={{ gap: '$4' }}>
                  {stockUsage.map((item, index) => {
                    const selectedStock = stock.find(s => s._id === item.stockId);
                    return (
                      <Card key={index} variant="bordered" css={{ p: '$6' }}>
                        <Flex direction="column" css={{ gap: '$3' }}>
                          <Flex css={{ gap: '$2', alignItems: 'start', '@xsMax': { flexDirection: 'column' } }}>
                            <div style={{ flex: 2, minWidth: '150px' }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>
                                Stock Item
                              </label>
                              <select
                                value={item.stockId}
                                onChange={(e) => updateStockUsage(index, 'stockId', e.target.value)}
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
                                <option value="">Select stock item</option>
                                {stock.map((s) => (
                                  <option key={s._id} value={s._id}>
                                    {s.name} - Available: {s.quantity} {s.unit}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div style={{ flex: 1, minWidth: '120px' }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>
                                Quantity Used
                              </label>
                              <Input
                                type="number"
                                placeholder="0"
                                bordered
                                fullWidth
                                size="sm"
                                value={item.quantityUsed}
                                onChange={(e) => updateStockUsage(index, 'quantityUsed', parseFloat(e.target.value) || 0)}
                                disabled={loading}
                                min={0}
                                step="1"
                              />
                            </div>
                            <Button
                              auto
                              flat
                              color="error"
                              size="sm"
                              onClick={() => removeStockUsage(index)}
                              disabled={loading}
                              css={{ minWidth: 'auto', px: '$3', mt: '$7' }}
                            >
                              ✕
                            </Button>
                          </Flex>
                          {selectedStock && (
                            <Card variant="flat" css={{ p: '$4', bg: item.quantityUsed > selectedStock.quantity ? '$error' : '$accents1' }}>
                              <Flex justify="between" align="start">
                                <Box>
                                  <Text b size="$sm">✓ {selectedStock.name}</Text>
                                  <Text size="$xs" color="$accents7">
                                    Available: {selectedStock.quantity} {selectedStock.unit}
                                  </Text>
                                  <Text size="$xs" color="$accents7">
                                    After use: {selectedStock.quantity - item.quantityUsed} {selectedStock.unit}
                                  </Text>
                                </Box>
                                {selectedStock.price && (
                                  <Text b size="$sm" color="$primary">
                                    {(selectedStock.price * item.quantityUsed).toFixed(2)} TND
                                  </Text>
                                )}
                              </Flex>
                              {item.quantityUsed > selectedStock.quantity && (
                                <Text size="$xs" color="error" css={{ mt: '$2' }}>
                                  ⚠️ Not enough stock available!
                                </Text>
                              )}
                            </Card>
                          )}
                        </Flex>
                      </Card>
                    );
                  })}
                  {stockUsage.length === 0 && (
                    <Card variant="flat" css={{ p: '$12', textAlign: 'center' }}>
                      <Text size="$sm" color="$accents7">
                        No stock items added yet. Click &quot;+ Add Stock Item&quot; or skip this step.
                      </Text>
                    </Card>
                  )}
                </Flex>
                {stockUsage.length > 0 && (
                  <Card variant="flat" css={{ p: '$6', bg: '$secondary', color: 'white' }}>
                    <Flex justify="between" align="center">
                      <Text b css={{ color: 'white' }}>Total Stock Cost:</Text>
                      <Text b size="$lg" css={{ color: 'white' }}>{totals.totalStockCost.toFixed(2)} TND</Text>
                    </Flex>
                  </Card>
                )}
              </Flex>
            </Card>
          </Box>
        );

      case 5:
        return (
          <Box>
            <Text h4 css={{ mb: '$6', textAlign: 'center' }}>📋 Step 5: Review & Confirm</Text>
            <Card variant="bordered" css={{ p: '$8' }}>
              <Flex direction="column" css={{ gap: '$6' }}>
                {/* Summary Header */}
                <Card variant="flat" css={{ p: '$6', bg: '$primary', color: 'white' }}>
                  <Text h4 css={{ color: 'white', mb: '$2' }}>Assignment Summary</Text>
                  <Flex justify="between" align="center">
                    <Text css={{ color: 'white' }}>
                      📍 {getSelectedChantier()?.name}
                    </Text>
                    <Text css={{ color: 'white' }}>
                      📅 {new Date(date).toLocaleDateString('en-GB')}
                    </Text>
                  </Flex>
                </Card>

                {/* Personnel Summary */}
                <Box>
                  <Text b size="$lg" css={{ mb: '$3' }}>👷 Personnel ({personnelRows.length})</Text>
                  {personnelRows.map((row, index) => {
                    const person = personnel.find(p => p._id === row.personnelId);
                    return (
                      <Card key={index} variant="flat" css={{ p: '$4', mb: '$2' }}>
                        <Flex justify="between" align="center">
                          <Box>
                            <Text b>{person?.name}</Text>
                            <Text size="$xs" color="$accents7">{person?.role}</Text>
                            {row.notes && <Text size="$xs" color="$accents7">Note: {row.notes}</Text>}
                          </Box>
                          <Flex direction="column" align="end">
                            <Text b color="$primary">{row.salary.toFixed(2)} TND</Text>
                            {row.isPayed && <Badge size="xs" color="success">Paid</Badge>}
                          </Flex>
                        </Flex>
                      </Card>
                    );
                  })}
                  <Flex justify="end" css={{ mt: '$2' }}>
                    <Text b>Subtotal: {totals.totalPersonnelCost.toFixed(2)} TND</Text>
                  </Flex>
                </Box>

                {/* Vehicles Summary */}
                {vehicleRows.length > 0 && (
                  <Box>
                    <Text b size="$lg" css={{ mb: '$3' }}>🚛 Vehicles ({vehicleRows.length})</Text>
                    {vehicleRows.map((row, index) => {
                      const vehicle = vehicules.find(v => v._id === row.vehicleId);
                      return (
                        <Card key={index} variant="flat" css={{ p: '$4', mb: '$2' }}>
                          <Flex justify="between" align="center">
                            <Box>
                              <Text b>{vehicle?.immatriculation}</Text>
                              <Text size="$xs" color="$accents7">
                                {vehicle?.marque} {vehicle?.modele} - {vehicle?.type}
                              </Text>
                              {row.notes && <Text size="$xs" color="$accents7">Note: {row.notes}</Text>}
                            </Box>
                            <Text b color="$warning">{row.fuelCost.toFixed(2)} TND</Text>
                          </Flex>
                        </Card>
                      );
                    })}
                    <Flex justify="end" css={{ mt: '$2' }}>
                      <Text b>Subtotal: {totals.totalFuelCost.toFixed(2)} TND</Text>
                    </Flex>
                  </Box>
                )}

                {/* Stock Summary */}
                {stockUsage.length > 0 && (
                  <Box>
                    <Text b size="$lg" css={{ mb: '$3' }}>📦 Stock Materials ({stockUsage.length})</Text>
                    {stockUsage.map((item, index) => {
                      const stockItem = stock.find(s => s._id === item.stockId);
                      return (
                        <Card key={index} variant="flat" css={{ p: '$4', mb: '$2' }}>
                          <Flex justify="between" align="center">
                            <Box>
                              <Text b>{stockItem?.name}</Text>
                              <Text size="$xs" color="$accents7">
                                Using: {item.quantityUsed} {stockItem?.unit}
                              </Text>
                              <Text size="$xs" color="$accents7">
                                Remaining: {(stockItem?.quantity || 0) - item.quantityUsed} {stockItem?.unit}
                              </Text>
                            </Box>
                            <Text b color="$secondary">
                              {((stockItem?.price || 0) * item.quantityUsed).toFixed(2)} TND
                            </Text>
                          </Flex>
                        </Card>
                      );
                    })}
                    <Flex justify="end" css={{ mt: '$2' }}>
                      <Text b>Subtotal: {totals.totalStockCost.toFixed(2)} TND</Text>
                    </Flex>
                  </Box>
                )}

                {/* Notes */}
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

                {/* Total Cost */}
                <Card variant="flat" css={{ p: '$8', bg: '$success', color: 'white' }}>
                  <Flex direction="column" css={{ gap: '$3' }}>
                    <Text h3 css={{ color: 'white', m: 0 }}>Total Cost</Text>
                    <Divider css={{ bg: 'white', opacity: 0.3 }} />
                    <Flex justify="between">
                      <Text css={{ color: 'white' }}>Personnel:</Text>
                      <Text b css={{ color: 'white' }}>{totals.totalPersonnelCost.toFixed(2)} TND</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text css={{ color: 'white' }}>Fuel:</Text>
                      <Text b css={{ color: 'white' }}>{totals.totalFuelCost.toFixed(2)} TND</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text css={{ color: 'white' }}>Stock:</Text>
                      <Text b css={{ color: 'white' }}>{totals.totalStockCost.toFixed(2)} TND</Text>
                    </Flex>
                    <Divider css={{ bg: 'white', opacity: 0.5 }} />
                    <Flex justify="between">
                      <Text h4 css={{ color: 'white', m: 0 }}>TOTAL:</Text>
                      <Text h3 css={{ color: 'white', m: 0 }}>{totals.totalCost.toFixed(2)} TND</Text>
                    </Flex>
                  </Flex>
                </Card>
              </Flex>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

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
        <Flex direction="column" css={{ w: '100%', gap: '$4' }}>
          <Text h3>
            {initialData ? 'Edit Daily Assignment' : 'New Daily Assignment'}
          </Text>
          <Box css={{ w: '100%' }}>
            <Progress value={getProgressPercentage()} color="primary" />
            <Flex justify="between" css={{ mt: '$2' }}>
              <Text size="$xs" color="$accents7">Step {currentStep} of 5</Text>
              <Text size="$xs" color="$accents7">{getProgressPercentage()}% Complete</Text>
            </Flex>
          </Box>
        </Flex>
      </Modal.Header>
      <Divider css={{ my: '$5' }} />
      
      <Modal.Body css={{ py: '$8' }}>
        {renderStepContent()}
      </Modal.Body>

      <Divider css={{ my: '$5' }} />
      <Modal.Footer>
        <Flex justify="between" css={{ w: '100%' }}>
          <Button auto flat onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Flex css={{ gap: '$2' }}>
            {currentStep > 1 && (
              <Button auto flat onClick={handlePrevious} disabled={loading}>
                ← Previous
              </Button>
            )}
            {currentStep < 5 ? (
              <Button auto color="primary" onClick={handleNext} disabled={loading}>
                Next →
              </Button>
            ) : (
              <Button auto color="success" onClick={handleSubmit} disabled={loading}>
                {loading ? <Loading color="currentColor" size="sm" /> : '✓ Finish & Create'}
              </Button>
            )}
          </Flex>
        </Flex>
      </Modal.Footer>
    </Modal>
  );
};
