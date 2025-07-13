"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Share, Shield, FileText, Clock, Hash } from "lucide-react";
import { getUserStoreFromEvents, getUserDocuments, DocumentEvent } from "@/lib/store";
import { getIPFSUrl } from "@/lib/ipfs";

export default function HomePage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const [documents, setDocuments] = useState<DocumentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDocuments();
  }, [currentAccount]);

  const loadUserDocuments = async () => {
    if (!currentAccount) {
      setLoading(false);
      return;
    }

    try {
      const storeId = await getUserStoreFromEvents(currentAccount.address);
      if (storeId) {
        const userDocs = await getUserDocuments(storeId);
        setDocuments(userDocs);
        console.log("User documents loaded:", userDocs);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">CertiSui</h1>
          <p className="text-xl text-gray-600">
            Secure Document Management on Sui Blockchain
          </p>
          {currentAccount && (
            
            
            <ConnectButton />
          )}
        </div>

        {!currentAccount ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-4">
                Connect your Sui wallet to start managing your documents securely on the blockchain.
              </p>
              <p className="text-sm text-gray-500">
                Please use the wallet connection button below.
              </p>
              <ConnectButton/>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/add-document')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Add Document</CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">Upload new document</div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/share-document')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Share Document</CardTitle>
                  <Share className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">Share with others</div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/verify-document')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verify Document</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">Verify authenticity</div>
                </CardContent>
              </Card>
            </div>

            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Documents</CardTitle>
                <CardDescription>
                  Documents stored in your blockchain store
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading documents...</div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No documents yet. Start by adding your first document!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <h3 className="font-medium">{doc.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                #{doc.document_index}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(doc.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{doc.document_type}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/share-document?doc=${doc.document_index}`)}
                          >
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">Secure Storage</h3>
                <p className="text-sm text-gray-600">Documents stored securely on Sui blockchain</p>
              </div>
              <div className="text-center p-4">
                <Hash className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">Tamper Proof</h3>
                <p className="text-sm text-gray-600">Cryptographic hashes ensure integrity</p>
              </div>
              <div className="text-center p-4">
                <Share className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold">Easy Sharing</h3>
                <p className="text-sm text-gray-600">Share documents with granular permissions</p>
              </div>
              <div className="text-center p-4">
                <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold">IPFS Storage</h3>
                <p className="text-sm text-gray-600">Decentralized file storage via IPFS</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
