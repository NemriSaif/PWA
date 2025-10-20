import { Button, Divider, Input, Modal, Text, Textarea, Loading } from '@nextui-org/react';
import React, { useState, useEffect } from 'react';
import { Flex } from '../styles/flex';
import { WorkSiteData } from '../../pages/work-sites';

interface WorksiteModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: WorkSiteData) => void;
  initialData?: WorkSiteData;
  readOnly?: boolean;
  loading?: boolean;
}

export const WorksiteModal = ({ 
  visible, 
  onClose, 
  onSubmit, 
  initialData, 
  readOnly,
  loading 
}: WorksiteModalProps) => {
  const [formData, setFormData] = useState<WorkSiteData>(
    initialData || { name: '', location: '', note: '', startDate: '', endDate: '' }
  );
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        startDate: initialData.startDate?.slice(0, 10) || '',
        endDate: initialData.endDate?.slice(0, 10) || '',
      });
    } else {
      // Reset form when opening for new entry
      setFormData({ name: '', location: '', note: '', startDate: '', endDate: '' });
      setErrors({});
    }
  }, [initialData, visible]);

  const handleChange = (field: keyof WorkSiteData, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Name validation
    if (!formData.name?.trim()) {
      newErrors.name = 'Work site name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    // Location validation
    if (!formData.location?.trim()) {
      newErrors.location = 'Location is required';
    }

    // Date validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
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
        location: formData.location.trim(),
        note: formData.note?.trim() || '',
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
          {readOnly ? 'Worksite Details' : initialData ? 'Edit Worksite' : 'Add New Worksite'}
        </Text>
      </Modal.Header>
      <Divider css={{ my: '$5' }} />
      <Modal.Body>
        <Flex direction="column" css={{ gap: '$6' }}>
          {/* Name Field */}
          <div>
            <Input
              label="Worksite Name"
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
              placeholder="e.g. Construction Site A"
              css={{
                '@xsMax': { fontSize: '$sm' }
              }}
            />
          </div>

          {/* Location Field */}
          <div>
            <Input
              label="Location"
              bordered
              fullWidth
              required
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              readOnly={readOnly}
              disabled={loading}
              color={errors.location ? 'error' : 'default'}
              helperColor="error"
              helperText={errors.location}
              onKeyPress={handleKeyPress}
              placeholder="e.g. Tunis, Tunisia"
              css={{
                '@xsMax': { fontSize: '$sm' }
              }}
            />
          </div>

          {/* Note Field */}
          <div>
            <Textarea
              label="Note"
              bordered
              fullWidth
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              readOnly={readOnly}
              disabled={loading}
              placeholder="Additional notes about this work site..."
              minRows={3}
              maxRows={6}
              css={{
                '@xsMax': { fontSize: '$sm' }
              }}
            />
          </div>

          {/* Date Fields */}
          <Flex 
            css={{ 
              gap: '$4',
              '@xsMax': { flexDirection: 'column' }
            }}
          >
            <div style={{ flex: 1 }}>
              <Input
                label="Start Date"
                bordered
                fullWidth
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => handleChange('startDate', e.target.value)}
                readOnly={readOnly}
                disabled={loading}
                css={{
                  '@xsMax': { fontSize: '$sm' }
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <Input
                label="End Date"
                bordered
                fullWidth
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value)}
                readOnly={readOnly}
                disabled={loading}
                color={errors.endDate ? 'error' : 'default'}
                helperColor="error"
                helperText={errors.endDate}
                css={{
                  '@xsMax': { fontSize: '$sm' }
                }}
              />
            </div>
          </Flex>

          {/* Helper Text */}
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
              css={{
                '@xsMax': { fontSize: '$sm', px: '$6' }
              }}
            >
              Cancel
            </Button>
            <Button 
              auto 
              onClick={handleSubmit}
              disabled={loading}
              css={{
                '@xsMax': { fontSize: '$sm', px: '$6' }
              }}
            >
              {loading ? (
                <Loading color="currentColor" size="sm" />
              ) : (
                initialData ? 'Update Worksite' : 'Add Worksite'
              )}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};