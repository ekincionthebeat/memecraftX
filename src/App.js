import React, { createContext, useContext, useState } from 'react';
import { ChakraProvider, Box, useColorMode, ColorModeScript, Image } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import ImageToImage from './components/ImageToImage/ImageToImage';
import TextToImage from './components/TextToImage/TextToImage';
import WalletProviderComponent from './components/WalletProvider/WalletProvider';
import theme from './theme';

export const ThemeAnimationContext = createContext();

const BackgroundVideo = () => {
  const { colorMode } = useColorMode();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showClock, setShowClock] = React.useState(false);
  const [isVideoReady, setIsVideoReady] = React.useState(false);
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const videoRef = React.useRef(null);
  const nextVideoRef = React.useRef(null);

  const overlayStyles = {
    dark: {
      bg: 'rgba(9, 9, 18, 0.65)',
      blur: '3px'
    },
    light: {
      bg: 'transparent',
      blur: '0px'
    }
  };

  const { startAnimation } = useContext(ThemeAnimationContext);

  const preloadNextVideo = (mode) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = `/assets/images/giphy/${mode === 'dark' ? 'night' : 'sun'}.mp4`;
      video.playsInline = true;
      video.preload = "auto";
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.load();
      video.onloadeddata = () => {
        nextVideoRef.current = video;
        resolve();
      };
    });
  };

  React.useEffect(() => {
    if (videoRef.current && isInitialLoad) {
      const video = videoRef.current;
      video.playsInline = true;
      video.preload = "auto";
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      
      if (video.videoWidth) {
        video.style.width = `${video.videoWidth}px`;
        video.style.height = `${video.videoHeight}px`;
      }

      setIsLoading(true);
      setIsVideoReady(false);
      video.load();
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  React.useEffect(() => {
    if (!isInitialLoad && videoRef.current) {
      setIsLoading(true);
      setIsVideoReady(false);
      videoRef.current.load();
    }
  }, [colorMode, isInitialLoad]);
  
  const handleVideoLoad = () => {
    setIsVideoReady(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  };

  React.useEffect(() => {
    if (startAnimation) {
      setIsLoading(true);
      setShowClock(true);
      setIsVideoReady(false);

      const nextMode = colorMode === 'dark' ? 'light' : 'dark';
      preloadNextVideo(nextMode).then(() => {
        setIsVideoReady(true);
        setTimeout(() => {
          setShowClock(false);
        }, 1500);
      });
    }
  }, [startAnimation, colorMode]);

  return (
    <>
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={-1}
        overflow="hidden"
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={handleVideoLoad}
          controls={false}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          style={{
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: 'none',
            pointerEvents: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            msUserSelect: 'none',
            objectPosition: 'center center',
            minWidth: '100%',
            minHeight: '100%',
            maxWidth: 'none',
            maxHeight: 'none'
          }}
        >
          <source
            src={`/assets/images/giphy/${colorMode === 'dark' ? 'night' : 'sun'}.mp4`}
            type="video/mp4"
          />
        </video>
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg={overlayStyles[colorMode].bg}
          backdropFilter={`blur(${overlayStyles[colorMode].blur})`}
          opacity={isLoading ? 0 : 1}
          transition="all 1.5s cubic-bezier(0.4, 0, 0.2, 1)"
        />
      </Box>

      {showClock && !isInitialLoad && (
        <Box
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={9999}
          sx={{
            animation: isVideoReady ? 'clockContainerFade 1.5s forwards' : 'none'
          }}
        >
          <Image
            src="/assets/images/giphy/clock.webp"
            alt="Loading"
            width="300px"
            height="300px"
            objectFit="contain"
            filter={colorMode === 'light' ? 'brightness(0.7)' : 'none'}
            sx={{
              animation: isVideoReady 
                ? 'clockFadeOut 1.5s forwards' 
                : 'clockPulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            }}
          />
        </Box>
      )}

      <style>
        {`
          @keyframes clockContainerFade {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.8);
            }
          }

          @keyframes clockFadeOut {
            0% {
              opacity: 1;
              transform: scale(1) rotate(0deg);
              filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
            }
            100% {
              opacity: 0;
              transform: scale(0.8) rotate(10deg);
              filter: drop-shadow(0 0 0px rgba(255, 255, 255, 0));
            }
          }

          @keyframes clockPulse {
            0% {
              transform: scale(1);
              filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.2));
            }
            50% {
              transform: scale(1.05);
              filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
            }
            100% {
              transform: scale(1);
              filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.2));
            }
          }
        `}
      </style>
    </>
  );
};

function App() {
  const [startAnimation, setStartAnimation] = useState(false);

  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ThemeAnimationContext.Provider value={{ startAnimation, setStartAnimation }}>
        <ChakraProvider theme={theme}>
          <WalletProviderComponent>
            <Router>
              <Box
                minH="100vh"
                position="relative"
              >
                <BackgroundVideo />
                <Header />
                <Box pt="80px">
                  <Routes>
                    <Route path="/" element={<ImageToImage />} />
                    <Route path="/image-to-image" element={<ImageToImage />} />
                    <Route path="/text-to-image" element={<TextToImage />} />
                  </Routes>
                </Box>
              </Box>
            </Router>
          </WalletProviderComponent>
        </ChakraProvider>
      </ThemeAnimationContext.Provider>
    </>
  );
}

export default App; 