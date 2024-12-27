import React from 'react';
import { Box, Container, Heading, Text, Button, VStack, HStack } from '@chakra-ui/react';

const Hero = () => {
  return (
    <Box bg="purple.900" color="white" py={20}>
      <Container maxW="container.xl">
        <VStack spacing={8} textAlign="center">
          <Heading size="2xl">
            AI Destekli Meme Coin Platformu
          </Heading>
          <Text fontSize="xl">
            Yapay zeka ile meme üretin, topluluğa katılın ve geleceğin parasını keşfedin
          </Text>
          <HStack spacing={4}>
            <Button colorScheme="purple" size="lg">
              Whitepaper
            </Button>
            <Button colorScheme="whiteAlpha" size="lg">
              Topluluk
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default Hero; 