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

  // Find the mapped state name from selectedState (GeoJSON name)
  const mappedSelectedState = useMemo(() => {
    if (!selectedState) return null;
    // Try to find the mapped state name
    const mapped = stateNameMapping[selectedState] || selectedState;
    // Find the state in heatmapData
    return heatmapData.find(item => 
      item.state === mapped || 
      item.state === selectedState ||
      item.state?.toLowerCase() === mapped?.toLowerCase() ||
      item.state?.toLowerCase() === selectedState?.toLowerCase()
    )?.state || mapped;
  }, [selectedState, heatmapData]);

  // Calculate statistics based on selected metric and selected state
  const statistics = useMemo(() => {
    if (!heatmapData.length) {
      return {
        total: 0,
        average: 0,
        max: 0,
        min: 0,
        topState: null,
        topStateValue: 0,
        statesCount: 0,
        isStateSpecific: false,
        selectedStateName: null
      };
    }

    // If a state is selected, show only that state's data
    if (mappedSelectedState) {
      const stateData = heatmapData.find(item => 
        item.state === mappedSelectedState ||
        item.state?.toLowerCase() === mappedSelectedState?.toLowerCase()
      );

      if (stateData) {
        const value = stateData[selectedMetric] || 0;
        return {
          total: value,
          average: value,
          max: value,
          min: value,
          topState: stateData.state,
          topStateValue: value,
          statesCount: 1,
          isStateSpecific: true,
          selectedStateName: stateData.state
        };
      }
    }

    // Otherwise, show aggregate data for all states
    const values = heatmapData.map(item => item[selectedMetric] || 0).filter(v => v > 0);
    if (values.length === 0) {
      return {
        total: 0,
        average: 0,
        max: 0,
        min: 0,
        topState: null,
        topStateValue: 0,
        statesCount: 0,
        isStateSpecific: false,
        selectedStateName: null
      };
    }

    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Find top state
    const topStateData = heatmapData.reduce((maxItem, item) => {
      const itemValue = item[selectedMetric] || 0;
      const maxValue = maxItem[selectedMetric] || 0;
      return itemValue > maxValue ? item : maxItem;
    }, heatmapData[0]);

    return {
      total,
      average,
      max,
      min,
      topState: topStateData?.state || null,
      topStateValue: topStateData?.[selectedMetric] || 0,
      statesCount: values.length,
      isStateSpecific: false,
      selectedStateName: null
    };
  }, [heatmapData, selectedMetric, mappedSelectedState]);

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
      
      {/* Statistics Section - Prominent Display */}
      <div className="px-6 pb-6 pt-4 relative z-10 min-h-[200px]">
        {statistics.isStateSpecific && statistics.selectedStateName && (
          <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
              <span className="text-white font-semibold">
                Showing data for: <span className="text-orange-400">{statistics.selectedStateName}</span>
              </span>
            </div>
            <Button
              onClick={() => setSelectedState(null)}
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Clear Selection
            </Button>
          </div>
        )}
        
        {/* Stats Title */}
        <div className="mb-4">
          <h3 className="text-white text-xl font-bold drop-shadow-lg">Key Statistics</h3>
        </div>
        
        <div className={`grid gap-4 mb-6 ${
          statistics.isStateSpecific 
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
            : "grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
        }`}>
          {/* Total / Current Value */}
          <div className="bg-gradient-to-br from-blue-500/80 to-blue-600/80 backdrop-blur-lg rounded-xl p-5 border-2 border-blue-300/50 shadow-2xl hover:shadow-blue-500/50 transition-all">
            <div className="text-white/90 text-sm mb-2 font-semibold uppercase tracking-wide">
              {statistics.isStateSpecific ? "Current Value" : "Total"}
            </div>
            <div className="text-white text-3xl font-bold drop-shadow-2xl">
              {formatValue(statistics.total)}
            </div>
          </div>
          
          {/* Average - Only show if not state-specific */}
          {!statistics.isStateSpecific && (
            <div className="bg-gradient-to-br from-green-500/80 to-green-600/80 backdrop-blur-lg rounded-xl p-5 border-2 border-green-300/50 shadow-2xl hover:shadow-green-500/50 transition-all">
              <div className="text-white/90 text-sm mb-2 font-semibold uppercase tracking-wide">Average</div>
              <div className="text-white text-3xl font-bold drop-shadow-2xl">
                {formatValue(statistics.average)}
              </div>
            </div>
          )}
          
          {/* Maximum - Only show if not state-specific */}
          {!statistics.isStateSpecific && (
            <div className="bg-gradient-to-br from-purple-500/80 to-purple-600/80 backdrop-blur-lg rounded-xl p-5 border-2 border-purple-300/50 shadow-2xl hover:shadow-purple-500/50 transition-all">
              <div className="text-white/90 text-sm mb-2 font-semibold uppercase tracking-wide">Maximum</div>
              <div className="text-white text-3xl font-bold drop-shadow-2xl">
                {formatValue(statistics.max)}
              </div>
            </div>
          )}
          
          {/* Minimum - Only show if not state-specific */}
          {!statistics.isStateSpecific && (
            <div className="bg-gradient-to-br from-orange-500/80 to-orange-600/80 backdrop-blur-lg rounded-xl p-5 border-2 border-orange-300/50 shadow-2xl hover:shadow-orange-500/50 transition-all">
              <div className="text-white/90 text-sm mb-2 font-semibold uppercase tracking-wide">Minimum</div>
              <div className="text-white text-3xl font-bold drop-shadow-2xl">
                {formatValue(statistics.min)}
              </div>
            </div>
          )}
          
          {/* Top State / Selected State */}
          <div className="bg-gradient-to-br from-indigo-500/80 to-indigo-600/80 backdrop-blur-lg rounded-xl p-5 border-2 border-indigo-300/50 shadow-2xl hover:shadow-indigo-500/50 transition-all">
            <div className="text-white/90 text-sm mb-2 font-semibold uppercase tracking-wide">
              {statistics.isStateSpecific ? "Selected State" : "Top State"}
            </div>
            <div className="text-white text-base font-bold truncate drop-shadow-lg" title={statistics.topState || "N/A"}>
              {statistics.topState || "N/A"}
            </div>
            {statistics.topStateValue > 0 && (
              <div className="text-white/90 text-sm mt-2 font-semibold drop-shadow-md">
                {formatValue(statistics.topStateValue)}
              </div>
            )}
          </div>
          
          {/* Additional metrics for state-specific view */}
          {statistics.isStateSpecific && (() => {
            const stateData = heatmapData.find(s => s.state === statistics.selectedStateName);
            return (
              <>
                <div className="bg-gradient-to-br from-teal-500/80 to-teal-600/80 backdrop-blur-lg rounded-xl p-5 border-2 border-teal-300/50 shadow-2xl hover:shadow-teal-500/50 transition-all">
                  <div className="text-white/90 text-sm mb-3 font-semibold uppercase tracking-wide">All Metrics</div>
                  <div className="text-white text-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white/90 font-medium">Vehicle Reg:</span>
                      <span className="font-bold text-white">{formatValue(stateData?.["vehicle_registration"] || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/90 font-medium">Accidents:</span>
                      <span className="font-bold text-white">{formatValue(stateData?.["accidents"] || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/90 font-medium">Revenue:</span>
                      <span className="font-bold text-white">{formatValue(stateData?.["revenue"] || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/90 font-medium">Challans:</span>
                      <span className="font-bold text-white">{formatValue(stateData?.["challans"] || 0)}</span>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
      
      {/* Insights Section */}
      <CardContent className="pt-0 pb-4">
        {(() => {
          const generateInsight = () => {
            if (!heatmapData.length) return null;
            
            const stateData = statistics.isStateSpecific 
              ? heatmapData.find(s => s.state === statistics.selectedStateName)
              : null;
            
            const metricLabel = metrics.find(m => m.key === selectedMetric)?.label || selectedMetric;
            
            if (statistics.isStateSpecific && stateData) {
              // State-specific insights
              const value = stateData[selectedMetric] || 0;
              const allStatesAvg = heatmapData.reduce((sum, item) => sum + (item[selectedMetric] || 0), 0) / heatmapData.length;
              const percentage = allStatesAvg > 0 ? ((value / allStatesAvg - 1) * 100).toFixed(1) : 0;
              const isAboveAvg = value > allStatesAvg;
              
              switch (selectedMetric) {
                case "vehicle_registration":
                  return isAboveAvg 
                    ? `${statistics.selectedStateName} has ${Math.abs(percentage)}% more vehicle registrations than the national average, indicating strong transportation growth.`
                    : `${statistics.selectedStateName} has ${Math.abs(percentage)}% fewer vehicle registrations than the national average, suggesting potential for growth in the transport sector.`;
                
                case "accidents":
                  return isAboveAvg
                    ? `${statistics.selectedStateName} reports ${Math.abs(percentage)}% more accidents than the national average, highlighting the need for enhanced road safety measures.`
                    : `${statistics.selectedStateName} has ${Math.abs(percentage)}% fewer accidents than the national average, demonstrating effective road safety initiatives.`;
                
                case "revenue":
                  return isAboveAvg
                    ? `${statistics.selectedStateName} generates ${Math.abs(percentage)}% more revenue than the national average, showing strong financial performance in transport services.`
                    : `${statistics.selectedStateName} generates ${Math.abs(percentage)}% less revenue than the national average, indicating opportunities for revenue optimization.`;
                
                case "challans":
                  return isAboveAvg
                    ? `${statistics.selectedStateName} issues ${Math.abs(percentage)}% more challans than the national average, reflecting active traffic enforcement.`
                    : `${statistics.selectedStateName} issues ${Math.abs(percentage)}% fewer challans than the national average, suggesting lower traffic violations or enforcement activity.`;
                
                default:
                  return `${statistics.selectedStateName} shows ${formatValue(value)} in ${metricLabel}, ${isAboveAvg ? 'above' : 'below'} the national average.`;
              }
            } else {
              // Aggregate insights
              const topState = statistics.topState;
              const topValue = statistics.topStateValue;
              const avgValue = statistics.average;
              
              switch (selectedMetric) {
                case "vehicle_registration":
                  return `${topState} leads with ${formatValue(topValue)} vehicle registrations, ${((topValue / avgValue - 1) * 100).toFixed(0)}% above the national average of ${formatValue(avgValue)}.`;
                
                case "accidents":
                  return `${topState} reports the highest number of accidents at ${formatValue(topValue)}, ${((topValue / avgValue - 1) * 100).toFixed(0)}% above the national average, requiring focused safety interventions.`;
                
                case "revenue":
                  return `${topState} generates the highest revenue at ${formatValue(topValue)}, ${((topValue / avgValue - 1) * 100).toFixed(0)}% above the national average, demonstrating strong transport sector performance.`;
                
                case "challans":
                  return `${topState} issues the most challans at ${formatValue(topValue)}, ${((topValue / avgValue - 1) * 100).toFixed(0)}% above the national average, indicating active traffic enforcement.`;
                
                default:
                  return `${topState} leads in ${metricLabel} with ${formatValue(topValue)}, significantly above the national average.`;
              }
            }
          };
          
          const insight = generateInsight();
          if (!insight) return null;
          
          return (
            <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 backdrop-blur-md rounded-lg p-4 border border-orange-400/30">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-white/90 text-sm leading-relaxed">
                    {insight}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </CardContent>
      
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
