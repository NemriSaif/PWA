import {styled} from '@nextui-org/react';

export const WrapperLayout = styled('div', {
   display: 'flex',
   flexDirection: 'column',
   minHeight: '100vh',
   width: '100%',
   '@md': {
      flexDirection: 'row',
   },
});
