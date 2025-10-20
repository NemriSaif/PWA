import { Button, Divider, Input, Modal, Text } from '@nextui-org/react';
import React, { useState, useEffect } from 'react';
import { Flex } from '../styles/flex';
import { VehiculeData } from '../../pages/vehicles';

interface AddVehiculeModalProps {
  onSubmit: (data: VehiculeData) => void;
  initialData?: VehiculeData;
}

export const AddVehiculeModal = ({ onSubmit, initialData }: AddVehiculeModalProps) => {
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState<VehiculeData>(
    initialData || {
      immatriculation: '',
      marque: '',
      modele: '',
      type: '',
      kilometrage: 0,
      chantier: '',
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const openHandler = () => setVisible(true);
  const closeHandler = () => setVisible(false);

  const handleChange = (field: keyof VehiculeData, value: any) =>
    setFormData({ ...formData, [field]: value });

  const handleSubmit = () => {
    onSubmit(formData);
    closeHandler();
  };

  return (
    <>
      <Button auto onClick={openHandler}>
        {initialData ? 'Edit Vehicule' : 'Add Vehicule'}
      </Button>

      <Modal closeButton open={visible} onClose={closeHandler} width="600px">
        <Modal.Header>
          <Text h4>{initialData ? 'Edit Vehicule' : 'Add New Vehicule'}</Text>
        </Modal.Header>
        <Divider css={{ my: '$5' }} />
        <Modal.Body>
          <Flex direction="column" css={{ gap: '$8' }}>
            <Input
              label="Immatriculation"
              bordered
              fullWidth
              value={formData.immatriculation}
              onChange={(e) => handleChange('immatriculation', e.target.value)}
            />
            <Input
              label="Marque"
              bordered
              fullWidth
              value={formData.marque}
              onChange={(e) => handleChange('marque', e.target.value)}
            />
            <Input
              label="Modèle"
              bordered
              fullWidth
              value={formData.modele}
              onChange={(e) => handleChange('modele', e.target.value)}
            />
            <Input
              label="Type"
              bordered
              fullWidth
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
            />
            <Input
              label="Kilométrage"
              bordered
              fullWidth
              type="number"
              value={formData.kilometrage || 0}
              onChange={(e) => handleChange('kilometrage', Number(e.target.value))}
            />
            <Input
              label="Chantier (optional)"
              bordered
              fullWidth
              value={formData.chantier || ''}
              onChange={(e) => handleChange('chantier', e.target.value)}
            />
          </Flex>
        </Modal.Body>
        <Divider css={{ my: '$5' }} />
        <Modal.Footer>
          <Button auto onClick={handleSubmit}>
            {initialData ? 'Update' : 'Add Vehicule'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
