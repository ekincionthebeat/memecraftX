import { extendTheme } from '@chakra-ui/react';

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
      }
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

export default theme; 