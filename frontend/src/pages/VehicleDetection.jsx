import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Truck, Upload, Camera, Car, Bus, Bike, Loader2, 
  RefreshCw, Eye, AlertTriangle
} from "lucide-react";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";

const VEHICLE_ICONS = {
  'Two Wheeler': Bike,
  'Four Wheeler - LMV': Car,
  'Heavy Goods Vehicle': Truck,
  'Bus': Bus
};

const VehicleDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleDetect = async () => {
    if (!selectedImage) {
      toast.error("Please upload an image");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('image_file', selectedImage);

      const response = await axios.post(`${API}/vehicle/detect`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(response.data);
      toast.success("Vehicle detected successfully");
    } catch (error) {
      console.error("Error detecting vehicle:", error);
      toast.error("Detection failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
  };

  const VehicleIcon = result ? (VEHICLE_ICONS[result.vehicle_class] || Car) : Car;

  return (
    <div className="space-y-6" data-testid="vehicle-detection">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Vehicle Class Detection
        </h1>
        <p className="text-white/60">
          AI-powered vehicle classification from images and video feeds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Camera className="w-5 h-5 mr-2 text-violet-500" />
              Upload Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                previewUrl ? 'border-violet-300 bg-violet-50' : 'border-gray-200 hover:border-violet-300'
              }`}
              onClick={() => fileInputRef.current?.click()}
              data-testid="upload-area"
            >
              {previewUrl ? (
                <div className="space-y-4 relative">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg shadow"
                  />
                  {result?.bounding_box && (
                    <div 
                      className="absolute border-2 border-emerald-500 rounded"
                      style={{
                        left: `${(result.bounding_box.x / 800) * 100}%`,
                        top: `${(result.bounding_box.y / 600) * 100}%`,
                        width: `${(result.bounding_box.width / 800) * 100}%`,
                        height: `${(result.bounding_box.height / 600) * 100}%`
                      }}
                    />
                  )}
                  <Button variant="outline" onClick={(e) => { e.stopPropagation(); resetForm(); }}>
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto bg-violet-100 rounded-full flex items-center justify-center">
                    <Upload className="w-10 h-10 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">
                      Drag and drop an image, or click to browse
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Supports: JPG, PNG (max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              data-testid="file-input"
            />

            <Button
              data-testid="detect-btn"
              onClick={handleDetect}
              disabled={!selectedImage || isProcessing}
              className="w-full bg-gradient-to-r from-violet-500 to-pink-500"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Detect Vehicle
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-teal-500" />
              Detection Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6" data-testid="detection-result">
                {/* Vehicle Class */}
                <div className="text-center p-6 bg-gradient-to-br from-violet-50 to-pink-50 rounded-lg">
                  <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                    <VehicleIcon className="w-10 h-10 text-violet-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {result.vehicle_class}
                  </h3>
                  <Badge className="bg-violet-100 text-violet-700">
                    {(result.confidence * 100).toFixed(1)}% Confidence
                  </Badge>
                </div>

                {/* Confidence Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Detection Confidence</span>
                    <span className="font-medium">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={result.confidence * 100} className="bg-violet-100" />
                </div>

                {/* Additional Info */}
                {result.additional_info && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Additional Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {Object.entries(result.additional_info).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-gray-500 capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bounding Box Info */}
                {result.bounding_box && (
                  <div className="text-xs text-gray-400 text-center">
                    Detection Box: ({result.bounding_box.x}, {result.bounding_box.y}) - 
                    {result.bounding_box.width}x{result.bounding_box.height}
                  </div>
                )}

                <Button variant="outline" onClick={resetForm} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Detect Another
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Truck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Upload an image to detect vehicle class</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Use Cases */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900">Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-violet-50 rounded-lg text-center">
              <Truck className="w-8 h-8 mx-auto mb-2 text-violet-500" />
              <h4 className="font-semibold text-violet-700 mb-1">Toll Classification</h4>
              <p className="text-xs text-gray-600">
                Automatic toll rates based on vehicle type
              </p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-pink-500" />
              <h4 className="font-semibold text-pink-700 mb-1">Enforcement</h4>
              <p className="text-xs text-gray-600">
                Automated challan for violations
              </p>
            </div>
            <div className="p-4 bg-teal-50 rounded-lg text-center">
              <Car className="w-8 h-8 mx-auto mb-2 text-teal-500" />
              <h4 className="font-semibold text-teal-700 mb-1">Traffic Analysis</h4>
              <p className="text-xs text-gray-600">
                Vehicle density and flow monitoring
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <Bus className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <h4 className="font-semibold text-orange-700 mb-1">Urban Planning</h4>
              <p className="text-xs text-gray-600">
                Data-driven infrastructure decisions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleDetection;
