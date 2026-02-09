import { useState, useEffect, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, AlertTriangle, DollarSign, FileWarning } from "lucide-react";
import axios from "axios";
import { API } from "@/App";

// India GeoJSON - Using DataMeet Community Maps Project (official and reliable source)
// Source: https://projects.datameet.org/maps/states/
// Repository: https://github.com/datameet/maps
// License: Creative Commons Attribution 2.5 India
// Using local file extracted from DataMeet repository for better reliability
const indiaGeoUrls = [
  "/states.geojson", // Local file from DataMeet repository
  "https://raw.githubusercontent.com/datameet/maps/master/docs/data/geojson/states.geojson",
  "https://raw.githubusercontent.com/datameet/maps/master/Country/india-composite.geojson",
  // Fallback to alternative sources
  "https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States.json",
];

// State name mapping to match backend data
// DataMeet uses ST_NM field with standard state names
// Mapping handles variations between GeoJSON (ST_NM) and backend data
const stateNameMapping = {
  "Andaman & Nicobar Island": "Andaman and Nicobar",
  "Andaman and Nicobar Islands": "Andaman and Nicobar",
  "Andaman & Nicobar Islands": "Andaman and Nicobar",
  "Andhra Pradesh": "Andhra Pradesh",
  "Arunachal Pradesh": "Arunachal Pradesh",
  "Assam": "Assam",
  "Bihar": "Bihar",
  "Chandigarh": "Chandigarh",
  "Chhattisgarh": "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu": "Dadra and Nagar Haveli",
  "Dadra & Nagar Haveli and Daman & Diu": "Dadra and Nagar Haveli",
  "Daman and Diu": "Dadra and Nagar Haveli",
  "Delhi": "Delhi",
  "NCT of Delhi": "Delhi",
  "Goa": "Goa",
  "Gujarat": "Gujarat",
  "Haryana": "Haryana",
  "Himachal Pradesh": "Himachal Pradesh",
  "Jammu and Kashmir": "Jammu and Kashmir",
  "Jammu & Kashmir": "Jammu and Kashmir",
  "Jharkhand": "Jharkhand",
  "Karnataka": "Karnataka",
  "Kerala": "Kerala",
  "Ladakh": "Ladakh",
  "Lakshadweep": "Lakshadweep",
  "Madhya Pradesh": "Madhya Pradesh",
  "Maharashtra": "Maharashtra",
  "Manipur": "Manipur",
  "Meghalaya": "Meghalaya",
  "Mizoram": "Mizoram",
  "Nagaland": "Nagaland",
  "Odisha": "Odisha",
  "Orissa": "Odisha",
  "Puducherry": "Puducherry",
  "Pondicherry": "Puducherry",
  "Punjab": "Punjab",
  "Rajasthan": "Rajasthan",
  "Sikkim": "Sikkim",
  "Tamil Nadu": "Tamil Nadu",
  "Telangana": "Telangana",
  "Tripura": "Tripura",
  "Uttar Pradesh": "Uttar Pradesh",
  "Uttarakhand": "Uttarakhand",
  "Uttaranchal": "Uttarakhand",
  "West Bengal": "West Bengal",
};

const metrics = [
  { key: "vehicle_registration", label: "Vehicle Registration", icon: Car, color: "from-blue-500 to-blue-600" },
  { key: "accidents", label: "Accidents", icon: AlertTriangle, color: "from-red-500 to-red-600" },
  { key: "revenue", label: "Revenue", icon: DollarSign, color: "from-green-500 to-green-600" },
  { key: "challans", label: "Challans", icon: FileWarning, color: "from-orange-500 to-orange-600" },
];

const IndiaHeatMap = () => {
  const [selectedMetric, setSelectedMetric] = useState("vehicle_registration");
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoData, setGeoData] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [dataError, setDataError] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API}/dashboard/heatmap-data`);
        if (response.data && response.data.data) {
          setHeatmapData(response.data.data);
          setDataError(null);
          console.log("Heatmap data loaded:", response.data.data.length, "states");
        } else {
          setDataError("No data available");
        }
      } catch (error) {
        console.error("Error fetching heatmap data:", error);
        setDataError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Fetch India GeoJSON with multiple fallback URLs
    setGeoError(null);
    setGeoLoading(true);
    
    const tryLoadGeoJSON = async (urlIndex = 0) => {
      if (urlIndex >= indiaGeoUrls.length) {
        setGeoError("All GeoJSON sources failed. Please check your internet connection.");
        setGeoLoading(false);
        return;
      }

      try {
        console.log(`Attempting to load GeoJSON from URL ${urlIndex + 1}/${indiaGeoUrls.length}`);
        const response = await fetch(indiaGeoUrls[urlIndex], {
          mode: 'cors',
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("GeoJSON loaded successfully:", {
          type: data.type,
          featuresCount: data.features?.length || 0,
          isArray: Array.isArray(data),
          sampleProperties: data.features?.[0]?.properties
        });
        
        if (data && data.features && data.features.length > 0) {
          setGeoData(data);
          setGeoError(null);
          setGeoLoading(false);
        } else if (data && Array.isArray(data) && data.length > 0) {
          // Handle case where GeoJSON is an array of features
          setGeoData({ type: "FeatureCollection", features: data });
          setGeoError(null);
          setGeoLoading(false);
        } else {
          throw new Error("Invalid GeoJSON structure - no features found");
        }
      } catch (err) {
        console.error(`Error loading GeoJSON from URL ${urlIndex + 1}:`, err.message);
        // Try next URL
        tryLoadGeoJSON(urlIndex + 1);
      }
    };

    tryLoadGeoJSON(0);
  }, []);

  // Create a map of state name to data value
  const dataMap = useMemo(() => {
    const map = {};
    heatmapData.forEach((item) => {
      map[item.state] = item[selectedMetric] || 0;
    });
    return map;
  }, [heatmapData, selectedMetric]);

  // Calculate color intensity based on value
  const getColor = (value, maxValue) => {
    if (!value || maxValue === 0) return "#e5e7eb";
    const intensity = value / maxValue;
    const selectedMetricObj = metrics.find((m) => m.key === selectedMetric);
    const colorClass = selectedMetricObj?.color || "from-blue-500 to-blue-600";
    
    // Extract colors from gradient class
    if (colorClass.includes("blue")) {
      return `rgba(59, 130, 246, ${0.3 + intensity * 0.7})`;
    } else if (colorClass.includes("red")) {
      return `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`;
    } else if (colorClass.includes("green")) {
      return `rgba(34, 197, 94, ${0.3 + intensity * 0.7})`;
    } else if (colorClass.includes("orange")) {
      return `rgba(249, 115, 22, ${0.3 + intensity * 0.7})`;
    }
    return `rgba(59, 130, 246, ${0.3 + intensity * 0.7})`;
  };

  const maxValue = useMemo(() => {
    if (!heatmapData.length) return 1;
    return Math.max(...heatmapData.map((item) => item[selectedMetric] || 0));
  }, [heatmapData, selectedMetric]);

  const formatValue = (value) => {
    if (selectedMetric === "revenue") {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    }
    return value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString();
  };

  if (loading || geoLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardContent className="p-8">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading heat map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (geoError && (!geoData || !geoData.features || geoData.features.length === 0)) {
    return (
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-2xl mb-4">India State-wise Analytics</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center text-white">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-orange-400" />
            <p className="text-lg mb-2">Unable to load map</p>
            <p className="text-sm text-white/60 mb-4">{geoError}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-2xl mb-4">India State-wise Analytics</CardTitle>
        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const isSelected = selectedMetric === metric.key;
            return (
              <Button
                key={metric.key}
                onClick={() => setSelectedMetric(metric.key)}
                variant={isSelected ? "default" : "outline"}
                className={`${
                  isSelected
                    ? `bg-gradient-to-r ${metric.color} text-white border-0`
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {metric.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[600px] relative bg-gray-900/50 rounded-lg overflow-hidden border border-white/10">
          {geoData && geoData.features && geoData.features.length > 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <ComposableMap
                projectionConfig={{
                  scale: 1000,
                  center: [78.5, 22],
                  rotate: [0, 0, 0],
                  precision: 0.1,
                }}
                width={1000}
                height={700}
                style={{ 
                  width: "100%", 
                  height: "100%",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  display: "block"
                }}
              >
                <Geographies geography={geoData}>
                  {({ geographies }) => {
                    if (!geographies || geographies.length === 0) {
                      return (
                        <text x="50%" y="50%" textAnchor="middle" fill="white" fontSize="16">
                          No geographic data available
                        </text>
                      );
                    }
                    return geographies.map((geo) => {
                      // DataMeet states.geojson uses 'ST_NM' (uppercase) for state names
                      const stateName = geo.properties?.ST_NM || geo.properties?.st_nm || geo.properties?.NAME_1 || geo.properties?.name || geo.properties?.NAME || "";
                      const mappedState = stateNameMapping[stateName] || stateName;
                      const value = dataMap[mappedState] || 0;
                      const fillColor = getColor(value, maxValue);
                      const isSelected = selectedState === stateName;

                      return (
                        <Geography
                          key={geo.rsmKey || geo.id || Math.random()}
                          geography={geo}
                          fill={isSelected ? "#fbbf24" : fillColor}
                          stroke="#ffffff"
                          strokeWidth={isSelected ? 2 : 0.5}
                          onClick={() => {
                            setSelectedState(stateName);
                            console.log("State clicked:", stateName, "Value:", formatValue(value));
                          }}
                          style={{
                            default: { 
                              outline: "none",
                              cursor: "pointer",
                            },
                            hover: {
                              fill: isSelected ? "#fbbf24" : fillColor,
                              outline: "none",
                              stroke: "#ffffff",
                              strokeWidth: 2.5,
                              cursor: "pointer",
                            },
                            pressed: { 
                              outline: "none",
                              fill: "#fbbf24",
                            },
                          }}
                        >
                          <title>
                            {stateName}: {formatValue(value)}
                          </title>
                        </Geography>
                      );
                    });
                  }}
                </Geographies>
              </ComposableMap>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-orange-400" />
                <p>Map data not available</p>
                {geoError && <p className="text-sm text-white/60 mt-2">{geoError}</p>}
              </div>
            </div>
          )}
          
          {/* Legend */}
          {geoData && geoData.features && geoData.features.length > 0 && (
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md rounded-lg p-4 text-white z-10">
              <div className="text-sm font-semibold mb-2">
                {metrics.find((m) => m.key === selectedMetric)?.label}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getColor(0, maxValue) }}></div>
                <span>Low</span>
                <div className="w-4 h-4 rounded ml-4" style={{ backgroundColor: getColor(maxValue, maxValue) }}></div>
                <span>High</span>
              </div>
              <div className="mt-2 text-xs text-white/70">
                Max: {formatValue(maxValue)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IndiaHeatMap;
