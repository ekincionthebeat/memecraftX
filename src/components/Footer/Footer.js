import React from 'react';
import { Box, Container, Stack, Text, Link } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box bg="gray.800" color="white">
      <Container
        as={Stack}
        maxW={'6xl'}
        py={4}
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        justify={{ base: 'center', md: 'space-between' }}
        align={{ base: 'center', md: 'center' }}>
        <Text>© 2024 Meme AI Coin. Tüm hakları saklıdır</Text>
        <Stack direction={'row'} spacing={6}>
          <Link href={'#'}>Gizlilik Politikası</Link>
          <Link href={'#'}>Kullanım Şartları</Link>
          <Link href={'#'}>İletişim</Link>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer; 