import {
  Button,
  Divider,
  Input,
  Modal,
  Text,
  Loading,
  Grid,
  Checkbox,
  Textarea,
  Dropdown,
  Card,
  Badge,
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
  FuelCost,
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
  onMarkPaid?: (assignmentId: string, personnelId: string) => Promise<{ success: boolean; message: string }>;
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
  onMarkPaid,
}: DailyAssignmentModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DailyAssignmentData>({
    date: new Date().toISOString().split('T')[0],
    chantier: '',
    personnelAssignments: [],
    vehiculeAssignments: [],
    fuelCosts: [],
    notes: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Personnel selection state
  const [selectedPersonnel, setSelectedPersonnel] = useState<Set<string>>(new Set());
  const [personnelSalaries, setPersonnelSalaries] = useState<{ [key: string]: number }>({});
  const [personnelNotes, setPersonnelNotes] = useState<{ [key: string]: string }>({});

  // Vehicle selection state
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [vehicleNotes, setVehicleNotes] = useState<{ [key: string]: string }>({});

  // Fuel costs state
  const [fuelCostsList, setFuelCostsList] = useState<FuelCost[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: new Date(initialData.date).toISOString().split('T')[0],
      });

      // Populate personnel
      const personnelSet = new Set<string>();
      const salaries: { [key: string]: number } = {};
      const pNotes: { [key: string]: string } = {};

      initialData.personnelAssignments?.forEach((pa) => {
        const id = typeof pa.personnel === 'object' ? pa.personnel._id : pa.personnel;
        personnelSet.add(id);
        salaries[id] = pa.salary || 0;
        pNotes[id] = pa.notes || '';
      });

      setSelectedPersonnel(personnelSet);
      setPersonnelSalaries(salaries);
      setPersonnelNotes(pNotes);

      // Populate vehicles
      const vehicleSet = new Set<string>();
      const vNotes: { [key: string]: string } = {};

      initialData.vehiculeAssignments?.forEach((va) => {
        const id = typeof va.vehicule === 'object' ? va.vehicule._id : va.vehicule;
        vehicleSet.add(id);
        vNotes[id] = va.notes || '';
      });

      setSelectedVehicles(vehicleSet);
      setVehicleNotes(vNotes);

      // Populate fuel costs
      setFuelCostsList(initialData.fuelCosts || []);
    } else {
      resetForm();
    }
  }, [initialData, visible]);

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      chantier: '',
      personnelAssignments: [],
      vehiculeAssignments: [],
      fuelCosts: [],
      notes: '',
    });
    setSelectedPersonnel(new Set());
    setPersonnelSalaries({});
    setPersonnelNotes({});
    setSelectedVehicles(new Set());
    setVehicleNotes({});
    setFuelCostsList([]);
    setErrors({});
    setStep(1);
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!formData.date) {
        newErrors.date = 'Date is required';
      }
      if (!formData.chantier) {
        newErrors.chantier = 'Work site is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handlePersonnelToggle = (personnelId: string) => {
    const newSelected = new Set(selectedPersonnel);
    if (newSelected.has(personnelId)) {
      newSelected.delete(personnelId);
      const newSalaries = { ...personnelSalaries };
      const newNotes = { ...personnelNotes };
      delete newSalaries[personnelId];
      delete newNotes[personnelId];
      setPersonnelSalaries(newSalaries);
      setPersonnelNotes(newNotes);
    } else {
      newSelected.add(personnelId);
      const person = personnel.find((p) => p._id === personnelId);
      if (person && person.salary) {
        setPersonnelSalaries({ ...personnelSalaries, [personnelId]: person.salary });
      }
    }
    setSelectedPersonnel(newSelected);
  };

  const handleVehicleToggle = (vehicleId: string) => {
    const newSelected = new Set(selectedVehicles);
    if (newSelected.has(vehicleId)) {
      newSelected.delete(vehicleId);
      const newNotes = { ...vehicleNotes };
      delete newNotes[vehicleId];
      setVehicleNotes(newNotes);
    } else {
      newSelected.add(vehicleId);
    }
    setSelectedVehicles(newSelected);
  };

  const addFuelCost = () => {
    setFuelCostsList([
      ...fuelCostsList,
      { description: '', amount: 0, paymentMethod: 'cash', notes: '' },
    ]);
  };

  const removeFuelCost = (index: number) => {
    setFuelCostsList(fuelCostsList.filter((_, i) => i !== index));
  };

  const updateFuelCost = (index: number, field: keyof FuelCost, value: any) => {
    const updated = [...fuelCostsList];
    updated[index] = { ...updated[index], [field]: value };
    setFuelCostsList(updated);
  };

  const handleSubmit = () => {
    if (!validateStep(1)) {
      setStep(1);
      return;
    }

    // Build personnel assignments
    const personnelAssignments: PersonnelAssignment[] = Array.from(selectedPersonnel).map(
      (personnelId) => ({
        personnel: personnelId,
        isPayed: false,
        salary: personnelSalaries[personnelId] || 0,
        notes: personnelNotes[personnelId] || '',
      })
    );

    // Build vehicle assignments
    const vehiculeAssignments: VehiculeAssignment[] = Array.from(selectedVehicles).map(
      (vehicleId) => ({
        vehicule: vehicleId,
        notes: vehicleNotes[vehicleId] || '',
      })
    );

    const submitData: DailyAssignmentData = {
      ...formData,
      personnelAssignments,
      vehiculeAssignments,
      fuelCosts: fuelCostsList.filter((fc) => fc.description && fc.amount > 0),
    };

    if (onSubmit) {
      onSubmit(submitData);
    }
  };

  const calculateTotals = () => {
    const totalPersonnel = Array.from(selectedPersonnel).reduce(
      (sum, id) => sum + (personnelSalaries[id] || 0),
      0
    );
    const totalFuel = fuelCostsList.reduce((sum, fc) => sum + (fc.amount || 0), 0);
    return { totalPersonnel, totalFuel, total: totalPersonnel + totalFuel };
  };

  const totals = calculateTotals();

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Flex direction="column" css={{ gap: '$6' }}>
            <Text h5>Basic Information</Text>

            <Input
              label="Date"
              type="date"
              bordered
              fullWidth
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              color={errors.date ? 'error' : 'default'}
              helperColor="error"
              helperText={errors.date}
              required
            />

            <Dropdown>
              <Dropdown.Button
                flat
                css={{ width: '100%', justifyContent: 'space-between' }}
                color={errors.chantier ? 'error' : 'default'}
              >
                {formData.chantier
                  ? chantiers.find((c) => c._id === formData.chantier)?.name || 'Select Work Site'
                  : 'Select Work Site *'}
              </Dropdown.Button>
              <Dropdown.Menu
                aria-label="Work site selection"
                selectionMode="single"
                selectedKeys={
                  formData.chantier
                    ? [typeof formData.chantier === 'string' ? formData.chantier : (formData.chantier as ChantierData)._id]
                    : []
                }
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFormData({ ...formData, chantier: selected });
                  setErrors({ ...errors, chantier: '' });
                }}
              >
                {chantiers.map((chantier) => (
                  <Dropdown.Item key={chantier._id}>
                    {chantier.name} - {chantier.location}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            {errors.chantier && (
              <Text size={12} color="error">
                {errors.chantier}
              </Text>
            )}

            <Textarea
              label="General Notes"
              bordered
              fullWidth
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any general notes about this assignment..."
              minRows={2}
            />
          </Flex>
        );

      case 2:
        return (
          <Flex direction="column" css={{ gap: '$6' }}>
            <Text h5>Assign Personnel ({selectedPersonnel.size} selected)</Text>

            {personnel.length === 0 ? (
              <Text color="$accents7">No personnel available</Text>
            ) : (
              <Box css={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Grid.Container gap={2}>
                  {personnel.map((person) => {
                    const isSelected = selectedPersonnel.has(person._id);
                    return (
                      <Grid xs={12} key={person._id}>
                        <Card
                          variant="bordered"
                          css={{
                            w: '100%',
                            p: '$8',
                            bg: isSelected ? '$primaryLight' : 'transparent',
                            borderColor: isSelected ? '$primary' : '$border',
                          }}
                        >
                          <Flex direction="column" css={{ gap: '$4' }}>
                            <Flex justify="between" align="center">
                              <Checkbox
                                isSelected={isSelected}
                                onChange={() => handlePersonnelToggle(person._id)}
                                size="lg"
                              >
                                <Text b>{person.name}</Text>
                              </Checkbox>
                              {person.role && (
                                <Badge color="primary" variant="flat">
                                  {person.role}
                                </Badge>
                              )}
                            </Flex>

                            {isSelected && (
                              <>
                                <Input
                                  label="Daily Salary (TND)"
                                  type="number"
                                  bordered
                                  size="sm"
                                  value={personnelSalaries[person._id]?.toString() || ''}
                                  onChange={(e) =>
                                    setPersonnelSalaries({
                                      ...personnelSalaries,
                                      [person._id]: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  min={0}
                                  step="0.01"
                                />
                                <Input
                                  label="Notes"
                                  bordered
                                  size="sm"
                                  value={personnelNotes[person._id] || ''}
                                  onChange={(e) =>
                                    setPersonnelNotes({
                                      ...personnelNotes,
                                      [person._id]: e.target.value,
                                    })
                                  }
                                  placeholder="Any specific notes..."
                                />
                              </>
                            )}
                          </Flex>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid.Container>
              </Box>
            )}

            <Card variant="bordered" css={{ p: '$8', bg: '$primaryLight' }}>
              <Flex justify="between" align="center">
                <Text b>Total Personnel Cost:</Text>
                <Text b color="$primary" size="$xl">
                  {totals.totalPersonnel.toFixed(2)} TND
                </Text>
              </Flex>
            </Card>
          </Flex>
        );

      case 3:
        return (
          <Flex direction="column" css={{ gap: '$6' }}>
            <Text h5>Assign Vehicles ({selectedVehicles.size} selected)</Text>

            {vehicules.length === 0 ? (
              <Text color="$accents7">No vehicles available</Text>
            ) : (
              <Box css={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Grid.Container gap={2}>
                  {vehicules.map((vehicle) => {
                    const isSelected = selectedVehicles.has(vehicle._id);
                    return (
                      <Grid xs={12} key={vehicle._id}>
                        <Card
                          variant="bordered"
                          css={{
                            w: '100%',
                            p: '$8',
                            bg: isSelected ? '$warningLight' : 'transparent',
                            borderColor: isSelected ? '$warning' : '$border',
                          }}
                        >
                          <Flex direction="column" css={{ gap: '$4' }}>
                            <Flex justify="between" align="center">
                              <Checkbox
                                isSelected={isSelected}
                                onChange={() => handleVehicleToggle(vehicle._id)}
                                size="lg"
                              >
                                <Text b>{vehicle.name}</Text>
                              </Checkbox>
                              {vehicle.plateNumber && (
                                <Badge color="warning" variant="flat">
                                  {vehicle.plateNumber}
                                </Badge>
                              )}
                            </Flex>

                            {isSelected && (
                              <Input
                                label="Notes"
                                bordered
                                size="sm"
                                value={vehicleNotes[vehicle._id] || ''}
                                onChange={(e) =>
                                  setVehicleNotes({
                                    ...vehicleNotes,
                                    [vehicle._id]: e.target.value,
                                  })
                                }
                                placeholder="Any specific notes..."
                              />
                            )}
                          </Flex>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid.Container>
              </Box>
            )}
          </Flex>
        );

      case 4:
        return (
          <Flex direction="column" css={{ gap: '$6' }}>
            <Flex justify="between" align="center">
              <Text h5>Fuel Costs ({fuelCostsList.length})</Text>
              <Button auto size="sm" onClick={addFuelCost}>
                + Add Fuel Cost
              </Button>
            </Flex>

            {fuelCostsList.length === 0 ? (
              <Text color="$accents7">No fuel costs added</Text>
            ) : (
              <Box css={{ maxHeight: '400px', overflowY: 'auto' }}>
                {fuelCostsList.map((fuelCost, index) => (
                  <Card key={index} variant="bordered" css={{ p: '$8', mb: '$4' }}>
                    <Flex direction="column" css={{ gap: '$4' }}>
                      <Flex justify="between" align="center">
                        <Text b>Fuel Cost #{index + 1}</Text>
                        <Button
                          auto
                          size="xs"
                          flat
                          color="error"
                          onClick={() => removeFuelCost(index)}
                        >
                          Remove
                        </Button>
                      </Flex>

                      <Input
                        label="Description"
                        bordered
                        fullWidth
                        value={fuelCost.description}
                        onChange={(e) => updateFuelCost(index, 'description', e.target.value)}
                        placeholder="e.g., Diesel for Truck 1"
                      />

                      <Grid.Container gap={2}>
                        <Grid xs={12} sm={6}>
                          <Input
                            label="Amount (TND)"
                            type="number"
                            bordered
                            fullWidth
                            value={fuelCost.amount.toString()}
                            onChange={(e) =>
                              updateFuelCost(index, 'amount', parseFloat(e.target.value) || 0)
                            }
                            min={0}
                            step="0.01"
                          />
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <Dropdown>
                            <Dropdown.Button flat css={{ width: '100%' }}>
                              {fuelCost.paymentMethod === 'cash'
                                ? '💵 Cash'
                                : fuelCost.paymentMethod === 'credit_card'
                                ? '💳 Credit Card'
                                : fuelCost.paymentMethod === 'check'
                                ? '📝 Check'
                                : '📋 Other'}
                            </Dropdown.Button>
                            <Dropdown.Menu
                              aria-label="Payment method"
                              selectionMode="single"
                              selectedKeys={[fuelCost.paymentMethod]}
                              onSelectionChange={(keys) => {
                                const method = Array.from(keys)[0] as string;
                                updateFuelCost(index, 'paymentMethod', method);
                              }}
                            >
                              <Dropdown.Item key="cash">💵 Cash</Dropdown.Item>
                              <Dropdown.Item key="credit_card">💳 Credit Card</Dropdown.Item>
                              <Dropdown.Item key="check">📝 Check</Dropdown.Item>
                              <Dropdown.Item key="other">📋 Other</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </Grid>
                      </Grid.Container>

                      <Input
                        label="Notes"
                        bordered
                        fullWidth
                        value={fuelCost.notes}
                        onChange={(e) => updateFuelCost(index, 'notes', e.target.value)}
                        placeholder="Any additional notes..."
                      />
                    </Flex>
                  </Card>
                ))}
              </Box>
            )}

            <Card variant="bordered" css={{ p: '$8', bg: '$warningLight' }}>
              <Flex justify="between" align="center">
                <Text b>Total Fuel Cost:</Text>
                <Text b color="$warning" size="$xl">
                  {totals.totalFuel.toFixed(2)} TND
                </Text>
              </Flex>
            </Card>
          </Flex>
        );

      case 5:
        return (
          <Flex direction="column" css={{ gap: '$6' }}>
            <Text h5>Review & Confirm</Text>

            <Card variant="bordered" css={{ p: '$10' }}>
              <Text b css={{ mb: '$4' }}>
                Assignment Details
              </Text>
              <Flex direction="column" css={{ gap: '$2' }}>
                <Text>
                  <Text b span>
                    Date:
                  </Text>{' '}
                  {new Date(formData.date).toLocaleDateString('en-GB')}
                </Text>
                <Text>
                  <Text b span>
                    Work Site:
                  </Text>{' '}
                  {chantiers.find((c) => c._id === formData.chantier)?.name || 'N/A'}
                </Text>
              </Flex>
            </Card>

            <Grid.Container gap={2}>
              <Grid xs={12} sm={4}>
                <Card variant="bordered" css={{ p: '$8', w: '100%' }}>
                  <Text css={{ fontSize: '$xs', color: '$accents7' }}>Personnel</Text>
                  <Text h4 css={{ m: 0, mt: '$2' }}>
                    {selectedPersonnel.size}
                  </Text>
                  <Text b color="$primary" css={{ mt: '$2' }}>
                    {totals.totalPersonnel.toFixed(2)} TND
                  </Text>
                </Card>
              </Grid>
              <Grid xs={12} sm={4}>
                <Card variant="bordered" css={{ p: '$8', w: '100%' }}>
                  <Text css={{ fontSize: '$xs', color: '$accents7' }}>Vehicles</Text>
                  <Text h4 css={{ m: 0, mt: '$2' }}>
                    {selectedVehicles.size}
                  </Text>
                </Card>
              </Grid>
              <Grid xs={12} sm={4}>
                <Card variant="bordered" css={{ p: '$8', w: '100%' }}>
                  <Text css={{ fontSize: '$xs', color: '$accents7' }}>Fuel Costs</Text>
                  <Text h4 css={{ m: 0, mt: '$2' }}>
                    {fuelCostsList.length}
                  </Text>
                  <Text b color="$warning" css={{ mt: '$2' }}>
                    {totals.totalFuel.toFixed(2)} TND
                  </Text>
                </Card>
              </Grid>
            </Grid.Container>

            <Card variant="bordered" css={{ p: '$10', bg: '$successLight' }}>
              <Flex justify="between" align="center">
                <Text h4 css={{ m: 0 }}>
                  Grand Total:
                </Text>
                <Text h3 css={{ m: 0 }} color="$success">
                  {totals.total.toFixed(2)} TND
                </Text>
              </Flex>
            </Card>
          </Flex>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Basic Info';
      case 2:
        return 'Personnel';
      case 3:
        return 'Vehicles';
      case 4:
        return 'Fuel Costs';
      case 5:
        return 'Review';
      default:
        return '';
    }
  };

  return (
    <Modal
      closeButton
      open={visible}
      onClose={onClose}
      width="800px"
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
        <Flex direction="column" css={{ gap: '$2', w: '100%' }}>
          <Text h4 css={{ m: 0 }}>
            {initialData ? 'Edit Assignment' : 'New Daily Assignment'}
          </Text>
          <Text css={{ fontSize: '$sm', color: '$accents7' }}>
            Step {step} of 5: {getStepTitle()}
          </Text>
        </Flex>
      </Modal.Header>

      <Divider css={{ my: '$5' }} />

      {/* Progress Bar */}
      <Box css={{ px: '$10', mb: '$6' }}>
        <Flex css={{ gap: '$2' }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Box
              key={s}
              css={{
                flex: 1,
                height: '4px',
                borderRadius: '$xs',
                bg: s <= step ? '$primary' : '$accents3',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </Flex>
      </Box>

      <Modal.Body>{renderStepContent()}</Modal.Body>

      <Divider css={{ my: '$5' }} />

      <Modal.Footer>
        <Flex justify="between" css={{ w: '100%' }}>
          <Button auto flat onClick={step === 1 ? onClose : handleBack} disabled={loading}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button auto onClick={step === 5 ? handleSubmit : handleNext} disabled={loading}>
            {loading ? (
              <Loading color="currentColor" size="sm" />
            ) : step === 5 ? (
              initialData ? 'Update Assignment' : 'Create Assignment'
            ) : (
              'Next'
            )}
          </Button>
        </Flex>
      </Modal.Footer>
    </Modal>
  );
};