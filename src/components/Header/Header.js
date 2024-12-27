import React from 'react';
import { Box, Flex, Text, HStack, Button, IconButton, useColorMode, Container, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, useDisclosure, Image } from '@chakra-ui/react';
import { FaSun, FaMoon, FaRoad, FaWallet, FaTools, FaImage, FaVideo, FaFont, FaBars } from 'react-icons/fa';

const PixelButton = ({ children, icon, isAccent, ...props }) => (
  <Button
    variant="outline"
    height="36px"
    px="5"
    border="2px solid"
    borderRadius="none"
    fontSize="xs"
    fontFamily="'Press Start 2P', cursive"
    position="relative"
    display="flex"
    gap="2"
    transition="all 0.2s"
    bg={isAccent ? 'rgba(238, 187, 195, 0.08)' : 'transparent'}
    color={isAccent ? 'space.accent' : 'currentColor'}
    overflow="hidden"
    _before={{
      content: '""',
      position: 'absolute',
      top: '4px',
      left: '4px',
      right: '-4px',
      bottom: '-4px',
      borderRadius: 'none',
      bg: isAccent ? 'space.accent' : 'currentColor',
      opacity: 0.1,
      transition: 'all 0.2s',
      zIndex: -1,
    }}
    _after={{
      content: '""',
      position: 'absolute',
      inset: '-1px',
      background: 'linear-gradient(45deg, transparent 40%, rgba(238, 187, 195, 0.4) 50%, transparent 60%)',
      backgroundSize: '200% 100%',
      backgroundPosition: '100% 0',
      transition: 'all 0.6s ease',
      opacity: 0,
    }}
    _hover={{
      transform: 'translate(-2px, -2px)',
      bg: isAccent ? 'rgba(238, 187, 195, 0.12)' : 'whiteAlpha.100',
      borderColor: isAccent ? 'space.hover' : 'currentColor',
      color: isAccent ? 'space.hover' : 'currentColor',
      _before: {
        transform: 'translate(2px, 2px)',
        opacity: isAccent ? 0.15 : 0.1,
      },
      _after: {
        backgroundPosition: '0 0',
        opacity: isAccent ? 0.5 : 0,
      }
    }}
    _active={{
      transform: 'translate(-1px, -1px)',
    }}
    {...props}
  >
    {icon && (
      <Box 
        as={icon} 
        size="14px" 
        zIndex={1}
        transition="all 0.2s"
      />
    )}
    <Box 
      as="span" 
      zIndex={1}
      textShadow={isAccent ? "0 0 8px rgba(238, 187, 195, 0.3)" : "none"}
    >
      {children}
    </Box>
  </Button>
);

const TypewriterText = ({ isVisible }) => {
  const [displayText, setDisplayText] = React.useState('');
  const [phase, setPhase] = React.useState(0);
  const [textStyle, setTextStyle] = React.useState({});
  const intervalRef = React.useRef(null);
  
  const sequence = [
    { text: "AI MEME GENERUGPULLATOR", duration: 1500, type: 'write' },
    { text: "AI MEME GENER", duration: 400, type: 'delete' },
    { text: "AI MEME GENERATOR", duration: 700, type: 'write' }
  ];

  React.useEffect(() => {
    if (isVisible) {
      const runPhase = (phaseIndex) => {
        if (phaseIndex >= sequence.length) return;
        
        let { text: currentText, duration, type } = sequence[phaseIndex];
        
        if (type === 'write') {
          let startIndex = phaseIndex === 0 ? 0 : "AI MEME GENER".length;
          let index = startIndex;
          
          intervalRef.current = setInterval(() => {
            setDisplayText(currentText.slice(0, index + 1));
            index++;
            
            if (index === currentText.length) {
              clearInterval(intervalRef.current);
              if (phaseIndex === 0) {
                // İlk yazım tamamlandığında kırmızı yanıp sönme efekti
                setTextStyle({
                  animation: 'errorBlink 0.5s infinite',
                  color: 'red.400'
                });
                setTimeout(() => setPhase(phaseIndex + 1), 1000);
              } else if (phaseIndex === 2) {
                // Son yazım tamamlandığında yeşil başarı efekti
                setTextStyle({
                  animation: 'successPulse 1s forwards',
                  color: 'green.400'
                });
              }
            }
          }, duration / (currentText.length - startIndex));
          
        } else if (type === 'delete') {
          let deleteCount = "UGPULLATOR".length;
          let deleteIndex = deleteCount;
          
          setTextStyle({}); // Silme başlamadan önce efektleri temizle
          
          intervalRef.current = setInterval(() => {
            if (deleteIndex > 0) {
              setDisplayText(prev => prev.slice(0, -1));
              deleteIndex--;
            } else {
              clearInterval(intervalRef.current);
              setTimeout(() => setPhase(phaseIndex + 1), 200);
            }
          }, duration / deleteCount);
        }
      };

      runPhase(phase);
    } else {
      setDisplayText('');
      setPhase(0);
      setTextStyle({});
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible, phase]);

  const cursorStyle = React.useMemo(() => {
    const isDeleting = phase === 1;
    const isError = phase === 0 && displayText === "AI MEME GENERUGPULLATOR";
    
    return {
      color: isDeleting ? 'rgba(255, 80, 80, 0.8)' : 'currentColor',
      animation: `blink 1s infinite ${isDeleting ? 'steps(2)' : 'steps(1)'}`,
      opacity: isVisible ? 1 : 0
    };
  }, [isVisible, phase, displayText]);

  return (
    <Text 
      as="span" 
      visibility={isVisible ? 'visible' : 'hidden'}
      sx={{
        '@keyframes errorBlink': {
          '0%, 100%': { opacity: 1, textShadow: '0 0 5px rgba(255, 0, 0, 0.5)' },
          '50%': { opacity: 0.7, textShadow: '0 0 10px rgba(255, 0, 0, 0.8)' }
        },
        '@keyframes successPulse': {
          '0%': { opacity: 0.8, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' },
          '100%': { opacity: 1, transform: 'scale(1)', textShadow: '0 0 8px rgba(0, 255, 0, 0.5)' }
        },
        ...textStyle
      }}
    >
      {displayText}
      <Box 
        as="span" 
        {...cursorStyle}
      >
        {phase === 0 && displayText === "AI MEME GENERUGPULLATOR" ? "!" : "_"}
      </Box>
    </Text>
  );
};

const PixelIcon = ({ isLight, colorMode }) => (
  <Box
    position="relative"
    width="18px"
    height="18px"
    sx={{
      '& svg': {
        position: 'absolute',
        inset: 0,
        transition: 'all 0.3s ease',
        filter: colorMode === 'dark' 
          ? 'drop-shadow(0 0 4px rgba(238, 187, 195, 0.3))'
          : 'drop-shadow(0 0 4px rgba(255, 236, 179, 0.4))',
        color: colorMode === 'dark' 
          ? 'space.accent'
          : '#FFE5B4',
      },
      '& path': {
        shapeRendering: 'crispEdges',
      }
    }}
  >
    {colorMode === 'dark' ? (
      <FaMoon size={16} style={{ transform: 'rotate(-45deg)' }} />
    ) : (
      <FaSun size={16} />
    )}
  </Box>
);

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isHovered, setIsHovered] = React.useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box 
      as="header" 
      position="fixed"
      top="4"
      left="0"
      right="0"
      mx="4"
      zIndex="1000"
    >
      <Box
        position="absolute"
        inset="0"
        bg="rgba(9, 9, 18, 0.7)"
        backdropFilter="blur(12px)"
        sx={{
          clipPath: `
            polygon(
              0 24px,
              8px 24px,
              8px 16px,
              16px 16px,
              16px 8px,
              24px 8px,
              24px 0,
              calc(100% - 24px) 0,
              calc(100% - 24px) 8px,
              calc(100% - 16px) 8px,
              calc(100% - 16px) 16px,
              calc(100% - 8px) 16px,
              calc(100% - 8px) 24px,
              100% 24px,
              100% calc(100% - 24px),
              calc(100% - 8px) calc(100% - 24px),
              calc(100% - 8px) calc(100% - 16px),
              calc(100% - 16px) calc(100% - 16px),
              calc(100% - 16px) calc(100% - 8px),
              calc(100% - 24px) calc(100% - 8px),
              calc(100% - 24px) 100%,
              24px 100%,
              24px calc(100% - 8px),
              16px calc(100% - 8px),
              16px calc(100% - 16px),
              8px calc(100% - 16px),
              8px calc(100% - 24px),
              0 calc(100% - 24px)
            )
          `,
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '24px',
            right: '24px',
            height: '2px',
            background: `
              repeating-linear-gradient(
                to right,
                rgba(238, 187, 195, 0.15) 0px,
                rgba(238, 187, 195, 0.15) 4px,
                transparent 4px,
                transparent 8px
              )
            `
          }
        }}
      />
      <Container maxW="1200px" px={6} position="relative">
        <Flex justify="space-between" align="center" height="64px">
          <Flex 
            role="group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            cursor="default"
          >
            <Box position="relative">
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="space.light"
                fontFamily="'Press Start 2P', cursive"
                textShadow="0 0 10px rgba(184, 193, 236, 0.3)"
                display="flex"
                alignItems="center"
                gap="1"
                position="relative"
              >
                <Text
                  as="span"
                  transition="all 0.3s ease"
                  _groupHover={{
                    color: "space.accent",
                    textShadow: "0 0 12px rgba(238, 187, 195, 0.5)"
                  }}
                >
                  meme
                </Text>
                <Text as="span" color="space.light">craft</Text>
                <Box position="relative">
                  <Text
                    as="span"
                    color="space.accent"
                    animation="float 2s ease-in-out infinite"
                    display="inline-block"
                    sx={{
                      willChange: 'transform',
                      transform: 'translateY(0)',
                    }}
                    textShadow="0 0 10px rgba(238, 187, 195, 0.5)"
                  >
                    X
                  </Text>
                  <Box
                    className="speech-bubble"
                    position="absolute"
                    bottom="100%"
                    left="50%"
                    transform="translate(-50%, -2px)"
                    opacity={isHovered ? 1 : 0}
                    visibility={isHovered ? 'visible' : 'hidden'}
                    transition="all 0.3s ease"
                    zIndex={2}
                    pointerEvents="none"
                    sx={{
                      willChange: 'transform, opacity',
                      transformOrigin: 'bottom center',
                      backfaceVisibility: 'hidden',
                      perspective: 1000,
                      WebkitFontSmoothing: 'antialiased'
                    }}
                  >
                    <Box
                      position="relative"
                      bg="white"
                      color="space.darker"
                      px="3"
                      py="2"
                      fontSize="12px"
                      fontFamily="'Press Start 2P', cursive"
                      fontWeight="400"
                      letterSpacing="0.5px"
                      whiteSpace="nowrap"
                      minWidth="160px"
                      textAlign="center"
                      sx={{
                        clipPath: `
                          polygon(
                            0 8px,
                            4px 8px,
                            4px 4px,
                            8px 4px,
                            8px 0,
                            calc(100% - 8px) 0,
                            calc(100% - 8px) 4px,
                            calc(100% - 4px) 4px,
                            calc(100% - 4px) 8px,
                            100% 8px,
                            100% calc(100% - 8px),
                            calc(100% - 4px) calc(100% - 8px),
                            calc(100% - 4px) calc(100% - 4px),
                            50% calc(100% - 4px),
                            50% 100%,
                            calc(50% - 8px) calc(100% - 4px),
                            4px calc(100% - 4px),
                            4px calc(100% - 8px),
                            0 calc(100% - 8px)
                          )
                        `,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: '1px',
                          bg: 'white',
                          zIndex: -1
                        }
                      }}
                    >
                      <TypewriterText isVisible={isHovered} />
                    </Box>
                  </Box>
                </Box>
              </Text>
            </Box>
          </Flex>

          <Box position="absolute" left="50%" transform="translateX(-50%)">
            <PixelButton
              icon={() => (
                <Image
                  src="/assets/images/giphy/generators.gif"
                  alt="Generators"
                  width="28px"
                  height="28px"
                  objectFit="cover"
                  display="inline-block"
                  verticalAlign="middle"
                />
              )}
              color="space.gray"
              borderColor="space.gray"
              onClick={onOpen}
              _hover={{
                color: 'space.light',
                borderColor: 'space.light',
                bg: 'whiteAlpha.100'
              }}
            >
              GENERATORS
            </PixelButton>
          </Box>

          <HStack spacing={3}>
            <IconButton
              aria-label="Toggle color mode"
              icon={<PixelIcon isLight={colorMode === 'light'} colorMode={colorMode} />}
              onClick={toggleColorMode}
              variant="outline"
              size="sm"
              border="2px solid"
              borderRadius="none"
              borderColor={colorMode === 'dark' 
                ? 'space.accent'
                : '#FFE5B4'
              }
              color={colorMode === 'dark' 
                ? 'space.accent' 
                : '#FFE5B4'
              }
              bg="transparent"
              w="36px"
              h="36px"
              position="relative"
              transition="all 0.2s"
              _before={{
                content: '""',
                position: 'absolute',
                top: '2px',
                left: '2px',
                right: '-2px',
                bottom: '-2px',
                bg: colorMode === 'dark' ? 'space.accent' : '#FFE5B4',
                opacity: 0.1,
                transition: 'all 0.2s',
                zIndex: -1,
              }}
              _hover={{
                transform: 'translate(-2px, -2px)',
                color: colorMode === 'dark' 
                  ? 'space.hover' 
                  : '#FFF0D4',
                borderColor: colorMode === 'dark' 
                  ? 'space.hover' 
                  : '#FFF0D4',
                bg: colorMode === 'dark' 
                  ? 'rgba(15, 15, 27, 0.12)' 
                  : 'rgba(255, 229, 180, 0.12)',
                _before: {
                  transform: 'translate(2px, 2px)',
                  opacity: 0.15,
                }
              }}
              _active={{
                transform: 'translate(-1px, -1px)',
              }}
              sx={{
                '&:hover svg': {
                  transform: colorMode === 'dark' 
                    ? 'rotate(-45deg) scale(1.1)' 
                    : 'rotate(180deg) scale(1.1)',
                }
              }}
            />
            <PixelButton
              icon={FaRoad}
              color="space.gray"
              borderColor="space.gray"
              _hover={{
                color: 'space.light',
                borderColor: 'space.light',
                bg: 'whiteAlpha.100'
              }}
            >
              ROADMAP
            </PixelButton>
            <PixelButton
              icon={FaWallet}
              color="space.accent"
              borderColor="space.accent"
              isAccent
              sx={{
                boxShadow: '0 0 20px rgba(238, 187, 195, 0.15)',
              }}
            >
              CONNECT
            </PixelButton>
          </HStack>
        </Flex>
      </Container>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay backdropFilter="blur(12px)" bg="rgba(9, 9, 18, 0.5)" />
        <DrawerContent
          bg="#201f4c"
          borderRight="2px solid"
          borderColor="space.accent"
          maxW="280px"
          position="relative"
        >
          <DrawerHeader
            borderBottom="2px solid"
            borderColor="space.accent"
            py={4}
            px={4}
          >
            <Flex align="center" gap={2}>
            <Text
              fontSize="sm"
              fontFamily="'Press Start 2P', cursive"
              color="space.accent"
            >
              GENERATORS
            </Text>
              <Image
                src="/assets/images/giphy/generators.gif"
                alt="Generators"
                width="20px"
                height="20px"
                objectFit="cover"
              />
            </Flex>
          </DrawerHeader>

          <DrawerBody p={2}>
            <Flex direction="column" gap={4} mt={2}>
              <Box>
                <Text
                  fontSize="xs"
                  fontFamily="'Press Start 2P', cursive"
                  color="space.accent"
                  mb={2}
                >
                  PIXEL ART
                </Text>
                
                <Box pl={3}>
                  <Flex direction="column" gap={2}>
                    <Flex align="center" gap={2} position="relative" role="group" cursor="pointer" _hover={{ '& .menu-arrow': { opacity: 1 } }}>
                      <Text
                        className="menu-arrow"
                        position="absolute"
                        left="-16px"
                        opacity={0}
                        transition="opacity 0.2s"
                        color="space.accent"
                        fontFamily="'Press Start 2P', cursive"
                        fontSize="10px"
                      >
                        ▶
                      </Text>
                      <Text
                        fontSize="xs"
                        fontFamily="'Press Start 2P', cursive"
                        color="white"
                        _groupHover={{ color: 'space.accent' }}
                      >
                        FROM IMAGE
                      </Text>
                    </Flex>

                    <Flex align="center" gap={2} position="relative" role="group" cursor="pointer" _hover={{ '& .menu-arrow': { opacity: 1 } }}>
                      <Text
                        className="menu-arrow"
                        position="absolute"
                        left="-16px"
                        opacity={0}
                        transition="opacity 0.2s"
                        color="space.accent"
                        fontFamily="'Press Start 2P', cursive"
                        fontSize="10px"
                      >
                        ▶
                      </Text>
                      <Text
                        fontSize="xs"
                        fontFamily="'Press Start 2P', cursive"
                        color="white"
                        _groupHover={{ color: 'space.accent' }}
                      >
                        FROM TEXT
                      </Text>
                    </Flex>

                    <Flex align="center" gap={2} position="relative" opacity={0.5} cursor="not-allowed">
                      <Text
                        fontSize="xs"
                        fontFamily="'Press Start 2P', cursive"
                        color="white"
                      >
                        FROM VIDEO
                      </Text>
                      <Text
                        fontSize="10px"
                        color="space.accent"
                        fontFamily="'Press Start 2P', cursive"
                      >
                        [SOON]
                      </Text>
                    </Flex>

                    <Flex align="center" gap={2} position="relative" opacity={0.5} cursor="not-allowed">
                      <Text
                        fontSize="xs"
                        fontFamily="'Press Start 2P', cursive"
                        color="white"
                      >
                        VIDEO FROM TEXT
                      </Text>
                      <Text
                        fontSize="10px"
                        color="space.accent"
                        fontFamily="'Press Start 2P', cursive"
                      >
                        [SOON]
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              </Box>

              <Box>
                <Flex align="center" gap={2} position="relative" role="group">
                  <Text
                    fontSize="xs"
                    fontFamily="'Press Start 2P', cursive"
                    color="space.accent"
                    mb={2}
                    cursor="pointer"
                    _groupHover={{ color: 'white' }}
                    position="relative"
                  >
                    {'MEME ART'.split('').map((char, index) => (
                      <Box
                        key={index}
                        as="span"
                        display="inline-block"
                        position="relative"
                        role="group"
                      >
                        {char}
                        {char === 'T' && (
                          <Box
                            position="absolute"
                            top="-120px"
                            left="50%"
                            transform="translateX(-50%)"
                            opacity={0}
                            visibility="hidden"
                            transition="all 0.2s ease"
                            zIndex={10}
                            _groupHover={{
                              opacity: 1,
                              visibility: "visible"
                            }}
                          >
                            <Box
                              bg="#201f4c"
                              p={2}
                              borderRadius="md"
                              border="2px solid"
                              borderColor="space.accent"
                              boxShadow="0 4px 12px rgba(0,0,0,0.3)"
                              position="relative"
                              width="100px"
                              height="100px"
                              _after={{
                                content: '""',
                                position: 'absolute',
                                bottom: '-6px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 0,
                                height: 0,
                                borderLeft: '6px solid transparent',
                                borderRight: '6px solid transparent',
                                borderTop: '6px solid',
                                borderTopColor: 'space.accent'
                              }}
                            >
                              <Box position="relative" width="100%" height="100%">
                                <Image
                                  src="/assets/images/giphy/memeart1.png"
                                  alt="Meme Art Preview 1"
                                  width="100%"
                                  height="100%"
                                  objectFit="contain"
                                  position="absolute"
                                  top="0"
                                  left="0"
                                  opacity={1}
                                  transition="all 0.5s ease-in-out"
                                  animation="imageTransition1 4s infinite"
                                  filter="blur(0px)"
                                />
                                <Image
                                  src="/assets/images/giphy/memeart2.png"
                                  alt="Meme Art Preview 2"
                                  width="100%"
                                  height="100%"
                                  objectFit="contain"
                                  position="absolute"
                                  top="0"
                                  left="0"
                                  opacity={0}
                                  transition="all 0.5s ease-in-out"
                                  animation="imageTransition2 4s infinite"
                                  filter="blur(0px)"
                                />
                              </Box>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Text>
                </Flex>
                
                <Box pl={3}>
                  <Flex direction="column" gap={2}>
                    <Flex align="center" gap={2} position="relative" role="group" cursor="pointer" _hover={{ '& .menu-arrow': { opacity: 1 } }}>
                      <Text
                        className="menu-arrow"
                        position="absolute"
                        left="-16px"
                        opacity={0}
                        transition="opacity 0.2s"
                        color="space.accent"
                        fontFamily="'Press Start 2P', cursive"
                        fontSize="10px"
                      >
                        ▶
                      </Text>
                      <Text
                        fontSize="xs"
                        fontFamily="'Press Start 2P', cursive"
                        color="white"
                        _groupHover={{ color: 'space.accent' }}
                      >
                        FROM IMAGE
                      </Text>
                    </Flex>

                    <Flex align="center" gap={2} position="relative" role="group" cursor="pointer" _hover={{ '& .menu-arrow': { opacity: 1 } }}>
                      <Text
                        className="menu-arrow"
                        position="absolute"
                        left="-16px"
                        opacity={0}
                        transition="opacity 0.2s"
                        color="space.accent"
                        fontFamily="'Press Start 2P', cursive"
                        fontSize="10px"
                      >
                        ▶
                      </Text>
                      <Text
                        fontSize="xs"
                        fontFamily="'Press Start 2P', cursive"
                        color="white"
                        _groupHover={{ color: 'space.accent' }}
                      >
                        FROM TEXT
                      </Text>
                    </Flex>

                    <Flex align="center" gap={2} position="relative" opacity={0.5} cursor="not-allowed">
                      <Text
                        fontSize="xs"
                        fontFamily="'Press Start 2P', cursive"
                        color="white"
                      >
                        FROM VIDEO
                      </Text>
                      <Text
                        fontSize="10px"
                        color="space.accent"
                        fontFamily="'Press Start 2P', cursive"
                      >
                        [SOON]
                      </Text>
                    </Flex>

                    <Flex align="center" gap={2} position="relative" opacity={0.5} cursor="not-allowed">
                      <Text
                        fontSize="xs"
                        fontFamily="'Press Start 2P', cursive"
                        color="white"
                      >
                        VIDEO FROM TEXT
                      </Text>
                      <Text
                        fontSize="10px"
                        color="space.accent"
                        fontFamily="'Press Start 2P', cursive"
                      >
                        [SOON]
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              </Box>
            </Flex>

            <Box 
              position="absolute"
              bottom="0"
              left="0"
              right="0"
              width="100%" 
              height="120px" 
              overflow="hidden"
            >
              <Image
                src="/assets/images/giphy/car.gif"
                alt="Pixel Car"
                width="100%"
                height="100%"
                objectFit="cover"
                position="relative"
              />
            </Box>
          </DrawerBody>

          <style>
            {`
              @keyframes imageTransition1 {
                0%, 100% { 
                  opacity: 1;
                  filter: blur(0px);
                  transform: scale(1);
                }
                45% { 
                  opacity: 1;
                  filter: blur(0px);
                  transform: scale(1);
                }
                50% { 
                  opacity: 0;
                  filter: blur(8px);
                  transform: scale(0.95);
                }
                95% { 
                  opacity: 0;
                  filter: blur(8px);
                  transform: scale(0.95);
                }
              }
              @keyframes imageTransition2 {
                0%, 100% { 
                  opacity: 0;
                  filter: blur(8px);
                  transform: scale(0.95);
                }
                45% { 
                  opacity: 0;
                  filter: blur(8px);
                  transform: scale(0.95);
                }
                50% { 
                  opacity: 1;
                  filter: blur(0px);
                  transform: scale(1);
                }
                95% { 
                  opacity: 1;
                  filter: blur(0px);
                  transform: scale(1);
                }
              }
            `}
          </style>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Header; 