import { Button, Input, Table, Text } from '@nextui-org/react';
import React from 'react';
import { Box } from '../styles/box';
import { AddSupplierModal } from './AddSupplierModal';
import { DeleteIcon } from '../icons/table/delete-icon';
import { EditIcon } from '../icons/table/edit-icon';

export const Suppliers = ({ suppliers, onAdd, onEdit, onDelete, onRefresh }: any) => {
  const [visible, setVisible] = React.useState(false);

  const handler = () => setVisible(true);
  const closeHandler = () => setVisible(false);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      const result = await onDelete(id);
      if (!result.success) {
        alert(result.message);
      }
    }
  };

  return (
    <Box css={{ overflow: 'auto', height: '100%' }}>
      <Text h3>Suppliers (Fournisseurs)</Text>
      <Box css={{ marginBottom: '$10', display: 'flex', gap: '$5', flexWrap: 'wrap' }}>
        <Button auto onPress={handler}>
          Add Supplier
        </Button>
        <Button auto flat onPress={onRefresh}>
          Refresh
        </Button>
      </Box>

      <Table
        lined
        headerLined
        shadow={false}
        css={{
          height: 'auto',
          minWidth: '100%',
        }}
      >
        <Table.Header>
          <Table.Column>NAME</Table.Column>
          <Table.Column>CONTACT</Table.Column>
          <Table.Column>PHONE</Table.Column>
          <Table.Column>EMAIL</Table.Column>
          <Table.Column>CATEGORY</Table.Column>
          <Table.Column>ACTIONS</Table.Column>
        </Table.Header>
        <Table.Body>
          {suppliers.map((supplier: any) => (
            <Table.Row key={supplier._id}>
              <Table.Cell>
                <Text b size={14}>{supplier.name}</Text>
              </Table.Cell>
              <Table.Cell>{supplier.contact || '-'}</Table.Cell>
              <Table.Cell>{supplier.phone || '-'}</Table.Cell>
              <Table.Cell>{supplier.email || '-'}</Table.Cell>
              <Table.Cell>{supplier.category || '-'}</Table.Cell>
              <Table.Cell>
                <Box css={{ display: 'flex', gap: '$5' }}>
                  <Button
                    auto
                    light
                    color="error"
                    icon={<DeleteIcon size={20} fill="#FF0080" />}
                    onPress={() => handleDelete(supplier._id)}
                  />
                </Box>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <AddSupplierModal
        visible={visible}
        closeHandler={closeHandler}
        onAdd={onAdd}
      />
    </Box>
  );
};
