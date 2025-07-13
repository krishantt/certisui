"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet, FileText, Share, Shield, CheckCircle, Plus } from "lucide-react";
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { createStore, getUserStoreFromEvents, getUserDocuments, DocumentEvent } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [userStore, setUserStore] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Load user's store and documents
  useEffect(() => {
    if (currentAccount?.address) {
      loadUserData();
    }
  }, [currentAccount?.address]);

  const loadUserData = async () => {
    if (!currentAccount?.address) return;

    setLoading(true);
    try {
      const storeId = await getUserStoreFromEvents(currentAccount.address);
      setUserStore(storeId);
      
      if (storeId) {
        const userDocs = await getUserDocuments(storeId);
        setDocuments(userDocs);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async () => {
    if (!currentAccount?.address) return;

    setLoading(true);
    try {
      await createStore(signAndExecute);
      // Wait a moment for the transaction to be processed
      setTimeout(loadUserData, 2000);
    } catch (error) {
      console.error('Error creating store:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to CertiSui</CardTitle>
            <CardDescription>
              Connect your wallet to start managing documents on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">CertiSui</h1>
            <p className="text-xl text-gray-600 mt-2">
              Decentralized Document Management
            </p>
          </div>
          <ConnectButton />
        </div>

        {!userStore ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <Wallet className="h-16 w-16 mx-auto text-blue-600 mb-4" />
              <CardTitle>Create Your Document Store</CardTitle>
              <CardDescription>
                Get started by creating your personal document store on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={handleCreateStore} 
                disabled={loading}
                size="lg"
                className="w-full max-w-sm"
              >
                {loading ? "Creating..." : "Create Store"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documents.length}</div>
                </CardContent>
              </Card>

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
                        <div>
                          <h3 className="font-medium">{doc.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Type: {doc.document_type} • Added: {new Date(doc.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
