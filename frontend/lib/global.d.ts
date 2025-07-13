interface Wallet {
  signAndExecuteTransactionBlock: (txb: any) => Promise<any>;
}

// Extend the global Window interface
interface Window {
  wallet?: Wallet;
}
