import { Button, Divider, Input, Modal, Text, Loading, Grid } from '@nextui-org/react';
import React, { useState, useEffect } from 'react';
import { Flex } from '../styles/flex';
import { PersonnelData } from '../../pages/employees';

interface AddPersonnelModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: PersonnelData) => void;
  initialData?: PersonnelData;
  readOnly?: boolean;
  loading?: boolean;
}

export const AddPersonnelModal = ({ 
  visible, 
  onClose, 
  onSubmit, 
  initialData, 
  readOnly,
  loading 
}: AddPersonnelModalProps) => {
  const [formData, setFormData] = useState<PersonnelData>(
    initialData || { name: '', role: '', phone: '', cin: '', salary: undefined }
  );
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', role: '', phone: '', cin: '', salary: undefined });
      setErrors({});
    }
  }, [initialData, visible]);

  const handleChange = (field: keyof PersonnelData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (formData.phone && !/^[+]?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (formData.cin) {
      if (formData.cin.length !== 8) {
        newErrors.cin = 'CIN must be exactly 8 characters';
      } else if (!/^\d{8}$/.test(formData.cin)) {
        newErrors.cin = 'CIN must contain only 8 digits';
      }
    }

    if (formData.salary !== undefined && formData.salary < 0) {
      newErrors.salary = 'Salary cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    if (onSubmit) {
      onSubmit({
        ...formData,
        name: formData.name.trim(),
        role: formData.role?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        cin: formData.cin?.trim() || undefined,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Modal 
      closeButton 
      open={visible} 
      onClose={onClose} 
      width="600px"
      scroll
      blur
      preventClose={loading}
      css={{
        '@xsMax': {
          width: '95vw',
          margin: '$4',
        }
      }}
    >
      <Modal.Header>
        <Text h4 css={{ '@xsMax': { fontSize: '$lg' } }}>
          {readOnly ? 'Personnel Details' : initialData ? 'Edit Personnel' : 'Add New Personnel'}
        </Text>
      </Modal.Header>
      <Divider css={{ my: '$5' }} />
      <Modal.Body>
        <Flex direction="column" css={{ gap: '$6' }}>
          {/* Name Field */}
          <div>
            <Input
              label="Name"
              bordered
              fullWidth
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              readOnly={readOnly}
              disabled={loading}
              color={errors.name ? 'error' : 'default'}
              helperColor="error"
              helperText={errors.name}
              onKeyPress={handleKeyPress}
              placeholder="Enter full name"
              css={{ '@xsMax': { fontSize: '$sm' } }}
            />
          </div>

          {/* Role & Phone */}
          <Flex 
            css={{ 
              gap: '$4',
              '@xsMax': { flexDirection: 'column' }
            }}
          >
            <div style={{ flex: 1 }}>
              <Input
                label="Role"
                bordered
                fullWidth
                value={formData.role || ''}
                onChange={(e) => handleChange('role', e.target.value)}
                readOnly={readOnly}
                disabled={loading}
                placeholder="e.g., Driver, Operator"
                css={{ '@xsMax': { fontSize: '$sm' } }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <Input
                label="Phone"
                bordered
                fullWidth
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                readOnly={readOnly}
                disabled={loading}
                color={errors.phone ? 'error' : 'default'}
                helperColor="error"
                helperText={errors.phone}
                placeholder="+216 20 123 456"
                css={{ '@xsMax': { fontSize: '$sm' } }}
              />
            </div>
          </Flex>

          {/* CIN & Salary */}
          <Flex 
            css={{ 
              gap: '$4',
              '@xsMax': { flexDirection: 'column' }
            }}
          >
            <div style={{ flex: 1 }}>
              <Input
                label="CIN"
                bordered
                fullWidth
                value={formData.cin || ''}
                onChange={(e) => handleChange('cin', e.target.value)}
                readOnly={readOnly}
                disabled={loading}
                color={errors.cin ? 'error' : 'default'}
                helperColor="error"
                helperText={errors.cin}
                placeholder="8 digits"
                maxLength={8}
                css={{ '@xsMax': { fontSize: '$sm' } }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <Input
                label="Salary (TND)"
                bordered
                fullWidth
                type="number"
                value={formData.salary?.toString() || ''}
                onChange={(e) => handleChange('salary', e.target.value ? parseFloat(e.target.value) : undefined)}
                readOnly={readOnly}
                disabled={loading}
                color={errors.salary ? 'error' : 'default'}
                helperColor="error"
                helperText={errors.salary}
                placeholder="0.00"
                min={0}
                step="0.01"
                css={{ '@xsMax': { fontSize: '$sm' } }}
              />
            </div>
          </Flex>

          <Text css={{ fontSize: '$xs', color: '$accents8' }}>
            * Required fields
          </Text>
        </Flex>
      </Modal.Body>
      
      {!readOnly && (
        <>
          <Divider css={{ my: '$5' }} />
          <Modal.Footer>
            <Button 
              auto 
              flat 
              onClick={onClose}
              disabled={loading}
              css={{ '@xsMax': { fontSize: '$sm', px: '$6' } }}
            >
              Cancel
            </Button>
            <Button 
              auto 
              onClick={handleSubmit}
              disabled={loading}
              css={{ '@xsMax': { fontSize: '$sm', px: '$6' } }}
            >
              {loading ? (
                <Loading color="currentColor" size="sm" />
              ) : (
                initialData ? 'Update Personnel' : 'Add Personnel'
              )}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};