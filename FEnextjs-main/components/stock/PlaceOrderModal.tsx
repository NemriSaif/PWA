import { Button, Input, Modal, Text, Table, Badge } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { offlineGet } from '../../utils/apiClient';
import { Box } from '../styles/box';

interface Stock {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
  owner: {
    _id: string;
    name: string;
    company?: string;
  };
}

export const PlaceOrderModal = ({ visible, closeHandler, onOrderPlaced }: any) => {
  const [suppliersStock, setSuppliersStock] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      fetchSuppliersStock();
    }
  }, [visible]);

  const fetchSuppliersStock = async () => {
    try {
      setLoading(true);
      const data = await offlineGet<Stock>('/stock/suppliers/all', 'stock');
      setSuppliersStock(data);
    } catch (error) {
      console.error('Error fetching suppliers stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStock = (stock: Stock) => {
    setSelectedStock(stock);
    setQuantity('');
    setNotes('');
  };

  const handlePlaceOrder = async () => {
    if (!selectedStock || !quantity || parseFloat(quantity) <= 0) {
      alert('Please select a stock item and enter a valid quantity');
      return;
    }

    if (parseFloat(quantity) > selectedStock.quantity) {
      alert(`Insufficient stock. Available: ${selectedStock.quantity} ${selectedStock.unit}`);
      return;
    }

    const result = await onOrderPlaced({
      stockItem: selectedStock._id,
      quantity: parseFloat(quantity),
      notes,
    });

    if (result.success) {
      setSelectedStock(null);
      setQuantity('');
      setNotes('');
      closeHandler();
    } else {
      alert(result.message);
    }
  };

  return (
    <Modal
      closeButton
      aria-labelledby="place-order-modal"
      width="90%"
      open={visible}
      onClose={closeHandler}
      css={{
        '@md': { width: '800px', maxWidth: '90vw' },
      }}
    >
      <Modal.Header>
        <Text h3 css={{ '@xs': { fontSize: '$lg' } }}>
          {selectedStock ? `Order: ${selectedStock.name}` : 'Browse Suppliers Stock'}
        </Text>
      </Modal.Header>
      <Modal.Body css={{ py: '$10' }}>
        {!selectedStock ? (
          <Box css={{ maxHeight: '60vh', overflow: 'auto' }}>
            {loading ? (
              <Text>Loading suppliers stock...</Text>
            ) : suppliersStock.length === 0 ? (
              <Text color="warning">No stock available from suppliers</Text>
            ) : (
              <Table
                lined
                headerLined
                shadow={false}
                aria-label="Suppliers stock table"
                css={{ minWidth: '100%' }}
              >
                <Table.Header>
                  <Table.Column>ITEM</Table.Column>
                  <Table.Column>SUPPLIER</Table.Column>
                  <Table.Column>AVAILABLE</Table.Column>
                  <Table.Column>PRICE</Table.Column>
                  <Table.Column>CATEGORY</Table.Column>
                  <Table.Column>ACTION</Table.Column>
                </Table.Header>
                <Table.Body>
                  {suppliersStock.map((stock) => (
                    <Table.Row key={stock._id}>
                      <Table.Cell>
                        <Text b>{stock.name}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="$sm">{stock.owner.company || stock.owner.name}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={stock.quantity > 10 ? 'success' : 'warning'}>
                          {stock.quantity} {stock.unit}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text b color="success">{stock.price} TND/{stock.unit}</Text>
                      </Table.Cell>
                      <Table.Cell>{stock.category || '-'}</Table.Cell>
                      <Table.Cell>
                        <Button
                          size="xs"
                          color="primary"
                          onPress={() => handleSelectStock(stock)}
                        >
                          Order
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </Box>
        ) : (
          <Box css={{ display: 'flex', flexDirection: 'column', gap: '$8' }}>
            <Box>
              <Text size="$sm" color="$accents7">Supplier</Text>
              <Text b>{selectedStock.owner.company || selectedStock.owner.name}</Text>
            </Box>
            <Box>
              <Text size="$sm" color="$accents7">Item</Text>
              <Text b>{selectedStock.name}</Text>
            </Box>
            <Box css={{ display: 'flex', gap: '$4' }}>
              <Box css={{ flex: 1 }}>
                <Text size="$sm" color="$accents7">Available</Text>
                <Text b color="success">{selectedStock.quantity} {selectedStock.unit}</Text>
              </Box>
              <Box css={{ flex: 1 }}>
                <Text size="$sm" color="$accents7">Price</Text>
                <Text b color="primary">{selectedStock.price} TND/{selectedStock.unit}</Text>
              </Box>
            </Box>
            <Input
              clearable
              bordered
              fullWidth
              type="number"
              label="Quantity *"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              helperText={quantity ? `Total: ${(parseFloat(quantity) * selectedStock.price).toFixed(2)} TND` : ''}
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
        )}
      </Modal.Body>
      <Modal.Footer>
        {selectedStock ? (
          <>
            <Button auto flat color="default" onPress={() => setSelectedStock(null)}>
              ← Back to List
            </Button>
            <Button auto color="primary" onPress={handlePlaceOrder}>
              Place Order
            </Button>
          </>
        ) : (
          <Button auto flat color="error" onPress={closeHandler}>
            Close
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};
