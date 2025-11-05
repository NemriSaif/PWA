import { Button, Input, Modal, Row, Text, Textarea } from '@nextui-org/react';
import React, { useState } from 'react';

export const AddStockModal = ({ visible, closeHandler, onAdd }: any) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = async () => {
    if (!name || !quantity || !price) {
      alert('Please fill in required fields (name, quantity, price)');
      return;
    }

    const result = await onAdd({
      name,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      unit,
      category,
      minQuantity: minQuantity ? parseFloat(minQuantity) : undefined,
      note,
    });

    if (result.success) {
      // Reset form
      setName('');
      setQuantity('');
      setPrice('');
      setUnit('');
      setCategory('');
      setMinQuantity('');
      setNote('');
      closeHandler();
    } else {
      alert(result.message);
    }
  };

  return (
    <Modal
      closeButton
      aria-labelledby="modal-title"
      width="600px"
      open={visible}
      onClose={closeHandler}
    >
      <Modal.Header>
        <Text id="modal-title" size={18}>
          Add Stock Item
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Input
          clearable
          bordered
          fullWidth
          size="lg"
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          label="Name *"
        />
        <Row gap={1}>
          <Input
            clearable
            bordered
            fullWidth
            size="lg"
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            label="Quantity *"
          />
          <Input
            clearable
            bordered
            fullWidth
            size="lg"
            placeholder="e.g., kg, L, pieces"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            label="Unit"
          />
        </Row>
        <Input
          clearable
          bordered
          fullWidth
          size="lg"
          placeholder="e.g., Materials, Tools, Fuel"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          label="Category"
        />
        <Row gap={1}>
          <Input
            clearable
            bordered
            fullWidth
            size="lg"
            type="number"
            placeholder="Minimum quantity alert"
            value={minQuantity}
            onChange={(e) => setMinQuantity(e.target.value)}
            label="Min Quantity"
          />
          <Input
            clearable
            bordered
            fullWidth
            size="lg"
            type="number"
            placeholder="Price per unit"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            label="Price *"
          />
        </Row>
        <Textarea
          bordered
          fullWidth
          placeholder="Additional notes"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          label="Note"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button auto flat color="error" onPress={closeHandler}>
          Cancel
        </Button>
        <Button auto onPress={handleSubmit}>
          Add Stock
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
