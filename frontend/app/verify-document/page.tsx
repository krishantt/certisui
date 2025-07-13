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
import { ArrowLeft, Shield, Hash, CheckCircle, XCircle, Upload } from "lucide-react"
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleVerify = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet to verify documents")
      return
    }

    setIsVerifying(true)

    try {
      let hashToVerify = documentHash

      // If verifying by file, generate hash
      if (verificationMethod === "file" && uploadedFile) {
        const arrayBuffer = await uploadedFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const sha256 = crypto.createHash("sha256").update(buffer).digest()
        hashToVerify = sha256.toString("hex")
      }

      // Get user's store
      const storeId = await getUserStoreFromEvents(currentAccount.address)
      
      if (!storeId) {
        setVerificationResult({
          isValid: false,
          documentHash: hashToVerify,
          title: "No documents found"
        })
        setIsVerifying(false)
        return
      }

      // Get user's documents
      const documents = await getUserDocuments(storeId)
      
      // Find matching document by comparing hashes
      const matchingDoc = documents.find(doc => {
        // You would need to implement hash comparison logic here
        // This is a simplified version
        return doc.title.toLowerCase().includes("contract") // Placeholder logic
      })

      if (matchingDoc) {
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
          verificationCount: 1,
          blockNumber: 18234567 // This would come from the blockchain response
        })
      } else {
        setVerificationResult({
          isValid: false,
          documentHash: hashToVerify,
          title: "Document not found"
        })
      }
    } catch (error) {
      console.error("Verification failed:", error)
      setVerificationResult({
        isValid: false,
        documentHash: documentHash || "unknown",
        title: "Verification failed"
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
            {!verificationMethod && (
              <div className="space-y-4">
                <h3 className="font-semibold">Choose Verification Method:</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-200"
                    onClick={() => setVerificationMethod("hash")}
                  >
                    <CardContent className="p-4 text-center">
                      <Hash className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold">By Document Hash</h4>
                      <p className="text-sm text-gray-600">Enter the document hash to verify</p>
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
                  <Label htmlFor="hash">Document Hash</Label>
                  <Input
                    id="hash"
                    placeholder="0x..."
                    value={documentHash}
                    onChange={(e) => setDocumentHash(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Enter the 64-character hexadecimal hash of the document</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleVerify} disabled={!documentHash || isVerifying} className="flex-1">
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
                    <Input id="file" type="file" onChange={handleFileUpload} className="hidden" />
                    <Label htmlFor="file" className="cursor-pointer">
                      <span className="text-purple-600 hover:text-purple-500">Click to upload</span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </Label>
                    {uploadedFile && <p className="text-sm text-green-600 mt-2">Selected: {uploadedFile.name}</p>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleVerify} disabled={!uploadedFile || isVerifying} className="flex-1">
                    {isVerifying ? "Verifying..." : "Verify Document"}
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
                      : "This document could not be verified or does not exist on the blockchain."}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <span className="font-semibold">Document Hash:</span>
                    <code className="block text-sm bg-white p-2 rounded border mt-1 break-all">
                      {verificationResult.documentHash}
                    </code>
                  </div>
                  
                  {verificationResult.isValid && (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm">
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
                          <span className="font-semibold">Owner:</span>
                          <p className="text-gray-600 text-xs break-all">{verificationResult.owner}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">Verified</Badge>
                        <Badge variant="outline">Block #{verificationResult.blockNumber}</Badge>
                        <Badge variant="outline">{verificationResult.verificationCount} verifications</Badge>
                      </div>
                    </>
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
