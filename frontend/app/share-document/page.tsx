"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Share, FileText, Users, Copy, Check } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ShareDocumentPage() {
  const router = useRouter()
  const [selectedDocument, setSelectedDocument] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [accessLevel, setAccessLevel] = useState("")
  const [shareLink, setShareLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  // Mock documents
  const documents = [
    { id: "1", title: "Contract Agreement", hash: "0xabc123...", category: "Legal" },
    { id: "2", title: "Financial Report Q4", hash: "0xdef456...", category: "Financial" },
    { id: "3", title: "Medical Records", hash: "0xghi789...", category: "Medical" },
  ]

  const handleShare = async () => {
    if (!selectedDocument || !recipientAddress || !accessLevel) return

    setIsSharing(true)

    // Simulate sharing process
    setTimeout(() => {
      const mockShareLink = `https://CertiSui.app/shared/${Math.random().toString(36).substr(2, 9)}`
      setShareLink(mockShareLink)
      setIsSharing(false)
    }, 2000)
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
              <Share className="h-6 w-6 text-green-600" />
              Share Document
            </CardTitle>
            <CardDescription>Share your documents with others while maintaining control over access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!shareLink ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="document">Select Document</Label>
                  <Select onValueChange={setSelectedDocument}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a document to share" />
                    </SelectTrigger>
                    <SelectContent>
                      {documents.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{doc.title}</span>
                            <Badge variant="secondary" className="ml-auto">
                              {doc.category}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Wallet Address</Label>
                  <Input
                    id="recipient"
                    placeholder="0x..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="access">Access Level</Label>
                  <Select onValueChange={setAccessLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="download">View & Download</SelectItem>
                      <SelectItem value="edit">View, Download & Edit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Access Control Features:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Time-limited access (expires in 30 days)</li>
                    <li>• Revocable permissions</li>
                    <li>• Audit trail of all access</li>
                    <li>• Encrypted document transmission</li>
                  </ul>
                </div>

                <Button
                  onClick={handleShare}
                  className="w-full"
                  disabled={!selectedDocument || !recipientAddress || !accessLevel || isSharing}
                >
                  {isSharing ? (
                    <>
                      <Users className="h-4 w-4 mr-2 animate-pulse" />
                      Creating Share Link...
                    </>
                  ) : (
                    <>
                      <Share className="h-4 w-4 mr-2" />
                      Share Document
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Share className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-600">Document Shared Successfully!</h3>
                  <p className="text-gray-600">Your document has been shared securely</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-sm font-semibold">Share Link:</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input value={shareLink} readOnly className="flex-1" />
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Document:</span>
                    <p className="text-gray-600">{documents.find((d) => d.id === selectedDocument)?.title}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Access Level:</span>
                    <p className="text-gray-600 capitalize">{accessLevel}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShareLink("")
                      setSelectedDocument("")
                      setRecipientAddress("")
                      setAccessLevel("")
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Share Another
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
