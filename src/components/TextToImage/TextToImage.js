import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  Image,
  SimpleGrid,
  HStack,
  useToast,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { FaRocket, FaMagic, FaImage } from 'react-icons/fa';

const ModelBadge = ({ children, isSelected, onClick }) => (
  <Badge
    px={4}
    py={2}
    borderRadius="none"
    bg={isSelected ? "space.light" : "transparent"}
    color={isSelected ? "space.dark" : "space.light"}
    cursor="pointer"
    fontFamily="'Press Start 2P', cursive"
    fontSize="xs"
    textTransform="none"
    border="1px solid"
    borderColor={isSelected ? "space.light" : "space.gray"}
    onClick={onClick}
    _hover={{
      bg: isSelected ? "space.light" : "whiteAlpha.100",
      borderColor: "space.light"
    }}
    transition="all 0.2s"
  >
    {children}
  </Badge>
);

const StyleCard = ({ title, image, isSelected, onClick }) => (
  <Box
    position="relative"
    borderWidth="1px"
    borderRadius="none"
    overflow="hidden"
    cursor="pointer"
    onClick={onClick}
    borderColor={isSelected ? "space.light" : "space.gray"}
    transition="all 0.2s"
    _hover={{ 
      borderColor: "space.light",
      boxShadow: '0 0 15px rgba(255,255,255,0.1)'
    }}
  >
    <Box position="relative" height="120px">
      <Image 
        src={image} 
        alt={title} 
        width="100%" 
        height="100%" 
        objectFit="cover" 
        filter={isSelected ? "none" : "grayscale(0.5)"}
      />
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg={isSelected ? "transparent" : "blackAlpha.400"}
        transition="all 0.2s"
      />
    </Box>
    <Text 
      p={3}
      textAlign="center" 
      fontSize="xs"
      fontFamily="'Press Start 2P', cursive"
      color="space.white"
      bg={isSelected ? "space.white" : "transparent"}
      color={isSelected ? "space.dark" : "space.white"}
    >
      {title}
    </Text>
  </Box>
);

const TextToImage = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('Stable Diffusion 3');
  const [selectedStyle, setSelectedStyle] = useState('Auto');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const models = [
    'Stable Diffusion XL 1.0',
    'Stable Diffusion 3',
    'Stable Diffusion 3.5',
    'DALL-E 3',
    'Playground V2.5',
    'Ideogram V2'
  ];

  const styles = [
    { title: 'Pixel Art', image: '/assets/images/styles/pixel.jpg' },
    { title: 'Meme', image: '/assets/images/styles/meme.jpg' },
    { title: 'Retro', image: '/assets/images/styles/retro.jpg' },
    { title: 'Space', image: '/assets/images/styles/space.jpg' },
    { title: 'Cyberpunk', image: '/assets/images/styles/cyber.jpg' },
    { title: '8-Bit', image: '/assets/images/styles/8bit.jpg' },
  ];

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: 'Input Required',
        description: 'Please describe your meme idea',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      // API entegrasyonu burada yapılacak
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Success',
        description: 'Your meme is being generated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate meme',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box py={12} bg="transparent">
      <Container maxW="container.xl">
        <VStack spacing={16}>
          <VStack textAlign="center" spacing={6}>
            <Heading 
              size="2xl"
              color="space.light"
              fontFamily="'Press Start 2P', cursive"
              letterSpacing="-1px"
              textShadow="0 0 20px rgba(255,255,255,0.2)"
            >
              MemecraftX
            </Heading>
            <Text 
              fontSize="md" 
              color="space.gray"
              maxW="600px"
            >
              Create pixel-perfect memes with AI-powered generation
            </Text>
          </VStack>

          <Box w="100%">
            <Text mb={4} color="space.white" fontSize="sm" fontWeight="bold">SELECT MODEL</Text>
            <HStack spacing={3} wrap="wrap" justify="center">
              {models.map((model) => (
                <ModelBadge
                  key={model}
                  isSelected={selectedModel === model}
                  onClick={() => setSelectedModel(model)}
                >
                  {model}
                </ModelBadge>
              ))}
            </HStack>
          </Box>

          <Box w="100%">
            <Text mb={4} color="space.white" fontSize="sm" fontWeight="bold">SELECT STYLE</Text>
            <SimpleGrid columns={{ base: 2, md: 6 }} spacing={6}>
              {styles.map((style) => (
                <StyleCard
                  key={style.title}
                  {...style}
                  isSelected={selectedStyle === style.title}
                  onClick={() => setSelectedStyle(style.title)}
                />
              ))}
            </SimpleGrid>
          </Box>

          <VStack w="100%" spacing={6}>
            <Box w="100%">
              <Text mb={4} color="space.white" fontSize="sm" fontWeight="bold">DESCRIBE YOUR MEME</Text>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your creative meme idea here..."
                size="lg"
                bg="space.darker"
                border="1px solid"
                borderColor="space.gray"
                color="space.light"
                _placeholder={{ color: 'space.gray' }}
                _hover={{ borderColor: 'space.light' }}
                _focus={{ 
                  borderColor: 'space.light',
                  boxShadow: '0 0 15px rgba(255,255,255,0.1)'
                }}
                height="60px"
                fontSize="md"
              />
            </Box>

            <HStack spacing={4} wrap="wrap" justify="center">
              <Button
                leftIcon={<FaRocket />}
                variant="outline"
                color="space.white"
                borderColor="space.white"
                _hover={{ bg: 'whiteAlpha.100' }}
                size="md"
              >
                Space Meme
              </Button>
              <Button
                leftIcon={<FaMagic />}
                variant="outline"
                color="space.white"
                borderColor="space.white"
                _hover={{ bg: 'whiteAlpha.100' }}
                size="md"
              >
                Pixel Magic
              </Button>
              <Button
                leftIcon={<FaImage />}
                variant="outline"
                color="space.white"
                borderColor="space.white"
                _hover={{ bg: 'whiteAlpha.100' }}
                size="md"
              >
                Retro Style
              </Button>
            </HStack>
          </VStack>

          <Button
            size="lg"
            width="300px"
            height="60px"
            isLoading={loading}
            onClick={handleGenerate}
            bg="space.light"
            color="space.dark"
            _hover={{ 
              bg: 'space.hover',
              boxShadow: '0 0 20px rgba(255,255,255,0.2)'
            }}
            fontFamily="'Press Start 2P', cursive"
            fontSize="sm"
            borderRadius="none"
            border="none"
            loadingText="GENERATING..."
          >
            GENERATE MEME
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default TextToImage; 