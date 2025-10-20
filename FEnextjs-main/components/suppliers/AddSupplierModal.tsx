import { Button, Input, Modal, Row, Text, Textarea } from '@nextui-org/react';
import React from 'react';

export const AddSupplierModal = ({ visible, closeHandler, onAdd }: any) => {
  const [name, setName] = React.useState('');
  const [contact, setContact] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [note, setNote] = React.useState('');

  const handleSubmit = async () => {
    const result = await onAdd({
      name,
      contact,
      phone,
      email,
      address,
      category,
      note,
    });

    if (result.success) {
      setName('');
      setContact('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCategory('');
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
          Add New Supplier
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Input
          clearable
          bordered
          fullWidth
          size="lg"
          placeholder="Supplier Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          label="Name *"
        />
        <Input
          clearable
          bordered
          fullWidth
          size="lg"
          placeholder="Contact Person"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          label="Contact"
        />
        <Row gap={1}>
          <Input
            clearable
            bordered
            fullWidth
            size="lg"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            label="Phone"
          />
          <Input
            clearable
            bordered
            fullWidth
            size="lg"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
          />
        </Row>
        <Input
          clearable
          bordered
          fullWidth
          size="lg"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          label="Address"
        />
        <Input
          clearable
          bordered
          fullWidth
          size="lg"
          placeholder="e.g., Materials, Fuel, Tools"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          label="Category"
        />
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
          Add Supplier
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
