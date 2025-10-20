import {Popover, Navbar, Badge, Text, Card} from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import {NotificationIcon} from '../icons/navbar/notificationicon';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Box } from '../styles/box';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const NotificationsDropdown = () => {
   const router = useRouter();
   const [lowStockItems, setLowStockItems] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchLowStock = async () => {
         try {
            const response = await axios.get(`${API_URL}/stock`);
            const low = response.data.filter((item: any) => 
               item.minQuantity && item.quantity <= item.minQuantity
            );
            setLowStockItems(low);
         } catch (error) {
            console.error('Error fetching notifications:', error);
         } finally {
            setLoading(false);
         }
      };

      fetchLowStock();
      // Refresh every 5 minutes
      const interval = setInterval(fetchLowStock, 5 * 60 * 1000);
      return () => clearInterval(interval);
   }, []);

   return (
      <Popover placement="bottom-right">
         <Popover.Trigger>
            <Navbar.Item css={{ cursor: 'pointer' }}>
               <Badge 
                  color="error" 
                  content={lowStockItems.length} 
                  isInvisible={lowStockItems.length === 0}
                  shape="circle"
               >
                  <NotificationIcon />
               </Badge>
            </Navbar.Item>
         </Popover.Trigger>
         <Popover.Content css={{ p: 0, minWidth: '340px', maxWidth: '400px' }}>
            <Card css={{ br: '$lg' }}>
               <Card.Header css={{ pb: '$6' }}>
                  <Text b size="$lg">🔔 Notifications</Text>
               </Card.Header>
               <Card.Body css={{ py: 0 }}>
                  {loading ? (
                     <Box css={{ py: '$10', textAlign: 'center' }}>
                        <Text size="$sm" color="$accents7">Loading notifications...</Text>
                     </Box>
                  ) : lowStockItems.length === 0 ? (
                     <Box css={{ py: '$10', textAlign: 'center' }}>
                        <Text size="$sm" color="$accents7">✅ All stock levels are OK</Text>
                     </Box>
                  ) : (
                     <Box css={{ display: 'flex', flexDirection: 'column', gap: '$4' }}>
                        {lowStockItems.slice(0, 5).map((item, index) => (
                           <Box 
                              key={index}
                              css={{ 
                                 p: '$4', 
                                 borderRadius: '$md', 
                                 backgroundColor: '$accents0',
                                 cursor: 'pointer',
                                 '&:hover': {
                                    backgroundColor: '$accents1'
                                 }
                              }}
                              onClick={() => router.push('/stock')}
                           >
                              <Text b size="$sm" color="error">
                                 ⚠️ {item.name}
                              </Text>
                              <Text size="$xs" color="$accents7" css={{ mt: '$1' }}>
                                 Current: {item.quantity} {item.unit} | Min: {item.minQuantity} {item.unit}
                              </Text>
                           </Box>
                        ))}
                        {lowStockItems.length > 5 && (
                           <Box css={{ p: '$2', textAlign: 'center' }}>
                              <Text size="$xs" color="$accents7">
                                 +{lowStockItems.length - 5} more items need restocking
                              </Text>
                           </Box>
                        )}
                     </Box>
                  )}
               </Card.Body>
               {!loading && lowStockItems.length > 0 && (
                  <Card.Footer css={{ pt: '$6' }}>
                     <Box 
                        css={{ 
                           width: '100%', 
                           textAlign: 'center', 
                           cursor: 'pointer',
                           p: '$4',
                           borderRadius: '$md',
                           '&:hover': {
                              backgroundColor: '$accents1'
                           }
                        }}
                        onClick={() => router.push('/stock')}
                     >
                        <Text b size="$sm" css={{ color: '$green600' }}>
                           View All Stock Items →
                        </Text>
                     </Box>
                  </Card.Footer>
               )}
            </Card>
         </Popover.Content>
      </Popover>
   );
};
