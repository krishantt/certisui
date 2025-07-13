import { Transaction } from '@mysten/sui/transactions';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

// Replace with your actual deployed contract address
const MODULE_ADDRESS = process.env.NEXT_PUBLIC_PACKAGE_ID; // Add your contract address here
const MODULE_NAME = "document_store";

const rpcUrl = getFullnodeUrl('testnet'); // or 'devnet' or 'mainnet'

// Initialize Sui client
const client = new SuiClient({
    url: rpcUrl,
});

export interface DocumentEvent {
    store_id: string;
    document_index: number;
    owner: string;
    title: string;
    document_type: string;
    timestamp: number;
    ipfs_hash: string ; // Hex string representation of the IPFS hash
    sha256_hash: Uint8Array; // Hex string representation of the SHA256 hash
}

export interface ShareEvent {
    store_id: string;
    document_index: number;
    owner: string;
    recipient: string;
    title: string;
    timestamp: number;
}

export interface VerificationEvent {
    store_id: string;
    document_index: number;
    verifier: string;
    owner: string;
    title: string;
    sha256_hash: number[];
    is_valid: boolean;
    timestamp: number;
}

// Create a new document store
export async function createStore(
    signAndExecute: (input: any) => Promise<any>
) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${MODULE_ADDRESS}::${MODULE_NAME}::create_store`,
        arguments: [],
    });
    return await signAndExecute({ transaction: tx });
}

// Publish a document
export async function publishDocument(
    signAndExecute: (input: any) => Promise<any>,
    storeId: string,
    title: string,
    documentType: string,
    ipfsHash: string,
    sha256Hash: string,
    timestamp: number
) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${MODULE_ADDRESS}::${MODULE_NAME}::publish_document`,
        arguments: [
            tx.object(storeId),
            tx.pure.string(title),
            tx.pure.string(documentType),
            tx.pure.vector("u8", Array.from(Buffer.from(ipfsHash, 'hex'))),
            tx.pure.vector("u8", Array.from(Buffer.from(sha256Hash, 'hex'))),
            tx.pure.u64(timestamp),
        ],
    });
    return await signAndExecute({ transaction: tx });
}

// Share a document
export async function shareDocument(
    signAndExecute: (input: any) => Promise<any>,
    storeId: string,
    documentIndex: number,
    recipient: string
) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${MODULE_ADDRESS}::${MODULE_NAME}::share_document`,
        arguments: [
            tx.object(storeId),
            tx.pure.u64(documentIndex),
            tx.pure.address(recipient),
        ],
    });
    return await signAndExecute({ transaction: tx });
}

// Verify a document
export async function verifyDocument(
    signAndExecute: (input: any) => Promise<any>,
    storeId: string,
    documentIndex: number,
    providedHash: string
) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${MODULE_ADDRESS}::${MODULE_NAME}::verify_document`,
        arguments: [
            tx.object(storeId),
            tx.pure.u64(documentIndex),
            tx.pure.vector("u8", Array.from(Buffer.from(providedHash, 'hex'))),
        ],
    });
    return await signAndExecute({ transaction: tx });
}

// Get user's store from events
export async function getUserStoreFromEvents(userAddress: string): Promise<string | null> {
    try {
        const events = await client.queryEvents({
            query: {
                MoveEventType: `${MODULE_ADDRESS}::${MODULE_NAME}::StoreCreated`
            },
            order: 'descending'
        });

        for (const event of events.data) {
            const eventData = event.parsedJson as any;
            if (eventData.owner === userAddress) {
                return eventData.store_id;
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching store from events:', error);
        return null;
    }
}

// Get user's documents from events
export async function getUserDocuments(storeId: string): Promise<DocumentEvent[]> {
    try {
        const events = await client.queryEvents({
            query: {
                MoveEventType: `${MODULE_ADDRESS}::${MODULE_NAME}::DocumentPublished`
            },
            order: 'descending'
        });

        return events.data
            .map(event => event.parsedJson as DocumentEvent)
            .filter(doc => doc.store_id === storeId);
    } catch (error) {
        console.error('Error fetching documents from events:', error);
        return [];
    }
}

// Get document shares
export async function getDocumentShares(storeId: string): Promise<ShareEvent[]> {
    try {
        const events = await client.queryEvents({
            query: {
                MoveEventType: `${MODULE_ADDRESS}::${MODULE_NAME}::DocumentShared`
            },
            order: 'descending'
        });

        return events.data
            .map(event => event.parsedJson as ShareEvent)
            .filter(share => share.store_id === storeId);
    } catch (error) {
        console.error('Error fetching document shares:', error);
        return [];
    }
}

// Get document verifications
export async function getDocumentVerifications(storeId: string): Promise<VerificationEvent[]> {
    try {
        const events = await client.queryEvents({
            query: {
                MoveEventType: `${MODULE_ADDRESS}::${MODULE_NAME}::DocumentVerified`
            },
            order: 'descending'
        });

        return events.data
            .map(event => event.parsedJson as VerificationEvent)
            .filter(verification => verification.store_id === storeId);
    } catch (error) {
        console.error('Error fetching document verifications:', error);
        return [];
    }
}
