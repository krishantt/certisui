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

public struct StoreCreated has copy, drop {
    store_id: ID,
    owner: address,
}

/// Event emitted when a document is published
public struct DocumentPublished has copy, drop {
    store_id: ID,
    document_index: u64,
    owner: address,
    title: string::String,
    document_type: string::String,
    timestamp: u64,
}

public struct DocumentShared has copy, drop {
    store_id: ID,
    document_index: u64,
    owner: address,
    recipient: address,
    title: string::String,
    timestamp: u64,
}

/// Event emitted when a document is verified
public struct DocumentVerified has copy, drop {
    store_id: ID,
    document_index: u64,
    verifier: address,
    owner: address,
    title: string::String,
    sha256_hash: vector<u8>,
    is_valid: bool,
    timestamp: u64,
}

/// Initializes a new store for a user
public fun create_store(ctx: &mut TxContext) {
    let id = object::new(ctx);
    let store_id = object::uid_to_inner(&id);
    let owner = ctx.sender();
    let store =  DocumentStore {
        id,
        owner,
        documents: vector::empty<Document>(),
    };
    event::emit(StoreCreated {
        store_id,
        owner,
    });
    transfer::transfer(store, ctx.sender());
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
    let document_index = vector::length(&store.documents);
    vector::push_back(&mut store.documents, doc);

    event::emit(DocumentPublished {
        store_id: object::uid_to_inner(&store.id),
        document_index,
        owner,
        title,
        document_type,
        timestamp,
    });
}

/// Share access with another address (adds to shared list)
public fun share_document(store: &mut DocumentStore, index: u64, recipient: address, ctx: &mut TxContext) {
    let doc_ref = vector::borrow_mut(&mut store.documents, index);
    assert!(ctx.sender() == doc_ref.owner, 0);
    vector::push_back(&mut doc_ref.shared_with, recipient);

    event::emit(DocumentShared {
        store_id: object::uid_to_inner(&store.id),
        document_index: index,
        owner: doc_ref.owner,
        recipient,
        title: doc_ref.title,
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
}

/// View document info (returns reference)
public fun get_document(store: &DocumentStore, index: u64): &Document {
    vector::borrow(&store.documents, index)
}

public fun verify_document(
    store: &DocumentStore, 
    index: u64, 
    provided_hash: vector<u8>,
    ctx: &mut TxContext
): bool {
    let doc_ref = vector::borrow(&store.documents, index);
    let is_valid = doc_ref.sha256_hash == provided_hash;
    
    // Emit verification event
    event::emit(DocumentVerified {
        store_id: object::uid_to_inner(&store.id),
        document_index: index,
        verifier: ctx.sender(),
        owner: doc_ref.owner,
        title: doc_ref.title,
        sha256_hash: provided_hash,
        is_valid,
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
    
    is_valid
}

/// Check if an address has access to a document (owner or shared)
public fun has_access(store: &DocumentStore, index: u64, user: address): bool {
    let doc_ref = vector::borrow(&store.documents, index);
    if (doc_ref.owner == user) {
        return true
    };
    
    let shared_list = &doc_ref.shared_with;
    let len = vector::length(shared_list);
    let mut i = 0;
    while (i < len) {
        if (*vector::borrow(shared_list, i) == user) {
            return true
        };
        i = i + 1;
    };
    false
}
