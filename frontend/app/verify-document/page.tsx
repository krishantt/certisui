"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shield, Hash, CheckCircle, XCircle, Upload } from "lucide-react"
import { useRouter } from "next/navigation"

export default function VerifyDocumentPage() {
  const router = useRouter()
  const [verificationMethod, setVerificationMethod] = useState<"hash" | "file" | null>(null)
  const [documentHash, setDocumentHash] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleVerify = async () => {
    setIsVerifying(true)

    // Simulate verification process
    setTimeout(() => {
      const isValid = Math.random() > 0.3 // 70% chance of valid document

      setVerificationResult({
        isValid,
        documentHash: documentHash || "0xabc123def456789...",
        title: "Contract Agreement",
        uploadDate: "2024-01-15T10:30:00Z",
        owner: "0x1234...5678",
        category: "Legal",
        lastModified: "2024-01-15T10:30:00Z",
        verificationCount: 5,
        blockNumber: 18234567,
      })

      setIsVerifying(false)
    }, 3000)
  }

  const resetVerification = () => {
    setVerificationMethod(null)
    setDocumentHash("")
    setUploadedFile(null)
    setVerificationResult(null)
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
                    className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                      verificationResult.isValid ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {verificationResult.isValid ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <h3
                    className={`text-lg font-semibold ${
                      verificationResult.isValid ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {verificationResult.isValid ? "Document Verified ✓" : "Verification Failed ✗"}
                  </h3>
                  <p className="text-gray-600">
                    {verificationResult.isValid
                      ? "This document is authentic and has not been tampered with"
                      : "This document could not be verified or has been modified"}
                  </p>
                </div>

                {verificationResult.isValid && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Title:</span>
                        <p className="text-gray-600">{verificationResult.title}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Category:</span>
                        <Badge variant="secondary">{verificationResult.category}</Badge>
                      </div>
                      <div>
                        <span className="font-semibold">Upload Date:</span>
                        <p className="text-gray-600">{new Date(verificationResult.uploadDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Block Number:</span>
                        <p className="text-gray-600">{verificationResult.blockNumber}</p>
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold">Document Hash:</span>
                      <code className="text-xs bg-white p-2 rounded border block mt-1 break-all">
                        {verificationResult.documentHash}
                      </code>
                    </div>

                    <div>
                      <span className="font-semibold">Owner:</span>
                      <p className="text-gray-600 font-mono text-sm">{verificationResult.owner}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={resetVerification} variant="outline" className="flex-1 bg-transparent">
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
