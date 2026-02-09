import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Upload, FileSearch, CheckCircle, XCircle, AlertCircle, 
  FileText, CreditCard, Car, Shield, Leaf, Loader2
} from "lucide-react";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";

const DOCUMENT_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card', icon: CreditCard },
  { value: 'dl', label: 'Driving License', icon: FileText },
  { value: 'rc', label: 'Registration Certificate (RC)', icon: Car },
  { value: 'insurance', label: 'Vehicle Insurance', icon: Shield },
  { value: 'puc', label: 'PUC Certificate', icon: Leaf }
];

const DocumentVerification = () => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleVerify = async () => {
    if (!selectedFile || !selectedType) {
      toast.error("Please select a document type and upload a file");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('image_file', selectedFile);
      formData.append('document_type', selectedType);

      const response = await axios.post(`${API}/ocr/verify`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(response.data);
      toast.success("Document processed successfully");
    } catch (error) {
      console.error("Error verifying document:", error);
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;
      toast.error(
        `Failed to process document${status ? ` (HTTP ${status})` : ""}${detail ? `: ${detail}` : ""}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedType('');
    setResult(null);
  };

  return (
    <div className="space-y-6" data-testid="document-verification">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Document Verification (OCR)
        </h1>
        <p className="text-white/60">
          AI-powered document extraction and verification using Gemini Vision
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <FileSearch className="w-5 h-5 mr-2 text-violet-500" />
              Upload Document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Type Selection */}
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger data-testid="document-type-select">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <type.icon className="w-4 h-4 mr-2" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                previewUrl ? 'border-violet-300 bg-violet-50' : 'border-gray-200 hover:border-violet-300'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              data-testid="upload-area"
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-48 mx-auto rounded-lg shadow"
                  />
                  <p className="text-sm text-gray-500">{selectedFile?.name}</p>
                  <Button variant="outline" onClick={resetForm}>
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-violet-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-gray-600">Drag and drop your document here, or</p>
                    <Button 
                      variant="link" 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-violet-600"
                    >
                      browse files
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Supports: JPG, PNG, PDF (max 10MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="file-input"
              />
            </div>

            {/* Verify Button */}
            <Button
              data-testid="verify-btn"
              onClick={handleVerify}
              disabled={!selectedFile || !selectedType || isProcessing}
              className="w-full bg-gradient-to-r from-violet-500 to-pink-500"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileSearch className="w-4 h-4 mr-2" />
                  Verify Document
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              {result ? (
                result.is_valid ? (
                  <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2 text-red-500" />
                )
              ) : (
                <AlertCircle className="w-5 h-5 mr-2 text-gray-400" />
              )}
              Verification Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6" data-testid="ocr-results">
                {/* Verification Status */}
                <div className={`p-4 rounded-lg ${
                  result.is_valid ? 'bg-emerald-50' : 'bg-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {result.is_valid ? (
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                      <span className={`font-semibold ${
                        result.is_valid ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {result.is_valid ? 'Document Verified' : 'Verification Failed'}
                      </span>
                    </div>
                    <Badge className={
                      result.is_valid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }>
                      {(result.confidence * 100).toFixed(0)}% Confidence
                    </Badge>
                  </div>
                </div>

                {/* Extracted Data */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Extracted Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {Object.entries(result.extracted_data).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-start">
                        <span className="text-sm text-gray-500 capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validation Errors */}
                {result.validation_errors?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600">Validation Issues</h4>
                    <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                      {result.validation_errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  <Button variant="outline" className="flex-1">
                    Download Report
                  </Button>
                  <Button 
                    onClick={resetForm}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500"
                  >
                    Verify Another
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FileSearch className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Upload a document and click verify to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document Types Info */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900">Supported Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {DOCUMENT_TYPES.map((type) => (
              <div 
                key={type.value}
                className="p-4 bg-gray-50 rounded-lg text-center hover:bg-violet-50 transition-colors cursor-pointer"
                onClick={() => setSelectedType(type.value)}
              >
                <type.icon className="w-8 h-8 mx-auto mb-2 text-violet-500" />
                <p className="text-sm font-medium text-gray-700">{type.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentVerification;
