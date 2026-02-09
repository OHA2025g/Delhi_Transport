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
  Upload, CheckCircle, XCircle, AlertCircle, 
  CreditCard, Loader2, FileCheck
} from "lucide-react";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";

const AadhaarVerification = () => {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    aadhaar_number: "",
    gender: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear result when form changes
    if (result) {
      setResult(null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a JPG, PNG, or PDF file");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
      setResult(null);
    }
  };

  const handleDrop = (e) => {
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
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
      setResult(null);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter your name as per Aadhaar");
      return false;
    }
    if (!formData.dob.trim()) {
      toast.error("Please enter your Date of Birth");
      return false;
    }
    // Validate date format
    const dobPattern = /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})$/;
    if (!dobPattern.test(formData.dob.trim())) {
      toast.error("Please enter Date of Birth in DD/MM/YYYY or YYYY-MM-DD format");
      return false;
    }
    if (!formData.aadhaar_number.trim()) {
      toast.error("Please enter your Aadhaar number");
      return false;
    }
    // Validate Aadhaar number (12 digits)
    const aadhaarPattern = /^\d{4}\s?\d{4}\s?\d{4}$|^\d{12}$/;
    if (!aadhaarPattern.test(formData.aadhaar_number.trim())) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return false;
    }
    if (!formData.gender) {
      toast.error("Please select your gender");
      return false;
    }
    if (!selectedFile) {
      toast.error("Please upload your Aadhaar card image or PDF");
      return false;
    }
    return true;
  };

  const handleVerify = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('dob', formData.dob.trim());
      formDataToSend.append('aadhaar_number', formData.aadhaar_number.trim().replace(/\s/g, ''));
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('image_file', selectedFile);

      const response = await axios.post(`${API}/aadhaar/verify-with-form`, formDataToSend, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        },
        timeout: 120000 // 120 seconds (2 minutes) timeout for OCR processing
      });

      setResult(response.data);
      if (response.data.is_verified) {
        toast.success("Aadhaar verification successful!");
      } else {
        toast.warning("Aadhaar details do not match");
      }
    } catch (error) {
      console.error("Error verifying Aadhaar:", error);
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail || error?.message;
      
      // Handle timeout specifically
      if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout') || error?.message?.includes('exceeded')) {
        toast.error(
          "Verification is taking longer than expected. OCR processing can be slow. Please try again or use a smaller image file (max 2MB recommended)."
        );
      } else {
        toast.error(
          `Failed to verify Aadhaar${status ? ` (HTTP ${status})` : ""}${detail ? `: ${detail}` : ""}`
        );
      }
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      dob: "",
      aadhaar_number: "",
      gender: ""
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6" data-testid="aadhaar-verification">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Aadhaar Document Verification (OCR)
        </h1>
        <p className="text-white/60">
          Enter your Aadhaar details and upload your Aadhaar card for verification
        </p>
      </div>

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
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
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
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
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
                value={formData.aadhaar_number}
                onChange={(e) => {
                  // Allow only digits and spaces, format as user types
                  const value = e.target.value.replace(/[^\d\s]/g, '');
                  handleInputChange('aadhaar_number', value);
                }}
                maxLength={14} // 12 digits + 2 spaces
                className="w-full"
              />
              <p className="text-xs text-gray-500">12-digit Aadhaar number</p>
            </div>

            {/* Gender Select */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => handleInputChange('gender', value)}
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
                      alt="Aadhaar preview" 
                      className="max-h-48 mx-auto rounded-lg shadow"
                    />
                    <p className="text-sm text-gray-500">{selectedFile?.name}</p>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}>
                      Change File
                    </Button>
                  </div>
                ) : selectedFile ? (
                  <div className="space-y-4">
                    <FileCheck className="w-12 h-12 mx-auto text-violet-500" />
                    <p className="text-sm text-gray-500">{selectedFile?.name}</p>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
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
            </div>

            {/* Verify Button */}
            <Button
              data-testid="verify-btn"
              onClick={handleVerify}
              disabled={isProcessing || !formData.name || !formData.dob || !formData.aadhaar_number || !formData.gender || !selectedFile}
              className="w-full bg-gradient-to-r from-violet-500 to-pink-500"
            >
              {isProcessing ? (
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
              {result ? (
                result.is_verified ? (
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
              <div className="space-y-6" data-testid="verification-results">
                {/* Verification Status */}
                <div className={`p-4 rounded-lg ${
                  result.is_verified ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {result.is_verified ? (
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                      <span className={`font-semibold text-lg ${
                        result.is_verified ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {result.is_verified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm ${
                    result.is_verified ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                </div>

                {/* Field Comparisons */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Field Comparison</h4>
                  <div className="space-y-3">
                    {result.field_comparisons?.map((comparison, index) => (
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
                {result.validation_errors && result.validation_errors.length > 0 && (
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
                <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Enter your Aadhaar details and upload your card to see verification results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AadhaarVerification;

