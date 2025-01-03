import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { Global, css } from '@emotion/react';

require('@solana/wallet-adapter-react-ui/styles.css');

const WalletProviderComponent = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter()
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Global
            styles={css`
              .wallet-adapter-modal-container {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                z-index: 10000 !important;
              }

              .wallet-adapter-modal {
                background: #201f4c !important;
                width: 220px !important;
                padding: 24px !important;
                position: relative !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                gap: 20px !important;
                border: 2px solid #B8C1EC !important;
              }

              .wallet-adapter-modal-button-close {
                position: absolute !important;
                top: 10px !important;
                right: 10px !important;
                width: 16px !important;
                height: 16px !important;
                padding: 0 !important;
                background: transparent !important;
                border: none !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                transform: scale(1) !important;
                opacity: 0.8 !important;
              }

              .wallet-adapter-modal-button-close::before,
              .wallet-adapter-modal-button-close::after {
                content: "" !important;
                position: absolute !important;
                top: 50% !important;
                left: 0 !important;
                width: 16px !important;
                height: 2px !important;
                background-color: #B8C1EC !important;
                box-shadow: 0 0 2px rgba(0, 0, 0, 0.2) !important;
              }

              .wallet-adapter-modal-button-close::before {
                transform: translateY(-50%) rotate(45deg) !important;
              }

              .wallet-adapter-modal-button-close::after {
                transform: translateY(-50%) rotate(-45deg) !important;
              }

              .wallet-adapter-modal-button-close:hover {
                opacity: 1 !important;
                transform: scale(1.2) !important;
              }

              .wallet-adapter-modal-button-close:hover::before,
              .wallet-adapter-modal-button-close:hover::after {
                background-color: #EEBBC3 !important;
                box-shadow: 0 0 4px rgba(238, 187, 195, 0.4) !important;
              }

              .wallet-adapter-modal-title {
                color: #B8C1EC !important;
                font-family: 'Press Start 2P', cursive !important;
                font-size: 10px !important;
                text-align: center !important;
                margin: 0 !important;
                padding: 4px 12px !important;
                background: #201f4c !important;
                border: 2px solid #B8C1EC !important;
                text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.2) !important;
                letter-spacing: 0.5px !important;
                display: block !important;
              }

              .wallet-adapter-modal-wrapper {
                width: 100% !important;
              }

              .wallet-adapter-modal-list {
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                list-style: none !important;
              }

              .wallet-adapter-modal-list li {
                margin: 0 !important;
                padding: 0 !important;
              }

              .wallet-adapter-modal-list li:not(:first-child) {
                display: none !important;
              }

              .wallet-adapter-button {
                width: 100% !important;
                height: 36px !important;
                padding: 0 !important;
                margin: 0 !important;
                background: #201f4c !important;
                border: 2px solid #B8C1EC !important;
                color: #B8C1EC !important;
                font-family: 'Press Start 2P', cursive !important;
                font-size: 10px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 8px !important;
                cursor: pointer !important;
                position: relative !important;
                text-decoration: none !important;
                user-select: none !important;
                -webkit-user-select: none !important;
                touch-action: manipulation !important;
                will-change: transform !important;
                transform: translateZ(0) !important;
                backface-visibility: hidden !important;
                -webkit-font-smoothing: subpixel-antialiased !important;
              }

              .wallet-adapter-button:hover {
                border-color: #EEBBC3 !important;
                color: #EEBBC3 !important;
                background: rgba(32, 31, 76, 0.99) !important;
              }

              .wallet-adapter-button-start-icon {
                width: 20px !important;
                height: 20px !important;
                flex: 0 0 20px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
              }

              .wallet-adapter-button-start-icon img {
                width: 100% !important;
                height: 100% !important;
                object-fit: contain !important;
              }

              .wallet-adapter-button-end-icon,
              .wallet-adapter-modal-list-more {
                display: none !important;
              }
            `}
          />
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletProviderComponent; 