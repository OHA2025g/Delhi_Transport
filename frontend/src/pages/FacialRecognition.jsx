import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  UserCheck, Upload, Camera, CheckCircle, XCircle, 
  AlertCircle, Loader2, RefreshCw, Shield
} from "lucide-react";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";

const FacialRecognition = () => {
  const [referenceImage, setReferenceImage] = useState(null);
  const [verifyImage, setVerifyImage] = useState(null);
  const [referencePreview, setReferencePreview] = useState(null);
  const [verifyPreview, setVerifyPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const referenceInputRef = useRef(null);
  const verifyInputRef = useRef(null);

  const handleImageSelect = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      if (type === 'reference') {
        setReferenceImage(file);
        setReferencePreview(preview);
      } else {
        setVerifyImage(file);
        setVerifyPreview(preview);
      }
      setResult(null);
    }
  };

  const handleVerify = async () => {
    if (!referenceImage || !verifyImage) {
      toast.error("Please upload both reference and verification images");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('reference_image', referenceImage);
      formData.append('verify_image', verifyImage);

      const response = await axios.post(`${API}/facial/verify`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(response.data);
      toast.success("Verification completed");
    } catch (error) {
      console.error("Error during verification:", error);
      toast.error("Verification failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setReferenceImage(null);
    setVerifyImage(null);
    setReferencePreview(null);
    setVerifyPreview(null);
    setResult(null);
  };

  return (
    <div className="space-y-6" data-testid="facial-recognition">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Facial Recognition
        </h1>
        <p className="text-white/60">
          AI-powered identity verification using facial biometrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reference Image */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Camera className="w-5 h-5 mr-2 text-violet-500" />
              Reference Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                referencePreview ? 'border-violet-300 bg-violet-50' : 'border-gray-200 hover:border-violet-300'
              }`}
              onClick={() => referenceInputRef.current?.click()}
              data-testid="reference-upload"
            >
              {referencePreview ? (
                <div className="space-y-3">
                  <img 
                    src={referencePreview} 
                    alt="Reference" 
                    className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-violet-200"
                  />
                  <p className="text-sm text-gray-500">Click to change</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-20 h-20 mx-auto bg-violet-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-violet-500" />
                  </div>
                  <p className="text-gray-600">Upload reference photo</p>
                  <p className="text-xs text-gray-400">From database or ID</p>
                </div>
              )}
            </div>
            <input
              ref={referenceInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(e, 'reference')}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Verification Image */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-pink-500" />
              Verification Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                verifyPreview ? 'border-pink-300 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
              }`}
              onClick={() => verifyInputRef.current?.click()}
              data-testid="verify-upload"
            >
              {verifyPreview ? (
                <div className="space-y-3">
                  <img 
                    src={verifyPreview} 
                    alt="Verify" 
                    className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-pink-200"
                  />
                  <p className="text-sm text-gray-500">Click to change</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-20 h-20 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-pink-500" />
                  </div>
                  <p className="text-gray-600">Upload live photo</p>
                  <p className="text-xs text-gray-400">From camera or upload</p>
                </div>
              )}
            </div>
            <input
              ref={verifyInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(e, 'verify')}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-teal-500" />
              Verification Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6" data-testid="verification-result">
                <div className={`p-6 rounded-lg text-center ${
                  result.is_match ? 'bg-emerald-50' : 'bg-red-50'
                }`}>
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    result.is_match ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {result.is_match ? (
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-500" />
                    )}
                  </div>
                  <h3 className={`text-xl font-bold ${
                    result.is_match ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {result.is_match ? 'Match Found' : 'No Match'}
                  </h3>
                  <Badge className={`mt-2 ${
                    result.is_match ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {(result.confidence * 100).toFixed(1)}% Confidence
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Confidence Level</span>
                    <span className="font-medium">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={result.confidence * 100} 
                    className={result.is_match ? 'bg-emerald-100' : 'bg-red-100'}
                  />
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-2">
                    Verification ID: {result.verification_id}
                  </p>
                  <Button variant="outline" onClick={resetForm}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    New Verification
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Upload both images and click verify</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verify Button */}
      <div className="flex justify-center">
        <Button
          data-testid="verify-btn"
          onClick={handleVerify}
          disabled={!referenceImage || !verifyImage || isProcessing}
          className="px-12 py-6 text-lg bg-gradient-to-r from-violet-500 to-pink-500"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <UserCheck className="w-5 h-5 mr-2" />
              Verify Identity
            </>
          )}
        </Button>
      </div>

      {/* Use Cases */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900">Use Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-violet-50 rounded-lg">
              <h4 className="font-semibold text-violet-700 mb-2">DL Issuance</h4>
              <p className="text-sm text-gray-600">
                Verify applicant identity during driving license issuance process
              </p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <h4 className="font-semibold text-pink-700 mb-2">Impersonation Prevention</h4>
              <p className="text-sm text-gray-600">
                Prevent proxy attempts in license tests and renewals
              </p>
            </div>
            <div className="p-4 bg-teal-50 rounded-lg">
              <h4 className="font-semibold text-teal-700 mb-2">Enforcement</h4>
              <p className="text-sm text-gray-600">
                Verify driver identity during traffic enforcement checks
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacialRecognition;
