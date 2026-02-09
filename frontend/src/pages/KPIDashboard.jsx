import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, TrendingDown, Car, FileText, Users, AlertTriangle, 
  Clock, CheckCircle, BarChart3, RefreshCw, Download, Settings,
  Building2, MapPin, Shield, Zap, Target, Activity, Globe, Award, Brain,
  Lightbulb, CheckCircle2, AlertCircle, ArrowRight, Calendar, User
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AnimatedCounter from "@/components/AnimatedCounter";
import ScrollReveal from "@/components/ScrollReveal";

const COLORS = ['#F97316', '#3B82F6', '#0D9488', '#EA580C', '#10B981', '#8B5CF6', '#EC4899'];

const KPIDashboard = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("national");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [kpiData, setKpiData] = useState({
    state_general: [],
    state_service: [],
    state_policy: [],
    rto_general: [],
    rto_performance: [],
    rto_policy: [],
    rto_desk: [],
    rto_internal: [],
    fleet_vehicles: [],
    fleet_drivers: [],
  });
  const [nationalKPIs, setNationalKPIs] = useState(null);
  const [stateDerivedKPIs, setStateDerivedKPIs] = useState(null);
  const [rtoDerivedKPIs, setRtoDerivedKPIs] = useState(null);
  const [executiveKPIs, setExecutiveKPIs] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  
  // Drill-down state
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownData, setDrillDownData] = useState(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);
  const [drillDownType, setDrillDownType] = useState(null);
  const [drillDownInsights, setDrillDownInsights] = useState(null);
  const [drillDownError, setDrillDownError] = useState(null);

  const geoParams = useCallback(() => {
    return Object.fromEntries(
      ["state_cd", "c_district", "city"]
        .map((k) => [k, searchParams.get(k) || ""])
        .filter(([, v]) => v)
    );
  }, [searchParams]);

  const fetchKPIData = useCallback(async () => {
    setLoading(true);
    try {
      const state = searchParams.get("state_cd") || null;
      const month = selectedMonth || null;
      
      const [summaryRes, stateGenRes, stateSvcRes, statePolRes, rtoGenRes, rtoPerfRes, rtoPolRes, rtoDeskRes, rtoIntRes, fleetVehRes, fleetDrvRes, natRes, stateDerivedRes, rtoDerivedRes, execRes, insightsRes] = await Promise.all([
        axios.get(`${API}/kpi/summary`, { params: { state, month } }),
        axios.get(`${API}/kpi/state/general`, { params: { state, month } }),
        axios.get(`${API}/kpi/state/service-delivery`, { params: { state, month } }),
        axios.get(`${API}/kpi/state/policy`, { params: { state, month } }),
        axios.get(`${API}/kpi/rto/general`, { params: { state, month } }),
        axios.get(`${API}/kpi/rto/performance`, { params: { state, month } }),
        axios.get(`${API}/kpi/rto/policy`, { params: { state, month } }),
        axios.get(`${API}/kpi/rto/desk`, { params: { state, month } }),
        axios.get(`${API}/kpi/rto/internal`, { params: { state, month } }),
        axios.get(`${API}/kpi/fleet/vehicles`, { params: { state, month } }),
        axios.get(`${API}/kpi/fleet/drivers`, { params: { state, month } }),
        axios.get(`${API}/kpi/national/summary`, { params: { month } }),
        axios.get(`${API}/kpi/state/derived`, { params: { state, month } }),
        axios.get(`${API}/kpi/rto/derived`, { params: { state, rto: null, month } }),
        axios.get(`${API}/kpi/executive/summary`, { params: { month } }),
        axios.get(`${API}/kpi/insights`, { params: { state, month } }),
      ]);

      // Extract months from state general data
      if (stateGenRes.data?.data?.length > 0) {
        const months = [...new Set(stateGenRes.data.data.map(d => d.Month).filter(Boolean))].sort().reverse();
        setAvailableMonths(months);
        if (!selectedMonth && months.length > 0) {
          setSelectedMonth(months[0]);
        }
      }

      setKpiData({
        state_general: stateGenRes.data?.data || [],
        state_service: stateSvcRes.data?.data || [],
        state_policy: statePolRes.data?.data || [],
        rto_general: rtoGenRes.data?.data || [],
        rto_performance: rtoPerfRes.data?.data || [],
        rto_policy: rtoPolRes.data?.data || [],
        rto_desk: rtoDeskRes.data?.data || [],
        rto_internal: rtoIntRes.data?.data || [],
        fleet_vehicles: fleetVehRes.data?.data || [],
        fleet_drivers: fleetDrvRes.data?.data || [],
      });
      
      setNationalKPIs(natRes.data);
      setStateDerivedKPIs(stateDerivedRes.data);
      setRtoDerivedKPIs(rtoDerivedRes.data);
      setExecutiveKPIs(execRes.data);
      setInsightsData(insightsRes.data);

      toast.success("KPI data refreshed");
    } catch (error) {
      console.error("Error fetching KPI data:", error);
      const status = error?.response?.status;
      const url = error?.config?.url;
      const msg = error?.message || "Request failed";
      const detail = error?.response?.data?.detail || "";
      toast.error(`Failed to fetch KPI data${status ? ` (HTTP ${status})` : ""}: ${msg}${detail ? ` - ${detail}` : ""}${url ? ` — ${url}` : ""}`);
      
      // If it's a connection error, suggest checking backend
      if (!error.response && error.message.includes("Network")) {
        console.error("Backend server may not be running. Check http://localhost:8001/health");
      }
    } finally {
      setLoading(false);
    }
  }, [searchParams, selectedMonth]);

  useEffect(() => {
    fetchKPIData();
  }, [fetchKPIData]);

  // Calculate summary metrics from latest data - get the most recent entry
  const getLatestData = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return {};
    // Sort by Month descending to get the latest
    const sorted = [...dataArray].sort((a, b) => {
      const monthA = a?.Month || '';
      const monthB = b?.Month || '';
      return monthB.localeCompare(monthA);
    });
    return sorted[0] || {};
  };

  // Helper to safely get property value with fallback
  const getValue = (obj, key, fallback = 0) => {
    if (!obj || typeof obj !== 'object') return fallback;
    const value = obj[key];
    if (value === null || value === undefined || value === '') return fallback;
    return value;
  };

  const latestStateGeneral = getLatestData(kpiData.state_general);
  const latestStateService = getLatestData(kpiData.state_service);
  const latestRtoPerformance = getLatestData(kpiData.rto_performance);
  const latestFleetVehicles = getLatestData(kpiData.fleet_vehicles);

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return "₹0";
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return "₹0";
    if (numValue === 0) return "₹0";
    if (numValue >= 10000000) return `₹${(numValue / 10000000).toFixed(2)}Cr`;
    if (numValue >= 100000) return `₹${(numValue / 100000).toFixed(2)}L`;
    return `₹${numValue.toLocaleString('en-IN')}`;
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return "0";
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return "0";
    return numValue.toLocaleString('en-IN');
  };

  // Drill-down handler
  const handleDrillDown = useCallback(async (type, params = {}) => {
    setDrillDownOpen(true);
    setDrillDownType(type);
    setDrillDownLoading(true);
    setDrillDownData(null);
    setDrillDownInsights(null);
    setDrillDownError(null);

    try {
      const month = selectedMonth || null;
      const state = searchParams.get("state_cd") || params.state || null;
      
      // Fetch drill-down data and insights in parallel
      const [drillDownResponse, insightsResponse] = await Promise.allSettled([
        (async () => {
          let response;
          switch (type) {
            case 'national_vehicle_registration':
              response = await axios.get(`${API}/kpi/drilldown/national/vehicle-registration`, { params: { month } });
              break;
            case 'national_revenue':
              response = await axios.get(`${API}/kpi/drilldown/national/revenue`, { params: { month } });
              break;
            case 'state_breakdown':
              response = await axios.get(`${API}/kpi/drilldown/state/breakdown`, { params: { month, state: params.state } });
              break;
            case 'rto_breakdown':
              response = await axios.get(`${API}/kpi/drilldown/rto/breakdown`, { params: { month, state, rto: params.rto } });
              break;
            case 'service_delivery':
              response = await axios.get(`${API}/kpi/drilldown/service-delivery`, { params: { month, state } });
              break;
            case 'revenue_trend':
              response = await axios.get(`${API}/kpi/drilldown/revenue-trend`, { params: { month, state } });
              break;
            case 'enforcement':
              response = await axios.get(`${API}/kpi/drilldown/enforcement`, { params: { month, state } });
              break;
            case 'fleet_vehicles':
              response = await axios.get(`${API}/kpi/drilldown/fleet-vehicles`, { params: { month, state } });
              break;
            default:
              // Use existing data for simple drill-downs
              response = { data: { type, data: kpiData[params.dataKey] || [] } };
          }
          return response;
        })(),
        axios.get(`${API}/kpi/insights`, { params: { state, month, section: type } }).catch(() => ({ data: null }))
      ]);

      if (drillDownResponse.status === 'fulfilled') {
        setDrillDownData(drillDownResponse.value.data);
      } else {
        throw drillDownResponse.reason;
      }

      if (insightsResponse.status === 'fulfilled' && insightsResponse.value?.data) {
        setDrillDownInsights(insightsResponse.value.data);
      }
    } catch (error) {
      console.error("Error fetching drill-down data:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Unknown error occurred";
      setDrillDownError(errorMessage);
      toast.error(`Failed to load drill-down data: ${errorMessage}`);
    } finally {
      setDrillDownLoading(false);
    }
  }, [selectedMonth, searchParams, kpiData]);

  // State Level KPIs
  const StateGeneralKPIs = () => {
    const data = kpiData.state_general.slice(0, 12).reverse(); // Last 12 months
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow kpi-card-enhanced hover-lift card-3d magnetic-hover ripple-effect"
            onClick={() => handleDrillDown('state_breakdown', { state: latestStateGeneral.State, metric: 'vehicle_registration' })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Vehicle Registration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    <AnimatedCounter value={latestStateGeneral["Vehicle Registration"] || 0} />
                  </p>
                </div>
                <Car className="w-8 h-8 text-orange-500 floating-particle" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown('state_breakdown', { state: latestStateGeneral.State, metric: 'dl_issued' })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">DL Issued</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(latestStateGeneral["DL Issued"] || 0)}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown('revenue_trend', { state: latestStateGeneral.State })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(latestStateGeneral["Revenue - Total"] || 0)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown('enforcement', { state: latestStateGeneral.State })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Road Accidents</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(latestStateGeneral["Road Accidents"] || 0)}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="chart-animated hover-lift">
          <CardHeader>
            <CardTitle className="gradient-text-animated">Vehicle Registration & Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                    labelStyle={{ color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="Vehicle Registration" stroke="#F97316" fill="url(#colorReg)" />
                  <Area yAxisId="right" type="monotone" dataKey="Revenue - Total" stroke="#3B82F6" fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const StateServiceKPIs = () => {
    const data = kpiData.state_service.slice(0, 12).reverse();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown('service_delivery', { state: latestStateService.State })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Online Services</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(latestStateService["Online Service Count"] || 0)}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown('service_delivery', { state: latestStateService.State })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Faceless Services</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(latestStateService["Faceless Service Count"] || 0)}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown('service_delivery', { state: latestStateService.State })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Citizen Service SLA</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {latestStateService["Citizen Service SLA % (within SLA)"] != null 
                      ? Number(latestStateService["Citizen Service SLA % (within SLA)"]).toFixed(1) 
                      : 0}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown('service_delivery', { state: latestStateService.State })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Grievance SLA</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {latestStateService["Grievance SLA % (within SLA)"] != null 
                      ? Number(latestStateService["Grievance SLA % (within SLA)"]).toFixed(1) 
                      : 0}%
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Delivery Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Month" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                    labelStyle={{ color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Citizen Service SLA % (within SLA)" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="Grievance SLA % (within SLA)" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const RTOPerformanceKPIs = () => {
    const data = kpiData.rto_performance.slice(0, 20); // Top 20 RTOs
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown('service_delivery')}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Avg Faceless %</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {kpiData.rto_performance.length > 0 
                      ? (kpiData.rto_performance.reduce((sum, r) => sum + (r["Faceless Application %"] || 0), 0) / kpiData.rto_performance.length).toFixed(1)
                      : 0}%
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown('service_delivery')}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Avg Service SLA</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {kpiData.rto_performance.length > 0 
                      ? (kpiData.rto_performance.reduce((sum, r) => sum + (r["Citizen Service SLA % (within SLA)"] || 0), 0) / kpiData.rto_performance.length).toFixed(1)
                      : 0}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown('revenue_trend')}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      kpiData.rto_performance.reduce((sum, r) => sum + (r["Revenue - Actual"] || 0), 0)
                    )}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown('rto_breakdown', { dataKey: 'rto_performance' })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Tax Defaulters</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(
                      kpiData.rto_performance.reduce((sum, r) => sum + (r["Tax Defaulter - Count"] || 0), 0)
                    )}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>RTO Performance Ranking (Top 20)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.slice(0, 20)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="RTO" type="category" width={120} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                    labelStyle={{ color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Bar dataKey="Citizen Service SLA % (within SLA)" fill="#10B981" />
                  <Bar dataKey="Grievance SLA % (within SLA)" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const FleetKPIs = () => {
    const data = kpiData.fleet_vehicles.slice(0, 12).reverse();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown('fleet_vehicles', { dataKey: 'fleet_vehicles' })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Vehicles Owned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(latestFleetVehicles["Vehicle Owned"] || 0)}
                  </p>
                </div>
                <Car className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown('fleet_vehicles', { dataKey: 'fleet_vehicles' })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Tax Due Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(latestFleetVehicles["Tax Due - Amount"] || 0)}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown('fleet_vehicles', { dataKey: 'fleet_vehicles' })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Insurance Due</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(latestFleetVehicles["Insurance Due - Count"] || 0)}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown('fleet_vehicles', { dataKey: 'fleet_vehicles' })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">e-Challan Due</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(latestFleetVehicles["e-Challan Due - Count"] || 0)}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fleet Compliance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Month" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                    labelStyle={{ color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="Tax Due - Count" stackId="1" stroke="#EF4444" fill="#EF4444" />
                  <Area type="monotone" dataKey="Insurance Due - Count" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                  <Area type="monotone" dataKey="PUCC Due - Count" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
                  <Area type="monotone" dataKey="Fitness Due - Count" stackId="1" stroke="#10B981" fill="#10B981" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6" data-testid="kpi-dashboard">
      {/* Header */}
      <ScrollReveal delay={0}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 gradient-text-animated">
              KPI Dashboard
            </h1>
            <p className="text-white/60 blur-in">
              Comprehensive performance metrics across State, RTO, and Fleet levels
            </p>
          </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          {availableMonths.length > 0 && (
            <Select value={selectedMonth || ""} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button 
            onClick={fetchKPIData} 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white liquid-button hover-lift magnetic-hover"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        </div>
      </ScrollReveal>

      {/* Tabs for different KPI levels */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7 bg-white/10">
          <TabsTrigger value="national" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            <Globe className="w-4 h-4 mr-2" />
            National
          </TabsTrigger>
          <TabsTrigger value="state" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            <Building2 className="w-4 h-4 mr-2" />
            State Level
          </TabsTrigger>
          <TabsTrigger value="rto" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            <MapPin className="w-4 h-4 mr-2" />
            RTO Level
          </TabsTrigger>
          <TabsTrigger value="fleet" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            <Car className="w-4 h-4 mr-2" />
            Fleet Level
          </TabsTrigger>
          <TabsTrigger value="policy" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            <Target className="w-4 h-4 mr-2" />
            Policy
          </TabsTrigger>
          <TabsTrigger value="executive" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            <Award className="w-4 h-4 mr-2" />
            Executive
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            <Brain className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="national" className="space-y-4 mt-6">
          {nationalKPIs && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>National Level KPIs (MoRTH)</CardTitle>
                  <p className="text-sm text-gray-500">Month: {nationalKPIs.month || "N/A"}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow kpi-card-enhanced hover-lift card-3d magnetic-hover"
            onClick={() => handleDrillDown('national_vehicle_registration')}
          >
            <CardContent className="p-5">
              <p className="text-gray-500 text-sm font-medium mb-1">Vehicle Registration Volume</p>
              <p className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={nationalKPIs.core_metrics?.vehicle_registration || 0} />
              </p>
              <p className="text-xs text-gray-400 mt-1">Click to view state breakdown</p>
            </CardContent>
          </Card>
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDrillDown('state_breakdown', { metric: 'license' })}
                    >
                      <CardContent className="p-5">
                        <p className="text-gray-500 text-sm font-medium mb-1">License Issuance Index</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(nationalKPIs.derived_kpis?.national_license_issuance_index || 0)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Click to view details</p>
                      </CardContent>
                    </Card>
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDrillDown('national_revenue')}
                    >
                      <CardContent className="p-5">
                        <p className="text-gray-500 text-sm font-medium mb-1">Transport Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(nationalKPIs.derived_kpis?.national_transport_revenue || 0)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Click to view state breakdown</p>
                      </CardContent>
                    </Card>
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDrillDown('service_delivery')}
                    >
                      <CardContent className="p-5">
                        <p className="text-gray-500 text-sm font-medium mb-1">Digital Adoption Ratio</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {nationalKPIs.derived_kpis?.digital_adoption_ratio || 0}%
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Click to view service details</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Core Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">LL Issued:</span>
                          <span className="font-semibold">{formatNumber(nationalKPIs.core_metrics?.ll_issued || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">DL Issued:</span>
                          <span className="font-semibold">{formatNumber(nationalKPIs.core_metrics?.dl_issued || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">e-Challan Issued:</span>
                          <span className="font-semibold">{formatNumber(nationalKPIs.core_metrics?.e_challan_issued || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Road Accidents:</span>
                          <span className="font-semibold">{formatNumber(nationalKPIs.core_metrics?.road_accidents || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Road Fatalities:</span>
                          <span className="font-semibold text-red-600">{formatNumber(nationalKPIs.core_metrics?.road_fatalities || 0)}</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Service Delivery</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Online Services:</span>
                          <span className="font-semibold">{formatNumber(nationalKPIs.derived_kpis?.online_service_count || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Faceless Services:</span>
                          <span className="font-semibold">{formatNumber(nationalKPIs.derived_kpis?.faceless_service_count || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Citizen SLA:</span>
                          <span className="font-semibold">{nationalKPIs.derived_kpis?.avg_citizen_sla || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Grievance SLA:</span>
                          <span className="font-semibold">{nationalKPIs.derived_kpis?.avg_grievance_sla || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">States Reporting:</span>
                          <span className="font-semibold">{nationalKPIs.state_count || 0}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="state" className="space-y-4 mt-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="service">Service Delivery</TabsTrigger>
              <TabsTrigger value="derived">Derived KPIs</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <StateGeneralKPIs />
            </TabsContent>
            <TabsContent value="service">
              <StateServiceKPIs />
            </TabsContent>
            <TabsContent value="derived">
              {stateDerivedKPIs && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDrillDown('service_delivery', { state: stateDerivedKPIs.state })}
                    >
                      <CardContent className="p-5">
                        <p className="text-gray-500 text-sm font-medium mb-1">Service Delivery Ranking</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stateDerivedKPIs.derived_kpis?.state_service_delivery_ranking || 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Click to view RTO breakdown</p>
                      </CardContent>
                    </Card>
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDrillDown('service_delivery', { state: stateDerivedKPIs.state })}
                    >
                      <CardContent className="p-5">
                        <p className="text-gray-500 text-sm font-medium mb-1">Faceless Adoption %</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stateDerivedKPIs.derived_kpis?.faceless_services_adoption_pct || 0}%
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Click to view details</p>
                      </CardContent>
                    </Card>
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDrillDown('revenue_trend', { state: stateDerivedKPIs.state })}
                    >
                      <CardContent className="p-5">
                        <p className="text-gray-500 text-sm font-medium mb-1">Revenue Contribution</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(stateDerivedKPIs.derived_kpis?.state_revenue_contribution || 0)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Click to view trend</p>
                      </CardContent>
                    </Card>
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDrillDown('enforcement', { state: stateDerivedKPIs.state })}
                    >
                      <CardContent className="p-5">
                        <p className="text-gray-500 text-sm font-medium mb-1">Enforcement Infrastructure</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(stateDerivedKPIs.derived_kpis?.enforcement_infrastructure_index || 0)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Click to view details</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-5">
                        <p className="text-gray-500 text-sm font-medium mb-1">License Efficiency</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stateDerivedKPIs.derived_kpis?.license_issuance_efficiency || 0}/day
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="rto" className="space-y-4 mt-6">
          <Tabs defaultValue="performance" className="w-full">
            <TabsList>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="derived">Derived KPIs</TabsTrigger>
            </TabsList>
            <TabsContent value="performance">
              <RTOPerformanceKPIs />
            </TabsContent>
            <TabsContent value="derived">
              {rtoDerivedKPIs && !rtoDerivedKPIs.error && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDrillDown('rto_breakdown', { state: rtoDerivedKPIs.state, rto: rtoDerivedKPIs.rto })}
                    >
                      <CardContent className="p-5">
                        <p className="text-gray-500 text-sm font-medium mb-1">Performance Index</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {rtoDerivedKPIs.derived_kpis?.rto_performance_index || 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Click to view details</p>
                      </CardContent>
                    </Card>
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDrillDown('rto_breakdown', { state: rtoDerivedKPIs.state, rto: rtoDerivedKPIs.rto })}
                    >
                      <CardContent className="p-5">
                        <p className="text-gray-500 text-sm font-medium mb-1">Revenue per RTO</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(rtoDerivedKPIs.derived_kpis?.revenue_per_rto || 0)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Click to view breakdown</p>
                      </CardContent>
                    </Card>
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDrillDown('enforcement', { state: rtoDerivedKPIs.state })}
                    >
                      <CardContent className="p-5">
                        <p className="text-gray-500 text-sm font-medium mb-1">Enforcement Effectiveness</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {rtoDerivedKPIs.derived_kpis?.enforcement_effectiveness || 0}%
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Click to view analysis</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-5">
                        <p className="text-gray-500 text-sm font-medium mb-1">Faceless Application %</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {rtoDerivedKPIs.derived_kpis?.faceless_application_pct || 0}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4 mt-6">
          <FleetKPIs />
        </TabsContent>

        <TabsContent value="policy" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Implementation Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <p className="text-gray-500 text-sm font-medium mb-2">ATS Count</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatNumber(
                        kpiData.state_policy.reduce((sum, r) => sum + (r["No. of ATS"] || 0), 0)
                      )}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <p className="text-gray-500 text-sm font-medium mb-2">Vehicles with VLTD</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatNumber(
                        kpiData.state_policy.reduce((sum, r) => sum + (r["Count of Vehicles fitted with VLTD"] || 0), 0)
                      )}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <p className="text-gray-500 text-sm font-medium mb-2">Vehicles with HSRP</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatNumber(
                        kpiData.state_policy.reduce((sum, r) => sum + (r["Count of Vehicles fitted with HSRP"] || 0), 0)
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executive" className="space-y-4 mt-6">
          {executiveKPIs && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Executive Summary KPIs</CardTitle>
                  <p className="text-sm text-gray-500">For CM / CS / MoRTH Review - Month: {executiveKPIs.month || "N/A"}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <Card 
                      className="bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDrillDown('national_vehicle_registration')}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <Globe className="w-5 h-5 text-blue-600" />
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-gray-600 text-xs font-medium mb-1">Mobility Growth Index</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {executiveKPIs.executive_kpis?.national_mobility_growth_index || 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Click to view breakdown</p>
                      </CardContent>
                    </Card>
                    <Card 
                      className="bg-gradient-to-br from-green-50 to-green-100 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDrillDown('service_delivery')}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <Zap className="w-5 h-5 text-green-600" />
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-gray-600 text-xs font-medium mb-1">Digital Governance Index</p>
                        <p className="text-2xl font-bold text-green-900">
                          {executiveKPIs.executive_kpis?.digital_governance_index || 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Click to view details</p>
                      </CardContent>
                    </Card>
                    <Card 
                      className="bg-gradient-to-br from-red-50 to-red-100 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDrillDown('enforcement')}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        </div>
                        <p className="text-gray-600 text-xs font-medium mb-1">Road Safety Risk Index</p>
                        <p className="text-2xl font-bold text-red-900">
                          {executiveKPIs.executive_kpis?.road_safety_risk_index || 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Click to view analysis</p>
                      </CardContent>
                    </Card>
                    <Card 
                      className="bg-gradient-to-br from-purple-50 to-purple-100 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDrillDown('enforcement')}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <Target className="w-5 h-5 text-purple-600" />
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-gray-600 text-xs font-medium mb-1">Enforcement ROI</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {formatCurrency(executiveKPIs.executive_kpis?.enforcement_roi_kpi || 0)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Click to view breakdown</p>
                      </CardContent>
                    </Card>
                    <Card 
                      className="bg-gradient-to-br from-orange-50 to-orange-100 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDrillDown('service_delivery')}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <CheckCircle className="w-5 h-5 text-orange-600" />
                          <TrendingUp className="w-4 h-4 text-orange-600" />
                        </div>
                        <p className="text-gray-600 text-xs font-medium mb-1">Service Efficiency Score</p>
                        <p className="text-2xl font-bold text-orange-900">
                          {executiveKPIs.executive_kpis?.citizen_service_efficiency_score || 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Click to view details</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Supporting Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Vehicles:</span>
                          <span className="font-semibold">{formatNumber(executiveKPIs.supporting_metrics?.total_vehicles || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Revenue:</span>
                          <span className="font-semibold">{formatCurrency(executiveKPIs.supporting_metrics?.total_revenue || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Road Accidents:</span>
                          <span className="font-semibold text-red-600">{formatNumber(executiveKPIs.supporting_metrics?.total_accidents || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Road Fatalities:</span>
                          <span className="font-semibold text-red-600">{formatNumber(executiveKPIs.supporting_metrics?.total_fatalities || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">e-Challans Issued:</span>
                          <span className="font-semibold">{formatNumber(executiveKPIs.supporting_metrics?.total_challans || 0)}</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Infrastructure & Services</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Online Services:</span>
                          <span className="font-semibold">{formatNumber(executiveKPIs.supporting_metrics?.total_online_services || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Faceless Services:</span>
                          <span className="font-semibold">{formatNumber(executiveKPIs.supporting_metrics?.total_faceless_services || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Enforcement Devices:</span>
                          <span className="font-semibold">{formatNumber(executiveKPIs.supporting_metrics?.total_enforcement_devices || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vehicles with VLTD:</span>
                          <span className="font-semibold">{formatNumber(executiveKPIs.supporting_metrics?.vehicles_with_vltd || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vehicles with HSRP:</span>
                          <span className="font-semibold">{formatNumber(executiveKPIs.supporting_metrics?.vehicles_with_hsrp || 0)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4 mt-6">
          {insightsData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium mb-1">Total Insights</p>
                        <p className="text-3xl font-bold">{insightsData.summary?.total_insights || 0}</p>
                      </div>
                      <Brain className="w-12 h-12 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium mb-1">Recommendations</p>
                        <p className="text-3xl font-bold">{insightsData.summary?.total_recommendations || 0}</p>
                      </div>
                      <Lightbulb className="w-12 h-12 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium mb-1">Action Items</p>
                        <p className="text-3xl font-bold">{insightsData.summary?.total_action_items || 0}</p>
                      </div>
                      <CheckCircle2 className="w-12 h-12 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Insights Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insightsData.insights && insightsData.insights.length > 0 ? (
                      insightsData.insights.map((insight, idx) => (
                        <Card 
                          key={idx}
                          className={`border-l-4 ${
                            insight.type === 'positive' ? 'border-green-500 bg-green-50' :
                            insight.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                            insight.type === 'critical' ? 'border-red-500 bg-red-50' :
                            'border-blue-500 bg-blue-50'
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {insight.type === 'positive' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
                              {insight.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />}
                              {insight.type === 'critical' && <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />}
                              {(!insight.type || insight.type === 'info') && <Brain className="w-5 h-5 text-blue-600 mt-0.5" />}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                                  <Badge variant="outline" className="text-xs">{insight.category}</Badge>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  <span className="font-medium">Metric: {insight.metric}</span>
                                  {insight.trend && (
                                    <span className="flex items-center gap-1">
                                      {insight.trend === 'up' ? (
                                        <TrendingUp className="w-3 h-3 text-green-600" />
                                      ) : insight.trend === 'down' ? (
                                        <TrendingDown className="w-3 h-3 text-red-600" />
                                      ) : null}
                                      {insight.trend}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No insights available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insightsData.recommendations && insightsData.recommendations.length > 0 ? (
                      insightsData.recommendations.map((rec, idx) => (
                        <Card key={idx} className="border-l-4 border-purple-500 bg-purple-50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Lightbulb className="w-5 h-5 text-purple-600 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      rec.priority === 'high' ? 'border-red-500 text-red-700' :
                                      rec.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                                      'border-gray-500 text-gray-700'
                                    }`}
                                  >
                                    {rec.priority} priority
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">{rec.category}</Badge>
                                </div>
                                <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  <span>Impact: <strong>{rec.impact}</strong></span>
                                  <span>Effort: <strong>{rec.effort}</strong></span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No recommendations available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Items Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insightsData.action_items && insightsData.action_items.length > 0 ? (
                      insightsData.action_items.map((action, idx) => (
                        <Card key={idx} className="border-l-4 border-orange-500 bg-orange-50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-orange-600 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-semibold text-gray-900">{action.title}</h4>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      action.priority === 'critical' ? 'border-red-500 text-red-700' :
                                      action.priority === 'high' ? 'border-orange-500 text-orange-700' :
                                      action.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                                      'border-gray-500 text-gray-700'
                                    }`}
                                  >
                                    {action.priority} priority
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">{action.category}</Badge>
                                </div>
                                <p className="text-sm text-gray-700 mb-3">{action.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Due: <strong>{action.due_date}</strong>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    Owner: <strong>{action.owner}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No action items available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                {loading ? "Loading insights..." : "No insights data available"}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Drill-down Dialog */}
      <Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {drillDownType === 'national_vehicle_registration' && 'National Vehicle Registration - State Breakdown'}
              {drillDownType === 'national_revenue' && 'National Revenue - State Breakdown'}
              {drillDownType === 'state_breakdown' && 'State Level Breakdown'}
              {drillDownType === 'rto_breakdown' && 'RTO Level Breakdown'}
              {drillDownType === 'service_delivery' && 'Service Delivery Analysis'}
              {drillDownType === 'revenue_trend' && 'Revenue Trend Analysis'}
              {drillDownType === 'enforcement' && 'Enforcement Analysis'}
              {drillDownType === 'fleet_vehicles' && 'Fleet Vehicles Analysis'}
              {!drillDownType && 'KPI Drill-down'}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Detailed breakdown and analysis of the selected KPI
            </DialogDescription>
          </DialogHeader>

          {drillDownLoading && (
            <div className="py-10 text-center text-gray-300">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
              <span className="text-white">Loading drill-down data...</span>
            </div>
          )}

          {!drillDownLoading && drillDownError && (
            <div className="py-10 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
              <p className="text-red-400 font-semibold mb-2">Error loading data</p>
              <p className="text-gray-400 text-sm">{drillDownError}</p>
            </div>
          )}

          {!drillDownLoading && !drillDownError && drillDownData && (
            <div className="space-y-6">
              {/* 1. CARDS/TILES SECTION */}
              {/* Summary Stats */}
              {drillDownData.summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(drillDownData.summary).map(([key, value]) => (
                    <Card key={key} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-300 mb-1">{key.replace(/_/g, ' ').toUpperCase()}</p>
                        <p className="text-xl font-bold text-white">
                          {typeof value === 'number' ? (value >= 1000000 ? formatCurrency(value) : formatNumber(value)) : value}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* RTO Data Details */}
              {drillDownData.rto_data && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">RTO Detailed Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="bg-gray-700 border-gray-600">
                        <CardContent className="p-4">
                          <p className="text-xs text-gray-300 mb-1">Vehicle Registration</p>
                          <p className="text-xl font-bold text-white">{formatNumber(drillDownData.rto_data["Vehicle Registration"] || 0)}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-700 border-gray-600">
                        <CardContent className="p-4">
                          <p className="text-xs text-gray-300 mb-1">Total Revenue</p>
                          <p className="text-xl font-bold text-white">{formatCurrency(drillDownData.rto_data["Revenue - Total"] || 0)}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-700 border-gray-600">
                        <CardContent className="p-4">
                          <p className="text-xs text-gray-300 mb-1">e-Challan Issued</p>
                          <p className="text-xl font-bold text-white">{formatNumber(drillDownData.rto_data["e-Challan Issued"] || 0)}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-700 border-gray-600">
                        <CardContent className="p-4">
                          <p className="text-xs text-gray-300 mb-1">Road Accidents</p>
                          <p className="text-xl font-bold text-red-400">{formatNumber(drillDownData.rto_data["Road Accidents"] || 0)}</p>
                        </CardContent>
                      </Card>
                    </div>
                    {drillDownData.performance_data && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-gray-700 border-gray-600">
                          <CardContent className="p-4">
                            <p className="text-xs text-gray-300 mb-1">Faceless Application %</p>
                            <p className="text-xl font-bold text-white">{drillDownData.performance_data["Faceless Application %"]?.toFixed(1) || 0}%</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-gray-700 border-gray-600">
                          <CardContent className="p-4">
                            <p className="text-xs text-gray-300 mb-1">Service SLA</p>
                            <p className="text-xl font-bold text-white">{drillDownData.performance_data["Citizen Service SLA % (within SLA)"]?.toFixed(1) || 0}%</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-gray-700 border-gray-600">
                          <CardContent className="p-4">
                            <p className="text-xs text-gray-300 mb-1">Grievance SLA</p>
                            <p className="text-xl font-bold text-white">{drillDownData.performance_data["Grievance SLA % (within SLA)"]?.toFixed(1) || 0}%</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Service Delivery Data */}
              {drillDownData.state_data && drillDownData.rto_breakdown && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Service Delivery Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {drillDownData.state_data.slice(0, 6).map((item, idx) => (
                        <Card key={idx} className="bg-gray-700 border-gray-600">
                          <CardContent className="p-4">
                            <p className="text-sm font-semibold mb-2 text-white">{item.State || item.Month}</p>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-300">Citizen SLA:</span>
                                <span className="font-semibold text-white">{item["Citizen Service SLA % (within SLA)"]?.toFixed(1) || 0}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Grievance SLA:</span>
                                <span className="font-semibold text-white">{item["Grievance SLA % (within SLA)"]?.toFixed(1) || 0}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Online Services:</span>
                                <span className="font-semibold text-white">{formatNumber(item["Online Service Count"] || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Faceless Services:</span>
                                <span className="font-semibold text-white">{formatNumber(item["Faceless Service Count"] || 0)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Fleet Vehicles Data */}
              {drillDownData.fleet_vehicles_data && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Fleet Vehicles & Drivers Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Card className="bg-gray-700 border-gray-600">
                        <CardHeader>
                          <CardTitle className="text-base text-white">Vehicles Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Total Vehicles:</span>
                            <span className="font-semibold text-white">{formatNumber(drillDownData.summary?.total_vehicles || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Tax Due Amount:</span>
                            <span className="font-semibold text-red-400">{formatCurrency(drillDownData.summary?.total_tax_due || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Insurance Due Count:</span>
                            <span className="font-semibold text-white">{formatNumber(drillDownData.summary?.total_insurance_due || 0)}</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-700 border-gray-600">
                        <CardHeader>
                          <CardTitle className="text-base text-white">Drivers Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Total Drivers:</span>
                            <span className="font-semibold text-white">{formatNumber(drillDownData.summary?.total_drivers || 0)}</span>
                          </div>
                          {drillDownData.fleet_drivers_data && drillDownData.fleet_drivers_data[0] && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-300">DL Due for Renewal:</span>
                                <span className="font-semibold text-white">{formatNumber(drillDownData.fleet_drivers_data[0]["DL Due for Renewal - Count"] || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">CL Due for Renewal:</span>
                                <span className="font-semibold text-white">{formatNumber(drillDownData.fleet_drivers_data[0]["CL Due for Renewal - Count"] || 0)}</span>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 2. GRAPHS/CHARTS SECTION - Moved after cards */}
              {/* Trend Chart */}
              {drillDownData.trend_data && drillDownData.trend_data.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">State-wise Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700">
                            <TableHead className="text-white">State</TableHead>
                            <TableHead className="text-right text-white">Vehicle Registration</TableHead>
                            <TableHead className="text-right text-white">LL Issued</TableHead>
                            <TableHead className="text-right text-white">DL Issued</TableHead>
                            <TableHead className="text-right text-white">Revenue</TableHead>
                            <TableHead className="text-right text-white">Accidents</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {drillDownData.state_breakdown && Array.isArray(drillDownData.state_breakdown) && drillDownData.state_breakdown.map((item, idx) => (
                            <TableRow 
                              key={idx} 
                              className="cursor-pointer hover:bg-gray-700 border-gray-700"
                              onClick={() => handleDrillDown('state_breakdown', { state: item.State })}
                            >
                              <TableCell className="font-medium text-white">{item.State}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["Vehicle Registration"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["LL Issued"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["DL Issued"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatCurrency(item["Revenue - Total"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["Road Accidents"] || 0)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Trend Chart */}
              {drillDownData.trend_data && drillDownData.trend_data.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Trend Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        {drillDownData.trend_data[0]?.revenue_total ? (
                          <AreaChart data={drillDownData.trend_data}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorTaxes" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                            <XAxis dataKey="month" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                              labelStyle={{ color: '#F3F4F6' }}
                              itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Legend wrapperStyle={{ color: '#F3F4F6' }} />
                            <Area type="monotone" dataKey="revenue_total" stroke="#3B82F6" fill="url(#colorRevenue)" name="Total Revenue" />
                            <Area type="monotone" dataKey="revenue_taxes" stroke="#10B981" fill="url(#colorTaxes)" name="Taxes" />
                          </AreaChart>
                        ) : drillDownData.trend_data[0]?.citizen_sla !== undefined ? (
                          <LineChart data={drillDownData.trend_data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                            <XAxis dataKey="month" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                              labelStyle={{ color: '#F3F4F6' }}
                              itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Legend wrapperStyle={{ color: '#F3F4F6' }} />
                            <Line type="monotone" dataKey="citizen_sla" stroke="#10B981" strokeWidth={2} name="Citizen SLA %" />
                            <Line type="monotone" dataKey="grievance_sla" stroke="#3B82F6" strokeWidth={2} name="Grievance SLA %" />
                          </LineChart>
                        ) : drillDownData.trend_data[0]?.e_challan !== undefined ? (
                          <AreaChart data={drillDownData.trend_data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                    labelStyle={{ color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                            <Legend />
                            <Area yAxisId="left" type="monotone" dataKey="e_challan" stroke="#F97316" fill="#F97316" fillOpacity={0.3} name="e-Challan" />
                            <Area yAxisId="right" type="monotone" dataKey="accidents" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} name="Accidents" />
                          </AreaChart>
                        ) : drillDownData.trend_data[0]?.vehicles_owned !== undefined ? (
                          <AreaChart data={drillDownData.trend_data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                            <XAxis dataKey="month" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                              labelStyle={{ color: '#F3F4F6' }}
                              itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Legend wrapperStyle={{ color: '#F3F4F6' }} />
                            <Area type="monotone" dataKey="vehicles_owned" stackId="1" stroke="#F97316" fill="#F97316" name="Vehicles Owned" />
                            <Area type="monotone" dataKey="tax_due_count" stackId="2" stroke="#EF4444" fill="#EF4444" name="Tax Due" />
                            <Area type="monotone" dataKey="insurance_due_count" stackId="2" stroke="#3B82F6" fill="#3B82F6" name="Insurance Due" />
                            <Area type="monotone" dataKey="pucc_due_count" stackId="2" stroke="#F59E0B" fill="#F59E0B" name="PUCC Due" />
                            <Area type="monotone" dataKey="fitness_due_count" stackId="2" stroke="#10B981" fill="#10B981" name="Fitness Due" />
                          </AreaChart>
                        ) : (
                          <AreaChart data={drillDownData.trend_data}>
                            <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                            <XAxis dataKey="month" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                              labelStyle={{ color: '#F3F4F6' }}
                              itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Legend wrapperStyle={{ color: '#F3F4F6' }} />
                            <Area type="monotone" dataKey="value" stroke="#F97316" fill="url(#colorValue)" />
                          </AreaChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Service Delivery Data */}
              {drillDownData.state_data && drillDownData.rto_breakdown && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Service Delivery Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {drillDownData.state_data.slice(0, 6).map((item, idx) => (
                        <Card key={idx} className="bg-gray-700 border-gray-600">
                          <CardContent className="p-4">
                            <p className="text-sm font-semibold mb-2 text-white">{item.State || item.Month}</p>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-300">Citizen SLA:</span>
                                <span className="font-semibold text-white">{item["Citizen Service SLA % (within SLA)"]?.toFixed(1) || 0}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Grievance SLA:</span>
                                <span className="font-semibold text-white">{item["Grievance SLA % (within SLA)"]?.toFixed(1) || 0}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Online Services:</span>
                                <span className="font-semibold text-white">{formatNumber(item["Online Service Count"] || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Faceless Services:</span>
                                <span className="font-semibold text-white">{formatNumber(item["Faceless Service Count"] || 0)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* RTO Data Details */}
              {drillDownData.rto_data && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">RTO Detailed Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="bg-gray-700 border-gray-600">
                        <CardContent className="p-4">
                          <p className="text-xs text-gray-300 mb-1">Vehicle Registration</p>
                          <p className="text-xl font-bold text-white">{formatNumber(drillDownData.rto_data["Vehicle Registration"] || 0)}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-700 border-gray-600">
                        <CardContent className="p-4">
                          <p className="text-xs text-gray-300 mb-1">Total Revenue</p>
                          <p className="text-xl font-bold text-white">{formatCurrency(drillDownData.rto_data["Revenue - Total"] || 0)}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-700 border-gray-600">
                        <CardContent className="p-4">
                          <p className="text-xs text-gray-300 mb-1">e-Challan Issued</p>
                          <p className="text-xl font-bold text-white">{formatNumber(drillDownData.rto_data["e-Challan Issued"] || 0)}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-700 border-gray-600">
                        <CardContent className="p-4">
                          <p className="text-xs text-gray-300 mb-1">Road Accidents</p>
                          <p className="text-xl font-bold text-red-400">{formatNumber(drillDownData.rto_data["Road Accidents"] || 0)}</p>
                        </CardContent>
                      </Card>
                    </div>
                    {drillDownData.performance_data && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-gray-700 border-gray-600">
                          <CardContent className="p-4">
                            <p className="text-xs text-gray-300 mb-1">Faceless Application %</p>
                            <p className="text-xl font-bold text-white">{drillDownData.performance_data["Faceless Application %"]?.toFixed(1) || 0}%</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-gray-700 border-gray-600">
                          <CardContent className="p-4">
                            <p className="text-xs text-gray-300 mb-1">Service SLA</p>
                            <p className="text-xl font-bold text-white">{drillDownData.performance_data["Citizen Service SLA % (within SLA)"]?.toFixed(1) || 0}%</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-gray-700 border-gray-600">
                          <CardContent className="p-4">
                            <p className="text-xs text-gray-300 mb-1">Grievance SLA</p>
                            <p className="text-xl font-bold text-white">{drillDownData.performance_data["Grievance SLA % (within SLA)"]?.toFixed(1) || 0}%</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 3. INSIGHTS, RECOMMENDATIONS & ACTION ITEMS SECTION */}
              {drillDownInsights && (
                <div className="space-y-6">
                  {/* Insights Section */}
                  {drillDownInsights.insights && drillDownInsights.insights.length > 0 && (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Brain className="w-5 h-5 text-primary" />
                          Key Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {drillDownInsights.insights && Array.isArray(drillDownInsights.insights) && drillDownInsights.insights.map((insight, idx) => (
                            <Card 
                              key={idx}
                              className={`border-l-4 ${
                                insight.type === 'positive' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                                insight.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                                insight.type === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                                'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  {insight.type === 'positive' && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />}
                                  {insight.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />}
                                  {insight.type === 'critical' && <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />}
                                  {(!insight.type || insight.type === 'info') && <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h4>
                                      {insight.category && <Badge variant="outline" className="text-xs">{insight.category}</Badge>}
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{insight.description}</p>
                                    {insight.metric && (
                                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Metric: {insight.metric}</span>
                                        {insight.trend && (
                                          <span className="flex items-center gap-1">
                                            {insight.trend === 'up' ? (
                                              <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                                            ) : insight.trend === 'down' ? (
                                              <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
                                            ) : null}
                                            {insight.trend}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recommendations Section */}
                  {drillDownInsights.recommendations && drillDownInsights.recommendations.length > 0 && (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Lightbulb className="w-5 h-5 text-primary" />
                          Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {drillDownInsights.recommendations && Array.isArray(drillDownInsights.recommendations) && drillDownInsights.recommendations.map((rec, idx) => (
                            <Card key={idx} className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                                      {rec.priority && (
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs ${
                                            rec.priority === 'high' ? 'border-red-500 text-red-700 dark:text-red-400' :
                                            rec.priority === 'medium' ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400' :
                                            'border-gray-500 text-gray-700 dark:text-gray-400'
                                          }`}
                                        >
                                          {rec.priority} priority
                                        </Badge>
                                      )}
                                      {rec.category && <Badge variant="outline" className="text-xs">{rec.category}</Badge>}
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{rec.description}</p>
                                    {(rec.impact || rec.effort) && (
                                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                        {rec.impact && <span>Impact: <strong>{rec.impact}</strong></span>}
                                        {rec.effort && <span>Effort: <strong>{rec.effort}</strong></span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Items Section */}
                  {drillDownInsights.action_items && drillDownInsights.action_items.length > 0 && (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                          Action Items
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {drillDownInsights.action_items && Array.isArray(drillDownInsights.action_items) && drillDownInsights.action_items.map((action, idx) => (
                            <Card key={idx} className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <CheckCircle2 className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <h4 className="font-semibold text-gray-900 dark:text-white">{action.title}</h4>
                                      {action.priority && (
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs ${
                                            action.priority === 'critical' ? 'border-red-500 text-red-700 dark:text-red-400' :
                                            action.priority === 'high' ? 'border-orange-500 text-orange-700 dark:text-orange-400' :
                                            action.priority === 'medium' ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400' :
                                            'border-gray-500 text-gray-700 dark:text-gray-400'
                                          }`}
                                        >
                                          {action.priority} priority
                                        </Badge>
                                      )}
                                      {action.category && <Badge variant="outline" className="text-xs">{action.category}</Badge>}
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{action.description}</p>
                                    {(action.due_date || action.owner) && (
                                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 flex-wrap">
                                        {action.due_date && (
                                          <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Due: <strong>{action.due_date}</strong>
                                          </span>
                                        )}
                                        {action.owner && (
                                          <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            Owner: <strong>{action.owner}</strong>
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* 4. TABLES SECTION */}
              {/* State Breakdown Table */}
              {drillDownData.state_breakdown && Array.isArray(drillDownData.state_breakdown) && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">State-wise Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700">
                            <TableHead className="text-white">State</TableHead>
                            <TableHead className="text-right text-white">Vehicle Registration</TableHead>
                            <TableHead className="text-right text-white">LL Issued</TableHead>
                            <TableHead className="text-right text-white">DL Issued</TableHead>
                            <TableHead className="text-right text-white">Revenue</TableHead>
                            <TableHead className="text-right text-white">Accidents</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {drillDownData.state_breakdown && Array.isArray(drillDownData.state_breakdown) && drillDownData.state_breakdown.map((item, idx) => (
                            <TableRow 
                              key={idx} 
                              className="cursor-pointer hover:bg-gray-700 border-gray-700"
                              onClick={() => handleDrillDown('state_breakdown', { state: item.State })}
                            >
                              <TableCell className="font-medium text-white">{item.State}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["Vehicle Registration"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["LL Issued"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["DL Issued"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatCurrency(item["Revenue - Total"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["Road Accidents"] || 0)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* RTO Breakdown */}
              {drillDownData.rto_breakdown && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">RTO-wise Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700">
                            <TableHead className="text-white">RTO</TableHead>
                            <TableHead className="text-white">State</TableHead>
                            <TableHead className="text-right text-white">Vehicle Registration</TableHead>
                            <TableHead className="text-right text-white">Revenue</TableHead>
                            <TableHead className="text-right text-white">Service SLA %</TableHead>
                            <TableHead className="text-right text-white">Grievance SLA %</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {drillDownData.rto_breakdown.slice(0, 20).map((item, idx) => (
                            <TableRow 
                              key={idx} 
                              className="cursor-pointer hover:bg-gray-700 border-gray-700"
                              onClick={() => handleDrillDown('rto_breakdown', { state: item.State, rto: item.RTO })}
                            >
                              <TableCell className="font-medium text-white">{item.RTO}</TableCell>
                              <TableCell className="text-white">{item.State}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["Vehicle Registration"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatCurrency(item["Revenue - Total"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{item["Citizen Service SLA % (within SLA)"]?.toFixed(1) || 0}%</TableCell>
                              <TableCell className="text-right text-white">{item["Grievance SLA % (within SLA)"]?.toFixed(1) || 0}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Summary Stats */}
              {drillDownData.summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(drillDownData.summary).map(([key, value]) => (
                    <Card key={key} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-300 mb-1">{key.replace(/_/g, ' ').toUpperCase()}</p>
                        <p className="text-xl font-bold text-white">
                          {typeof value === 'number' ? (value >= 1000000 ? formatCurrency(value) : formatNumber(value)) : value}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Fleet Vehicles Data */}
              {drillDownData.fleet_vehicles_data && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Fleet Vehicles & Drivers Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Card className="bg-gray-700 border-gray-600">
                        <CardHeader>
                          <CardTitle className="text-base text-white">Vehicles Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Total Vehicles:</span>
                            <span className="font-semibold text-white">{formatNumber(drillDownData.summary?.total_vehicles || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Tax Due Amount:</span>
                            <span className="font-semibold text-red-400">{formatCurrency(drillDownData.summary?.total_tax_due || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Insurance Due Count:</span>
                            <span className="font-semibold text-white">{formatNumber(drillDownData.summary?.total_insurance_due || 0)}</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-700 border-gray-600">
                        <CardHeader>
                          <CardTitle className="text-base text-white">Drivers Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Total Drivers:</span>
                            <span className="font-semibold text-white">{formatNumber(drillDownData.summary?.total_drivers || 0)}</span>
                          </div>
                          {drillDownData.fleet_drivers_data && drillDownData.fleet_drivers_data[0] && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-300">DL Due for Renewal:</span>
                                <span className="font-semibold text-white">{formatNumber(drillDownData.fleet_drivers_data[0]["DL Due for Renewal - Count"] || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">CL Due for Renewal:</span>
                                <span className="font-semibold text-white">{formatNumber(drillDownData.fleet_drivers_data[0]["CL Due for Renewal - Count"] || 0)}</span>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Raw Data Table (fallback) */}
              {drillDownData.data && drillDownData.data.length > 0 && !drillDownData.state_breakdown && !drillDownData.rto_breakdown && !drillDownData.fleet_vehicles_data && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Detailed Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto max-h-96">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700">
                            {drillDownData.data && Array.isArray(drillDownData.data) && drillDownData.data.length > 0 && Object.keys(drillDownData.data[0] || {}).slice(0, 8).map((key) => (
                              <TableHead key={key} className="text-white">{key}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {drillDownData.data && Array.isArray(drillDownData.data) && drillDownData.data.slice(0, 50).map((item, idx) => (
                            <TableRow key={idx} className="border-gray-700">
                              {item && typeof item === 'object' && Object.entries(item || {}).slice(0, 8).map(([key, value]) => (
                                <TableCell key={key} className="text-white">
                                  {typeof value === 'number' ? formatNumber(value) : String(value || '-')}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!drillDownLoading && !drillDownError && !drillDownData && (
            <div className="py-10 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400 font-semibold mb-2">No data available</p>
              <p className="text-gray-500 text-sm">No data available for this drill-down</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KPIDashboard;

