import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, TrendingDown, Car, FileText, Users, AlertTriangle, 
  Clock, CheckCircle, BarChart3, RefreshCw, Download, Settings,
  Building2, MapPin, Shield, Zap, Target, Activity, Globe, Award, Brain,
  Lightbulb, CheckCircle2, AlertCircle, ArrowRight, Calendar, User,
  DollarSign
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

const COLORS = ['#F97316', '#3B82F6', '#0D9488', '#EA580C', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B'];

const FleetAnalytics = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("compliance");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  
  const [fleetKPIData, setFleetKPIData] = useState([]);
  const [fleetAdvancedData, setFleetAdvancedData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  
  // Drill-down state
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownData, setDrillDownData] = useState(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState("");
  const [drillDownDescription, setDrillDownDescription] = useState("");
  const [drillDownInsights, setDrillDownInsights] = useState(null);
  const [drillDownError, setDrillDownError] = useState(null);

  const fetchFleetData = useCallback(async () => {
    setLoading(true);
    try {
      const state = searchParams.get("state_cd") || null;
      const month = selectedMonth || null;
      
      const [fleetVehRes, fleetAdvancedRes, insightsRes] = await Promise.all([
        axios.get(`${API}/kpi/fleet/vehicles`, { params: { state, month } }),
        axios.get(`${API}/kpi/advanced/fleet-compliance`, { params: { state, month } }),
        axios.get(`${API}/kpi/insights`, { params: { state, month, section: 'fleet' } }).catch(() => ({ data: null }))
      ]);

      setFleetKPIData(fleetVehRes.data?.data || []);
      setFleetAdvancedData(fleetAdvancedRes.data);
      setInsightsData(insightsRes.data);

      // Extract months from fleet data
      if (fleetVehRes.data?.data?.length > 0) {
        const months = [...new Set(fleetVehRes.data.data.map(d => d.Month).filter(Boolean))].sort().reverse();
        setAvailableMonths(months);
        if (!selectedMonth && months.length > 0) {
          setSelectedMonth(months[0]);
        }
      }

      toast.success("Fleet data loaded");
    } catch (error) {
      console.error("Error fetching fleet data:", error);
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;
      toast.error(
        `Failed to fetch fleet data${status ? ` (HTTP ${status})` : ""}${detail ? `: ${detail}` : ""}`
      );
    } finally {
      setLoading(false);
    }
  }, [searchParams, selectedMonth]);

  useEffect(() => {
    fetchFleetData();
  }, [fetchFleetData]);

  // Calculate summary metrics from latest data
  const getLatestData = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return {};
    const sorted = [...dataArray].sort((a, b) => {
      const monthA = a?.Month || '';
      const monthB = b?.Month || '';
      return monthB.localeCompare(monthA);
    });
    return sorted[0] || {};
  };

  const latestFleetVehicles = getLatestData(fleetKPIData);

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return "₹0";
    if (typeof value === 'string') {
      value = parseFloat(value.replace(/[^0-9.-]/g, ''));
      if (isNaN(value)) return "₹0";
    }
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(2)}K`;
    return `₹${value.toFixed(2)}`;
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    if (typeof num === 'string') {
      num = parseFloat(num.replace(/[^0-9.-]/g, ''));
      if (isNaN(num)) return "0";
    }
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getKPIStatus = (value, threshold = 50) => {
    if (value >= threshold) return { color: "bg-green-500", text: "Good" };
    if (value >= threshold * 0.7) return { color: "bg-yellow-500", text: "Fair" };
    return { color: "bg-red-500", text: "Poor" };
  };

  const handleDrillDown = useCallback(async (type, title, description, params = {}) => {
    setDrillDownOpen(true);
    setDrillDownTitle(title);
    setDrillDownDescription(description);
    setDrillDownLoading(true);
    setDrillDownData(null);
    setDrillDownError(null);

    try {
      const state = searchParams.get("state_cd") || null;
      const month = selectedMonth || null;

      const [drillDownResponse, insightsResponse] = await Promise.allSettled([
        (async () => {
          let response;
          switch (type) {
            case 'fleet_vehicles':
              response = await axios.get(`${API}/kpi/drilldown/fleet-vehicles`, { params: { month, state } });
              break;
            case 'fleet_compliance':
              response = await axios.get(`${API}/kpi/drilldown/fleet-vehicles`, { params: { month, state } });
              break;
            default:
              response = { data: { type, data: fleetKPIData || [] } };
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
  }, [selectedMonth, searchParams, fleetKPIData]);

  const KPICard = ({ title, value, unit = "", icon: Icon, status, description, drillDownType, drillDownParams = {}, trendData, maxValue, showProgress = false }) => {
    const statusInfo = status ? getKPIStatus(value) : null;
    const numValue = typeof value === "number" ? value : (typeof value === "string" ? parseFloat(value.replace(/[^0-9.-]/g, '')) : 0);
    const isPercentage = unit === "%" || title.toLowerCase().includes("score") || title.toLowerCase().includes("index") || title.toLowerCase().includes("ratio");
    const progressValue = isPercentage ? Math.min(Math.max(numValue, 0), 100) : (maxValue ? (numValue / maxValue * 100) : 0);
    
    return (
      <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer kpi-card-enhanced hover-lift card-3d magnetic-hover ripple-effect"
        onClick={() => drillDownType && handleDrillDown(drillDownType, title, description, drillDownParams)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">{title}</CardTitle>
          {Icon && <Icon className="h-4 w-4 text-gray-600 dark:text-gray-300 floating-particle" />}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === "number" ? (
              <AnimatedCounter value={value} suffix={unit} />
            ) : (
              <>
                {value}
                {unit && <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">{unit}</span>}
              </>
            )}
          </div>
          
          {(showProgress || isPercentage) && !isNaN(progressValue) && (
            <div className="mt-3">
              <Progress 
                value={progressValue} 
                className="h-2"
                style={{
                  background: 'rgba(0,0,0,0.1)',
                }}
              />
            </div>
          )}
          
          {statusInfo && (
            <div className="flex items-center mt-2">
              <div className={`w-2 h-2 rounded-full ${statusInfo.color} mr-2 pulse-ring`} />
              <span className="text-xs text-gray-700 dark:text-gray-200 font-medium">{statusInfo.text}</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {description}
              {drillDownType && <span className="text-blue-600 dark:text-blue-400 ml-1 sparkle font-medium">(Click for details)</span>}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  // Fleet Level KPIs Component (from KPIDashboard)
  const FleetLevelKPIs = () => {
    const data = fleetKPIData.slice(0, 12).reverse();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDrillDown('fleet_vehicles', 'Fleet Vehicles', 'View fleet vehicles breakdown', { dataKey: 'fleet_vehicles' })}
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
            onClick={() => handleDrillDown('fleet_vehicles', 'Tax Due', 'View tax due details', { dataKey: 'fleet_vehicles' })}
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
            onClick={() => handleDrillDown('fleet_vehicles', 'Insurance Due', 'View insurance due details', { dataKey: 'fleet_vehicles' })}
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
            onClick={() => handleDrillDown('fleet_vehicles', 'e-Challan Due', 'View e-challan due details', { dataKey: 'fleet_vehicles' })}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen animated-gradient">
        <div className="text-center space-y-4">
          <div className="relative">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary glow-effect" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="text-white gradient-text-animated text-lg">Loading Fleet Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="fleet-analytics">
      {/* Header */}
      <ScrollReveal delay={0}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 gradient-text-animated">
              Fleet Analytics
            </h1>
            <p className="text-white/60 blur-in">
              Comprehensive fleet compliance, risk, and performance metrics
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
              onClick={fetchFleetData} 
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/10">
          <TabsTrigger value="compliance" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            <Shield className="w-4 h-4 mr-2" />
            Fleet Compliance & Risk
          </TabsTrigger>
          <TabsTrigger value="level" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
            <Car className="w-4 h-4 mr-2" />
            Fleet Level KPIs
          </TabsTrigger>
        </TabsList>

        {/* Fleet Compliance & Risk Tab (from AdvancedKPIDashboard) */}
        <TabsContent value="compliance" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Car className="h-5 w-5 text-primary" />
                Fleet Compliance & Risk KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fleetAdvancedData ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard
                      title="Fleet Compliance Score"
                      value={fleetAdvancedData.kpis?.fleet_compliance_score}
                      unit="%"
                      icon={CheckCircle}
                      status={true}
                      description="Legal compliance"
                      drillDownType="fleet_compliance"
                      showProgress={true}
                    />
                    <KPICard
                      title="Revenue at Risk (Fleet)"
                      value={formatCurrency(fleetAdvancedData.kpis?.revenue_at_risk_fleet)}
                      icon={DollarSign}
                      description="Uncollected revenue"
                      drillDownType="fleet_compliance"
                    />
                    <KPICard
                      title="Fitness Risk Index"
                      value={fleetAdvancedData.kpis?.fitness_risk_index}
                      unit="%"
                      icon={AlertTriangle}
                      description="Road safety risk"
                      drillDownType="fleet_compliance"
                      showProgress={true}
                    />
                    <KPICard
                      title="Insurance Exposure Score"
                      value={fleetAdvancedData.kpis?.insurance_exposure_score}
                      unit="%"
                      icon={Shield}
                      description="Accident liability"
                      drillDownType="fleet_compliance"
                      showProgress={true}
                    />
                  </div>
                  
                  {/* Fleet Dues Breakdown */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">Fleet Dues Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { 
                              name: 'Tax Due', 
                              value: fleetAdvancedData.supporting_metrics?.tax_due_amount || 0,
                              fill: '#3B82F6'
                            },
                            { 
                              name: 'Insurance Due', 
                              value: fleetAdvancedData.supporting_metrics?.insurance_due_amount || 0,
                              fill: '#10B981'
                            },
                            { 
                              name: 'Fitness Due', 
                              value: fleetAdvancedData.supporting_metrics?.fitness_due_amount || 0,
                              fill: '#F59E0B'
                            },
                            { 
                              name: 'PUCC Due', 
                              value: fleetAdvancedData.supporting_metrics?.pucc_due_amount || 0,
                              fill: '#8B5CF6'
                            },
                            { 
                              name: 'Challan Due', 
                              value: fleetAdvancedData.supporting_metrics?.challan_due_amount || 0,
                              fill: '#EF4444'
                            }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                              labelStyle={{ color: '#F3F4F6' }}
                              itemStyle={{ color: '#F3F4F6' }}
                              formatter={(value) => formatCurrency(value)}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fleet Level KPIs Tab (from KPIDashboard) */}
        <TabsContent value="level" className="space-y-4 mt-6">
          <FleetLevelKPIs />
        </TabsContent>
      </Tabs>

      {/* Drill-Down Dialog */}
      <Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">{drillDownTitle}</DialogTitle>
            <DialogDescription className="text-gray-300">{drillDownDescription}</DialogDescription>
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
              {/* Summary Stats */}
              {drillDownData.summary && typeof drillDownData.summary === 'object' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(drillDownData.summary || {}).map(([key, value]) => (
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

              {/* Supporting Metrics */}
              {drillDownData.supporting_metrics && typeof drillDownData.supporting_metrics === 'object' && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Supporting Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(drillDownData.supporting_metrics || {}).map(([key, value]) => (
                        <Card key={key} className="bg-gray-700 border-gray-600">
                          <CardContent className="p-4">
                            <p className="text-xs text-gray-300 mb-1">{key.replace(/_/g, ' ').toUpperCase()}</p>
                            <p className="text-xl font-bold text-white">
                              {typeof value === 'number' ? (value >= 1000000 ? formatCurrency(value) : formatNumber(value)) : value}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
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
                        <AreaChart data={drillDownData.trend_data}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
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
                          {drillDownData.trend_data[0]?.value !== undefined && (
                            <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="url(#colorValue)" name="Value" />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Data Table */}
              {drillDownData.data && Array.isArray(drillDownData.data) && drillDownData.data.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Detailed Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700">
                            {Object.keys(drillDownData.data[0] || {}).map((key) => (
                              <TableHead key={key} className="text-white">{key}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {drillDownData.data.slice(0, 20).map((item, idx) => (
                            <TableRow key={idx} className="border-gray-700">
                              {Object.entries(item || {}).map(([key, value]) => (
                                <TableCell key={key} className="text-white">
                                  {typeof value === 'number' ? (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('amount') ? formatCurrency(value) : formatNumber(value)) : String(value || '-')}
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

              {/* Insights */}
              {drillDownInsights && drillDownInsights.insights && Array.isArray(drillDownInsights.insights) && drillDownInsights.insights.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Brain className="w-5 h-5 text-primary" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {drillDownInsights.insights.map((insight, idx) => (
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
            </div>
          )}
          {!drillDownLoading && !drillDownError && !drillDownData && (
            <div className="py-10 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400 font-semibold mb-2">No data available</p>
              <p className="text-gray-500 text-sm">No drill-down data available.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FleetAnalytics;

