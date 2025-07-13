"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import crypto from "crypto-browserify";
import { Buffer } from "buffer";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, FileText, Hash, Clock } from "lucide-react";
import { publishDocument, createStore, getUserStoreFromEvents } from "@/lib/store";
import { uploadToIPFS } from "@/lib/ipfs";

export default function AddDocumentPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [documentHash, setDocumentHash] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    file: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !currentAccount) return;

    setIsUploading(true);

    try {
      const arrayBuffer = await formData.file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to IPFS using free service
      const ipfsHash = await uploadToIPFS(buffer);

      // Generate SHA256 hash
      const sha256 = crypto.createHash("sha256").update(buffer).digest();
      const sha256Hex = sha256.toString("hex");

      // Get or create user's document store
      let storeId = await getUserStoreFromEvents(currentAccount.address);
      
      if (!storeId) {
        // Create new store if user doesn't have one
        const storeResult = await createStore(signAndExecute);
        // Extract store ID from transaction result
        storeId = storeResult.objectChanges?.find((change: any) => 
          change.type === 'created' && change.objectType.includes('DocumentStore')
        )?.objectId;
      }

      if (!storeId) {
        throw new Error("Failed to create or retrieve document store");
      }

      // Publish document to blockchain
      await publishDocument(
        signAndExecute,
        storeId,
        formData.title,
        formData.category,
        ipfsHash,
        sha256Hex,
        Math.floor(Date.now() / 1000)
      );

      setDocumentHash("0x" + sha256Hex);
      setUploadSuccess(true);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="text-center py-8">
              <p>Please connect your wallet to add documents.</p>
              <Button onClick={() => router.push("/")} className="mt-4">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                Document Uploaded Successfully!
              </CardTitle>
              <CardDescription>
                Your document has been securely stored on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-gray-600" />
                  <span className="font-semibold">Document Hash:</span>
                </div>
                <code className="text-sm bg-white p-2 rounded border block break-all">
                  {documentHash}
                </code>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Title:</span>
                  <p className="text-gray-600">{formData.title}</p>
                </div>
                <div>
                  <span className="font-semibold">Category:</span>
                  <p className="text-gray-600">{formData.category}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => router.push("/")} className="flex-1">
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/share-document")}
                  className="flex-1"
                >
                  Share Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-6 w-6 text-blue-600" />
              Add New Document
            </CardTitle>
            <CardDescription>
              Upload a document to store securely on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  placeholder="Enter document title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Upload File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                  />
                  <Label htmlFor="file" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX, TXT, JPG, PNG up to 10MB
                  </p>
                  {formData.file && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {formData.file.name}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isUploading || !formData.file || !formData.title}
              >
                {isUploading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Uploading to Blockchain...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
