import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Text, Row, Loading, Textarea } from '@nextui-org/react';
import { apiPost } from '../../utils/apiClient';
import { Box } from '../styles/box';

interface OrderModalProps {
  visible: boolean;
  closeHandler: () => void;
  stockItem: any;
}

export const OrderModal = ({ visible, closeHandler, stockItem }: OrderModalProps) => {
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setQuantity('');
      setNotes('');
      setLoading(false);
    }
  }, [visible]);

  if (!stockItem) return null;

  const handleSubmit = async () => {
    if (!quantity || Number(quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        stockItem: stockItem._id,
        quantity: Number(quantity),
        notes: notes || undefined,
      };

      await apiPost('/order', payload, 'order');
      setLoading(false);
      alert('Order created — manager order queued/sent');
      closeHandler();
      // optionally navigate to /orders, but keep modal simple
    } catch (err: any) {
      setLoading(false);
      const isQueued = err?.message?.includes('queued');
      if (isQueued) {
        alert('✅ Order queued for sync when online');
        closeHandler();
        return;
      }
      console.error('Error creating order', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to create order');
    }
  };

  return (
    <Modal
      closeButton
      aria-labelledby="order-modal"
      open={visible}
      onClose={closeHandler}
      width="600px"
    >
      <Modal.Header>
        <Text id="order-modal" size={18} b>
          Order Stock - {stockItem.name}
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Box css={{ mb: '$6' }}>
          <Text size="$sm">Current Quantity: <Text b span>{stockItem.quantity} {stockItem.unit || ''}</Text></Text>
        </Box>

        <Input
          clearable
          bordered
          fullWidth
          size="lg"
          type="number"
          placeholder="Quantity to order"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          label="Quantity *"
        />

        <Textarea
          bordered
          fullWidth
          placeholder="Optional notes for supplier"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          label="Notes"
          css={{ mt: '$4' }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button auto flat color="error" onPress={closeHandler}>
          Cancel
        </Button>
        <Button auto onPress={handleSubmit} disabled={!quantity || Number(quantity) <= 0 || loading}>
          {loading ? <Loading size="sm" /> : 'Place Order'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderModal;
