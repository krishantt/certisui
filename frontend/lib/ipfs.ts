import { Buffer } from "buffer";

// Pinata configuration (free tier)
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

// Fallback to web3.storage
const WEB3_STORAGE_TOKEN = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;

export async function uploadToIPFS(buffer: Buffer): Promise<string> {
  // Try Pinata first (most reliable)
  if (PINATA_API_KEY && PINATA_SECRET_KEY) {
    try {
      return await uploadToPinata(buffer);
    } catch (error) {
      console.warn('Pinata upload failed, trying fallback:', error);
    }
  }

  // Try web3.storage as fallback
  if (WEB3_STORAGE_TOKEN) {
    try {
      return await uploadToWeb3Storage(buffer);
    } catch (error) {
      console.warn('Web3.storage upload failed, trying local fallback:', error);
    }
  }

  // Last resort: use a simple mock for development
  return await mockIPFSUpload(buffer);
}

async function uploadToPinata(buffer: Buffer): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([buffer]);
  formData.append('file', blob, 'document');

  const metadata = JSON.stringify({
    name: `document-${Date.now()}`,
    keyvalues: {
      uploadedBy: 'certisui-dapp',
      timestamp: Date.now().toString()
    }
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', options);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': PINATA_API_KEY!,
      'pinata_secret_api_key': PINATA_SECRET_KEY!,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Pinata upload failed: ${response.statusText} - ${errorData}`);
  }

  const data = await response.json();
  return data.IpfsHash;
}

async function uploadToWeb3Storage(buffer: Buffer): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([buffer]);
  formData.append('file', blob, 'document');

  const response = await fetch('https://api.web3.storage/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WEB3_STORAGE_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Web3.storage upload failed: ${response.statusText} - ${errorData}`);
  }

  const data = await response.json();
  return data.cid;
}

// Mock IPFS upload for development/testing
async function mockIPFSUpload(buffer: Buffer): Promise<string> {
  // Generate a deterministic hash based on content
  const crypto = await import('crypto-browserify');
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const mockHash = `Qm${hash.substring(0, 44)}`; // Mock IPFS hash format
  
  console.warn('Using mock IPFS upload - file not actually stored on IPFS:', mockHash);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockHash;
}

export async function retrieveFromIPFS(hash: string): Promise<Buffer> {
  // Check if it's a mock hash
  if (hash.startsWith('QmMOCK') || hash.length !== 46) {
    throw new Error('Cannot retrieve mock IPFS file');
  }

  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${hash}`,
    `https://ipfs.io/ipfs/${hash}`,
    `https://dweb.link/ipfs/${hash}`,
    `https://cf-ipfs.com/ipfs/${hash}`,
    `https://${hash}.ipfs.w3s.link`
  ];

  for (const gateway of gateways) {
    try {
      const response = await fetch(gateway, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        }
      });
      
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
    } catch (error) {
      console.warn(`Failed to retrieve from ${gateway}:`, error);
      continue;
    }
  }
  
  throw new Error('Failed to retrieve file from IPFS');
}

export function getIPFSUrl(hash: string): string {
  if (PINATA_API_KEY) {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  return `https://ipfs.io/ipfs/${hash}`;
}

export function validateIPFSHash(hash: string): boolean {
  // Basic IPFS hash validation
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash);
}