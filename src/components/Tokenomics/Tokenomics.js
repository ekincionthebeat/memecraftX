import React from 'react';
import { Box, Container, Heading, Text, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';

const TokenomicsStat = ({ label, number, helpText }) => {
  return (
    <Stat
      px={{ base: 4, md: 8 }}
      py={'5'}
      shadow={'xl'}
      border={'1px solid'}
      borderColor={'gray.200'}
      rounded={'lg'}>
      <StatLabel fontWeight={'medium'} isTruncated>
        {label}
      </StatLabel>
      <StatNumber fontSize={'2xl'} fontWeight={'medium'}>
        {number}
      </StatNumber>
      <StatHelpText>{helpText}</StatHelpText>
    </Stat>
  );
};

const Tokenomics = () => {
  return (
    <Box bg="purple.50" py={16}>
      <Container maxW={'7xl'}>
        <Heading textAlign="center" mb={10}>Tokenomics</Heading>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={{ base: 5, lg: 8 }}>
          <TokenomicsStat
            label={'Toplam Arz'}
            number={'1,000,000,000'}
            helpText={'Maksimum token sayısı'}
          />
          <TokenomicsStat
            label={'Likidite Havuzu'}
            number={'40%'}
            helpText={'Kilitli likidite'}
          />
          <TokenomicsStat
            label={'Pazarlama'}
            number={'20%'}
            helpText={'Geliştirme ve büyüme'}
          />
          <TokenomicsStat
            label={'Ekip'}
            number={'10%'}
            helpText={'6 ay kilitli'}
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Tokenomics; 