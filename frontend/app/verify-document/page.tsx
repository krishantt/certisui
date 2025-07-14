"use client"

import type React from "react"
import { useState } from "react"
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import crypto from "crypto-browserify"
import { Buffer } from "buffer"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Shield, Hash, CheckCircle, XCircle, Upload, AlertCircle, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { verifyDocument, getUserStoreFromEvents, getUserDocuments } from "@/lib/store"

interface VerificationResult {
  isValid: boolean;
  documentHash: string;
  title?: string;
  uploadDate?: string;
  owner?: string;
  category?: string;
  lastModified?: string;
  verificationCount?: number;
  blockNumber?: number;
  ipfsHash?: string;
  documentIndex?: number;
  matchType: 'exact' | 'none' | 'error';
}

export default function VerifyDocumentPage() {
  const router = useRouter()
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()

  const [verificationMethod, setVerificationMethod] = useState<"hash" | "file" | null>(null)
  const [documentHash, setDocumentHash] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (50MB limit for verification)
      if (file.size > 50 * 1024 * 1024) {
        setError("File size must be less than 50MB for verification")
        return
      }
      setUploadedFile(file)
      setError("")
    }
  }

  const normalizeHash = (hash: string): string => {
    // Remove 0x prefix if present and convert to lowercase
    return hash.replace(/^0x/, '').toLowerCase()
  }

  const compareHashes = (hash1: string, hash2: string): boolean => {
    const normalized1 = normalizeHash(hash1)
    const normalized2 = normalizeHash(hash2)
    return normalized1 === normalized2
  }

  const handleVerify = async () => {
    if (!currentAccount) {
      setError("Please connect your wallet to verify documents")
      return
    }

    setIsVerifying(true)
    setError("")

    try {
      let hashToVerify = documentHash

      // If verifying by file, generate hash
      if (verificationMethod === "file" && uploadedFile) {
        try {
          const arrayBuffer = await uploadedFile.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const sha256 = crypto.createHash("sha256").update(buffer).digest()
          hashToVerify = sha256.toString("hex")
        } catch (hashError) {
          console.error("Hash generation failed:", hashError)
          setError("Failed to generate document hash. Please try again.")
          return
        }
      }

      // Validate hash format
      if (!hashToVerify || hashToVerify.length < 40) {
        setError("Invalid hash format. Please provide a valid SHA-256 hash.")
        return
      }

      // Get user's store
      const storeId = await getUserStoreFromEvents(currentAccount.address)

      if (!storeId) {
        setVerificationResult({
          isValid: false,
          documentHash: hashToVerify,
          title: "No document store found",
          matchType: 'none'
        })
        return
      }

      // Get user's documents
      const documents = await getUserDocuments(storeId)

      if (documents.length === 0) {
        setVerificationResult({
          isValid: false,
          documentHash: hashToVerify,
          title: "No documents found in store",
          matchType: 'none'
        })
        return
      }

      // Find matching document by comparing SHA-256 hashes
      const matchingDoc = documents.find(doc => {
        // Convert document hash from bytes to hex string if needed
        let docHash = ''
        
        if (Array.isArray(doc.sha256_hash)) {
          // If sha256_hash is a byte array, convert to hex
          docHash = doc.sha256_hash.map((byte: number) => 
            byte.toString(16).padStart(2, '0')
          ).join('')
        } else if (typeof doc.sha256_hash === 'string') {
          // If it's already a string, use it directly
          docHash = doc.sha256_hash
        } else {
          console.warn('Unexpected hash format:', doc.sha256_hash)
          return false
        }

        return compareHashes(hashToVerify, docHash)
      })

      if (matchingDoc) {
        try {
          // Verify document on blockchain
          await verifyDocument(
            signAndExecute,
            storeId,
            matchingDoc.document_index,
            hashToVerify
          )

          setVerificationResult({
            isValid: true,
            documentHash: hashToVerify,
            title: matchingDoc.title,
            uploadDate: new Date(matchingDoc.timestamp * 1000).toISOString(),
            owner: matchingDoc.owner,
            category: matchingDoc.document_type,
            lastModified: new Date(matchingDoc.timestamp * 1000).toISOString(),
            verificationCount: 1, // This would come from blockchain
            blockNumber: Math.floor(Math.random() * 1000000), // Mock block number
            ipfsHash: matchingDoc.ipfs_hash,
            documentIndex: matchingDoc.document_index,
            matchType: 'exact'
          })
        } catch (verifyError) {
          console.error("Blockchain verification failed:", verifyError)
          setError("Blockchain verification failed. Document found but verification transaction failed.")
          return
        }
      } else {
        // Check if we're looking at a different user's documents
        setVerificationResult({
          isValid: false,
          documentHash: hashToVerify,
          title: "Document not found in your store",
          matchType: 'none'
        })
      }
    } catch (error) {
      console.error("Verification failed:", error)
      setError("Verification process failed. Please check your connection and try again.")
      setVerificationResult({
        isValid: false,
        documentHash: documentHash || hashToVerify || "unknown",
        title: "Verification error occurred",
        matchType: 'error'
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const resetVerification = () => {
    setVerificationMethod(null)
    setDocumentHash("")
    setUploadedFile(null)
    setVerificationResult(null)
    setError("")
  }

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="text-center py-8">
              <p>Please connect your wallet to verify documents.</p>
              <Button onClick={() => router.push("/")} className="mt-4">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-purple-600" />
              Verify Document
            </CardTitle>
            <CardDescription>
              Verify the authenticity and integrity of documents stored on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!verificationMethod && (
              <div className="space-y-4">
                <h3 className="font-semibold">Choose Verification Method:</h3>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Document verification compares SHA-256 hashes to ensure integrity. 
                    Only documents in your own store can be verified.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-200"
                    onClick={() => setVerificationMethod("hash")}
                  >
                    <CardContent className="p-4 text-center">
                      <Hash className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold">By Document Hash</h4>
                      <p className="text-sm text-gray-600">Enter the SHA-256 hash to verify</p>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-200"
                    onClick={() => setVerificationMethod("file")}
                  >
                    <CardContent className="p-4 text-center">
                      <Upload className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold">By File Upload</h4>
                      <p className="text-sm text-gray-600">Upload file to generate and verify hash</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {verificationMethod === "hash" && !verificationResult && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hash">Document Hash (SHA-256)</Label>
                  <Input
                    id="hash"
                    placeholder="Enter 64-character hash (with or without 0x prefix)"
                    value={documentHash}
                    onChange={(e) => setDocumentHash(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Enter the 64-character hexadecimal SHA-256 hash of the document
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleVerify} 
                    disabled={!documentHash || isVerifying || documentHash.replace(/^0x/, '').length !== 64} 
                    className="flex-1"
                  >
                    {isVerifying ? "Verifying..." : "Verify Document"}
                  </Button>
                  <Button variant="outline" onClick={resetVerification}>
                    Back
                  </Button>
                </div>
              </div>
            )}

            {verificationMethod === "file" && !verificationResult && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Upload Document</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <Input 
                      id="file" 
                      type="file" 
                      onChange={handleFileUpload} 
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.png,.jpeg"
                    />
                    <Label htmlFor="file" className="cursor-pointer">
                      <span className="text-purple-600 hover:text-purple-500">Click to upload</span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Any file type up to 50MB
                    </p>
                    {uploadedFile && (
                      <div className="mt-2 text-sm">
                        <p className="text-green-600">Selected: {uploadedFile.name}</p>
                        <p className="text-gray-500">Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleVerify} disabled={!uploadedFile || isVerifying} className="flex-1">
                    {isVerifying ? "Calculating Hash & Verifying..." : "Calculate Hash & Verify"}
                  </Button>
                  <Button variant="outline" onClick={resetVerification}>
                    Back
                  </Button>
                </div>
              </div>
            )}

            {verificationResult && (
              <div className="space-y-4">
                <div className="text-center">
                  <div
                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                      verificationResult.isValid ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {verificationResult.isValid ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  <h3 className={`text-xl font-semibold ${verificationResult.isValid ? "text-green-600" : "text-red-600"}`}>
                    {verificationResult.isValid ? "Document Verified!" : "Verification Failed"}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {verificationResult.isValid
                      ? "This document is authentic and has not been tampered with."
                      : "This document could not be verified or does not exist in your blockchain store."}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <span className="font-semibold">Calculated Hash:</span>
                    <code className="block text-sm bg-white p-2 rounded border mt-1 break-all font-mono">
                      {verificationResult.documentHash}
                    </code>
                  </div>

                  {verificationResult.isValid && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Title:</span>
                          <p className="text-gray-600">{verificationResult.title}</p>
                        </div>
                        <div>
                          <span className="font-semibold">Category:</span>
                          <p className="text-gray-600">{verificationResult.category}</p>
                        </div>
                        <div>
                          <span className="font-semibold">Upload Date:</span>
                          <p className="text-gray-600">
                            {verificationResult.uploadDate ? new Date(verificationResult.uploadDate).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold">Document ID:</span>
                          <p className="text-gray-600">#{verificationResult.documentIndex}</p>
                        </div>
                      </div>

                      {verificationResult.ipfsHash && (
                        <div>
                          <span className="font-semibold">IPFS Hash:</span>
                          <code className="block text-xs bg-white p-2 rounded border mt-1 break-all">
                            {verificationResult.ipfsHash}
                          </code>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">Verified</Badge>
                        <Badge variant="outline">Exact Match</Badge>
                        {verificationResult.blockNumber && (
                          <Badge variant="outline">Block #{verificationResult.blockNumber}</Badge>
                        )}
                      </div>
                    </>
                  )}

                  {!verificationResult.isValid && verificationResult.matchType === 'none' && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        This document was not found in your blockchain store. It may belong to another user 
                        or may not be stored on the blockchain.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={resetVerification} variant="outline" className="flex-1">
                    Verify Another
                  </Button>
                  <Button onClick={() => router.push("/")} className="flex-1">
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
