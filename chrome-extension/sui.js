import { Connection, JsonRpcProvider, RawSigner, Ed25519Keypair } from '@mysten/sui.js';

const provider = new JsonRpcProvider(new Connection({ fullnode: 'https://fullnode.mainnet.sui.io' }));
const keypair = Ed25519Keypair.fromSecretKey(Uint8Array.from([...your_private_key_bytes]));
const signer = new RawSigner(keypair, provider);

export async function sendToSui(title, cid) {
  const tx = {
    packageObjectId: 'your_package_id',
    module: 'document_store',
    function: 'upload_document',
    arguments: [Array.from(new TextEncoder().encode(title)), Array.from(new TextEncoder().encode(cid))],
    gasBudget: 10000
  };

  const result = await signer.executeMoveCall(tx);
  return result.digest;
}
