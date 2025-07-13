import { TransactionBlock } from "@mysten/sui.js/transactions";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";

export const client = new SuiClient({ url: getFullnodeUrl("devnet") }); // or testnet/mainnet

export async function publishToSui(ipfsBytes: number[], shaBytes: number[]) {
  const txb = new TransactionBlock();

  const documentStoreId = "0xYOUR_STORE_OBJECT_ID";

  txb.moveCall({
    target: "contract::document_store::publish_document",
    arguments: [
      txb.object(documentStoreId),
      txb.pure(ipfsBytes),
      txb.pure(shaBytes),
      txb.pure(Math.floor(Date.now() / 1000)),
    ],
  });

  if (!window.wallet) {
    throw new Error("Wallet not connected");
  }

  await window.wallet.signAndExecuteTransactionBlock({ transactionBlock: txb });
}
