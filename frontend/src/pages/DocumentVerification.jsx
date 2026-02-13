import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Upload, FileSearch, CheckCircle, XCircle, AlertCircle, 
  FileText, CreditCard, Car, Shield, Leaf, Loader2, FileCheck
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
  const [activeTab, setActiveTab] = useState("general");
  
  // General Document Verification State
  const [selectedType, setSelectedType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  // Aadhaar Verification State
  const [aadhaarFormData, setAadhaarFormData] = useState({
    name: "",
    dob: "",
    aadhaar_number: "",
    gender: ""
  });
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [aadhaarPreviewUrl, setAadhaarPreviewUrl] = useState(null);
  const [isAadhaarProcessing, setIsAadhaarProcessing] = useState(false);
  const [aadhaarResult, setAadhaarResult] = useState(null);
  const aadhaarFileInputRef = useRef(null);

  // General Document Handlers
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

  // Aadhaar Verification Handlers
  const handleAadhaarInputChange = (field, value) => {
    setAadhaarFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (aadhaarResult) {
      setAadhaarResult(null);
    }
  };

  const handleAadhaarFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a JPG, PNG, or PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setAadhaarFile(file);
      if (file.type.startsWith('image/')) {
        setAadhaarPreviewUrl(URL.createObjectURL(file));
      } else {
        setAadhaarPreviewUrl(null);
      }
      setAadhaarResult(null);
    }
  };

  const handleAadhaarDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a JPG, PNG, or PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setAadhaarFile(file);
      if (file.type.startsWith('image/')) {
        setAadhaarPreviewUrl(URL.createObjectURL(file));
      } else {
        setAadhaarPreviewUrl(null);
      }
      setAadhaarResult(null);
    }
  };

  const validateAadhaarForm = () => {
    if (!aadhaarFormData.name.trim()) {
      toast.error("Please enter your name as per Aadhaar");
      return false;
    }
    if (!aadhaarFormData.dob.trim()) {
      toast.error("Please enter your Date of Birth");
      return false;
    }
    const dobPattern = /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})$/;
    if (!dobPattern.test(aadhaarFormData.dob.trim())) {
      toast.error("Please enter Date of Birth in DD/MM/YYYY or YYYY-MM-DD format");
      return false;
    }
    if (!aadhaarFormData.aadhaar_number.trim()) {
      toast.error("Please enter your Aadhaar number");
      return false;
    }
    const aadhaarPattern = /^\d{4}\s?\d{4}\s?\d{4}$|^\d{12}$/;
    if (!aadhaarPattern.test(aadhaarFormData.aadhaar_number.trim())) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return false;
    }
    if (!aadhaarFormData.gender) {
      toast.error("Please select your gender");
      return false;
    }
    if (!aadhaarFile) {
      toast.error("Please upload your Aadhaar card image or PDF");
      return false;
    }
    return true;
  };

  const handleAadhaarVerify = async () => {
    if (!validateAadhaarForm()) {
      return;
    }

    setIsAadhaarProcessing(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', aadhaarFormData.name.trim());
      formDataToSend.append('dob', aadhaarFormData.dob.trim());
      formDataToSend.append('aadhaar_number', aadhaarFormData.aadhaar_number.trim().replace(/\s/g, ''));
      formDataToSend.append('gender', aadhaarFormData.gender);
      formDataToSend.append('image_file', aadhaarFile);

      const response = await axios.post(`${API}/aadhaar/verify-with-form`, formDataToSend, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        },
        timeout: 120000
      });

      setAadhaarResult(response.data);
      if (response.data.is_verified) {
        toast.success("Aadhaar verification successful!");
      } else {
        toast.warning("Aadhaar details do not match");
      }
    } catch (error) {
      console.error("Error verifying Aadhaar:", error);
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail || error?.message;
      
      if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout') || error?.message?.includes('exceeded')) {
        toast.error(
          "Verification is taking longer than expected. OCR processing can be slow. Please try again or use a smaller image file (max 2MB recommended)."
        );
      } else {
        toast.error(
          `Failed to verify Aadhaar${status ? ` (HTTP ${status})` : ""}${detail ? `: ${detail}` : ""}`
        );
      }
      setAadhaarResult(null);
    } finally {
      setIsAadhaarProcessing(false);
    }
  };

  const resetAadhaarForm = () => {
    setAadhaarFormData({
      name: "",
      dob: "",
      aadhaar_number: "",
      gender: ""
    });
    setAadhaarFile(null);
    setAadhaarPreviewUrl(null);
    setAadhaarResult(null);
    if (aadhaarFileInputRef.current) {
      aadhaarFileInputRef.current.value = '';
    }
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/10 border border-white/20 mb-6">
          <TabsTrigger value="general" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            <FileSearch className="w-4 h-4 mr-2" />
            General Documents
          </TabsTrigger>
          <TabsTrigger value="aadhaar" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            <CreditCard className="w-4 h-4 mr-2" />
            Aadhaar Verification
          </TabsTrigger>
        </TabsList>

        {/* General Documents Tab */}
        <TabsContent value="general" className="space-y-6">
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
        </TabsContent>

        {/* Aadhaar Verification Tab */}
        <TabsContent value="aadhaar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-violet-500" />
                  Enter Aadhaar Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name as per Aadhaar *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={aadhaarFormData.name}
                    onChange={(e) => handleAadhaarInputChange('name', e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Date of Birth Input */}
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="text"
                    placeholder="DD/MM/YYYY or YYYY-MM-DD"
                    value={aadhaarFormData.dob}
                    onChange={(e) => handleAadhaarInputChange('dob', e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Format: DD/MM/YYYY or YYYY-MM-DD</p>
                </div>

                {/* Aadhaar Number Input */}
                <div className="space-y-2">
                  <Label htmlFor="aadhaar_number">Aadhaar Number *</Label>
                  <Input
                    id="aadhaar_number"
                    type="text"
                    placeholder="1234 5678 9012"
                    value={aadhaarFormData.aadhaar_number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d\s]/g, '');
                      handleAadhaarInputChange('aadhaar_number', value);
                    }}
                    maxLength={14}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">12-digit Aadhaar number</p>
                </div>

                {/* Gender Select */}
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select 
                    value={aadhaarFormData.gender} 
                    onValueChange={(value) => handleAadhaarInputChange('gender', value)}
                  >
                    <SelectTrigger id="gender" className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* File Upload Area */}
                <div className="space-y-2">
                  <Label>Upload Aadhaar Card *</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      aadhaarPreviewUrl ? 'border-violet-300 bg-violet-50' : 'border-gray-200 hover:border-violet-300'
                    }`}
                    onDrop={handleAadhaarDrop}
                    onDragOver={(e) => e.preventDefault()}
                    data-testid="upload-area"
                  >
                    {aadhaarPreviewUrl ? (
                      <div className="space-y-4">
                        <img 
                          src={aadhaarPreviewUrl} 
                          alt="Aadhaar preview" 
                          className="max-h-48 mx-auto rounded-lg shadow"
                        />
                        <p className="text-sm text-gray-500">{aadhaarFile?.name}</p>
                        <Button variant="outline" size="sm" onClick={() => {
                          setAadhaarFile(null);
                          setAadhaarPreviewUrl(null);
                          if (aadhaarFileInputRef.current) {
                            aadhaarFileInputRef.current.value = '';
                          }
                        }}>
                          Change File
                        </Button>
                      </div>
                    ) : aadhaarFile ? (
                      <div className="space-y-4">
                        <FileCheck className="w-12 h-12 mx-auto text-violet-500" />
                        <p className="text-sm text-gray-500">{aadhaarFile?.name}</p>
                        <Button variant="outline" size="sm" onClick={() => {
                          setAadhaarFile(null);
                          if (aadhaarFileInputRef.current) {
                            aadhaarFileInputRef.current.value = '';
                          }
                        }}>
                          Change File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-violet-100 rounded-full flex items-center justify-center">
                          <Upload className="w-8 h-8 text-violet-500" />
                        </div>
                        <div>
                          <p className="text-gray-600">Drag and drop your Aadhaar card here, or</p>
                          <Button 
                            variant="link" 
                            onClick={() => aadhaarFileInputRef.current?.click()}
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
                      ref={aadhaarFileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleAadhaarFileSelect}
                      className="hidden"
                      data-testid="file-input"
                    />
                  </div>
                </div>

                {/* Verify Button */}
                <Button
                  data-testid="verify-btn"
                  onClick={handleAadhaarVerify}
                  disabled={isAadhaarProcessing || !aadhaarFormData.name || !aadhaarFormData.dob || !aadhaarFormData.aadhaar_number || !aadhaarFormData.gender || !aadhaarFile}
                  className="w-full bg-gradient-to-r from-violet-500 to-pink-500"
                >
                  {isAadhaarProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 mr-2" />
                      Verify Aadhaar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center">
                  {aadhaarResult ? (
                    aadhaarResult.is_verified ? (
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
                {aadhaarResult ? (
                  <div className="space-y-6" data-testid="verification-results">
                    {/* Verification Status */}
                    <div className={`p-4 rounded-lg ${
                      aadhaarResult.is_verified ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {aadhaarResult.is_verified ? (
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-500" />
                          )}
                          <span className={`font-semibold text-lg ${
                            aadhaarResult.is_verified ? 'text-emerald-700' : 'text-red-700'
                          }`}>
                            {aadhaarResult.is_verified ? 'Verified' : 'Not Verified'}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm ${
                        aadhaarResult.is_verified ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {aadhaarResult.message}
                      </p>
                    </div>

                    {/* Field Comparisons */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Field Comparison</h4>
                      <div className="space-y-3">
                        {aadhaarResult.field_comparisons?.map((comparison, index) => (
                          <div 
                            key={index} 
                            className={`p-3 rounded-lg border ${
                              comparison.matches 
                                ? 'bg-emerald-50 border-emerald-200' 
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{comparison.field_name}</span>
                              {comparison.matches ? (
                                <Badge className="bg-emerald-100 text-emerald-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Match
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Mismatch
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div>
                                <span className="text-gray-500">Entered: </span>
                                <span className="font-medium text-gray-900">{comparison.entered_value}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Extracted: </span>
                                <span className="font-medium text-gray-900">{comparison.extracted_value}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Validation Errors */}
                    {aadhaarResult.validation_errors && aadhaarResult.validation_errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-red-600">Validation Issues</h4>
                        <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                          {aadhaarResult.validation_errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <Button 
                        onClick={resetAadhaarForm}
                        className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500"
                      >
                        Verify Another
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Enter your Aadhaar details and upload your card to see verification results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentVerification;
