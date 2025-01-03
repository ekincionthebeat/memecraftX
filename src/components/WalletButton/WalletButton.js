import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Box } from '@chakra-ui/react';

const WalletButton = () => {
  const { wallet } = useWallet();

  return (
    <Box
      sx={{
        '.wallet-adapter-button': {
          backgroundColor: 'rgba(9, 9, 18, 0.95)',
          border: '4px solid',
          borderColor: 'space.accent',
          color: 'space.light',
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '14px',
          padding: '12px 24px',
          borderRadius: '0',
          transition: 'all 0.2s',
          _hover: {
            backgroundColor: 'rgba(9, 9, 18, 0.8)',
            transform: 'translateY(-2px)',
          },
          _active: {
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <WalletMultiButton />
    </Box>
  );
};

export default WalletButton; 