// ============ WEB3: OPTIONAL POLYGON WALLET BRIDGE ============
// The vertical slice keeps all balances local. This module contains the
// production-shaped wallet flow: connect an EVM wallet, switch to Polygon,
// and read an ERC-20 balance with ethers.js. It is inert unless a real
// contract address is configured below, so the demo never moves funds.

export const WEB3_CONFIG = {
  chainId: 137,
  chainHex: '0x89',
  chainName: 'Polygon PoS',
  rpc: 'https://polygon-rpc.com',
  explorer: 'https://polygonscan.com',
  // Set a deployed $SRN token address to enable live read-only balance checks.
  srnToken: null,
  // A production claim/distributor contract. Enabling this requires a
  // server-signed claim and a deployed contract; it is intentionally null.
  claimContract: null,
  enabled: false
};

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

let ethersPromise = null;

export function loadEthers() {
  if (window.ethers) return Promise.resolve(window.ethers);
  if (ethersPromise) return ethersPromise;
  ethersPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'vendor/ethers.umd.min.js';
    script.async = true;
    script.onload = () => window.ethers ? resolve(window.ethers) : reject(new Error('ethers.js failed to initialize'));
    script.onerror = () => reject(new Error('Unable to load ethers.js'));
    document.head.appendChild(script);
  });
  return ethersPromise;
}

export function hasInjectedWallet() {
  return typeof window.ethereum !== 'undefined';
}

/**
 * Connect the injected EVM wallet, request Polygon, and return the account.
 * Throws a user-facing Error when no wallet is present or the request is denied.
 */
export async function connectWallet() {
  if (!hasInjectedWallet()) {
    throw new Error('No EVM wallet detected. Install MetaMask or keep the demo wallet.');
  }
  const ethers = await loadEthers();
  const provider = new ethers.BrowserProvider(window.ethereum, 'any');
  await provider.send('eth_requestAccounts', []);

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: WEB3_CONFIG.chainHex }]
    });
  } catch (err) {
    // 4902 = chain not added to the wallet.
    if (err && (err.code === 4902 || err.code === -32603)) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: WEB3_CONFIG.chainHex,
          chainName: WEB3_CONFIG.chainName,
          nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
          rpcUrls: [WEB3_CONFIG.rpc],
          blockExplorerUrls: [WEB3_CONFIG.explorer]
        }]
      });
    } else {
      throw err;
    }
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  return { address, chainId: Number(network.chainId), provider };
}

/**
 * Read a real $SRN balance once a token address is configured.
 * Returns null in demo mode so the UI can keep showing the local balance.
 */
export async function readSrnBalance(address) {
  if (!WEB3_CONFIG.enabled || !WEB3_CONFIG.srnToken || !address) return null;
  const ethers = await loadEthers();
  const provider = hasInjectedWallet()
    ? new ethers.BrowserProvider(window.ethereum, 'any')
    : new ethers.JsonRpcProvider(WEB3_CONFIG.rpc, WEB3_CONFIG.chainId);
  const token = new ethers.Contract(WEB3_CONFIG.srnToken, ERC20_ABI, provider);
  const [raw, decimals] = await Promise.all([token.balanceOf(address), token.decimals()]);
  return Number(ethers.formatUnits(raw, decimals));
}

export function explorerAddress(address) {
  return `${WEB3_CONFIG.explorer}/address/${address}`;
}
