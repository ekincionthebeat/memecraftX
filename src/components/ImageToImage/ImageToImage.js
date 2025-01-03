import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  Center,
  Image,
  Flex,
} from '@chakra-ui/react';
import { FaImage } from 'react-icons/fa';
import { gsap } from 'gsap';
import { database } from '../../firebase/config';
import { ref as databaseRef, push, set, onValue, off, get } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

const STATUS = {
  INITIAL: 'initial',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  PROCESSING_PIXEL: 'processing_pixel',
  PROCESSING_STYLE: 'processing_style',
  COMPLETED: 'completed',
  ERROR: 'error',
  CANCELED: 'canceled'
};

const getStatusMessage = (status) => {
  switch(status) {
    case STATUS.UPLOADING:
      return '[YÜKLENIYOR...]';
    case STATUS.PROCESSING:
      return '[AI İŞLEMİ BAŞLADI...]';
    case STATUS.PROCESSING_PIXEL:
      return '[PIXEL ART OLUŞTURULUYOR...]';
    case STATUS.PROCESSING_STYLE:
      return '[STİL TRANSFERİ YAPILIYOR...]';
    case STATUS.COMPLETED:
      return '[İŞLEM TAMAMLANDI]';
    case STATUS.ERROR:
      return '[HATA OLUŞTU]';
    case STATUS.CANCELED:
      return '[İŞLEM İPTAL EDİLDİ]';
    default:
      return '[HAZIR]';
  }
};

const ProcessButton = ({ loading, onClick, children }) => {
  const buttonRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    const box = boxRef.current;
    const button = buttonRef.current;

    // 3D kutu oluşturma
    const faces = {
      front: createFace('translateZ(0px)'),
      back: createFace('translateZ(-80px)'),
      left: createFace('rotateY(-90deg) translateZ(40px)'),
      right: createFace('rotateY(90deg) translateZ(40px)'),
      bottom: createFace('rotateX(90deg) translateZ(40px)'),
    };

    // Yüzleri kutuya ekleme
    Object.values(faces).forEach(face => box.appendChild(face));

    // GSAP animasyonu
    gsap.set(box, {
      transformPerspective: 1000,
      transformStyle: 'preserve-3d'
    });

    gsap.set(button, {
      backgroundColor: '#371e00',
      border: '4px solid black',
      color: 'white'
    });

    // Hover animasyonu
    box.addEventListener('mouseenter', () => {
      gsap.to(box, {
        rotationX: 15,
        y: -5,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    box.addEventListener('mouseleave', () => {
      gsap.to(box, {
        rotationX: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    return () => {
      // Cleanup
      Object.values(faces).forEach(face => face.remove());
    };
  }, []);

  function createFace(transform) {
    const face = document.createElement('div');
    face.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      background: #371e00;
      border: 4px solid black;
      transform: ${transform};
      backface-visibility: hidden;
    `;
    return face;
  }

  return (
    <Box ref={boxRef} position="relative" width="100%" height="80px">
      <Button
        ref={buttonRef}
        leftIcon={
          <Image 
            src="/assets/images/giphy/enter.webp" 
            alt="Enter" 
            width="72px"
            height="72px"
            ml={-4}
          />
        }
        rightIcon={
          <Image 
            src="/assets/images/giphy/enter2.webp" 
            alt="Enter" 
            width="72px"
            height="72px"
            mr={-4}
          />
        }
        size="lg"
        width="100%"
        height="80px"
        isLoading={loading}
        onClick={onClick}
        fontFamily="'Press Start 2P', cursive"
        fontSize="xl"
        borderRadius="none"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={12}
        position="relative"
        zIndex={2}
        loadingText="[PROCESSING...]"
      >
        {children}
      </Button>
    </Box>
  );
};

const TextToImage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([null, null, null, null]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const toast = useToast();
  const fileInputRef = useRef(null);
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

  useEffect(() => {
    const historyRef = databaseRef(database, 'img2img');
    let isInitialLoad = true;
    let lastStatus = null; // Son durumu takip etmek için
    
    onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const historyArray = Object.values(data)
          .sort((a, b) => new Date(b.metadata.created_at) - new Date(a.metadata.created_at))
          .slice(0, 4)
          .concat(Array(4).fill(null))
          .slice(0, 4);
        
        // En son işlemi bul
        const latestItem = historyArray[0];
        if (!latestItem) return;

        // Durum değişikliğini kontrol et
        if (lastStatus !== latestItem.status) {
          lastStatus = latestItem.status;

          // İlk yükleme değilse bildirimleri göster
          if (!isInitialLoad) {
            // Önceki bildirimleri temizle
            clearAllToasts();

            if (latestItem.status === STATUS.PROCESSING || 
                latestItem.status === STATUS.PROCESSING_PIXEL || 
                latestItem.status === STATUS.PROCESSING_STYLE) {
              setAiProcessing(true);
              currentProcessRef.current = latestItem.id;
              processingToastRef.current = toast({
                title: '[AI İŞLEMİ]',
                description: getStatusMessage(latestItem.status),
                status: 'info',
                duration: null,
                isClosable: false,
                position: 'top',
                variant: 'solid',
                containerStyle: {
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: '12px',
                  margin: '20px'
                }
              });
            } else {
              setAiProcessing(false);
              currentProcessRef.current = null;
              
              if (latestItem.status === STATUS.COMPLETED && latestItem.output?.image_url) {
                setResult(latestItem.output.image_url);
                const toastId = toast({
                  title: '[BAŞARILI]',
                  description: getStatusMessage(STATUS.COMPLETED),
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                  position: 'top',
                  variant: 'solid',
                  containerStyle: {
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: '12px',
                    margin: '20px'
                  }
                });
                toastIdsRef.current.push(toastId);
              } else if (latestItem.status === STATUS.ERROR || latestItem.status === STATUS.CANCELED) {
                setResult(null);
                const toastId = toast({
                  title: '[HATA]',
                  description: latestItem.error || '[BİR HATA OLUŞTU]',
                  status: 'error',
                  duration: 5000,
                  isClosable: true,
                  position: 'top',
                  variant: 'solid',
                  containerStyle: {
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: '12px',
                    margin: '20px'
                  }
                });
                toastIdsRef.current.push(toastId);
              }
            }
          }
        }
        
        setHistory(historyArray);
        isInitialLoad = false;
      }
    });

    return () => {
      off(historyRef);
      clearAllToasts();
    };
  }, [toast, clearAllToasts]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/gif")) {
      setSelectedFile(file);
    } else {
      toast({
        title: '[HATA]',
        description: '[LÜTFEN JPG VEYA PNG DOSYASI YÜKLEYİN]',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
        variant: 'solid',
        containerStyle: {
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '12px',
          margin: '20px',
          position: 'relative'
        },
        style: {
          background: '#371e00',
          border: '4px solid black',
          borderRadius: '0',
          padding: '16px',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: '4px',
            top: '4px',
            right: '4px',
            bottom: '4px',
            border: '2px solid rgba(255,255,255,0.1)'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            right: '-8px',
            bottom: '-8px',
            width: '100%',
            height: '100%',
            background: 'black',
            zIndex: -1
          }
        }
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/gif")) {
      setSelectedFile(file);
    } else {
      toast({
        title: '[HATA]',
        description: '[LÜTFEN JPG VEYA PNG DOSYASI YÜKLEYİN]',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
        variant: 'solid',
        containerStyle: {
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '12px',
          margin: '20px',
          position: 'relative'
        },
        style: {
          background: '#371e00',
          border: '4px solid black',
          borderRadius: '0',
          padding: '16px',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: '4px',
            top: '4px',
            right: '4px',
            bottom: '4px',
            border: '2px solid rgba(255,255,255,0.1)'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            right: '-8px',
            bottom: '-8px',
            width: '100%',
            height: '100%',
            background: 'black',
            zIndex: -1
          }
        }
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast({
        title: '[HATA]',
        description: '[GÖRSEL GEREKLİ]',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
      return;
    }

    setLoading(true);
    try {
      // Dosyayı base64'e çevir
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = () => {
          // Data URL'den base64 kısmını al (data:image/jpeg;base64, kısmını kaldır)
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = error => reject(error);
      });

      const promptId = uuidv4();
      const historyRef = databaseRef(database, 'img2img');
      const newHistoryRef = push(historyRef);
      
      const promptData = {
        id: promptId,
        type: 'img2img',
        input: {
          prompt: '',
          input_image: base64Image,
          num_images: 1,
          width: 256,
          height: 256,
          prompt_style: 'default',
          strength: 0.8
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
      
      // UI'ı güncelle - yüklenen resmi göster
      setResult(URL.createObjectURL(selectedFile));
      
      toast({
        title: '[BAŞLADI]',
        description: getStatusMessage(STATUS.PROCESSING),
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top',
        variant: 'solid',
        containerStyle: {
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '12px',
          margin: '20px'
        }
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: '[HATA]',
        description: error.message === 'Dosya boyutu 5MB\'dan küçük olmalıdır' 
          ? '[DOSYA BOYUTU ÇOK BÜYÜK]' 
          : '[YÜKLEME BAŞARISIZ]',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (currentProcessRef.current) {
      const historyRef = databaseRef(database, 'img2img');
      const snapshot = await get(historyRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const processKey = Object.keys(data).find(key => data[key].id === currentProcessRef.current);
        
        if (processKey) {
          const processRef = databaseRef(database, `img2img/${processKey}`);
          setResult(null);
          await set(processRef, {
            ...data[processKey],
            status: STATUS.CANCELED,
            error: '[İŞLEM İPTAL EDİLDİ]'
          });
        }
      }
    }
  };

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
          {/* Sol yüz */}
          <Box
            position="absolute"
            top="0"
            left="-8px"
            width="8px"
            height="100%"
            bg="rgba(9, 9, 18, 0.98)"
            border="4px solid"
            borderColor="space.gray"
            borderRight="none"
            transition="width 0.2s"
          />
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
                borderColor="space.gray"
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
                    borderColor: 'space.accent',
                    filter: 'drop-shadow(0 0 8px rgba(184, 193, 236, 0.4))'
                  },
                  '& > div:first-of-type': {
                    transform: 'scale(0.98)',
                    bg: 'rgba(9, 9, 18, 0.7)',
                    backgroundImage: item ? 'none' : `
                      linear-gradient(45deg, 
                        rgba(184, 193, 236, 0.1) 25%, 
                        transparent 25%, 
                        transparent 50%, 
                        rgba(184, 193, 236, 0.1) 50%, 
                        rgba(184, 193, 236, 0.1) 75%, 
                        transparent 75%, 
                        transparent
                      )
                    `,
                    backgroundSize: '8px 8px'
                  },
                  '& p': {
                    color: 'space.accent',
                    textShadow: '0 0 8px rgba(184, 193, 236, 0.4)'
                  }
                }}
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
                >
                  {item ? (
                    <Image
                      src={item.image}
                      alt={`History ${index + 1}`}
                      objectFit="contain"
                      w="100%"
                      h="100%"
                    />
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
                Process Image
              </Heading>

              <Flex w="100%" gap={20} direction={{ base: 'column', md: 'row' }} position="relative">
                {/* Input Image Box */}
                <Box flex="1" position="relative">
                  <Text 
                    color="space.light" 
                    fontSize="md" 
                    mb={4} 
                    fontFamily="'Press Start 2P', cursive"
                  >
                    INPUT
                  </Text>
                  <Box position="relative" width="100%" height="324px" overflow="visible">
                    <Box
                      position="relative"
                      width="100%"
                      height="300px"
                      bg="rgba(9, 9, 18, 0.95)"
                      border="4px solid"
                      borderColor="space.gray"
                      borderBottom="none"
                      zIndex={2}
                      transition="transform 0.15s ease-in-out"
                      _hover={{
                        transform: loading ? 'none' : 'translateY(12px)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        '& + div': {
                          height: loading ? '24px' : '12px'
                        }
                      }}
                      backdropFilter="blur(12px)"
                      boxShadow="0 0 20px rgba(184, 193, 236, 0.1)"
                    >
                      <Box
                        w="100%"
                        h="100%"
                        onDrop={(e) => !loading && handleDrop(e)}
                        onDragOver={handleDragOver}
                        onClick={() => !loading && fileInputRef.current?.click()}
                        position="relative"
                        overflow="visible"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => !loading && handleFileSelect(e)}
                          accept="image/jpeg,image/png,image/gif"
                          style={{ display: 'none' }}
                          disabled={loading}
                        />
                        {selectedFile ? (
                          <Box position="relative" w="100%" h="100%">
                            {loading ? (
                              <Image
                                src="/assets/images/giphy/loading.gif"
                                alt="Loading"
                                objectFit="cover"
                                w="100%"
                                h="100%"
                              />
                            ) : (
                              <>
                                <Image
                                  src={URL.createObjectURL(selectedFile)}
                                  alt="Selected"
                                  objectFit="contain"
                                  w="100%"
                                  h="100%"
                                  p={4}
                                />
                                <Text 
                                  position="absolute" 
                                  bottom="4px" 
                                  left="50%" 
                                  transform="translateX(-50%)"
                                  color="space.light" 
                                  fontSize="10px"
                                  maxW="80%"
                                  zIndex={3}
                                  sx={{
                                    background: 'rgba(9, 9, 18, 0.95)',
                                    border: '2px solid',
                                    borderColor: 'space.gray',
                                    padding: '2px 8px',
                                    clipPath: `
                                      polygon(
                                        0 0,
                                        4px 0,
                                        4px 2px,
                                        calc(100% - 4px) 2px,
                                        calc(100% - 4px) 0,
                                        100% 0,
                                        100% calc(100% - 2px),
                                        calc(100% - 4px) calc(100% - 2px),
                                        calc(100% - 4px) 100%,
                                        4px 100%,
                                        4px calc(100% - 2px),
                                        0 calc(100% - 2px)
                                      )
                                    `,
                                    '&::before': {
                                      content: '""',
                                      position: 'absolute',
                                      top: '2px',
                                      left: '4px',
                                      right: '4px',
                                      height: '1px',
                                      background: 'rgba(184, 193, 236, 0.3)'
                                    },
                                    '&::after': {
                                      content: '""',
                                      position: 'absolute',
                                      bottom: '2px',
                                      left: '4px',
                                      right: '4px',
                                      height: '1px',
                                      background: 'rgba(184, 193, 236, 0.3)'
                                    }
                                  }}
                                  fontFamily="'Press Start 2P', cursive"
                                  display="flex"
                                  alignItems="center"
                                  gap={1}
                                >
                                  <Box
                                    as="span"
                                    display="inline-block"
                                    w="4px"
                                    h="4px"
                                    bg="space.gray"
                                    sx={{
                                      animation: 'pulse 2s infinite'
                                    }}
                                  />
                                  {selectedFile.name.length > 20 
                                    ? selectedFile.name.substring(0, 20) + '...' 
                                    : selectedFile.name}
                                  <Box
                                    as="span"
                                    display="inline-block"
                                    w="4px"
                                    h="4px"
                                    bg="space.gray"
                                    sx={{
                                      animation: 'pulse 2s infinite'
                                    }}
                                  />
                                </Text>
                              </>
                            )}
                          </Box>
                        ) : (
                          <Center h="100%" flexDirection="column" p={4}>
                            <Image 
                              src="/Icons/upload.png" 
                              alt="Upload" 
                              width="48px"
                              height="48px"
                              mb={4}
                              opacity={0.6}
                            />
                            <Text color="space.white" fontSize="md" textAlign="center" fontFamily="'Press Start 2P', cursive" display="flex" alignItems="center" justifyContent="center" gap={2}>
                              <Text as="span">▼</Text>
                              <Text as="span">DROP IMAGE HERE</Text>
                              <Text as="span">▼</Text>
                            </Text>
                            <Text color="space.gray" fontSize="sm" mt={2} textAlign="center" fontFamily="'Press Start 2P', cursive">
                              [JPG] | [PNG]
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
                      borderColor="space.gray"
                      zIndex={1}
                      transition="height 0.15s ease-in-out"
                      boxShadow="0 4px 20px rgba(184, 193, 236, 0.15)"
                    />
                  </Box>
                </Box>

                {/* Connection Cable */}
                <Box
                  position="absolute"
                  left="calc(50% - 80px)"
                  right="calc(50% - 80px)"
                  top="150px"
                  height="24px"
                  display={{ base: 'none', md: 'block' }}
                  zIndex={1}
                >
                  {/* Left Connector */}
                  <Box
                    position="absolute"
                    left="-4px"
                    top="4px"
                    width="12px"
                    height="16px"
                    bg="space.gray"
                    boxShadow="0 0 8px rgba(184, 193, 236, 0.3)"
                    sx={{
                      clipPath: 'polygon(0 0, 100% 25%, 100% 75%, 0 100%)'
                    }}
                  />

                  {/* Main Cable */}
                  <Box
                    position="absolute"
                    left="8px"
                    right="8px"
                    top="8px"
                    height="8px"
                    bg="space.gray"
                    sx={{
                      background: loading 
                        ? `repeating-linear-gradient(
                            90deg,
                            rgba(184, 193, 236, 0.2),
                            rgba(184, 193, 236, 0.2) 8px,
                            rgba(184, 193, 236, 0.8) 8px,
                            rgba(184, 193, 236, 0.8) 16px
                          )`
                        : 'space.gray',
                      animation: loading ? 'dataFlow 0.5s linear infinite' : 'none',
                      boxShadow: '0 0 8px rgba(184, 193, 236, 0.3)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '2px',
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'rgba(255, 255, 255, 0.2)'
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '2px',
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'rgba(0, 0, 0, 0.2)'
                      }
                    }}
                  />

                  {/* Right Connector */}
                  <Box
                    position="absolute"
                    right="-4px"
                    top="4px"
                    width="12px"
                    height="16px"
                    bg="space.gray"
                    boxShadow="0 0 8px rgba(184, 193, 236, 0.3)"
                    sx={{
                      clipPath: 'polygon(100% 0, 0 25%, 0 75%, 100% 100%)'
                    }}
                  />
                </Box>

                {/* Output Image Box */}
                <Box flex="1" position="relative">
                  <Text 
                    color="space.light" 
                    fontSize="md" 
                    mb={4} 
                    fontFamily="'Press Start 2P', cursive"
                  >
                    OUTPUT
                  </Text>
                  <Box position="relative" width="100%" height="324px">
                    <Box
                      position="relative"
                      width="100%"
                      height="300px"
                      bg="rgba(9, 9, 18, 0.95)"
                      border="4px solid"
                      borderColor="space.gray"
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
                        {loading || aiProcessing ? (
                          <>
                            <Image 
                              src="/assets/images/giphy/loading.gif" 
                              alt="Loading" 
                              objectFit="cover"
                              w="100%"
                              h="100%"
                            />
                            {aiProcessing && (
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
                            )}
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
                              [WAITING...]
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
                      borderColor="space.gray"
                      zIndex={1}
                      transition="height 0.15s ease-in-out"
                      boxShadow="0 4px 20px rgba(184, 193, 236, 0.15)"
                    />
                  </Box>

                  {/* Download Options - sadece işlem tamamlandığında göster */}
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
                            link.download = 'processed_image.png';
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
                            link.download = 'processed_image.jpg';
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

              {/* Process Button */}
              <Box
                position="relative"
                width="100%"
                height="104px"
                sx={{
                  '&:hover': {
                    '& > div:first-of-type': {
                      transform: 'translateY(12px)'
                    },
                    '& > div:last-of-type': {
                      height: '12px'
                    }
                  }
                }}
              >
                {/* Ana buton yüzeyi */}
                <Box
                  position="relative"
                  width="100%"
                  height="80px"
                  bg="#371e00"
                  border="4px solid black"
                  borderBottom="none"
                  zIndex={2}
                  onClick={handleGenerate}
                  cursor="pointer"
                  transition="transform 0.15s ease-in-out"
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
                    />
                    <Text
                      color="white"
                      fontSize="xl"
                      fontFamily="'Press Start 2P', cursive"
                    >
                      {loading ? '[PROCESSING...]' : '[PROCESS IMAGE]'}
                    </Text>
                    <Image 
                      src="/assets/images/giphy/enter2.webp" 
                      alt="Enter" 
                      width="72px"
                      height="72px"
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
                  bg="#2d1800"
                  border="4px solid black"
                  zIndex={1}
                  transition="height 0.15s ease-in-out"
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