import { Button, Input, Modal, Text } from '@nextui-org/react';
import React, { useState } from 'react';
import { Box } from '../styles/box';

export const ReorderModal = ({ visible, closeHandler, stockItem, onReorder }: any) => {
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const handleReorder = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const result = await onReorder({
      stockItemId: stockItem.sourceStockId || stockItem._id,
      quantity: parseFloat(quantity),
      notes,
    });

    if (result.success) {
      setQuantity('');
      setNotes('');
      closeHandler();
    } else {
      alert(result.message);
    }
  };

  if (!stockItem) return null;

  return (
    <Modal
      closeButton
      aria-labelledby="reorder-modal"
      width="600px"
      open={visible}
      onClose={closeHandler}
    >
      <Modal.Header>
        <Text h3>Reorder: {stockItem.name}</Text>
      </Modal.Header>
      <Modal.Body>
        <Box css={{ display: 'flex', flexDirection: 'column', gap: '$8' }}>
          <Box>
            <Text size="$sm" color="$accents7">Item</Text>
            <Text b>{stockItem.name}</Text>
          </Box>
          
          <Box css={{ display: 'flex', gap: '$4' }}>
            <Box css={{ flex: 1 }}>
              <Text size="$sm" color="$accents7">Current Stock</Text>
              <Text b color={stockItem.quantity < 10 ? 'error' : 'success'}>
                {stockItem.quantity} {stockItem.unit}
              </Text>
            </Box>
            <Box css={{ flex: 1 }}>
              <Text size="$sm" color="$accents7">Price</Text>
              <Text b color="primary">{stockItem.price} TND/{stockItem.unit}</Text>
            </Box>
          </Box>

          {stockItem.note && (
            <Box>
              <Text size="$sm" color="$accents7">Original Order Note</Text>
              <Text size="$sm">{stockItem.note}</Text>
            </Box>
          )}

          <Input
            clearable
            bordered
            fullWidth
            type="number"
            label="Quantity to Order *"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            helperText={quantity ? `Total: ${(parseFloat(quantity) * stockItem.price).toFixed(2)} TND` : ''}
          />
          
          <Input
            clearable
            bordered
            fullWidth
            label="Notes (optional)"
            placeholder="Delivery instructions, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Box>
      </Modal.Body>
      <Modal.Footer>
        <Button auto flat color="error" onPress={closeHandler}>
          Cancel
        </Button>
        <Button auto color="primary" onPress={handleReorder}>
          Place Order
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
