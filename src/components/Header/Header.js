import React, { useEffect, useRef } from 'react';
import { Box, Flex, Text, HStack, Button, IconButton, useColorMode, Container, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, useDisclosure, Image, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { FaSun, FaMoon, FaRoad, FaWallet, FaTools, FaImage, FaVideo, FaFont, FaBars, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { gsap } from 'gsap';
import { ThemeAnimationContext } from '../../App';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useNavigate } from 'react-router-dom';

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
    bg={isAccent ? 'rgba(9, 9, 18, 0.95)' : 'rgba(9, 9, 18, 0.95)'}
    color={isAccent ? 'space.accent' : 'currentColor'}
    overflow="hidden"
    backdropFilter="blur(12px)"
    transform="perspective(1000px) rotateX(10deg)"
    transformOrigin="bottom"
    boxShadow={`
      0 -2px 0 1px rgba(255,255,255,0.1),
      0 2px 0 1px rgba(0,0,0,0.2),
      0 4px 8px -2px rgba(0,0,0,0.3),
      inset 0 0 0 1px rgba(255,255,255,0.1)
    `}
    _before={{
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: `
        linear-gradient(
          180deg,
          rgba(255,255,255,0.1) 0%,
          rgba(255,255,255,0.05) 5%,
          rgba(0,0,0,0.05) 95%,
          rgba(0,0,0,0.1) 100%
        )
      `,
      opacity: 0.5,
      transition: 'all 0.2s',
      zIndex: 0,
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
      zIndex: 1,
    }}
    _hover={{
      transform: 'perspective(1000px) rotateX(10deg) translate(-2px, -2px)',
      bg: isAccent ? 'rgba(9, 9, 18, 0.98)' : 'rgba(9, 9, 18, 0.98)',
      borderColor: isAccent ? 'space.hover' : 'currentColor',
      color: isAccent ? 'space.hover' : 'currentColor',
      boxShadow: `
        0 -2px 0 1px rgba(255,255,255,0.15),
        0 4px 0 1px rgba(0,0,0,0.2),
        0 8px 16px -4px rgba(0,0,0,0.5),
        inset 0 0 0 1px rgba(255,255,255,0.2)
      `,
      _before: {
        opacity: 0.7,
      },
      _after: {
        backgroundPosition: '0 0',
        opacity: isAccent ? 0.5 : 0,
      }
    }}
    _active={{
      transform: 'perspective(1000px) rotateX(10deg) translate(-1px, -1px)',
      boxShadow: `
        0 -1px 0 1px rgba(255,255,255,0.1),
        0 2px 0 1px rgba(0,0,0,0.2),
        0 4px 8px -2px rgba(0,0,0,0.3),
        inset 0 0 0 1px rgba(255,255,255,0.1)
      `,
    }}
    {...props}
  >
    {icon && (
      <Box 
        as={icon} 
        size="14px" 
        zIndex={2}
        transition="all 0.2s"
        style={{
          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))'
        }}
      />
    )}
    <Box 
      as="span" 
      zIndex={2}
      textShadow={isAccent ? "0 2px 4px rgba(238, 187, 195, 0.3)" : "0 2px 4px rgba(0,0,0,0.2)"}
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

const PixelIcon = ({ isLight, colorMode, onClick }) => (
  <Box
    position="relative"
    width="18px"
    height="18px"
    onClick={onClick}
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isMenuOpen, onOpen: onMenuOpen, onClose: onMenuClose } = useDisclosure();
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } = useDisclosure();
  const btnRef = useRef();
  const { setStartAnimation } = React.useContext(ThemeAnimationContext);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isChanging, setIsChanging] = React.useState(false);
  const rocketRef = useRef(null);
  const smokeRef = useRef(null);
  const { connected, publicKey, disconnect } = useWallet();
  const navigate = useNavigate();

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.toString().slice(0, 4)}...${address.toString().slice(-4)}`;
  };

  const handleThemeChange = () => {
    if (isChanging) return; // Eğer tema değişimi devam ediyorsa, yeni değişime izin verme
    
    setIsChanging(true);
    setStartAnimation(true);
    
    setTimeout(() => {
      toggleColorMode();
      setTimeout(() => {
        setStartAnimation(false);
        setIsChanging(false); // 3 saniye sonra yeni tema değişimine izin ver
      }, 3000);
    }, 100);
  };

  useEffect(() => {
    // Yukarı aşağı salınım animasyonu
    gsap.to(rocketRef.current, {
      y: -5,
      duration: 1.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });

    // Duman container'ı oluştur
    const smokeContainer = document.createElement('div');
    smokeContainer.style.position = 'absolute';
    smokeContainer.style.top = '0';
    smokeContainer.style.left = '0';
    smokeContainer.style.right = '0';
    smokeContainer.style.bottom = '0';
    smokeContainer.style.overflow = 'hidden';
    smokeContainer.style.pointerEvents = 'none';
    smokeContainer.style.zIndex = '1001';
    
    let isForwardDirection = true;
    let smokeInterval;

    // Duman container'ını header içindeki Box'a ekle
    const headerBox = document.querySelector('.header-box');
    if (headerBox) {
      headerBox.appendChild(smokeContainer);
    }

    // Ana timeline
    const mainTimeline = gsap.timeline({
      repeat: -1,
    });

    // Rastgele zıplama fonksiyonu
    const createPigJumps = (direction) => {
      const jumpTimeline = gsap.timeline();
      const jumpPoints = [2, 6, 18]; // Yaklaşık olarak yolun başı, ortası ve sonu
      
      jumpPoints.forEach(time => {
        jumpTimeline.to(".pig-container", {
          y: -30,
          duration: 0.4,
          ease: "power1.out",
          yoyo: true,
          repeat: 1,
          repeatDelay: 0.1
        }, time);
      });

      return jumpTimeline;
    };

    // 1. Roket sağa gider
    mainTimeline.fromTo(rocketRef.current,
      { 
        xPercent: -1300,
        rotateZ: 90
      },
      {
        xPercent: 1300,
        rotateZ: 90,
        duration: 20,
        ease: "none",
        onStart: () => {
          isForwardDirection = true;
          smokeInterval = setInterval(createSmoke, 50);
        },
        onComplete: () => {
          clearInterval(smokeInterval);
        }
      }
    )
    // 2. Bekleme süresi
    .to({}, {
      duration: 1
    })
    // 3. Domuz soldan sağa hareket eder
    .fromTo(".pig-container",
      { 
        xPercent: -1450,
        y: 0
      },
      {
        xPercent: 1450,
        duration: 20,
        ease: "none",
        onStart: () => {
          gsap.set(".pig-container img", { scaleX: 1 }); // Sağa giderken normal yön
          createPigJumps("right");
        }
      }
    )
    // 4. Bekleme süresi
    .to({}, {
      duration: 1
    })
    // 5. Domuz sağdan sola hareket eder
    .fromTo(".pig-container",
      { 
        xPercent: 1450,
        y: 0
      },
      {
        xPercent: -1450,
        duration: 20,
        ease: "none",
        onStart: () => {
          gsap.set(".pig-container img", { scaleX: -1 }); // Sola giderken ters yön
          createPigJumps("left");
        }
      }
    )
    // 6. Bekleme süresi
    .to({}, {
      duration: 1
    })
    // 7. Roket ters döner
    .to(rocketRef.current, {
      rotateZ: -90,
      duration: 0.5,
      ease: "power1.inOut"
    })
    // 8. Roket soldan sağa geri döner
    .to(rocketRef.current, {
      xPercent: -1300,
      duration: 20,
      ease: "none",
      onStart: () => {
        isForwardDirection = false;
      }
    })
    // 9. Roket tekrar döner
    .to(rocketRef.current, {
      rotateZ: 90,
      duration: 0.5,
      ease: "power1.inOut"
    });

    // Duman efekti animasyonu
    const createSmoke = () => {
      if (!rocketRef.current || !isForwardDirection) return;
      
      const smoke = document.createElement('div');
      smoke.className = 'smoke-particle';
      smokeContainer.appendChild(smoke);

      const rocketBounds = rocketRef.current.getBoundingClientRect();
      const rocketLeftX = rocketBounds.left;
      const rocketCenterY = rocketBounds.top + (rocketBounds.height / 2);

      gsap.set(smoke, {
        position: 'fixed',
        top: rocketCenterY + -10,
        left: rocketLeftX + 30,
        width: '8px',
        height: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '50%',
        boxShadow: '0 0 4px rgba(255, 255, 255, 0.1)',
        transform: 'translate(-50%, -50%)',
      });

      gsap.to(smoke, {
        scale: "random(1.5, 2)",
        opacity: 0,
        x: "-=random(30, 40)",
        y: "random(-8, 8)",
        rotation: "random(-90, 90)",
        duration: "random(0.4, 0.6)",
        ease: "power1.out",
        onComplete: () => {
          if (smokeContainer.contains(smoke)) {
            smokeContainer.removeChild(smoke);
          }
        }
      });
    };

    // Temizleme işlemleri
    return () => {
      if (smokeInterval) clearInterval(smokeInterval);
      if (smokeContainer.parentNode) {
        smokeContainer.parentNode.removeChild(smokeContainer);
      }
    };
  }, []);

  return (
    <Box 
      as="header" 
      position="fixed"
      top="4"
      left="0"
      right="0"
      mx="4"
      zIndex="1000"
      className="header-container"
    >
      <Box
        className="header-box"
        position="absolute"
        inset="0"
        bg="rgba(9, 9, 18, 0.7)"
        backdropFilter="blur(12px)"
        sx={{
          boxShadow: colorMode === 'dark' ? `
            0 0 20px rgba(238, 187, 195, 0.1),
            inset 0 0 30px rgba(238, 187, 195, 0.05)
          ` : 'none',
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
            `,
            zIndex: 0,
            boxShadow: colorMode === 'dark' ? '0 0 10px rgba(238, 187, 195, 0.2)' : 'none'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '0',
            background: colorMode === 'dark' ? 'radial-gradient(circle at 50% 50%, rgba(238, 187, 195, 0.05) 0%, transparent 70%)' : 'none',
            pointerEvents: 'none'
          }
        }}
      >
        <Box
          position="absolute"
          left="24px"
          right="24px"
          bottom="2px"
          height="20px"
          overflow="visible"
          zIndex={1}
        >
          {/* Roket Container'ı */}
          <Box
            position="absolute"
            bottom="0"
            left="0"
            right="0"
            height="20px"
            overflow="visible"
            zIndex={1}
          >
            <Box
              ref={smokeRef}
              position="absolute"
              bottom="0"
              left="50%"
              width="0"
              height="0"
              zIndex={0}
            />
            <Box
              ref={rocketRef}
              position="absolute"
              bottom="-20px"
              left="50%"
              transform="translateX(-50%) rotate(90deg)"
              zIndex={1}
              style={{
                transformStyle: 'preserve-3d',
                willChange: 'transform'
              }}
            >
              <Image 
                src="/assets/images/giphy/rocket.webp" 
                alt="Rocket" 
                width="94.5px" 
                height="94.5px"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))',
                  transformOrigin: 'center',
                  position: 'relative'
                }}
              />
            </Box>
          </Box>

          {/* Domuz Container'ı */}
          <Box
            position="absolute"
            bottom="0"
            left="0"
            right="0"
            height="20px"
            overflow="visible"
            zIndex={0}
          >
            <Box
              className="pig-container"
              position="absolute"
              bottom="-25px"
              left="50%"
              transform="translateX(-50%)"
              sx={{
                willChange: 'transform'
              }}
            >
              <Image 
                src="/assets/images/giphy/domuz.webp" 
                alt="Pig" 
                width="70px" 
                height="70px" 
                style={{
                  position: 'relative'
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
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
                fontSize={["md", "xl"]}
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
                    display={["none", "block"]}
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

          <Box 
            position="absolute" 
            left="50%" 
            transform="translateX(-50%)"
            display={["none", "none", "block"]}
          >
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
            {/* Mobil Hamburger Menü */}
            <IconButton
              ref={btnRef}
              display={["flex", "flex", "none"]}
              aria-label="Open menu"
              icon={<FaBars />}
              onClick={onMenuOpen}
              variant="outline"
              size="sm"
              border="2px solid"
              borderRadius="none"
              borderColor="space.accent"
              color="space.accent"
              bg="rgba(9, 9, 18, 0.95)"
              backdropFilter="blur(12px)"
              transform="perspective(1000px) rotateX(10deg)"
              transformOrigin="bottom"
              boxShadow={`
                0 -2px 0 1px rgba(255,255,255,0.1),
                0 2px 0 1px rgba(0,0,0,0.2),
                0 4px 8px -2px rgba(0,0,0,0.3),
                inset 0 0 0 1px rgba(255,255,255,0.1)
              `}
              _hover={{
                transform: 'perspective(1000px) rotateX(10deg) translate(-2px, -2px)',
                bg: 'rgba(9, 9, 18, 0.98)',
                boxShadow: `
                  0 -2px 0 1px rgba(255,255,255,0.15),
                  0 4px 0 1px rgba(0,0,0,0.2),
                  0 8px 16px -4px rgba(0,0,0,0.5),
                  inset 0 0 0 1px rgba(255,255,255,0.2)
                `
              }}
            />

            {/* Desktop Menü */}
            <HStack spacing={3} display={["none", "none", "flex"]}>
              <IconButton
                aria-label="Toggle color mode"
                icon={<PixelIcon isLight={colorMode === 'light'} colorMode={colorMode} />}
                onClick={handleThemeChange}
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
                bg="rgba(9, 9, 18, 0.95)"
                backdropFilter="blur(12px)"
                w="36px"
                h="36px"
                position="relative"
                transition="all 0.2s"
                transform="perspective(1000px) rotateX(10deg)"
                transformOrigin="bottom"
                boxShadow={`
                  0 -2px 0 1px rgba(255,255,255,0.1),
                  0 2px 0 1px rgba(0,0,0,0.2),
                  0 4px 8px -2px rgba(0,0,0,0.3),
                  inset 0 0 0 1px rgba(255,255,255,0.1)
                `}
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  bottom: '0',
                  background: `
                    linear-gradient(
                      180deg,
                      rgba(255,255,255,0.1) 0%,
                      rgba(255,255,255,0.05) 5%,
                      rgba(0,0,0,0.05) 95%,
                      rgba(0,0,0,0.1) 100%
                    )
                  `,
                  opacity: 0.5,
                  transition: 'all 0.2s',
                  zIndex: 0,
                }}
                _hover={{
                  transform: 'perspective(1000px) rotateX(10deg) translate(-2px, -2px)',
                  color: colorMode === 'dark' 
                    ? 'space.hover' 
                    : '#FFF0D4',
                  borderColor: colorMode === 'dark' 
                    ? 'space.hover' 
                    : '#FFF0D4',
                  bg: 'rgba(9, 9, 18, 0.98)',
                  boxShadow: `
                    0 -2px 0 1px rgba(255,255,255,0.15),
                    0 4px 0 1px rgba(0,0,0,0.2),
                    0 8px 16px -4px rgba(0,0,0,0.5),
                    inset 0 0 0 1px rgba(255,255,255,0.2)
                  `,
                  _before: {
                    opacity: 0.7,
                  }
                }}
                _active={{
                  transform: 'perspective(1000px) rotateX(10deg) translate(-1px, -1px)',
                  boxShadow: `
                    0 -1px 0 1px rgba(255,255,255,0.1),
                    0 2px 0 1px rgba(0,0,0,0.2),
                    0 4px 8px -2px rgba(0,0,0,0.3),
                    inset 0 0 0 1px rgba(255,255,255,0.1)
                  `,
                }}
                sx={{
                  '& svg': {
                    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))',
                    zIndex: 2,
                  },
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
              {!connected ? (
                <Box
                  sx={{
                    '.wallet-adapter-button': {
                      background: 'none !important',
                      border: 'none !important',
                      padding: '0 !important',
                      margin: '0 !important',
                      width: '100% !important',
                      height: 'auto !important',
                      color: 'inherit !important',
                      fontSize: 'inherit !important',
                      fontFamily: 'inherit !important',
                      fontWeight: 'inherit !important',
                      lineHeight: 'inherit !important',
                      cursor: 'pointer',
                    },
                    '.wallet-adapter-button-start-icon': {
                      display: 'none !important',
                    },
                    '.wallet-adapter-button-end-icon': {
                      display: 'none !important',
                    },
                    '.wallet-adapter-button:hover': {
                      background: 'none !important',
                      opacity: '1 !important',
                    },
                    '.wallet-adapter-button:not([disabled]):hover': {
                      background: 'none !important',
                      opacity: '1 !important',
                    }
                  }}
                >
                  <WalletMultiButton>
                    <PixelButton
                      w="100%"
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
                  </WalletMultiButton>
                </Box>
              ) : (
                <PixelButton
                  icon={FaUser}
                  color="space.accent"
                  borderColor="space.accent"
                  isAccent
                  onClick={onProfileOpen}
                  sx={{
                    boxShadow: '0 0 20px rgba(238, 187, 195, 0.15)',
                  }}
                >
                  {shortenAddress(publicKey)}
                </PixelButton>
              )}
            </HStack>
          </HStack>
        </Flex>
      </Container>

      {/* Mobil Menü Drawer */}
      <Drawer
        isOpen={isMenuOpen}
        placement="right"
        onClose={onMenuClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay backdropFilter="blur(12px)" bg="rgba(9, 9, 18, 0.5)" />
        <DrawerContent
          bg="#201f4c"
          borderLeft="2px solid"
          borderColor="space.accent"
          maxW="280px"
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
                MENU
              </Text>
            </Flex>
          </DrawerHeader>

          <DrawerBody p={4}>
            <Flex direction="column" gap={4}>
              <PixelButton
                w="100%"
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
                onClick={() => {
                  onMenuClose();
                  onOpen();
                }}
              >
                GENERATORS
              </PixelButton>
              
              <PixelButton
                w="100%"
                icon={FaRoad}
                color="space.gray"
                borderColor="space.gray"
              >
                ROADMAP
              </PixelButton>

              {!connected ? (
                <Box
                  sx={{
                    '.wallet-adapter-button': {
                      background: 'none !important',
                      border: 'none !important',
                      padding: '0 !important',
                      margin: '0 !important',
                      width: '100% !important',
                      height: 'auto !important',
                      color: 'inherit !important',
                      fontSize: 'inherit !important',
                      fontFamily: 'inherit !important',
                      fontWeight: 'inherit !important',
                      lineHeight: 'inherit !important',
                      cursor: 'pointer',
                    },
                    '.wallet-adapter-button-start-icon': {
                      display: 'none !important',
                    },
                    '.wallet-adapter-button-end-icon': {
                      display: 'none !important',
                    },
                    '.wallet-adapter-button:hover': {
                      background: 'none !important',
                      opacity: '1 !important',
                    },
                    '.wallet-adapter-button:not([disabled]):hover': {
                      background: 'none !important',
                      opacity: '1 !important',
                    }
                  }}
                >
                  <WalletMultiButton>
                    <PixelButton
                      w="100%"
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
                  </WalletMultiButton>
                </Box>
              ) : (
                <>
                  <PixelButton
                    w="100%"
                    icon={FaUser}
                    color="space.accent"
                    borderColor="space.accent"
                    isAccent
                    onClick={() => {}}
                  >
                    {shortenAddress(publicKey)}
                  </PixelButton>
                  <PixelButton
                    w="100%"
                    icon={FaUser}
                    color="space.gray"
                    borderColor="space.gray"
                    onClick={() => {}}
                  >
                    PROFILE
                  </PixelButton>
                  <PixelButton
                    w="100%"
                    icon={FaCog}
                    color="space.gray"
                    borderColor="space.gray"
                    onClick={() => {}}
                  >
                    SETTINGS
                  </PixelButton>
                  <PixelButton
                    w="100%"
                    icon={FaSignOutAlt}
                    color="space.gray"
                    borderColor="space.gray"
                    onClick={() => {
                      disconnect();
                      onMenuClose();
                    }}
                  >
                    DISCONNECT
                  </PixelButton>
                </>
              )}

              <Box pt={4}>
                <Text
                  fontSize="xs"
                  fontFamily="'Press Start 2P', cursive"
                  color="space.accent"
                  mb={2}
                >
                  THEME
                </Text>
                <PixelButton
                  w="100%"
                  onClick={handleThemeChange}
                  icon={colorMode === 'dark' ? FaMoon : FaSun}
                >
                  {colorMode === 'dark' ? 'DARK' : 'LIGHT'}
                </PixelButton>
              </Box>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Profil Drawer */}
      <Drawer
        isOpen={isProfileOpen}
        placement="right"
        onClose={onProfileClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay backdropFilter="blur(12px)" bg="rgba(9, 9, 18, 0.5)" />
        <DrawerContent
          bg="#201f4c"
          borderLeft="2px solid"
          borderColor="space.accent"
          maxW="280px"
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
                PROFILE
              </Text>
            </Flex>
          </DrawerHeader>

          <DrawerBody p={4}>
            <Flex direction="column" gap={4}>
              <PixelButton
                w="100%"
                icon={FaUser}
                color="space.accent"
                borderColor="space.accent"
                isAccent
              >
                {shortenAddress(publicKey)}
              </PixelButton>

              <Box
                width="100%"
                height="2px"
                my={2}
                sx={{
                  background: `repeating-linear-gradient(
                    to right,
                    rgba(238, 187, 195, 0.1) 0px,
                    rgba(238, 187, 195, 0.1) 4px,
                    transparent 4px,
                    transparent 8px
                  )`
                }}
              />

              <PixelButton
                w="100%"
                icon={FaUser}
                color="space.gray"
                borderColor="space.gray"
                onClick={() => {}}
              >
                PROFILE
              </PixelButton>

              <PixelButton
                w="100%"
                icon={FaCog}
                color="space.gray"
                borderColor="space.gray"
                onClick={() => {}}
              >
                SETTINGS
              </PixelButton>

              <Box
                width="100%"
                height="2px"
                my={2}
                sx={{
                  background: `repeating-linear-gradient(
                    to right,
                    rgba(238, 187, 195, 0.1) 0px,
                    rgba(238, 187, 195, 0.1) 4px,
                    transparent 4px,
                    transparent 8px
                  )`
                }}
              />

              <PixelButton
                w="100%"
                icon={FaSignOutAlt}
                color="space.gray"
                borderColor="space.gray"
                onClick={() => {
                  disconnect();
                  onProfileClose();
                }}
              >
                DISCONNECT
              </PixelButton>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Generator Drawer */}
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
                    <Flex 
                      align="center" 
                      gap={2} 
                      position="relative" 
                      role="group" 
                      cursor="pointer" 
                      className="menu-item"
                      onClick={() => {
                        navigate('/image-to-image');
                        onClose();
                      }}
                      _hover={{ '& .menu-arrow': { opacity: 1 }, '& .hover-desc': { opacity: 0.7 } }}
                    >
                      <Text
                        className="menu-arrow"
                        position="absolute"
                        left="-16px"
                        opacity={0}
                        visibility="hidden"
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
                        whiteSpace="nowrap"
                      >
                        FROM IMAGE
                      </Text>
                      <Text
                        className="hover-desc"
                        fontSize="10px"
                        color="space.accent"
                        opacity={0}
                        transition="opacity 0.2s"
                        fontFamily="monospace"
                      >
                        "image becomes pixel art"
                      </Text>
                    </Flex>

                    <Flex 
                      align="center" 
                      gap={2} 
                      position="relative" 
                      role="group" 
                      cursor="pointer" 
                      className="menu-item"
                      onClick={() => {
                        navigate('/text-to-image');
                        onClose();
                      }}
                      _hover={{ '& .menu-arrow': { opacity: 1 }, '& .hover-desc': { opacity: 0.7 } }}
                    >
                      <Text
                        className="menu-arrow"
                        position="absolute"
                        left="-16px"
                        opacity={0}
                        visibility="hidden"
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
                        whiteSpace="nowrap"
                      >
                        FROM TEXT
                      </Text>
                      <Text
                        className="hover-desc"
                        fontSize="10px"
                        color="space.accent"
                        opacity={0}
                        transition="opacity 0.2s"
                        fontFamily="monospace"
                      >
                        "words become pixel magic"
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

              <Box
                width="100%"
                height="2px"
                my={4}
                sx={{
                  background: `repeating-linear-gradient(
                    to right,
                    rgba(238, 187, 195, 0.1) 0px,
                    rgba(238, 187, 195, 0.1) 4px,
                    transparent 4px,
                    transparent 8px
                  )`
                }}
              />

              <Box>
                <Text
                  fontSize="xs"
                  fontFamily="'Press Start 2P', cursive"
                  color="space.accent"
                  mb={2}
                >
                  MEME ART
                </Text>
                
                <Box pl={3}>
                  <Flex direction="column" gap={2}>
                    <Flex 
                      align="center" 
                      gap={2} 
                      position="relative" 
                      role="group" 
                      cursor="pointer" 
                      className="menu-item"
                      _hover={{ '& .menu-arrow': { opacity: 1 }, '& .hover-desc': { opacity: 0.7 } }}
                    >
                      <Text
                        className="menu-arrow"
                        position="absolute"
                        left="-16px"
                        opacity={0}
                        visibility="hidden"
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
                        whiteSpace="nowrap"
                      >
                        FROM IMAGE
                      </Text>
                      <Text
                        className="hover-desc"
                        fontSize="10px"
                        color="space.accent"
                        opacity={0}
                        transition="opacity 0.2s"
                        fontFamily="monospace"
                      >
                        "memes go ultra instinct"
                      </Text>
                    </Flex>

                    <Flex 
                      align="center" 
                      gap={2} 
                      position="relative" 
                      role="group" 
                      cursor="pointer" 
                      className="menu-item"
                      _hover={{ '& .menu-arrow': { opacity: 1 }, '& .hover-desc': { opacity: 0.7 } }}
                    >
                      <Text
                        className="menu-arrow"
                        position="absolute"
                        left="-16px"
                        opacity={0}
                        visibility="hidden"
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
                        whiteSpace="nowrap"
                      >
                        FROM TEXT
                      </Text>
                      <Text
                        className="hover-desc"
                        fontSize="10px"
                        color="space.accent"
                        opacity={0}
                        transition="opacity 0.2s"
                        fontFamily="monospace"
                      >
                        "text becomes meme lord"
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

              <Box
                width="100%"
                height="2px"
                my={4}
                sx={{
                  background: `repeating-linear-gradient(
                    to right,
                    rgba(238, 187, 195, 0.1) 0px,
                    rgba(238, 187, 195, 0.1) 4px,
                    transparent 4px,
                    transparent 8px
                  )`
                }}
              />

              <Box>
                <Text
                  fontSize="xs"
                  fontFamily="'Press Start 2P', cursive"
                  color="space.accent"
                  mb={2}
                >
                  WEBSITE CREATOR
                </Text>
                
                <Box pl={3}>
                  <Flex direction="column" gap={2}>
                    <Flex align="center" gap={2} position="relative" opacity={0.5} cursor="not-allowed">
                      <Text
                        fontSize="xs"
                        fontFamily="'Press Start 2P', cursive"
                        color="white"
                      >
                        TEXT TO WEBSITE
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
                        DRAW TO WEBSITE
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
            </Flex>

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
                @keyframes arrowBlink {
                  0%, 100% { opacity: 0; }
                  50% { opacity: 1; }
                }

                .menu-item:hover .menu-arrow {
                  visibility: visible;
                  animation: arrowBlink 1s infinite;
                }

                .menu-item {
                  position: relative;
                  transition: all 0.2s ease;
                }

                .menu-item:active::after {
                  content: '';
                  position: absolute;
                  inset: -2px;
                  background: rgba(238, 187, 195, 0.2);
                  clip-path: polygon(
                    0 2px, 2px 2px, 2px 0,
                    calc(100% - 2px) 0, calc(100% - 2px) 2px, 100% 2px,
                    100% calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 100%,
                    2px 100%, 2px calc(100% - 2px), 0 calc(100% - 2px)
                  );
                }

                .smoke-particle {
                  pointer-events: none;
                  will-change: transform, opacity;
                  mix-blend-mode: screen;
                  filter: blur(3px);
                  position: fixed;
                }
              `}
            </style>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Header; 