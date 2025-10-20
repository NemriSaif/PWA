import React, { useState } from 'react';
import { Modal, Input, Button, Text, Row, Checkbox, Spacer } from '@nextui-org/react';

interface TopUpModalProps {
  visible: boolean;
  closeHandler: () => void;
  stockItem: any;
  onTopUp: (stockId: string, quantity: number) => Promise<any>;
}

export const TopUpModal = ({ visible, closeHandler, stockItem, onTopUp }: TopUpModalProps) => {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!quantity || Number(quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    const result = await onTopUp(stockItem._id, Number(quantity));
    setLoading(false);

    if (result.success) {
      setQuantity('');
      closeHandler();
    } else {
      alert(result.message || 'Failed to top up stock');
    }
  };

  const handleClose = () => {
    setQuantity('');
    closeHandler();
  };

  if (!stockItem) return null;

  const newTotal = stockItem.quantity + (Number(quantity) || 0);
  const isLow = stockItem.minQuantity && stockItem.quantity <= stockItem.minQuantity;

  return (
    <Modal
      closeButton
      aria-labelledby="top-up-modal"
      open={visible}
      onClose={handleClose}
      width="600px"
    >
      <Modal.Header>
        <Text id="top-up-modal" size={18} b>
          Top Up Stock - {stockItem.name}
        </Text>
      </Modal.Header>
      <Modal.Body>
        {/* Stock Info */}
        <div style={{ 
          padding: '12px', 
          background: isLow ? '#FEE7EF' : '#F1F3F5', 
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <Text b size={14}>Current Stock Information</Text>
          <Spacer y={0.5} />
          <Row justify="space-between">
            <Text size={13}>Current Quantity:</Text>
            <Text b size={13} color={isLow ? 'error' : 'default'}>
              {stockItem.quantity} {stockItem.unit}
            </Text>
          </Row>
          <Row justify="space-between">
            <Text size={13}>Minimum Required:</Text>
            <Text size={13}>{stockItem.minQuantity} {stockItem.unit}</Text>
          </Row>
          <Row justify="space-between">
            <Text size={13}>Supplier:</Text>
            <Text b size={13} color="primary">
              {stockItem.fournisseur?.name || 'No supplier'}
            </Text>
          </Row>
          {stockItem.fournisseur?.phone && (
            <Row justify="space-between">
              <Text size={13}>Contact:</Text>
              <Text size={13}>{stockItem.fournisseur.phone}</Text>
            </Row>
          )}
        </div>

        {/* Quantity Input */}
        <Input
          clearable
          bordered
          fullWidth
          color="primary"
          size="lg"
          type="number"
          label={`Add Quantity (${stockItem.unit})`}
          placeholder="Enter quantity to add"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
        />

        {/* New Total Preview */}
        {quantity && Number(quantity) > 0 && (
          <div style={{ 
            padding: '12px', 
            background: '#E7F5FF', 
            borderRadius: '8px',
            marginTop: '16px'
          }}>
            <Row justify="space-between" align="center">
              <Text size={14}>New Total:</Text>
              <Text b size={18} color="success">
                {newTotal} {stockItem.unit}
              </Text>
            </Row>
            {stockItem.minQuantity && (
              <Row justify="space-between" style={{ marginTop: '8px' }}>
                <Text size={13}>Status:</Text>
                <Text b size={13} color={newTotal > stockItem.minQuantity ? 'success' : 'warning'}>
                  {newTotal > stockItem.minQuantity ? '✓ Above minimum' : '⚠ Still below minimum'}
                </Text>
              </Row>
            )}
          </div>
        )}

        <Spacer y={0.5} />
        <Text size={12} color="$gray600">
          This will add the specified quantity to your current stock.
        </Text>
      </Modal.Body>
      <Modal.Footer>
        <Button auto flat color="error" onPress={handleClose}>
          Cancel
        </Button>
        <Button 
          auto 
          onPress={handleSubmit} 
          disabled={!quantity || Number(quantity) <= 0 || loading}
        >
          {loading ? 'Adding...' : `Add ${quantity || 0} ${stockItem.unit}`}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
