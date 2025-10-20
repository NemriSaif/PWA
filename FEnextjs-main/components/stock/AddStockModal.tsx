import { Button, Input, Modal, Row, Text, Textarea } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const AddStockModal = ({ visible, closeHandler, onAdd }: any) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [note, setNote] = useState('');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');

  useEffect(() => {
    if (visible) {
      // Fetch suppliers for dropdown
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/fournisseur`)
        .then(res => setSuppliers(res.data))
        .catch(err => console.error('Error fetching suppliers:', err));
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!name || !quantity) {
      alert('Please fill in required fields');
      return;
    }

    const result = await onAdd({
      name,
      quantity: parseFloat(quantity),
      unit,
      category,
      fournisseur: selectedSupplier || undefined,
      minQuantity: minQuantity ? parseFloat(minQuantity) : undefined,
      note,
    });

    if (result.success) {
      // Reset form
      setName('');
      setQuantity('');
      setUnit('');
      setCategory('');
      setSelectedSupplier('');
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
          <div style={{ width: '100%' }}>
            <label style={{ fontSize: '14px', marginBottom: '4px', display: 'block' }}>Supplier</label>
            <select
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '2px solid #e4e4e7',
                fontSize: '16px',
              }}
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
            >
              <option value="">Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
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
