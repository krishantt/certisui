# CertiSui - Decentralized Document Management

CertiSui is a secure, blockchain-based document management system built on the Sui blockchain. It enables users to store, share, and verify documents with cryptographic integrity guarantees and decentralized storage.

## 🌟 Features

- **Secure Storage**: Documents stored securely on Sui blockchain with cryptographic hashes
- **Tamper Proof**: SHA-256 hashing ensures document integrity and tamper detection
- **Easy Sharing**: Share documents with granular permissions and access control
- **IPFS Integration**: Decentralized file storage via InterPlanetary File System
- **Document Verification**: Verify document authenticity using blockchain records
- **Wallet Integration**: Seamless integration with Sui wallets

## 🏗️ Project Structure

```
document-dapp/
├── contract/                 # Sui Move smart contracts
│   ├── sources/
│   │   └── contract.move    # Main document store contract
│   ├── tests/
│   └── Move.toml
├── frontend/                # Next.js React frontend
│   ├── app/                 # App router pages
│   │   ├── add-document/    # Document upload page
│   │   ├── share-document/  # Document sharing page
│   │   ├── verify-document/ # Document verification page
│   │   └── page.tsx         # Home dashboard
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility libraries
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- pnpm package manager
- Sui CLI tools
- A Sui wallet (Sui Wallet, Suiet, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd document-dapp
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Build and deploy the smart contract**
   ```bash
   cd contract
   sui move build
   sui client publish --gas-budget 20000000
   ```

5. **Start the development server**
   ```bash
   cd frontend
   pnpm dev
   ```

Visit `http://localhost:3000` to access the application.

## 📖 Usage

### Adding Documents

1. Connect your Sui wallet
2. Click "Add Document" on the dashboard
3. Fill in document details (title, category)
4. Upload your file
5. Confirm the blockchain transaction

### Sharing Documents

1. Navigate to "Share Document"
2. Select the document to share
3. Enter recipient's Sui wallet address
4. Choose access level permissions
5. Generate and share the access link

### Verifying Documents

1. Go to "Verify Document"
2. Upload the document file
3. The system will calculate the SHA-256 hash
4. Compare against blockchain records for verification

## 🔧 Smart Contract

The Move smart contract (`contract/sources/contract.move`) provides:

- **DocumentStore**: Container for user documents
- **Document**: Individual document metadata with IPFS and hash references
- **Events**: Blockchain events for document publishing, sharing, and verification
- **Access Control**: Owner-based permissions and sharing capabilities

### Key Functions

- `create_store()`: Initialize a document store for a user
- `publish_document()`: Add a new document to the store
- `share_document()`: Grant access to another user
- `verify_document()`: Verify document integrity
- `get_document()`: Retrieve document metadata

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **@mysten/dapp-kit**: Sui wallet integration

### Blockchain
- **Sui**: Layer 1 blockchain platform
- **Move**: Smart contract programming language
- **IPFS**: Decentralized file storage

### Development Tools
- **pnpm**: Fast, disk space efficient package manager
- **ESLint**: Code linting
- **PostCSS**: CSS processing

## 🔐 Security Features

- **Cryptographic Hashing**: SHA-256 hashes ensure document integrity
- **Blockchain Immutability**: Documents cannot be altered once published
- **Access Control**: Owner-based permissions with sharing capabilities
- **Wallet Authentication**: Secure transaction signing required

## 📱 API Integration

The frontend integrates with:

- **Sui RPC**: For blockchain interactions
- **IPFS Gateway**: For file storage and retrieval
- **Wallet Providers**: For transaction signing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Sui Foundation for the blockchain platform
- IPFS for decentralized storage
- The open-source community for various tools and libraries

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ on Sui Blockchain**