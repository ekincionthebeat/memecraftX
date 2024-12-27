import React from 'react';
import { Box, Container, SimpleGrid, Link, Icon } from '@chakra-ui/react';
import { FaTwitter, FaTelegram, FaDiscord, FaMedium } from 'react-icons/fa';

const SocialLinks = () => {
  return (
    <Box bg="gray.100" py={10}>
      <Container maxW={'4xl'}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
          <Link href="#" isExternal display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaTwitter} w={10} h={10} color="blue.400" />
          </Link>
          <Link href="#" isExternal display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaTelegram} w={10} h={10} color="blue.500" />
          </Link>
          <Link href="#" isExternal display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaDiscord} w={10} h={10} color="purple.500" />
          </Link>
          <Link href="#" isExternal display="flex" alignItems="center" justifyContent="center">
            <Icon as={FaMedium} w={10} h={10} color="black" />
          </Link>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default SocialLinks; 