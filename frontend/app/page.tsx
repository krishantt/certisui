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
import { Wallet, FileText, Share, Shield, CheckCircle } from "lucide-react";

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    // Check if wallet is already connected
    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      setIsConnected(true);
      setWalletAddress(savedAddress);
    }
  }, []);

  const connectWallet = async () => {
    try {
      // Simulate wallet connection
      const mockAddress = "0x" + Math.random().toString(16).substr(2, 40);
      setWalletAddress(mockAddress);
      setIsConnected(true);
      localStorage.setItem("walletAddress", mockAddress);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress("");
    localStorage.removeItem("walletAddress");
  };

  if (isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DocChain</h1>
              <p className="text-gray-600">Decentralized Document Management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Connected: {walletAddress.slice(0, 6)}...
                {walletAddress.slice(-4)}
              </div>
              <Button variant="outline" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  My Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">12</div>
                <p className="text-sm text-gray-600">Total documents stored</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Share className="h-5 w-5 text-green-600" />
                  Shared
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">8</div>
                <p className="text-sm text-gray-600">Documents shared</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Verified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">15</div>
                <p className="text-sm text-gray-600">Verifications performed</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  Active
                </div>
                <p className="text-sm text-gray-600">Network connection</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => (window.location.href = "/add-document")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Add Document
                </CardTitle>
                <CardDescription>
                  Upload and store documents securely on the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Upload Document</Button>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => (window.location.href = "/share-document")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share className="h-6 w-6 text-green-600" />
                  Share Document
                </CardTitle>
                <CardDescription>
                  Share documents with others while maintaining control
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" variant="outline">
                  Share Document
                </Button>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => (window.location.href = "/verify-document")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-purple-600" />
                  Verify Document
                </CardTitle>
                <CardDescription>
                  Verify the authenticity and integrity of documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" variant="outline">
                  Verify Document
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Wallet className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to DocChain</CardTitle>
          <CardDescription>
            Connect your wallet to access the decentralized document management
            system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Secure document storage on blockchain</li>
              <li>• Share documents with controlled access</li>
              <li>• Verify document authenticity</li>
              <li>• Immutable document history</li>
            </ul>
          </div>
          <Button onClick={connectWallet} className="w-full">
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
