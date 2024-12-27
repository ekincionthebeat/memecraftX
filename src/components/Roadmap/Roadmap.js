import React from 'react';
import { Box, Container, Heading, VStack, HStack, Text, Circle, Divider } from '@chakra-ui/react';

const RoadmapItem = ({ phase, title, items }) => {
  return (
    <HStack align="start" spacing={4}>
      <Circle size="40px" bg="purple.500" color="white">
        {phase}
      </Circle>
      <VStack align="start" spacing={2}>
        <Heading size="md">{title}</Heading>
        {items.map((item, index) => (
          <Text key={index}>{item}</Text>
        ))}
      </VStack>
    </HStack>
  );
};

const Roadmap = () => {
  return (
    <Box py={16}>
      <Container maxW={'4xl'}>
        <Heading textAlign="center" mb={10}>Yol Haritası</Heading>
        <VStack spacing={8}>
          <RoadmapItem
            phase="1"
            title="Başlangıç"
            items={[
              'Token lansmanı',
              'Topluluk oluşturma',
              'Website yayını',
              'Sosyal medya kampanyaları'
            ]}
          />
          <Divider />
          <RoadmapItem
            phase="2"
            title="Geliştirme"
            items={[
              'AI meme üretici',
              'Staking platformu',
              'CEX listelemeleri',
              'Ortaklıklar'
            ]}
          />
          <Divider />
          <RoadmapItem
            phase="3"
            title="Büyüme"
            items={[
              'DAO yönetimi',
              'NFT koleksiyonu',
              'Mobil uygulama',
              'Ekosistem genişletme'
            ]}
          />
        </VStack>
      </Container>
    </Box>
  );
};

export default Roadmap; 