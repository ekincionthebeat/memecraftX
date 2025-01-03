import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Textarea,
  Button,
  useToast,
  Center,
  Image,
  Flex,
  Select,
  useColorMode,
} from '@chakra-ui/react';
import { database } from '../../firebase/config';
import { ref as databaseRef, push, set, onValue, off, get } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

const STATUS = {
  INITIAL: 'initial',
  PROCESSING: 'processing',
  GENERATING: 'generating',
  COMPLETED: 'completed',
  ERROR: 'error',
  CANCELED: 'canceled'
};

const getStatusMessage = (status) => {
  switch(status) {
    case STATUS.PROCESSING:
      return '[AI PROCESS STARTED...]';
    case STATUS.GENERATING:
      return '[AI GENERATING...]';
    case STATUS.COMPLETED:
      return '[PROCESS COMPLETED]';
    case STATUS.ERROR:
      return '[ERROR OCCURRED]';
    case STATUS.CANCELED:
      return '[PROCESS CANCELED]';
    default:
      return '[READY]';
  }
};

const TextToImage = () => {
  const { colorMode } = useColorMode();
  const borderColor = colorMode === 'dark' ? 'space.accent' : 'orange.300';
  const grayBorderColor = colorMode === 'dark' ? 'space.gray' : 'orange.200';

  // Sabit renkler
  const fixedAccentColor = 'space.accent';
  const fixedShadowColor = 'rgba(184, 193, 236, 0.2)';
  const fixedDropShadowColor = 'rgba(184, 193, 236, 0.4)';

  const hoverBorderColor = colorMode === 'dark' ? 'space.light' : 'orange.500';
  const boxShadowColor = colorMode === 'dark' ? 'rgba(184, 193, 236, 0.2)' : 'rgba(251, 146, 60, 0.2)';
  const dropShadowColor = colorMode === 'dark' ? 'rgba(184, 193, 236, 0.4)' : 'rgba(251, 146, 60, 0.4)';
  const [prompt, setPrompt] = useState('');
  const [width, setWidth] = useState(256);
  const [height, setHeight] = useState(256);
  const [numImages, setNumImages] = useState(1);
  const [promptStyle, setPromptStyle] = useState('default');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([null, null, null, null]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [status, setStatus] = useState(STATUS.INITIAL);
  const toast = useToast();
  const processingToastRef = useRef(null);
  const currentProcessRef = useRef(null);
  const toastIdsRef = useRef([]);

  const clearAllToasts = useCallback(() => {
    toastIdsRef.current.forEach(id => toast.close(id));
    toastIdsRef.current = [];
    if (processingToastRef.current) {
      toast.close(processingToastRef.current);
      processingToastRef.current = null;
    }
  }, [toast]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      clearAllToasts();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearAllToasts();
    };
  }, [clearAllToasts]);

  const showNotification = useCallback((title, description, status) => {
    clearAllToasts();
    const toastId = toast({
      title,
      description,
      status,
      duration: status === 'error' ? 5000 : 3000,
      isClosable: true,
      position: 'bottom-right',
      variant: 'solid',
      containerStyle: {
        fontFamily: "'Press Start 2P', cursive",
        fontSize: '12px',
        margin: '20px',
        maxWidth: '400px'
      },
      render: ({ onClose }) => (
        <Box
          bg="rgba(9, 9, 18, 0.95)"
          border="4px solid"
          borderColor={status === 'error' ? 'red.500' : status === 'success' ? fixedAccentColor : 'space.gray'}
          p={4}
          position="relative"
          transition="all 0.3s"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 20px ${fixedShadowColor}`
          }}
        >
          <Flex gap={3} alignItems="flex-start">
            <Box
              w="6px"
              h="6px"
              mt={1}
              bg={status === 'error' ? 'red.500' : status === 'success' ? fixedAccentColor : 'space.gray'}
              sx={{ animation: 'pulse 2s infinite' }}
            />
            <Box flex={1}>
              <Text
                color="space.light"
                fontSize="xs"
                mb={2}
              >
                {title}
              </Text>
              <Text
                color="space.gray"
                fontSize="xs"
              >
                {description}
              </Text>
            </Box>
            <Box
              as="button"
              onClick={onClose}
              color="space.gray"
              transition="color 0.2s"
              _hover={{ color: 'space.accent' }}
              fontSize="lg"
              lineHeight={1}
            >
              ×
            </Box>
          </Flex>
        </Box>
      )
    });
    toastIdsRef.current.push(toastId);
  }, [toast, clearAllToasts]);

  useEffect(() => {
    const historyRef = databaseRef(database, 'text2img');
    let isInitialLoad = true;
    let lastStatus = null;
    
    onValue(historyRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const historyArray = Object.values(data)
            .sort((a, b) => new Date(b.metadata.created_at) - new Date(a.metadata.created_at))
            .slice(0, 4)
            .concat(Array(4).fill(null))
            .slice(0, 4);
          
          const latestItem = historyArray[0];
          if (!latestItem) return;

          if (lastStatus !== latestItem.status) {
            lastStatus = latestItem.status;
            setStatus(latestItem.status);

            if (!isInitialLoad) {
              clearAllToasts();

              if (latestItem.status === STATUS.PROCESSING || latestItem.status === STATUS.GENERATING) {
                setAiProcessing(true);
                setLoading(true);
                currentProcessRef.current = latestItem.id;
                showNotification(
                  '[AI PROCESS]',
                  getStatusMessage(latestItem.status),
                  'info'
                );
              } else {
                setAiProcessing(false);
                setLoading(false);
                currentProcessRef.current = null;
                
                if (latestItem.status === STATUS.COMPLETED && latestItem.output?.image_url) {
                  setResult(latestItem.output.image_url);
                  showNotification(
                    '[SUCCESS]',
                    getStatusMessage(STATUS.COMPLETED),
                    'success'
                  );
                } else if (latestItem.status === STATUS.ERROR || latestItem.status === STATUS.CANCELED) {
                  setResult(null);
                  showNotification(
                    '[ERROR]',
                    typeof latestItem.error === 'string' ? latestItem.error : '[AN ERROR OCCURRED]',
                    'error'
                  );
                }
              }
            }
          }
          
          setHistory(historyArray);
          isInitialLoad = false;
        }
      } catch (error) {
        console.error('Firebase data processing error:', error);
        showNotification(
          '[ERROR]',
          '[DATA PROCESSING ERROR]',
          'error'
        );
      }
    }, (error) => {
      console.error('Firebase connection error:', error);
      showNotification(
        '[ERROR]',
        '[CONNECTION ERROR]',
        'error'
      );
    });

    return () => {
      off(historyRef);
      clearAllToasts();
    };
  }, [toast, clearAllToasts, showNotification]);

  const handleCancel = async () => {
    if (status === STATUS.PROCESSING) {
      const historyRef = databaseRef(database, 'text2img');
      const snapshot = await get(historyRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const latestItem = Object.values(data)
          .sort((a, b) => new Date(b.metadata.created_at) - new Date(a.metadata.created_at))[0];
        
        if (latestItem && latestItem.status === STATUS.PROCESSING) {
          const processKey = Object.keys(data).find(key => data[key].id === latestItem.id);
          
          if (processKey) {
            const processRef = databaseRef(database, `text2img/${processKey}`);
            await set(processRef, {
              ...latestItem,
              status: STATUS.CANCELED,
              error: '[PROCESS CANCELED]'
            });
            setStatus(STATUS.CANCELED);
            setAiProcessing(false);
          }
        }
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showNotification(
        '[ERROR]',
        '[PROMPT REQUIRED]',
        'error'
      );
      return;
    }

    if (loading || aiProcessing || status === STATUS.PROCESSING || status === STATUS.GENERATING) {
      showNotification(
        '[WARNING]',
        '[PLEASE WAIT FOR THE CURRENT PROCESS TO FINISH]',
        'warning'
      );
      return;
    }

    setResult(null);
    setLoading(true);
    try {
      const promptId = uuidv4();
      const historyRef = databaseRef(database, 'text2img');
      const newHistoryRef = push(historyRef);
      
      const promptData = {
        id: promptId,
        type: 'text2img',
        input: {
          prompt: prompt.trim(),
          num_images: numImages,
          width: width,
          height: height,
          prompt_style: promptStyle
        },
        output: {
          image_url: ''
        },
        metadata: {
          created_at: new Date().toISOString()
        },
        status: STATUS.PROCESSING,
        error: null
      };
      
      await set(newHistoryRef, promptData);
      
      showNotification(
        '[STARTED]',
        getStatusMessage(STATUS.PROCESSING),
        'info'
      );
      
      setLoading(false);
    } catch (error) {
      console.error('Process error:', error);
      showNotification(
        '[ERROR]',
        error?.message || '[PROCESS FAILED]',
        'error'
      );
      setLoading(false);
    }
  };

  // Stil seçenekleri
  const styleOptions = [
    'default',
    'simple',
    'detailed',
    'anime',
    'game_asset',
    'portrait',
    'texture',
    'ui',
    'spritesheet',
    'no_style'
  ];

  return (
    <Box py={12} bg="transparent" position="relative">
      {/* History Toggle Button */}
      <Box
        position="fixed"
        right={isHistoryOpen ? '320px' : 0}
        top="50%"
        transform="translateY(-50%)"
        zIndex={9999}
        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        cursor="pointer"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      >
        <Box
          bg="rgba(9, 9, 18, 0.95)"
          border="4px solid"
          borderRight="none"
          borderColor="space.gray"
          p={3}
          position="relative"
          transition="all 0.2s"
          _hover={{
            bg: 'rgba(9, 9, 18, 0.8)',
            '& > div:first-of-type': {
              transform: 'translateX(-4px)'
            }
          }}
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Box
            w="8px"
            h="8px"
            bg="space.accent"
            sx={{ animation: 'pulse 2s infinite' }}
            transition="transform 0.2s"
          />
          <Text
            color="space.light"
            fontSize="sm"
            fontFamily="'Press Start 2P', cursive"
            sx={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              letterSpacing: '2px'
            }}
          >
            HISTORY
          </Text>
        </Box>
      </Box>

      {/* History Panel */}
      <Box
        position="fixed"
        inset={0}
        bg="rgba(0, 0, 0, 0.5)"
        opacity={isHistoryOpen ? 1 : 0}
        visibility={isHistoryOpen ? 'visible' : 'hidden'}
        transition="all 0.3s"
        zIndex={9997}
        onClick={() => setIsHistoryOpen(false)}
      />
      <Box
        position="fixed"
        right={isHistoryOpen ? 0 : '-320px'}
        top={0}
        bottom={0}
        w="320px"
        bg="rgba(9, 9, 18, 0.95)"
        border="4px solid"
        borderRight="none"
        borderColor="space.gray"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        zIndex={9998}
        display="flex"
        flexDirection="column"
        transform={`translateX(${isHistoryOpen ? '0' : '20px'})`}
        boxShadow="-10px 0 30px rgba(0, 0, 0, 0.5)"
      >
        <Box p={6}>
          <Heading 
            size="md" 
            color="space.light" 
            fontFamily="'Press Start 2P', cursive"
            display="flex"
            alignItems="center"
            gap={3}
            w="100%"
          >
            <Box
              w="8px"
              h="8px"
              bg="space.accent"
              sx={{ animation: 'pulse 2s infinite' }}
            />
            HISTORY LOG
            <Box flex={1} />
            <Box
              as="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsHistoryOpen(false);
              }}
              color="space.gray"
              transition="color 0.2s"
              _hover={{ color: 'space.accent' }}
              fontSize="lg"
            >
              ×
            </Box>
          </Heading>
        </Box>
        
        <Box 
          flex={1} 
          overflowY="auto"
          sx={{
            '&::-webkit-scrollbar': {
              width: '12px',
              backgroundColor: 'rgba(9, 9, 18, 0.98)'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'space.gray',
              border: '2px solid black',
              borderRadius: '0'
            }
          }}
        >
          <VStack p={6} pt={0} spacing={4}>
            {history.map((item, index) => (
              <Box
                key={index}
                w="100%"
                h="80px"
                bg="rgba(9, 9, 18, 0.98)"
                border="4px solid"
                borderColor={grayBorderColor}
                p={2}
                position="relative"
                transition="all 0.2s"
                _before={{
                  content: '""',
                  position: 'absolute',
                  inset: '-4px',
                  background: 'transparent',
                  border: '4px solid transparent',
                  transition: 'all 0.3s'
                }}
                _hover={{
                  '&::before': {
                    border: '4px solid',
                    borderColor: borderColor,
                    filter: `drop-shadow(0 0 8px ${fixedDropShadowColor})`
                  },
                  '& > div:first-of-type': {
                    transform: 'scale(0.98)',
                    bg: 'rgba(9, 9, 18, 0.7)'
                  }
                }}
                onClick={() => {
                  if (item?.output?.image_url) {
                    setResult(item.output.image_url);
                  }
                }}
                cursor={item?.output?.image_url ? 'pointer' : 'default'}
              >
                <Box
                  w="100%"
                  h="100%"
                  bg="space.dark"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  transition="all 0.3s"
                  overflow="hidden"
                  position="relative"
                >
                  {item ? (
                    <>
                      {item.status === STATUS.PROCESSING ? (
                        <Image
                          src="/assets/images/giphy/loading.gif"
                          alt="Processing"
                          objectFit="contain"
                          w="100%"
                          h="100%"
                        />
                      ) : item.output?.image_url ? (
                        <Image
                          src={item.output.image_url}
                          alt={`History ${index + 1}`}
                          objectFit="cover"
                          w="100%"
                          h="100%"
                        />
                      ) : (
                        <Text color="space.gray" fontSize="xs" fontFamily="'Press Start 2P', cursive">
                          {item.status === STATUS.ERROR ? '[ERROR]' : 
                           item.status === STATUS.CANCELED ? '[CANCELED]' : '[NO IMAGE]'}
                        </Text>
                      )}
                      <Box
                        position="absolute"
                        top={1}
                        right={1}
                        w="6px"
                        h="6px"
                        borderRadius="full"
                        bg={
                          item.status === STATUS.COMPLETED ? 'green.500' :
                          item.status === STATUS.ERROR ? 'red.500' :
                          item.status === STATUS.PROCESSING ? 'blue.500' :
                          item.status === STATUS.CANCELED ? 'yellow.500' : 'gray.500'
                        }
                        sx={item.status === STATUS.PROCESSING ? { animation: 'pulse 2s infinite' } : {}}
                      />
                    </>
                  ) : (
                    <Text color="space.gray" fontSize="xs" fontFamily="'Press Start 2P', cursive">
                      [EMPTY]
                    </Text>
                  )}
                </Box>
              </Box>
            ))}
          </VStack>
        </Box>
      </Box>

      <Container maxW="container.xl" position="relative" zIndex={1}>
        <Flex gap={8} alignItems="flex-start">
          {/* Main Content */}
          <Box flex="1">
            <VStack spacing={8}>
              <Heading 
                size="xl"
                color="space.light"
                fontFamily="'Press Start 2P', cursive"
                textShadow="0 0 20px rgba(255,255,255,0.2)"
              >
                Text to Pixel Art Image
              </Heading>

              <Flex w="100%" gap={8} direction={{ base: 'column', md: 'row' }} position="relative">
                {/* Input Box */}
                <Box 
                  flex="1" 
                  position="relative"
                  bg="rgba(9, 9, 18, 0.95)"
                  border="4px solid"
                  borderColor={borderColor}
                  p={6}
                  transition="all 0.3s"
                  _hover={{
                    borderColor: fixedAccentColor,
                    boxShadow: `0 0 20px ${fixedShadowColor}`
                  }}
                >
                  <VStack spacing={4} align="stretch">
                    {/* Prompt Input */}
                    <Box>
                      <Text 
                        color="space.light" 
                        fontSize="md" 
                        mb={2} 
                        fontFamily="'Press Start 2P', cursive"
                      >
                        PROMPT
                      </Text>
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your prompt here..."
                        size="lg"
                        height="100px"
                        bg="rgba(9, 9, 18, 0.98)"
                        border="4px solid"
                        borderColor={grayBorderColor}
                        _hover={{ borderColor: borderColor }}
                        _focus={{ borderColor: borderColor, boxShadow: 'none' }}
                        fontFamily="'Press Start 2P', cursive"
                        fontSize="sm"
                        disabled={loading}
                        color="white"
                      />
                    </Box>

                    {/* Width & Height Inputs */}
                    <Flex gap={4}>
                      <Box flex={1}>
                        <Text 
                          color="space.light" 
                          fontSize="md" 
                          mb={2} 
                          fontFamily="'Press Start 2P', cursive"
                        >
                          WIDTH
                        </Text>
                        <Select
                          value={width}
                          onChange={(e) => setWidth(Number(e.target.value))}
                          bg="rgba(9, 9, 18, 0.95)"
                          border="4px solid"
                          borderColor={grayBorderColor}
                          _hover={{ borderColor: borderColor }}
                          _focus={{ borderColor: borderColor, boxShadow: 'none' }}
                          fontFamily="'Press Start 2P', cursive"
                          fontSize="sm"
                          color="white"
                          disabled={loading}
                        >
                          <option value={256}>256</option>
                          <option value={512}>512</option>
                          <option value={768}>768</option>
                        </Select>
                      </Box>
                      <Box flex={1}>
                        <Text 
                          color="space.light" 
                          fontSize="md" 
                          mb={2} 
                          fontFamily="'Press Start 2P', cursive"
                        >
                          HEIGHT
                        </Text>
                        <Select
                          value={height}
                          onChange={(e) => setHeight(Number(e.target.value))}
                          bg="rgba(9, 9, 18, 0.95)"
                          border="4px solid"
                          borderColor={grayBorderColor}
                          _hover={{ borderColor: borderColor }}
                          _focus={{ borderColor: borderColor, boxShadow: 'none' }}
                          fontFamily="'Press Start 2P', cursive"
                          fontSize="sm"
                          color="white"
                          disabled={loading}
                        >
                          <option value={256}>256</option>
                          <option value={512}>512</option>
                          <option value={768}>768</option>
                        </Select>
                      </Box>
                    </Flex>

                    {/* Number of Images & Style */}
                    <Flex gap={4}>
                      <Box flex={1}>
                        <Text 
                          color="space.light" 
                          fontSize="md" 
                          mb={2} 
                          fontFamily="'Press Start 2P', cursive"
                        >
                          IMAGES
                        </Text>
                        <Select
                          value={numImages}
                          onChange={(e) => setNumImages(Number(e.target.value))}
                          bg="rgba(9, 9, 18, 0.95)"
                          border="4px solid"
                          borderColor={grayBorderColor}
                          _hover={{ borderColor: borderColor }}
                          _focus={{ borderColor: borderColor, boxShadow: 'none' }}
                          fontFamily="'Press Start 2P', cursive"
                          fontSize="sm"
                          color="white"
                          disabled={loading}
                        >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                        </Select>
                      </Box>
                      <Box flex={1}>
                        <Text 
                          color="space.light" 
                          fontSize="md" 
                          mb={2} 
                          fontFamily="'Press Start 2P', cursive"
                        >
                          STYLE
                        </Text>
                        <Select
                          value={promptStyle}
                          onChange={(e) => setPromptStyle(e.target.value)}
                          bg="rgba(9, 9, 18, 0.95)"
                          border="4px solid"
                          borderColor={grayBorderColor}
                          _hover={{ borderColor: borderColor }}
                          _focus={{ borderColor: borderColor, boxShadow: 'none' }}
                          fontFamily="'Press Start 2P', cursive"
                          fontSize="sm"
                          color="white"
                          disabled={loading}
                        >
                          {styleOptions.map(style => (
                            <option key={style} value={style}>
                              {style.toUpperCase()}
                            </option>
                          ))}
                        </Select>
                      </Box>
                    </Flex>
                  </VStack>
                </Box>

                {/* Output Box */}
                <Box 
                  flex="1" 
                  position="relative"
                  bg="rgba(9, 9, 18, 0.95)"
                  border="4px solid"
                  borderColor={borderColor}
                  p={6}
                  transition="all 0.3s"
                  _hover={{
                    borderColor: fixedAccentColor,
                    boxShadow: `0 0 20px ${fixedShadowColor}`
                  }}
                >
                  <Text 
                    color="space.light" 
                    fontSize="md" 
                    mb={4} 
                    fontFamily="'Press Start 2P', cursive"
                  >
                    RESULT
                  </Text>
                  <Box position="relative" width="100%" height="324px">
                    <Box
                      position="relative"
                      width="100%"
                      height="300px"
                      bg="rgba(9, 9, 18, 0.95)"
                      border="4px solid"
                      borderColor={grayBorderColor}
                      borderBottom="none"
                      zIndex={2}
                      transition="transform 0.15s ease-in-out"
                      backdropFilter="blur(12px)"
                      boxShadow="0 0 20px rgba(184, 193, 236, 0.1)"
                    >
                      <Box
                        w="100%"
                        h="100%"
                        position="relative"
                        overflow="hidden"
                      >
                        {(loading || aiProcessing || status === STATUS.PROCESSING || status === STATUS.GENERATING) ? (
                          <>
                            <Image 
                              src="/assets/images/giphy/loading.gif" 
                              alt="Loading" 
                              objectFit="cover"
                              w="100%"
                              h="100%"
                            />
                            <Box
                              position="absolute"
                              bottom={4}
                              left="50%"
                              transform="translateX(-50%)"
                              zIndex={3}
                            >
                              <Box
                                as="button"
                                bg="rgba(9, 9, 18, 0.95)"
                                border="4px solid"
                                borderColor="red.500"
                                p={2}
                                px={4}
                                color="red.500"
                                fontFamily="'Press Start 2P', cursive"
                                fontSize="sm"
                                position="relative"
                                height="40px"
                                onClick={handleCancel}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                gap={3}
                                boxShadow="0 0 20px rgba(255, 0, 0, 0.2)"
                              >
                                <Box
                                  w="6px"
                                  h="6px"
                                  bg="red.500"
                                  sx={{ animation: 'pulse 2s infinite' }}
                                />
                                [CANCEL]
                              </Box>
                            </Box>
                          </>
                        ) : result ? (
                          <Image
                            src={result}
                            alt="Result"
                            objectFit="contain"
                            w="100%"
                            h="100%"
                            p={4}
                          />
                        ) : (
                          <Center h="100%" flexDirection="column" p={4}>
                            <Image 
                              src="/Icons/upload.png" 
                              alt="Result" 
                              width="48px"
                              height="48px"
                              mb={4}
                              opacity={0.6}
                            />
                            <Text 
                              color="space.accent" 
                              fontSize="md" 
                              textAlign="center" 
                              fontFamily="'Press Start 2P', cursive"
                            >
                              [WAITING FOR PROMPT...]
                            </Text>
                          </Center>
                        )}
                      </Box>
                    </Box>
                    {/* Alt yüz */}
                    <Box
                      position="absolute"
                      bottom="0"
                      left="0"
                      width="100%"
                      height="24px"
                      bg="rgba(9, 9, 18, 0.98)"
                      border="4px solid"
                      borderColor={grayBorderColor}
                      zIndex={1}
                      transition="height 0.15s ease-in-out"
                      boxShadow="0 4px 20px rgba(184, 193, 236, 0.15)"
                    />
                  </Box>

                  {/* Download Options */}
                  {result && !loading && !aiProcessing && (
                    <VStack spacing={4} mt={8}>
                      <Text 
                        color="space.light" 
                        fontSize="sm" 
                        fontFamily="'Press Start 2P', cursive"
                        textShadow="0 0 10px rgba(184, 193, 236, 0.3)"
                        mb={4}
                      >
                        [DOWNLOAD OPTIONS]
                      </Text>
                      <Flex gap={6} position="relative">
                        <Box
                          as="button"
                          bg="rgba(9, 9, 18, 0.95)"
                          border="4px solid"
                          borderColor="space.accent"
                          p={4}
                          px={8}
                          color="space.light"
                          fontFamily="'Press Start 2P', cursive"
                          fontSize="sm"
                          position="relative"
                          transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                          height="60px"
                          _hover={{
                            transform: 'translateY(-4px)',
                            boxShadow: '0 0 30px rgba(184, 193, 236, 0.2)',
                            borderColor: 'space.light',
                            '& > div:last-of-type': {
                              height: '16px',
                              transform: 'translateY(12px)',
                              borderColor: 'space.light'
                            }
                          }}
                          _active={{
                            transform: 'translateY(2px)',
                            transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                            '& > div:last-of-type': {
                              height: '4px',
                              transform: 'translateY(0)',
                              transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
                            }
                          }}
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = result;
                            link.download = 'generated_image.png';
                            link.click();
                          }}
                        >
                          <Flex alignItems="center" gap={3} position="relative">
                            <Box
                              w="6px"
                              h="6px"
                              bg="space.accent"
                              sx={{ animation: 'pulse 2s infinite' }}
                            />
                            [PNG]
                          </Flex>
                          <Box
                            position="absolute"
                            bottom="-8px"
                            left="-4px"
                            right="-4px"
                            width="calc(100% + 8px)"
                            height="8px"
                            bg="rgba(9, 9, 18, 0.98)"
                            border="4px solid"
                            borderColor="space.accent"
                            borderTop="none"
                            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                            transform="translateY(0)"
                          />
                        </Box>

                        <Box
                          as="button"
                          bg="rgba(9, 9, 18, 0.95)"
                          border="4px solid"
                          borderColor="space.accent"
                          p={4}
                          px={8}
                          color="space.light"
                          fontFamily="'Press Start 2P', cursive"
                          fontSize="sm"
                          position="relative"
                          transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                          height="60px"
                          _hover={{
                            transform: 'translateY(-4px)',
                            boxShadow: '0 0 30px rgba(184, 193, 236, 0.2)',
                            borderColor: 'space.light',
                            '& > div:last-of-type': {
                              height: '16px',
                              transform: 'translateY(12px)',
                              borderColor: 'space.light'
                            }
                          }}
                          _active={{
                            transform: 'translateY(2px)',
                            transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                            '& > div:last-of-type': {
                              height: '4px',
                              transform: 'translateY(0)',
                              transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
                            }
                          }}
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = result;
                            link.download = 'generated_image.jpg';
                            link.click();
                          }}
                        >
                          <Flex alignItems="center" gap={3} position="relative">
                            <Box
                              w="6px"
                              h="6px"
                              bg="space.accent"
                              sx={{ animation: 'pulse 2s infinite' }}
                            />
                            [JPG]
                          </Flex>
                          <Box
                            position="absolute"
                            bottom="-8px"
                            left="-4px"
                            right="-4px"
                            width="calc(100% + 8px)"
                            height="8px"
                            bg="rgba(9, 9, 18, 0.98)"
                            border="4px solid"
                            borderColor="space.accent"
                            borderTop="none"
                            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                            transform="translateY(0)"
                          />
                        </Box>
                      </Flex>
                    </VStack>
                  )}
                </Box>
              </Flex>

              {/* Generate Button */}
              <Box
                position="relative"
                width="100%"
                height="104px"
                sx={{
                  '&:hover': {
                    '& > div:first-of-type': {
                      transform: loading || aiProcessing ? 'none' : 'translateY(12px)'
                    },
                    '& > div:last-of-type': {
                      height: loading || aiProcessing ? '24px' : '12px'
                    }
                  }
                }}
              >
                {/* Ana buton yüzeyi */}
                <Box
                  position="relative"
                  width="100%"
                  height="80px"
                  bg={loading || aiProcessing || status === STATUS.PROCESSING || status === STATUS.GENERATING ? "#1a1a1a" : "#371e00"}
                  border="4px solid black"
                  borderBottom="none"
                  zIndex={2}
                  onClick={handleGenerate}
                  cursor={loading || aiProcessing || !prompt.trim() || status === STATUS.PROCESSING || status === STATUS.GENERATING ? 'not-allowed' : 'pointer'}
                  transition="all 0.15s ease-in-out"
                  opacity={loading || aiProcessing || !prompt.trim() || status === STATUS.PROCESSING || status === STATUS.GENERATING ? 0.5 : 1}
                  _hover={{
                    bg: loading || aiProcessing || status === STATUS.PROCESSING || status === STATUS.GENERATING ? "#1a1a1a" : "#4a2800"
                  }}
                >
                  {/* Buton içeriği */}
                  <Box
                    position="absolute"
                    inset="0"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    px={12}
                  >
                    <Image 
                      src="/assets/images/giphy/enter.webp" 
                      alt="Enter" 
                      width="72px"
                      height="72px"
                      opacity={loading || aiProcessing ? 0.5 : 1}
                    />
                    <Text
                      color="white"
                      fontSize="xl"
                      fontFamily="'Press Start 2P', cursive"
                    >
                      {(loading || aiProcessing || status === STATUS.PROCESSING || status === STATUS.GENERATING) ? '[PROCESSING...]' : '[GENERATE]'}
                    </Text>
                    <Image 
                      src="/assets/images/giphy/enter2.webp" 
                      alt="Enter" 
                      width="72px"
                      height="72px"
                      opacity={loading || aiProcessing ? 0.5 : 1}
                    />
                  </Box>
                </Box>

                {/* Alt yüz */}
                <Box
                  position="absolute"
                  bottom="0"
                  left="0"
                  width="100%"
                  height="24px"
                  bg={loading || aiProcessing || status === STATUS.PROCESSING || status === STATUS.GENERATING ? "#0d0d0d" : "#2d1800"}
                  border="4px solid black"
                  zIndex={1}
                  transition="height 0.15s ease-in-out"
                  opacity={loading || aiProcessing || !prompt.trim() || status === STATUS.PROCESSING || status === STATUS.GENERATING ? 0.5 : 1}
                />
              </Box>
            </VStack>
          </Box>
        </Flex>
      </Container>

      <style>
        {`
          @keyframes dataFlow {
            0% {
              background-position: 28px 0;
            }
            100% {
              background-position: 0 0;
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 0.3;
              transform: scale(0.8);
            }
            50% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default TextToImage; 