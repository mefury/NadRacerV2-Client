import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

const PrivyConfig = {
  // Replace with your Privy App ID
  appId: import.meta.env.VITE_PRIVY_APP_ID,
  config: {
    // Customize Privy's appearance in your app
    appearance: {
      theme: 'dark',
      accentColor: '#836EF9', // Monad purple
      logo: '/monad.svg',
      // Additional theme customization to match shadcn
      variables: {
        colorBackground: 'hsl(var(--background))',
        colorInputBackground: 'hsl(var(--background))',
        colorInputBorder: 'hsl(var(--border))',
        colorText: 'hsl(var(--foreground))',
        colorTextSecondary: 'hsl(var(--muted-foreground))',
        colorPrimary: 'hsl(var(--primary))',
        colorPrimaryForeground: 'hsl(var(--primary-foreground))',
        colorSecondary: 'hsl(var(--secondary))',
        colorSecondaryForeground: 'hsl(var(--secondary-foreground))',
        borderRadius: '0.5rem',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
    },
    // Configure login methods - Monad Games ID only
    loginMethodsAndOrder: {
      primary: [`privy:${import.meta.env.VITE_MONAD_APP_ID}`],
      overflow: [],
    },
    // Configure embedded wallets only - disable all external wallets
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      requireUserPasswordOnCreate: false,
    },
    // Disable all external wallet connections to minimize scripts
    externalWallets: {
      coinbaseWallet: false,
      metaMask: false,
      rainbow: false,
      walletConnect: false,
      argent: false,
      trust: false,
      ledger: false,
      zerion: false,
      brave: false,
      opera: false,
      phantom: false,
      solflare: false
    },
    // Disable analytics and tracking to prevent GTM script loading
    disableAnalytics: true,
    // Disable automatic wallet detection to reduce external scripts
    walletConnectCloudProjectId: undefined,
    // Additional configuration to prevent external scripts
    setWalletConnectV2ProjectId: false,
    // Monad Games ID integration
    crossApp: {
      providerAppIds: [import.meta.env.VITE_MONAD_APP_ID], // Monad Global App ID
    },
  },
};

export function PrivyAppProvider({ children }) {
  return (
    <PrivyProvider
      appId={PrivyConfig.appId}
      config={PrivyConfig.config}
    >
      {children}
    </PrivyProvider>
  );
}

export default PrivyAppProvider;