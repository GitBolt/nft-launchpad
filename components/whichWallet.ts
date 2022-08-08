declare global {
  interface Window {
    solana: any,
    solflare: any,
    sollet: any
  }
}

const whichWallet = () => (typeof window !== 'undefined' ? (window.solana || window.solflare) : null);
  
export default whichWallet;