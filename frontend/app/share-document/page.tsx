"use client"
import { useState, useEffect } from "react"
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Share, FileText, Users, Copy, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { shareDocument, getUserStoreFromEvents, getUserDocuments } from "@/lib/store"
import { getIPFSUrl } from "@/lib/ipfs"

export default function ShareDocumentPage() {
  const router = useRouter()
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  
  const [selectedDocument, setSelectedDocument] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [accessLevel, setAccessLevel] = useState("")
  const [shareLink, setShareLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserDocuments()
  }, [currentAccount])

  const loadUserDocuments = async () => {
    if (!currentAccount) {
      setLoading(false)
      return
    }

    try {
      const storeId = await getUserStoreFromEvents(currentAccount.address)
      if (storeId) {
        const userDocs = await getUserDocuments(storeId)
        const formattedDocs = userDocs.map((doc, index) => ({
          id: doc.document_index.toString(),
          title: doc.title,
          hash: `0x{[...new Uint8Array(doc.sha256_hash)].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 20)}...`, // Simplified hash representation
          category: doc.document_type,
          documentIndex: doc.document_index
        }))
        setDocuments(formattedDocs)
      }
    } catch (error) {
      console.error("Error loading documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!selectedDocument || !recipientAddress || !accessLevel || !currentAccount) return
    
    setIsSharing(true)
    
    try {
      const storeId = await getUserStoreFromEvents(currentAccount.address)
      if (!storeId) {
        throw new Error("Document store not found")
      }

      const selectedDoc = documents.find(doc => doc.id === selectedDocument)
      if (!selectedDoc) {
        throw new Error("Selected document not found")
      }

      // Share document on blockchain
      await shareDocument(
        signAndExecute,
        storeId,
        selectedDoc.documentIndex,
        recipientAddress
      )

      // Generate share link (this would typically include access tokens)
      const mockShareLink = `https://certisui.app/shared/${selectedDocument}?access=${accessLevel}&recipient=${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`
      setShareLink(mockShareLink)
    } catch (error) {
      console.error("Sharing failed:", error)
      alert("Failed to share document. Please try again.")
    } finally {
      setIsSharing(false)
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="text-center py-8">
              <p>Please connect your wallet to share documents.</p>
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
                  {loading ? (
                    <div className="text-center py-4">Loading your documents...</div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No documents found. Please add documents first.
                    </div>
                  ) : (
                    <Select onValueChange={setSelectedDocument}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a document to share" />
                      </SelectTrigger>
                      <SelectContent>
                        {documents.map((doc) => (
                          <SelectItem key={doc.id} value={doc.id}>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{doc.title}</div>
                                <div className="text-xs text-gray-500">{doc.category}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    placeholder="0x..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Enter the Sui wallet address of the person you want to share with</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="access">Access Level</Label>
                  <Select onValueChange={setAccessLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select access permissions" />
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
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-600">Document Shared Successfully!</h3>
                  <p className="text-gray-600 mt-2">Your document has been shared securely on the blockchain</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-sm font-semibold">Share Link:</Label>
                  <div className="flex gap-2 mt-2">
                    <Input value={shareLink} readOnly className="flex-1" />
                    <Button onClick={copyToClipboard} variant="outline" size="sm">
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
