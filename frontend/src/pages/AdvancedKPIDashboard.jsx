import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, TrendingDown, Car, FileText, Users, AlertTriangle, 
  Clock, CheckCircle, BarChart3, RefreshCw, Download, Settings,
  Building2, MapPin, Shield, Zap, Target, Activity, Globe, Award,
  Brain, DollarSign, Gauge, AlertCircle, TrendingUp as TrendUpIcon,
  Lightbulb, CheckCircle2, Calendar, User
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
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
import AnimatedBackground from "@/components/AnimatedBackground";

const COLORS = ['#F97316', '#3B82F6', '#0D9488', '#EA580C', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B'];

const AdvancedKPIDashboard = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mobility");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  
  const [kpiData, setKpiData] = useState({
    mobility: null,
    digital: null,
    revenue: null,
    enforcement: null,
    policy: null,
    rto: null,
    internal: null,
    fleet: null,
    driver: null,
    super: null,
  });
  const [insightsData, setInsightsData] = useState(null);

  // Drill-down state
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownData, setDrillDownData] = useState(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState("");
  const [drillDownDescription, setDrillDownDescription] = useState("");
  const [drillDownInsights, setDrillDownInsights] = useState(null);
  const [drillDownError, setDrillDownError] = useState(null);

  const fetchKPIData = useCallback(async () => {
    setLoading(true);
    try {
      const state = searchParams.get("state_cd") || null;
      const month = selectedMonth || null;
      const rto = searchParams.get("rto") || null;
      
      const [
        mobilityRes, digitalRes, revenueRes, enforcementRes, policyRes,
        rtoRes, internalRes, fleetRes, driverRes, insightsRes
      ] = await Promise.all([
        axios.get(`${API}/kpi/advanced/mobility-growth`, { params: { state, month } }),
        axios.get(`${API}/kpi/advanced/digital-governance`, { params: { state, month } }),
        axios.get(`${API}/kpi/advanced/revenue-intelligence`, { params: { state, month } }),
        axios.get(`${API}/kpi/advanced/enforcement-safety`, { params: { state, month } }),
        axios.get(`${API}/kpi/advanced/policy-effectiveness`, { params: { state, month } }),
        axios.get(`${API}/kpi/advanced/rto-performance`, { params: { state, rto, month } }),
        axios.get(`${API}/kpi/advanced/internal-efficiency`, { params: { state, rto, month } }),
        axios.get(`${API}/kpi/advanced/fleet-compliance`, { params: { state, month } }),
        axios.get(`${API}/kpi/advanced/driver-risk`, { params: { state, month } }),
        axios.get(`${API}/kpi/advanced/insights`, { params: { state, month } }),
      ]);

      setKpiData({
        mobility: mobilityRes.data,
        digital: digitalRes.data,
        revenue: revenueRes.data,
        enforcement: enforcementRes.data,
        policy: policyRes.data,
        rto: rtoRes.data,
        internal: internalRes.data,
        fleet: fleetRes.data,
        driver: driverRes.data,
      });
      // Ensure insightsData has proper structure
      setInsightsData(insightsRes.data || {
        insights: [],
        recommendations: [],
        action_items: [],
        summary: {
          total_insights: 0,
          total_recommendations: 0,
          total_action_items: 0
        }
      });

      // Extract months from any response
      if (mobilityRes.data?.month) {
        setSelectedMonth(mobilityRes.data.month);
      }
    } catch (error) {
      console.error("Error fetching advanced KPI data:", error);
      const status = error?.response?.status;
      const url = error?.config?.url;
      const msg = error?.message || "Request failed";
      const detail = error?.response?.data?.detail || "";
      toast.error(`Failed to load advanced KPIs${status ? ` (HTTP ${status})` : ""}: ${msg}${detail ? ` - ${detail}` : ""}${url ? ` — ${url}` : ""}`);
      
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

  const formatNumber = (num) => {
    if (num === null || num === undefined) return "N/A";
    if (typeof num === "string") return num;
    if (Math.abs(num) >= 10000000) return `${(num / 10000000).toFixed(2)}Cr`;
    if (Math.abs(num) >= 100000) return `${(num / 100000).toFixed(2)}L`;
    if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatCurrency = (num) => {
    if (num === null || num === undefined) return "₹0";
    return `₹${formatNumber(num)}`;
  };

  const getKPIStatus = (value, threshold = 50) => {
    if (value >= threshold) return { color: "bg-green-500", text: "Good" };
    if (value >= threshold * 0.7) return { color: "bg-yellow-500", text: "Fair" };
    return { color: "bg-red-500", text: "Poor" };
  };

  // Drill-down handler
  const handleDrillDown = useCallback(async (type, title, description, params = {}) => {
    setDrillDownOpen(true);
    setDrillDownTitle(title);
    setDrillDownDescription(description);
    setDrillDownLoading(true);
    setDrillDownData(null);
    setDrillDownInsights(null);
    setDrillDownError(null);

    try {
      const state = searchParams.get("state_cd") || null;
      const month = selectedMonth || null;
      const rto = searchParams.get("rto") || null;

      // Fetch drill-down data and insights in parallel
      const [drillDownResponse, insightsResponse] = await Promise.allSettled([
        (async () => {
          let response;
          switch (type) {
            case 'mobility_growth':
              // Use national vehicle registration endpoint to get state breakdown
              if (params.metric === 'vehicle_registration') {
                response = await axios.get(`${API}/kpi/drilldown/national/vehicle-registration`, { 
                  params: { month } 
                });
              } else {
                response = await axios.get(`${API}/kpi/drilldown/national/revenue`, { 
                  params: { month } 
                });
              }
              break;
            case 'digital_governance':
              response = await axios.get(`${API}/kpi/drilldown/service-delivery`, { 
                params: { month, state } 
              });
              break;
            case 'revenue_intelligence':
              response = await axios.get(`${API}/kpi/drilldown/revenue-trend`, { 
                params: { month, state } 
              });
              break;
            case 'enforcement_safety':
              response = await axios.get(`${API}/kpi/drilldown/enforcement`, { 
                params: { month, state } 
              });
              break;
            case 'policy_effectiveness':
              // Use national vehicle registration endpoint to get state breakdown
              response = await axios.get(`${API}/kpi/drilldown/national/vehicle-registration`, { 
                params: { month } 
              });
              break;
            case 'rto_performance':
              // If state is provided, get RTO breakdown; otherwise get state breakdown
              if (state) {
                response = await axios.get(`${API}/kpi/drilldown/state/breakdown`, { 
                  params: { month, state } 
                });
              } else {
                response = await axios.get(`${API}/kpi/drilldown/national/vehicle-registration`, { 
                  params: { month } 
                });
              }
              break;
            case 'fleet_compliance':
              response = await axios.get(`${API}/kpi/drilldown/fleet-vehicles`, { 
                params: { month, state } 
              });
              break;
            case 'internal':
              // Use national vehicle registration endpoint to get state breakdown
              response = await axios.get(`${API}/kpi/drilldown/national/vehicle-registration`, { 
                params: { month } 
              });
              break;
            case 'driver':
              // Use national vehicle registration endpoint to get state breakdown
              response = await axios.get(`${API}/kpi/drilldown/national/vehicle-registration`, { 
                params: { month } 
              });
              break;
            default:
              // Use existing KPI data and format it properly
              const kpiDataForType = kpiData[type] || {};
              response = { 
                data: { 
                  type,
                  supporting_metrics: kpiDataForType.supporting_metrics || {},
                  summary: kpiDataForType.kpis || {},
                  data: [kpiDataForType] // Wrap in array for display
                }
              };
          }
          return response;
        })(),
        axios.get(`${API}/kpi/advanced/insights`, { params: { state, month, section: type } }).catch(() => ({ data: null }))
      ]);

      // Handle drill-down response
      if (drillDownResponse.status === 'fulfilled') {
        const response = drillDownResponse.value;
        if (response && response.data) {
          if (response.data.error) {
            throw new Error(response.data.error);
          }
          setDrillDownData(response.data);
        } else if (response) {
          if (response.error) {
            throw new Error(response.error);
          }
          setDrillDownData(response);
        } else {
          throw new Error("No data received from server");
        }
      } else {
        throw drillDownResponse.reason;
      }

      // Handle insights response
      if (insightsResponse.status === 'fulfilled' && insightsResponse.value?.data) {
        setDrillDownInsights(insightsResponse.value.data);
      }
    } catch (error) {
      console.error("Error fetching drill-down data:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Unknown error occurred";
      setDrillDownError(errorMessage);
      toast.error(`Failed to load drill-down data: ${errorMessage}`);
      setDrillDownData(null);
    } finally {
      setDrillDownLoading(false);
    }
  }, [selectedMonth, searchParams, kpiData]);

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
          
          {/* Progress Bar for percentage-based KPIs */}
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
          
          {/* Mini Trend Chart */}
          {trendData && trendData.length > 0 && (
            <div className="mt-3 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    fill="url(#gradient-${title})" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
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
          <p className="text-white gradient-text-animated text-lg">Loading Advanced KPIs...</p>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 relative">
      <AnimatedBackground />
      <ScrollReveal delay={0}>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text-animated">Advanced KPI Dashboard</h1>
            <p className="text-white/90 mt-1 blur-in">
              Data-driven, second-order KPIs for senior officers, CM dashboards, and MoRTH reviews
            </p>
          </div>
        <div className="flex items-center gap-4">
          {selectedMonth && (
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="icon" onClick={fetchKPIData} className="liquid-button magnetic-hover">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        </div>
      </ScrollReveal>


      <div className="relative z-20">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 relative z-20 pointer-events-auto">
          <TabsTrigger value="mobility">Mobility</TabsTrigger>
          <TabsTrigger value="digital">Digital</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="enforcement">Enforcement</TabsTrigger>
          <TabsTrigger value="policy">Policy</TabsTrigger>
          <TabsTrigger value="rto">RTO</TabsTrigger>
          <TabsTrigger value="internal">Internal</TabsTrigger>
          <TabsTrigger value="fleet">Fleet</TabsTrigger>
          <TabsTrigger value="driver">Driver</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Mobility & Growth Intelligence */}
        <TabsContent value="mobility" className="space-y-4 relative z-10">
          <Card className="relative z-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Car className="h-5 w-5 text-primary" />
                Mobility & Growth Intelligence KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {kpiData.mobility ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <KPICard
                      title="Vehicle Demand Momentum Index"
                      value={kpiData.mobility.kpis?.vehicle_demand_momentum_index}
                      unit="%"
                      icon={TrendingUp}
                      status={true}
                      description="Growth strength of registrations"
                      drillDownType="mobility_growth"
                      drillDownParams={{ metric: 'vehicle_registration' }}
                      showProgress={true}
                    />
                    <KPICard
                      title="Registration to Transaction Efficiency"
                      value={kpiData.mobility.kpis?.registration_to_transaction_efficiency}
                      unit="%"
                      icon={BarChart3}
                      status={true}
                      description="Operational efficiency"
                      drillDownType="mobility_growth"
                      drillDownParams={{ metric: 'transaction_efficiency' }}
                      showProgress={true}
                    />
                    <KPICard
                      title="Seasonal Mobility Spike Indicator"
                      value={kpiData.mobility.kpis?.seasonal_mobility_spike_indicator}
                      icon={AlertTriangle}
                      description={`Z-Score: ${kpiData.mobility.kpis?.z_score || 0}`}
                      drillDownType="mobility_growth"
                      drillDownParams={{ metric: 'seasonal_trend' }}
                    />
                  </div>
                  
                  {/* Trend Visualization */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">Mobility Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            { month: 'Previous', registrations: kpiData.mobility.supporting_metrics?.previous_month_registrations || 0, transactions: 0 },
                            { month: 'Current', registrations: kpiData.mobility.supporting_metrics?.current_month_registrations || 0, transactions: kpiData.mobility.supporting_metrics?.current_transactions || 0 }
                          ]}>
                            <defs>
                              <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                              labelStyle={{ color: '#F3F4F6' }}
                              itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="registrations" stroke="#3B82F6" fill="url(#colorRegistrations)" name="Vehicle Registrations" />
                            <Area type="monotone" dataKey="transactions" stroke="#10B981" fill="url(#colorTransactions)" name="Transactions" />
                          </AreaChart>
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

        {/* Digital Governance */}
        <TabsContent value="digital" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Globe className="h-5 w-5 text-primary" />
                Digital Governance & Service Maturity KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {kpiData.digital ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard
                      title="Digital Service Penetration Score"
                      value={kpiData.digital.kpis?.digital_service_penetration_score}
                      unit="%"
                      icon={Zap}
                      status={true}
                      description="Digital usage intensity"
                      drillDownType="digital_governance"
                      showProgress={true}
                    />
                    <KPICard
                      title="Faceless Transformation Index"
                      value={kpiData.digital.kpis?.faceless_transformation_index}
                      unit="%"
                      icon={Brain}
                      status={true}
                      description="Automation maturity"
                      drillDownType="digital_governance"
                      showProgress={true}
                    />
                    <KPICard
                      title="Service Reliability Index"
                      value={kpiData.digital.kpis?.service_reliability_index}
                      unit="%"
                      icon={CheckCircle}
                      status={true}
                      description="SLA stability"
                      drillDownType="digital_governance"
                      showProgress={true}
                    />
                    <KPICard
                      title="SLA Volatility Score"
                      value={kpiData.digital.kpis?.sla_volatility_score}
                      unit=""
                      icon={AlertCircle}
                      description="Risk to citizen trust"
                      drillDownType="digital_governance"
                    />
                  </div>
                  
                  {/* Digital Services Comparison Chart */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">Digital Services Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { 
                              name: 'Online Services', 
                              value: kpiData.digital.supporting_metrics?.online_services || 0,
                              fill: '#3B82F6'
                            },
                            { 
                              name: 'Faceless Services', 
                              value: kpiData.digital.supporting_metrics?.faceless_services || 0,
                              fill: '#10B981'
                            },
                            { 
                              name: 'Total Transactions', 
                              value: kpiData.digital.supporting_metrics?.total_transactions || 0,
                              fill: '#F59E0B'
                            }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                              labelStyle={{ color: '#F3F4F6' }}
                              itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* SLA Comparison */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">Service Level Agreement Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { 
                              name: 'Citizen SLA', 
                              value: kpiData.digital.supporting_metrics?.citizen_sla || 0,
                              fill: '#3B82F6'
                            },
                            { 
                              name: 'Grievance SLA', 
                              value: kpiData.digital.supporting_metrics?.grievance_sla || 0,
                              fill: '#10B981'
                            }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                              labelStyle={{ color: '#F3F4F6' }}
                              itemStyle={{ color: '#F3F4F6' }}
                              formatter={(value) => `${value}%`}
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

        {/* Revenue Intelligence */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <DollarSign className="h-5 w-5 text-primary" />
                Revenue Intelligence & Leak Detection KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {kpiData.revenue ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard
                      title="Revenue Quality Index"
                      value={kpiData.revenue.kpis?.revenue_quality_index}
                      unit="%"
                      icon={Award}
                      status={true}
                      description="Sustainable revenue mix"
                      drillDownType="revenue_intelligence"
                      showProgress={true}
                    />
                    <KPICard
                      title="Penalty Dependency Ratio"
                      value={kpiData.revenue.kpis?.penalty_dependency_ratio}
                      unit="%"
                      icon={AlertTriangle}
                      description="Over-reliance on penalties"
                      drillDownType="revenue_intelligence"
                      showProgress={true}
                    />
                    <KPICard
                      title="Revenue Achievement Score"
                      value={kpiData.revenue.kpis?.revenue_achievement_score}
                      unit="%"
                      icon={Target}
                      status={true}
                      description="Target performance"
                      drillDownType="revenue_intelligence"
                      showProgress={true}
                    />
                    <KPICard
                      title="Revenue Leakage Risk Score"
                      value={kpiData.revenue.kpis?.revenue_leakage_risk_score}
                      unit="%"
                      icon={AlertCircle}
                      description="Default risk exposure"
                      drillDownType="revenue_intelligence"
                      showProgress={true}
                    />
                  </div>
                  
                  {/* Revenue Breakdown Pie Chart */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">Revenue Composition</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Taxes', value: kpiData.revenue.supporting_metrics?.revenue_taxes || 0, fill: '#3B82F6' },
                                { name: 'Fees', value: kpiData.revenue.supporting_metrics?.revenue_fees || 0, fill: '#10B981' },
                                { name: 'Penalties', value: kpiData.revenue.supporting_metrics?.revenue_penalties || 0, fill: '#F59E0B' }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {[
                                { name: 'Taxes', value: kpiData.revenue.supporting_metrics?.revenue_taxes || 0 },
                                { name: 'Fees', value: kpiData.revenue.supporting_metrics?.revenue_fees || 0 },
                                { name: 'Penalties', value: kpiData.revenue.supporting_metrics?.revenue_penalties || 0 }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                              labelStyle={{ color: '#F3F4F6' }}
                              itemStyle={{ color: '#F3F4F6' }}
                              formatter={(value) => formatCurrency(value)}
                            />
                            <Legend />
                          </PieChart>
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

        {/* Enforcement & Road Safety */}
        <TabsContent value="enforcement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Shield className="h-5 w-5 text-primary" />
                Enforcement & Road Safety KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {kpiData.enforcement ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard
                      title="Enforcement Effectiveness Ratio"
                      value={kpiData.enforcement.kpis?.enforcement_effectiveness_ratio}
                      unit=""
                      icon={Shield}
                      description="Impact of challans"
                      drillDownType="enforcement_safety"
                    />
                    <KPICard
                      title="Fatality Severity Index"
                      value={kpiData.enforcement.kpis?.fatality_severity_index}
                      unit="%"
                      icon={AlertTriangle}
                      description="Lethality risk"
                      drillDownType="enforcement_safety"
                      showProgress={true}
                    />
                    <KPICard
                      title="Preventive Enforcement Score"
                      value={kpiData.enforcement.kpis?.preventive_enforcement_score}
                      unit="%"
                      icon={Target}
                      status={true}
                      description="Proactive policing"
                      drillDownType="enforcement_safety"
                      showProgress={true}
                    />
                    <KPICard
                      title="High-Risk Period Indicator"
                      value={kpiData.enforcement.kpis?.high_risk_period_indicator}
                      icon={AlertCircle}
                      description={`Z-Score: ${kpiData.enforcement.kpis?.accident_z_score || 0}`}
                      drillDownType="enforcement_safety"
                    />
                  </div>
                  
                  {/* Enforcement Metrics Bar Chart */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">Enforcement & Safety Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { 
                              name: 'e-Challan', 
                              value: kpiData.enforcement.supporting_metrics?.e_challan_issued || 0,
                              fill: '#3B82F6'
                            },
                            { 
                              name: 'Accidents', 
                              value: kpiData.enforcement.supporting_metrics?.road_accidents || 0,
                              fill: '#EF4444'
                            },
                            { 
                              name: 'Fatalities', 
                              value: kpiData.enforcement.supporting_metrics?.road_fatalities || 0,
                              fill: '#DC2626'
                            },
                            { 
                              name: 'Registrations', 
                              value: kpiData.enforcement.supporting_metrics?.vehicle_registrations || 0,
                              fill: '#10B981'
                            }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                              labelStyle={{ color: '#F3F4F6' }}
                              itemStyle={{ color: '#F3F4F6' }}
                              formatter={(value) => formatNumber(value)}
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

        {/* Policy Implementation */}
        <TabsContent value="policy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <FileText className="h-5 w-5 text-primary" />
                Policy Implementation Effectiveness KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {kpiData.policy ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard
                      title="Enforcement Infrastructure Density"
                      value={kpiData.policy.kpis?.enforcement_infrastructure_density}
                      unit=""
                      icon={Building2}
                      description="Infra adequacy"
                      drillDownType="policy_effectiveness"
                    />
                    <KPICard
                      title="Vehicle Traceability Index"
                      value={kpiData.policy.kpis?.vehicle_traceability_index}
                      unit="%"
                      icon={MapPin}
                      status={true}
                      description="Safety readiness"
                      drillDownType="policy_effectiveness"
                      showProgress={true}
                    />
                    <KPICard
                      title="EV Adoption Efficiency"
                      value={kpiData.policy.kpis?.ev_adoption_efficiency}
                      unit=""
                      icon={Zap}
                      description="Incentive effectiveness"
                      drillDownType="policy_effectiveness"
                    />
                    <KPICard
                      title="Green Mobility Transition Score"
                      value={kpiData.policy.kpis?.green_mobility_transition_score}
                      unit="%"
                      icon={Globe}
                      status={true}
                      description="Sustainability"
                      drillDownType="policy_effectiveness"
                      showProgress={true}
                    />
                  </div>
                  
                  {/* Infrastructure Devices Chart */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">Enforcement Infrastructure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { 
                              name: 'ATS', 
                              value: kpiData.policy.supporting_metrics?.ats_count || 0,
                              fill: '#3B82F6'
                            },
                            { 
                              name: 'ADTT', 
                              value: kpiData.policy.supporting_metrics?.adtt_count || 0,
                              fill: '#10B981'
                            },
                            { 
                              name: 'RVSF', 
                              value: kpiData.policy.supporting_metrics?.rvsf_count || 0,
                              fill: '#F59E0B'
                            }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                              labelStyle={{ color: '#F3F4F6' }}
                              itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Vehicle Traceability Pie Chart */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">Vehicle Traceability</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'VLTD Fitted', value: kpiData.policy.supporting_metrics?.vltd_count || 0, fill: '#3B82F6' },
                                { name: 'HSRP Fitted', value: kpiData.policy.supporting_metrics?.hsrp_count || 0, fill: '#10B981' },
                                { name: 'Not Fitted', value: Math.max(0, (kpiData.policy.supporting_metrics?.total_vehicles || 0) - (kpiData.policy.supporting_metrics?.vltd_count || 0) - (kpiData.policy.supporting_metrics?.hsrp_count || 0)), fill: '#6B7280' }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {[
                                { name: 'VLTD Fitted', value: kpiData.policy.supporting_metrics?.vltd_count || 0 },
                                { name: 'HSRP Fitted', value: kpiData.policy.supporting_metrics?.hsrp_count || 0 },
                                { name: 'Not Fitted', value: Math.max(0, (kpiData.policy.supporting_metrics?.total_vehicles || 0) - (kpiData.policy.supporting_metrics?.vltd_count || 0) - (kpiData.policy.supporting_metrics?.hsrp_count || 0)) }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#6B7280'][index]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                              labelStyle={{ color: '#F3F4F6' }}
                              itemStyle={{ color: '#F3F4F6' }}
                              formatter={(value) => formatNumber(value)}
                            />
                            <Legend />
                          </PieChart>
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

        {/* RTO Performance */}
        <TabsContent value="rto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Building2 className="h-5 w-5 text-primary" />
                RTO Performance Intelligence KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {kpiData.rto ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard
                      title="RTO Digital Maturity Score"
                      value={kpiData.rto.kpis?.rto_digital_maturity_score}
                      unit=""
                      icon={Zap}
                      status={true}
                      description="Automation readiness"
                      drillDownType="rto_performance"
                    />
                    <KPICard
                      title="RTO Financial Health Index"
                      value={formatCurrency(kpiData.rto.kpis?.rto_financial_health_index)}
                      icon={DollarSign}
                      description="Fiscal discipline"
                      drillDownType="rto_performance"
                    />
                    <KPICard
                      title="RTO Risk Flag"
                      value={kpiData.rto.kpis?.rto_risk_flag}
                      icon={AlertTriangle}
                      description="Governance risk"
                      drillDownType="rto_performance"
                    />
                    <KPICard
                      title="Composite RTO Performance Index"
                      value={kpiData.rto.kpis?.composite_rto_performance_index}
                      unit=""
                      icon={Award}
                      status={true}
                      description="Overall score"
                      drillDownType="rto_performance"
                    />
                  </div>
                  
                  {/* RTO Performance Metrics */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">RTO Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { 
                              name: 'Faceless %', 
                              value: kpiData.rto.supporting_metrics?.faceless_percentage || 0,
                              fill: '#3B82F6'
                            },
                            { 
                              name: 'SLA %', 
                              value: kpiData.rto.supporting_metrics?.sla_percentage || 0,
                              fill: '#10B981'
                            }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                              labelStyle={{ color: '#F3F4F6' }}
                              itemStyle={{ color: '#F3F4F6' }}
                              formatter={(value) => `${value}%`}
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

        {/* Internal Efficiency */}
        <TabsContent value="internal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Users className="h-5 w-5 text-primary" />
                Internal Efficiency & Fraud Detection KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {kpiData.internal ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard
                      title="Staff Utilization Efficiency"
                      value={kpiData.internal.kpis?.staff_utilization_efficiency}
                      unit=""
                      icon={Users}
                      description="Workforce optimization"
                      drillDownType="internal"
                    />
                    <KPICard
                      title="Enforcement Load Ratio"
                      value={kpiData.internal.kpis?.enforcement_load_ratio}
                      unit=""
                      icon={Shield}
                      description="Field pressure"
                      drillDownType="internal"
                    />
                    <KPICard
                      title="Anomaly Density Index"
                      value={kpiData.internal.kpis?.anomaly_density_index}
                      unit="%"
                      icon={AlertCircle}
                      description="Fraud probability"
                      drillDownType="internal"
                      showProgress={true}
                    />
                    <KPICard
                      title="Governance Stress Indicator"
                      value={kpiData.internal.kpis?.governance_stress_indicator}
                      unit="%"
                      icon={AlertTriangle}
                      description="Admin overload"
                      drillDownType="internal"
                      showProgress={true}
                    />
                  </div>
                  
                  {/* Staff Distribution */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">Staff Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Field Staff', value: kpiData.internal.supporting_metrics?.field_staff || 0, fill: '#3B82F6' },
                                { name: 'Back Office Staff', value: kpiData.internal.supporting_metrics?.back_office_staff || 0, fill: '#10B981' }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {[
                                { name: 'Field Staff', value: kpiData.internal.supporting_metrics?.field_staff || 0 },
                                { name: 'Back Office Staff', value: kpiData.internal.supporting_metrics?.back_office_staff || 0 }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981'][index]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                              labelStyle={{ color: '#F3F4F6' }}
                              itemStyle={{ color: '#F3F4F6' }}
                              formatter={(value) => formatNumber(value)}
                            />
                            <Legend />
                          </PieChart>
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

        {/* Fleet Compliance */}
        <TabsContent value="fleet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Car className="h-5 w-5 text-primary" />
                Fleet Compliance & Risk KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {kpiData.fleet ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard
                      title="Fleet Compliance Score"
                      value={kpiData.fleet.kpis?.fleet_compliance_score}
                      unit="%"
                      icon={CheckCircle}
                      status={true}
                      description="Legal compliance"
                      drillDownType="fleet_compliance"
                      showProgress={true}
                    />
                    <KPICard
                      title="Revenue at Risk (Fleet)"
                      value={formatCurrency(kpiData.fleet.kpis?.revenue_at_risk_fleet)}
                      icon={DollarSign}
                      description="Uncollected revenue"
                      drillDownType="fleet_compliance"
                    />
                    <KPICard
                      title="Fitness Risk Index"
                      value={kpiData.fleet.kpis?.fitness_risk_index}
                      unit="%"
                      icon={AlertTriangle}
                      description="Road safety risk"
                      drillDownType="fleet_compliance"
                      showProgress={true}
                    />
                    <KPICard
                      title="Insurance Exposure Score"
                      value={kpiData.fleet.kpis?.insurance_exposure_score}
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
                              value: kpiData.fleet.supporting_metrics?.tax_due_amount || 0,
                              fill: '#3B82F6'
                            },
                            { 
                              name: 'Insurance Due', 
                              value: kpiData.fleet.supporting_metrics?.insurance_due_amount || 0,
                              fill: '#10B981'
                            },
                            { 
                              name: 'Fitness Due', 
                              value: kpiData.fleet.supporting_metrics?.fitness_due_amount || 0,
                              fill: '#F59E0B'
                            },
                            { 
                              name: 'PUCC Due', 
                              value: kpiData.fleet.supporting_metrics?.pucc_due_amount || 0,
                              fill: '#8B5CF6'
                            },
                            { 
                              name: 'Challan Due', 
                              value: kpiData.fleet.supporting_metrics?.challan_due_amount || 0,
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

        {/* Driver Risk */}
        <TabsContent value="driver" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <FileText className="h-5 w-5 text-primary" />
                Driver Risk & Behaviour Analytics KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {kpiData.driver ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard
                      title="Driver Compliance Ratio"
                      value={kpiData.driver.kpis?.driver_compliance_ratio}
                      unit="%"
                      icon={CheckCircle}
                      status={true}
                      description="License discipline"
                      drillDownType="driver"
                      showProgress={true}
                    />
                    <KPICard
                      title="Habitual Driver Risk Score"
                      value={kpiData.driver.kpis?.habitual_driver_risk_score}
                      unit="%"
                      icon={AlertTriangle}
                      description="Risk behavior"
                      drillDownType="driver"
                      showProgress={true}
                    />
                    <KPICard
                      title="License Enforcement Yield"
                      value={kpiData.driver.kpis?.license_enforcement_yield}
                      unit=""
                      icon={Target}
                      description="Revenue effectiveness"
                      drillDownType="driver"
                    />
                    <KPICard
                      title="High-Risk Driver Flag"
                      value={kpiData.driver.kpis?.high_risk_driver_identification_flag}
                      icon={AlertCircle}
                      description="Predictive alert"
                      drillDownType="driver"
                    />
                  </div>
                  
                  {/* Driver Compliance Metrics */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">Driver Compliance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { 
                              name: 'Total Drivers', 
                              value: kpiData.driver.supporting_metrics?.driver_count || 0,
                              fill: '#3B82F6'
                            },
                            { 
                              name: 'DL Renewal Due', 
                              value: kpiData.driver.supporting_metrics?.dl_renewal_due_count || 0,
                              fill: '#F59E0B'
                            },
                            { 
                              name: 'Challans on DL', 
                              value: kpiData.driver.supporting_metrics?.challans_on_dl_count || 0,
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
                              formatter={(value) => formatNumber(value)}
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

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4 relative z-10">
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
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Brain className="w-5 h-5 text-primary" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insightsData.insights && Array.isArray(insightsData.insights) && insightsData.insights.length > 0 ? (
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
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insightsData.recommendations && Array.isArray(insightsData.recommendations) && insightsData.recommendations.length > 0 ? (
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
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insightsData.action_items && Array.isArray(insightsData.action_items) && insightsData.action_items.length > 0 ? (
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
      </div>

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
              {/* 1. CARDS/TILES SECTION */}
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

              {/* Supporting Metrics Cards */}
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

              {/* 2. GRAPHS/CHARTS SECTION - Moved after cards */}
              {/* State Breakdown Table - Show if state_breakdown exists */}
              {drillDownData.state_breakdown && Array.isArray(drillDownData.state_breakdown) && drillDownData.state_breakdown.length > 0 && (
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
                            <TableHead className="text-right text-white">Revenue</TableHead>
                            <TableHead className="text-right text-white">Accidents</TableHead>
                            <TableHead className="text-right text-white">Challans</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {drillDownData.state_breakdown.map((item, idx) => (
                            <TableRow key={idx} className="border-gray-700">
                              <TableCell className="font-medium text-white">{item.State || item.state || '-'}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["Vehicle Registration"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatCurrency(item["Revenue - Total"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["Road Accidents"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["e-Challan Issued"] || 0)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Trend Chart - Moved after cards */}
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
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorChallan" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
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
                          {drillDownData.trend_data[0]?.revenue !== undefined && (
                            <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="url(#colorRevenue)" name="Revenue" />
                          )}
                          {drillDownData.trend_data[0]?.revenue_total !== undefined && (
                            <Area type="monotone" dataKey="revenue_total" stroke="#10B981" fill="url(#colorRevenue)" name="Total Revenue" />
                          )}
                          {drillDownData.trend_data[0]?.revenue_taxes !== undefined && (
                            <Area type="monotone" dataKey="revenue_taxes" stroke="#059669" fill="url(#colorRevenue)" name="Taxes" />
                          )}
                          {drillDownData.trend_data[0]?.revenue_fees !== undefined && (
                            <Area type="monotone" dataKey="revenue_fees" stroke="#047857" fill="url(#colorRevenue)" name="Fees" />
                          )}
                          {drillDownData.trend_data[0]?.revenue_penalties !== undefined && (
                            <Area type="monotone" dataKey="revenue_penalties" stroke="#DC2626" fill="url(#colorValue)" name="Penalties" />
                          )}
                          {drillDownData.trend_data[0]?.e_challan !== undefined && (
                            <Area type="monotone" dataKey="e_challan" stroke="#F59E0B" fill="url(#colorChallan)" name="e-Challan" />
                          )}
                          {drillDownData.trend_data[0]?.accidents !== undefined && (
                            <Area type="monotone" dataKey="accidents" stroke="#EF4444" fill="url(#colorValue)" name="Accidents" />
                          )}
                          {drillDownData.trend_data[0]?.fatalities !== undefined && (
                            <Area type="monotone" dataKey="fatalities" stroke="#DC2626" fill="url(#colorValue)" name="Fatalities" />
                          )}
                          {drillDownData.trend_data[0]?.ats_count !== undefined && (
                            <Area type="monotone" dataKey="ats_count" stroke="#8B5CF6" fill="url(#colorValue)" name="ATS Count" />
                          )}
                          {drillDownData.trend_data[0]?.adtt_count !== undefined && (
                            <Area type="monotone" dataKey="adtt_count" stroke="#7C3AED" fill="url(#colorValue)" name="ADTT Count" />
                          )}
                          {drillDownData.trend_data[0]?.citizen_sla !== undefined && (
                            <Area type="monotone" dataKey="citizen_sla" stroke="#3B82F6" fill="url(#colorValue)" name="Citizen SLA %" />
                          )}
                          {drillDownData.trend_data[0]?.grievance_sla !== undefined && (
                            <Area type="monotone" dataKey="grievance_sla" stroke="#6366F1" fill="url(#colorValue)" name="Grievance SLA %" />
                          )}
                          {drillDownData.trend_data[0]?.online_services !== undefined && (
                            <Area type="monotone" dataKey="online_services" stroke="#10B981" fill="url(#colorRevenue)" name="Online Services" />
                          )}
                          {drillDownData.trend_data[0]?.faceless_services !== undefined && (
                            <Area type="monotone" dataKey="faceless_services" stroke="#059669" fill="url(#colorRevenue)" name="Faceless Services" />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 3. INSIGHTS, RECOMMENDATIONS & ACTION ITEMS SECTION */}
              {drillDownInsights && drillDownInsights !== null && typeof drillDownInsights === 'object' && (
                <div className="space-y-6">
                  {/* Insights Section */}
                  {drillDownInsights.insights && Array.isArray(drillDownInsights.insights) && drillDownInsights.insights.length > 0 && (
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
                  {drillDownInsights.recommendations && Array.isArray(drillDownInsights.recommendations) && drillDownInsights.recommendations.length > 0 && (
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
                  {drillDownInsights.action_items && Array.isArray(drillDownInsights.action_items) && drillDownInsights.action_items.length > 0 && (
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
              {drillDownData.state_breakdown && Array.isArray(drillDownData.state_breakdown) && drillDownData.state_breakdown.length > 0 && (
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
                            <TableHead className="text-right text-white">Revenue</TableHead>
                            <TableHead className="text-right text-white">Accidents</TableHead>
                            <TableHead className="text-right text-white">Challans</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {drillDownData.state_breakdown && Array.isArray(drillDownData.state_breakdown) && drillDownData.state_breakdown.map((item, idx) => (
                            <TableRow key={idx} className="border-gray-700">
                              <TableCell className="font-medium text-white">{item.State || item.state || '-'}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["Vehicle Registration"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatCurrency(item["Revenue - Total"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["Road Accidents"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["e-Challan Issued"] || 0)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* RTO Breakdown Table */}
              {drillDownData.rto_breakdown && Array.isArray(drillDownData.rto_breakdown) && drillDownData.rto_breakdown.length > 0 && (
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
                            <TableHead className="text-right text-white">SLA %</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {drillDownData.rto_breakdown && Array.isArray(drillDownData.rto_breakdown) && drillDownData.rto_breakdown.map((item, idx) => (
                            <TableRow key={idx} className="border-gray-700">
                              <TableCell className="font-medium text-white">{item.RTO || '-'}</TableCell>
                              <TableCell className="text-white">{item.State || '-'}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["Vehicle Registration"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatCurrency(item["Revenue - Total"] || item["Revenue - Actual"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{Number(item["Citizen Service SLA % (within SLA)"] || 0).toFixed(1)}%</TableCell>
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
                        <AreaChart data={drillDownData.trend_data}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorChallan" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
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
                          {drillDownData.trend_data[0]?.revenue !== undefined && (
                            <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="url(#colorRevenue)" name="Revenue" />
                          )}
                          {drillDownData.trend_data[0]?.revenue_total !== undefined && (
                            <Area type="monotone" dataKey="revenue_total" stroke="#10B981" fill="url(#colorRevenue)" name="Total Revenue" />
                          )}
                          {drillDownData.trend_data[0]?.revenue_taxes !== undefined && (
                            <Area type="monotone" dataKey="revenue_taxes" stroke="#059669" fill="url(#colorRevenue)" name="Taxes" />
                          )}
                          {drillDownData.trend_data[0]?.revenue_fees !== undefined && (
                            <Area type="monotone" dataKey="revenue_fees" stroke="#047857" fill="url(#colorRevenue)" name="Fees" />
                          )}
                          {drillDownData.trend_data[0]?.revenue_penalties !== undefined && (
                            <Area type="monotone" dataKey="revenue_penalties" stroke="#DC2626" fill="url(#colorValue)" name="Penalties" />
                          )}
                          {drillDownData.trend_data[0]?.e_challan !== undefined && (
                            <Area type="monotone" dataKey="e_challan" stroke="#F59E0B" fill="url(#colorChallan)" name="e-Challan" />
                          )}
                          {drillDownData.trend_data[0]?.accidents !== undefined && (
                            <Area type="monotone" dataKey="accidents" stroke="#EF4444" fill="url(#colorValue)" name="Accidents" />
                          )}
                          {drillDownData.trend_data[0]?.fatalities !== undefined && (
                            <Area type="monotone" dataKey="fatalities" stroke="#DC2626" fill="url(#colorValue)" name="Fatalities" />
                          )}
                          {drillDownData.trend_data[0]?.ats_count !== undefined && (
                            <Area type="monotone" dataKey="ats_count" stroke="#8B5CF6" fill="url(#colorValue)" name="ATS Count" />
                          )}
                          {drillDownData.trend_data[0]?.adtt_count !== undefined && (
                            <Area type="monotone" dataKey="adtt_count" stroke="#7C3AED" fill="url(#colorValue)" name="ADTT Count" />
                          )}
                          {drillDownData.trend_data[0]?.citizen_sla !== undefined && (
                            <Area type="monotone" dataKey="citizen_sla" stroke="#3B82F6" fill="url(#colorValue)" name="Citizen SLA %" />
                          )}
                          {drillDownData.trend_data[0]?.grievance_sla !== undefined && (
                            <Area type="monotone" dataKey="grievance_sla" stroke="#6366F1" fill="url(#colorValue)" name="Grievance SLA %" />
                          )}
                          {drillDownData.trend_data[0]?.online_services !== undefined && (
                            <Area type="monotone" dataKey="online_services" stroke="#10B981" fill="url(#colorRevenue)" name="Online Services" />
                          )}
                          {drillDownData.trend_data[0]?.faceless_services !== undefined && (
                            <Area type="monotone" dataKey="faceless_services" stroke="#059669" fill="url(#colorRevenue)" name="Faceless Services" />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Supporting Metrics */}
              {drillDownData.supporting_metrics && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Supporting Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {drillDownData.supporting_metrics && typeof drillDownData.supporting_metrics === 'object' && Object.entries(drillDownData.supporting_metrics || {}).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-gray-300 font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="ml-2 font-medium text-white">
                            {typeof value === 'number' ? (key.includes('revenue') || key.includes('amount') ? formatCurrency(value) : formatNumber(value)) : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* State Data Display */}
              {drillDownData.state_data && Array.isArray(drillDownData.state_data) && drillDownData.state_data.length > 0 && !drillDownData.state_breakdown && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">State Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700">
                            <TableHead className="text-white">Month</TableHead>
                            <TableHead className="text-white">State</TableHead>
                            <TableHead className="text-right text-white">Vehicle Registration</TableHead>
                            <TableHead className="text-right text-white">Revenue</TableHead>
                            <TableHead className="text-right text-white">Accidents</TableHead>
                            <TableHead className="text-right text-white">Challans</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {drillDownData.state_data && Array.isArray(drillDownData.state_data) && drillDownData.state_data.slice(0, 20).map((item, idx) => (
                            <TableRow key={idx} className="border-gray-700">
                              <TableCell className="text-white">{item.Month || '-'}</TableCell>
                              <TableCell className="text-white">{item.State || '-'}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["Vehicle Registration"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatCurrency(item["Revenue - Total"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["Road Accidents"] || 0)}</TableCell>
                              <TableCell className="text-right text-white">{formatNumber(item["e-Challan Issued"] || 0)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Raw Data Display */}
              {drillDownData.data && Array.isArray(drillDownData.data) && drillDownData.data.length > 0 && !drillDownData.state_breakdown && !drillDownData.rto_breakdown && !drillDownData.state_data && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Detailed Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700">
                            {drillDownData.data && Array.isArray(drillDownData.data) && drillDownData.data.length > 0 && Object.keys(drillDownData.data[0] || {}).map((key) => (
                              <TableHead key={key} className="text-white">{key}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {drillDownData.data && Array.isArray(drillDownData.data) && drillDownData.data.slice(0, 20).map((item, idx) => (
                            <TableRow key={idx} className="border-gray-700">
                              {item && typeof item === 'object' && Object.entries(item || {}).map(([key, value]) => (
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

              {/* Summary Stats */}
              {drillDownData.summary && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Summary Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {drillDownData.summary && typeof drillDownData.summary === 'object' && Object.entries(drillDownData.summary || {}).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-gray-300 font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="ml-2 font-medium text-white">
                            {typeof value === 'number' ? (key.includes('revenue') || key.includes('amount') ? formatCurrency(value) : formatNumber(value)) : value}
                          </span>
                        </div>
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

export default AdvancedKPIDashboard;

