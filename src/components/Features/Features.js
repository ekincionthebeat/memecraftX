import React from 'react';
import { Box, Container, SimpleGrid, Icon, Text, Stack, Flex } from '@chakra-ui/react';
import { FaRobot, FaCoins, FaUsers, FaChartLine } from 'react-icons/fa';

const Feature = ({ title, text, icon }) => {
  return (
    <Stack align={'center'} textAlign={'center'}>
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg={'purple.500'}
        mb={1}>
        <Icon as={icon} w={10} h={10} />
      </Flex>
      <Text fontWeight={600}>{title}</Text>
      <Text color={'gray.600'}>{text}</Text>
    </Stack>
  );
};

const Features = () => {
  return (
    <Box p={4} bg="white">
      <Container maxW={'6xl'} py={16}>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={10}>
          <Feature
            icon={FaRobot}
            title={'AI Destekli'}
            text={'Yapay zeka ile meme üretimi'}
          />
          <Feature
            icon={FaCoins}
            title={'Token Ekonomisi'}
            text={'Sürdürülebilir tokenomics'}
          />
          <Feature
            icon={FaUsers}
            title={'Topluluk'}
            text={'Güçlü topluluk desteği'}
          />
          <Feature
            icon={FaChartLine}
            title={'Büyüme'}
            text={'Sürekli gelişen ekosistem'}
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Features; 