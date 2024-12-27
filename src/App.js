import React from 'react';
import { ChakraProvider, Box, extendTheme, ColorModeScript, useColorMode } from '@chakra-ui/react';
import Header from './components/Header/Header';
import TextToImage from './components/TextToImage/TextToImage';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: '#0F0F1B',
        color: '#FFFFFF',
      },
      '@keyframes blink': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
      },
      '@keyframes float': {
        '0%, 100%': { 
          transform: 'translateY(0)'
        },
        '50%': { 
          transform: 'translateY(-6px)'
        }
      },
      '@keyframes pulse': {
        '0%': { 
          boxShadow: '0 0 0 0 rgba(238, 187, 195, 0.4)'
        },
        '70%': { 
          boxShadow: '0 0 0 10px rgba(238, 187, 195, 0)'
        },
        '100%': { 
          boxShadow: '0 0 0 0 rgba(238, 187, 195, 0)'
        }
      },
      '@keyframes slideIn': {
        '0%': { transform: 'translateX(-100%)', opacity: 0 },
        '100%': { transform: 'translateX(0)', opacity: 1 }
      },
      '@keyframes pixelCollision': {
        '0%': { transform: 'translateX(-100%)', opacity: 0 },
        '50%': { transform: 'translateX(0)', opacity: 1 },
        '60%': { transform: 'translateX(2px)' },
        '70%': { transform: 'translateX(-2px)' },
        '80%': { transform: 'translateX(1px)' },
        '90%': { transform: 'translateX(-1px)' },
        '100%': { transform: 'translateX(0)' }
      },
      '@keyframes glowPulse': {
        '0%, 100%': { 
          filter: 'drop-shadow(0 0 8px rgba(238, 187, 195, 0.6))',
        },
        '50%': { 
          filter: 'drop-shadow(0 0 12px rgba(238, 187, 195, 0.8))',
        }
      },
      '@keyframes pixelSlideIn': {
        '0%': { 
          transform: 'translateX(-150%)',
          opacity: 0,
          filter: 'blur(2px)'
        },
        '60%': { 
          transform: 'translateX(-10%)',
          opacity: 0.8,
          filter: 'blur(0px)'
        },
        '80%': { 
          transform: 'translateX(5%)',
        },
        '100%': { 
          transform: 'translateX(0)',
          opacity: 1
        }
      },
      '@keyframes pixelBounce': {
        '0%': { transform: 'translateY(0)' },
        '20%': { transform: 'translateY(-3px)' },
        '40%': { transform: 'translateY(2px)' },
        '60%': { transform: 'translateY(-1px)' },
        '80%': { transform: 'translateY(1px)' },
        '100%': { transform: 'translateY(0)' }
      },
      '@keyframes scanline': {
        '0%': {
          transform: 'translateY(-100%)'
        },
        '100%': {
          transform: 'translateY(100%)'
        }
      },
      '@keyframes pixelLineMove': {
        '0%': { 
          transform: 'translateX(-100%)',
          opacity: 0
        },
        '100%': { 
          transform: 'translateX(0)',
          opacity: 0.5
        }
      },
    },
  },
  fonts: {
    heading: "'Press Start 2P', cursive",
    body: "system-ui, sans-serif",
  },
  colors: {
    space: {
      dark: '#0F0F1B',
      darker: '#090912',
      light: '#FFFFFF',
      gray: '#B8C1EC',
      accent: '#EEBBC3',
      hover: '#FEC8D8',
      stars: '#E4E4F1',
      glow: '#B8C1EC'
    },
  },
});

const MainContent = () => {
  const { colorMode } = useColorMode();

  return (
    <Box 
      minH="100vh" 
      bg="space.dark"
      position="relative"
      overflow="hidden"
      mt="76px"
      sx={{
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(1px 1px at 25% 15%, rgba(232, 232, 241, 0.4), transparent),
            radial-gradient(1.5px 1.5px at 50% 25%, rgba(184, 193, 236, 0.3), transparent),
            radial-gradient(2px 2px at 15% 45%, rgba(238, 187, 195, 0.3), transparent),
            radial-gradient(2px 2px at 75% 55%, rgba(184, 193, 236, 0.3), transparent),
            radial-gradient(1px 1px at 35% 65%, rgba(232, 232, 241, 0.4), transparent),
            radial-gradient(1.5px 1.5px at 85% 35%, rgba(238, 187, 195, 0.2), transparent)
          `,
          backgroundSize: '450px 450px, 350px 350px, 250px 250px, 350px 350px, 450px 450px, 350px 350px',
          animation: 'space-animation 240s linear infinite',
          opacity: colorMode === 'dark' ? 0.6 : 0,
          transition: 'opacity 0.2s',
        },
        '@keyframes space-animation': {
          '0%': {
            transform: 'translateY(0)',
          },
          '100%': {
            transform: 'translateY(-450px)',
          },
        },
        '&::after': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(167deg, rgba(238, 187, 195, 0.05) 0%, rgba(184, 193, 236, 0.05) 100%)',
          pointerEvents: 'none',
          opacity: colorMode === 'dark' ? 1 : 0,
          transition: 'opacity 0.2s',
        }
      }}
    >
      <Header />
      <TextToImage />
    </Box>
  );
};

function App() {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <MainContent />
      </ChakraProvider>
    </>
  );
}

export default App; 