import { Button, Table, Text } from '@nextui-org/react';
import React from 'react';
import { Box } from '../styles/box';
import { AddStockModal } from './AddStockModal';
import { PlaceOrderModal } from './PlaceOrderModal';
import { TopUpModal } from './TopUpModal';
import { ReorderModal } from './ReorderModal';
import { DeleteIcon } from '../icons/table/delete-icon';
import { getUserRole } from '../../utils/auth';

export const StockList = ({ stock, onAdd, onEdit, onDelete, onRefresh, onTopUp, onPlaceOrder, onReorder }: any) => {
  const [visible, setVisible] = React.useState(false);
  const [placeOrderVisible, setPlaceOrderVisible] = React.useState(false);
  const [topUpVisible, setTopUpVisible] = React.useState(false);
  const [reorderVisible, setReorderVisible] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);

  const userRole = getUserRole();
  const isManager = userRole === 'manager';
  const isSupplier = userRole === 'fournisseur';

  const handler = () => setVisible(true);
  const closeHandler = () => setVisible(false);

  const handlePlaceOrder = () => setPlaceOrderVisible(true);
  const closePlaceOrderHandler = () => setPlaceOrderVisible(false);
  
  const handleTopUp = (item: any) => {
    setSelectedItem(item);
    setTopUpVisible(true);
  };

  const handleReorder = (item: any) => {
    setSelectedItem(item);
    // If item has sourceStockId, use reorder modal (quick reorder from same supplier)
    // Otherwise, use place order modal to browse all suppliers
    if (item.sourceStockId) {
      setReorderVisible(true);
    } else {
      setPlaceOrderVisible(true);
    }
  };
  
  const closeTopUpHandler = () => {
    setTopUpVisible(false);
    setSelectedItem(null);
  };

  const closeReorderHandler = () => {
    setReorderVisible(false);
    setSelectedItem(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this stock item?')) {
      const result = await onDelete(id);
      if (!result.success) {
        alert(result.message);
      }
    }
  };

  return (
    <Box css={{ overflow: 'auto', height: '100%' }}>
      <Text h3>{isManager ? 'My Stock' : 'Stock Inventory'}</Text>
      <Box css={{ marginBottom: '$10', display: 'flex', gap: '$5', flexWrap: 'wrap' }}>
        {isSupplier && (
          <Button auto onPress={handler}>
            Add Stock Item
          </Button>
        )}
        {isManager && (
          <Button auto color="primary" onPress={handlePlaceOrder}>
            📦 Place Order
          </Button>
        )}
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
          <Table.Column>QUANTITY</Table.Column>
          <Table.Column>UNIT</Table.Column>
          <Table.Column>PRICE</Table.Column>
          <Table.Column>CATEGORY</Table.Column>
          <Table.Column>SUPPLIER</Table.Column>
          <Table.Column>STATUS</Table.Column>
          <Table.Column>ACTIONS</Table.Column>
        </Table.Header>
        <Table.Body>
          {stock.map((item: any) => {
            const isLow = item.minQuantity && item.quantity <= item.minQuantity;
            return (
              <Table.Row key={item._id}>
                <Table.Cell>
                  <Text b size={14}>{item.name}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text color={isLow ? 'error' : 'default'}>
                    {item.quantity}
                  </Text>
                </Table.Cell>
                <Table.Cell>{item.unit || '-'}</Table.Cell>
                <Table.Cell>
                  <Text b>{item.price ? `$${item.price}` : '-'}</Text>
                </Table.Cell>
                <Table.Cell>{item.category || '-'}</Table.Cell>
                <Table.Cell>{item.owner?.name || item.fournisseur?.name || '-'}</Table.Cell>
                <Table.Cell>
                  {isLow ? (
                    <Text color="error" b>Low Stock!</Text>
                  ) : (
                    <Text color="success">OK</Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Box css={{ display: 'flex', gap: '$5', flexWrap: 'wrap' }}>
                    {isLow && isSupplier ? (
                      <Button
                        auto
                        size="sm"
                        color="warning"
                        onPress={() => handleTopUp(item)}
                      >
                        Top Up
                      </Button>
                    ) : null}
                    {isManager ? (
                      <Button
                        auto
                        size="sm"
                        color="primary"
                        onPress={() => handleReorder(item)}
                      >
                        🔄 {item.sourceStockId ? 'Reorder' : 'Order More'}
                      </Button>
                    ) : null}
                    {isSupplier ? (
                      <Button
                        auto
                        light
                        color="error"
                        icon={<DeleteIcon size={20} fill="#FF0080" />}
                        onPress={() => handleDelete(item._id)}
                      />
                    ) : null}
                  </Box>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>

      <AddStockModal
        visible={visible}
        closeHandler={closeHandler}
        onAdd={onAdd}
      />

      <PlaceOrderModal
        visible={placeOrderVisible}
        closeHandler={closePlaceOrderHandler}
        onOrderPlaced={onPlaceOrder}
      />

      <ReorderModal
        visible={reorderVisible}
        closeHandler={closeReorderHandler}
        stockItem={selectedItem}
        onReorder={onReorder}
      />
      
      <TopUpModal
        visible={topUpVisible}
        closeHandler={closeTopUpHandler}
        stockItem={selectedItem}
        onTopUp={onTopUp}
      />
    </Box>
  );
};
