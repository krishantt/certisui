module contract::document_store;

use sui::event;
use std::string;



/// Represents a digital document's metadata
public struct Document has key, store {
    id: UID,
    owner: address,
    title: string::String,
    document_type: string::String,
    ipfs_hash: vector<u8>,
    sha256_hash: vector<u8>,
    timestamp: u64,
    shared_with: vector<address>,
}

/// Container to hold all documents of a user
public struct DocumentStore has key {
    id: UID,
    owner: address,
    documents: vector<Document>,
}

/// Event when a document is published
public struct DocumentPublishedEvent has copy, drop {
    owner: address,
    ipfs_hash: vector<u8>,
    sha256_hash: vector<u8>,
    timestamp: u64,
}

/// Initializes a new store for a user
public fun create_store(ctx: &mut TxContext): DocumentStore {
    let id = object::new(ctx);
    DocumentStore {
        id,
        owner: ctx.sender(),
        documents: vector::empty<Document>(),
    }
}

/// Publish a new document to your store
public fun publish_document(
    store: &mut DocumentStore,
    title: string::String,
    document_type: string::String,
    ipfs_hash: vector<u8>,
    sha256_hash: vector<u8>,
    timestamp: u64,
    ctx: &mut TxContext,
) {
    let doc_id = object::new(ctx);
    let owner = ctx.sender();
    let doc = Document {
        id: doc_id,
        owner,
        title,
        document_type,
        ipfs_hash,
        sha256_hash,
        timestamp,
        shared_with: vector::empty<address>(),
    };
    vector::push_back(&mut store.documents, doc);
    event::emit(DocumentPublishedEvent {
        owner,
        ipfs_hash,
        sha256_hash,
        timestamp,
    });
}

/// Share access with another address (adds to shared list)
public fun share_document(store: &mut DocumentStore, index: u64, recipient: address, ctx: &mut TxContext) {
    let doc_ref = vector::borrow_mut(&mut store.documents, index);
    assert!(ctx.sender() == doc_ref.owner, 0);
    vector::push_back(&mut doc_ref.shared_with, recipient);
}

/// View document info (returns reference)
public fun get_document(store: &DocumentStore, index: u64): &Document {
    vector::borrow(&store.documents, index)
}

/// Transfer ownership of a document store
public fun transfer_store(store: DocumentStore, recipient: address) {
    transfer::transfer(store, recipient);
}
