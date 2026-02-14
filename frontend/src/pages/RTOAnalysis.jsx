import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ReferenceLine, Cell, AreaChart, Area, Legend
} from "recharts";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";
import { 
  TrendingUp, TrendingDown, Award, RefreshCw, Target,
  Building2, Zap, DollarSign, AlertTriangle, Shield,
  CheckCircle, Car, FileText, Clock
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import AnimatedCounter from "@/components/AnimatedCounter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSearchParams } from "react-router-dom";

const COLORS = ['#F97316', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B'];

const RTOAnalysis = () => {
  const [searchParams] = useSearchParams();
  const [overview, setOverview] = useState(null);
  const [topBottom, setTopBottom] = useState(null);
  const [rankMovement, setRankMovement] = useState(null);
  const [kpiDrivers, setKpiDrivers] = useState(null);
  const [onlineRevenue, setOnlineRevenue] = useState(null);
  const [sarathiPendency, setSarathiPendency] = useState(null);
  const [vahanPendency, setVahanPendency] = useState(null);
  const [challanPendency, setChallanPendency] = useState(null);
  const [allData, setAllData] = useState(null);
  const [rtoPerformanceKPIs, setRtoPerformanceKPIs] = useState(null);
  const [rtoPerformanceData, setRtoPerformanceData] = useState([]);
  const [rtoDerivedKPIs, setRtoDerivedKPIs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Drill-down state
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownData, setDrillDownData] = useState(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState("");
  const [drillDownDescription, setDrillDownDescription] = useState("");
  const [drillDownError, setDrillDownError] = useState(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const state = searchParams.get("state_cd") || null;
    const month = null; // Can be made dynamic if needed
    
    // Use Promise.allSettled to handle partial failures gracefully
    const results = await Promise.allSettled([
        axios.get(`${API}/rto-analysis/overview`).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error("Error fetching overview:", err);
          return { data: null, error: err.message };
        }),
        axios.get(`${API}/rto-analysis/top-bottom?limit=10`).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error("Error fetching top-bottom:", err);
          return { data: null, error: err.message };
        }),
        axios.get(`${API}/rto-analysis/rank-movement`).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error("Error fetching rank-movement:", err);
          return { data: null, error: err.message };
        }),
        axios.get(`${API}/rto-analysis/kpi-drivers`).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error("Error fetching kpi-drivers:", err);
          return { data: null, error: err.message };
        }),
        axios.get(`${API}/rto-analysis/online-revenue`).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error("Error fetching online-revenue:", err);
          return { data: null, error: err.message };
        }),
        axios.get(`${API}/rto-analysis/sarathi-pendency`).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error("Error fetching sarathi-pendency:", err);
          return { data: null, error: err.message };
        }),
        axios.get(`${API}/rto-analysis/vahan-pendency`).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error("Error fetching vahan-pendency:", err);
          return { data: null, error: err.message };
        }),
        axios.get(`${API}/rto-analysis/challan-pendency`).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error("Error fetching challan-pendency:", err);
          return { data: null, error: err.message };
        }),
        axios.get(`${API}/rto-analysis/all-data`).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error("Error fetching all-data:", err);
          return { data: null, error: err.message };
        }),
        axios.get(`${API}/kpi/advanced/rto-performance`).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error("Error fetching advanced rto-performance:", err);
          return { data: null, error: err.message };
        }),
        axios.get(`${API}/kpi/rto/performance`, { params: { state, month } }).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error("Error fetching rto performance:", err);
          return { data: null, error: err.message };
        }),
        axios.get(`${API}/kpi/rto/derived`, { params: { state, rto: null, month } }).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error("Error fetching rto derived:", err);
          return { data: null, error: err.message };
        })
    ]);

    // Extract data from results, handling both fulfilled and rejected promises
    const [
      overviewRes,
      topBottomRes,
      rankMovementRes,
      kpiDriversRes,
      onlineRevenueRes,
      sarathiRes,
      vahanRes,
      challanRes,
      allDataRes,
      rtoPerformanceRes,
      rtoPerfRes,
      rtoDerivedRes
    ] = results.map(result => 
      result.status === 'fulfilled' ? result.value : { data: null, error: result.reason?.message || 'Unknown error' }
    );

    // Set data, handling null/error cases with conditional logging (dev only)
    const isDev = process.env.NODE_ENV !== 'production';
    
    if (overviewRes?.data) {
      if (overviewRes.data.error) {
        if (isDev) console.warn("Overview endpoint returned error:", overviewRes.data.error);
      } else {
        setOverview(overviewRes.data);
        if (isDev) console.log("Overview data loaded");
      }
    }
    
    if (topBottomRes?.data) {
      if (topBottomRes.data.error) {
        if (isDev) console.warn("Top-Bottom endpoint returned error:", topBottomRes.data.error);
      } else {
        setTopBottom(topBottomRes.data);
        if (isDev) console.log("Top-Bottom data loaded");
      }
    }
    
    if (rankMovementRes?.data) {
      if (rankMovementRes.data.error) {
        if (isDev) console.warn("Rank-Movement endpoint returned error:", rankMovementRes.data.error);
      } else {
        setRankMovement(rankMovementRes.data);
        if (isDev) console.log("Rank-Movement data loaded");
      }
    }
    
    if (kpiDriversRes?.data) {
      if (kpiDriversRes.data.error) {
        if (isDev) console.warn("KPI-Drivers endpoint returned error:", kpiDriversRes.data.error);
      } else {
        setKpiDrivers(kpiDriversRes.data);
        if (isDev) console.log("KPI-Drivers data loaded");
      }
    }
    
    if (onlineRevenueRes?.data) {
      if (onlineRevenueRes.data.error) {
        if (isDev) console.warn("Online-Revenue endpoint returned error:", onlineRevenueRes.data.error);
      } else {
        setOnlineRevenue(onlineRevenueRes.data);
        if (isDev) console.log("Online-Revenue data loaded");
      }
    }
    
    if (sarathiRes?.data) {
      if (sarathiRes.data.error) {
        if (isDev) console.warn("Sarathi-Pendency endpoint returned error:", sarathiRes.data.error);
      } else {
        setSarathiPendency(sarathiRes.data);
        if (isDev) console.log("Sarathi-Pendency data loaded");
      }
    }
    
    if (vahanRes?.data) {
      if (vahanRes.data.error) {
        if (isDev) console.warn("Vahan-Pendency endpoint returned error:", vahanRes.data.error);
      } else {
        setVahanPendency(vahanRes.data);
        if (isDev) console.log("Vahan-Pendency data loaded");
      }
    }
    
    if (challanRes?.data) {
      if (challanRes.data.error) {
        if (isDev) console.warn("Challan-Pendency endpoint returned error:", challanRes.data.error);
      } else {
        setChallanPendency(challanRes.data);
        if (isDev) console.log("Challan-Pendency data loaded");
      }
    }
    
    if (allDataRes?.data) {
      if (allDataRes.data.error) {
        if (isDev) console.warn("All-Data endpoint returned error:", allDataRes.data.error);
      } else {
        setAllData(allDataRes.data);
        if (isDev) console.log("All-Data loaded");
      }
    }
    
    if (rtoPerformanceRes?.data) {
      if (rtoPerformanceRes.data.error) {
        if (isDev) console.warn("RTO Performance KPIs endpoint returned error:", rtoPerformanceRes.data.error);
      } else {
        setRtoPerformanceKPIs(rtoPerformanceRes.data);
        if (isDev) console.log("RTO Performance KPIs loaded");
      }
    }
    
    if (rtoPerfRes?.data?.data) {
      setRtoPerformanceData(rtoPerfRes.data.data);
      if (isDev) console.log("RTO Performance data loaded:", rtoPerfRes.data.data.length, "records");
    }
    
    if (rtoDerivedRes?.data) {
      if (rtoDerivedRes.data.error) {
        if (isDev) console.warn("RTO Derived KPIs endpoint returned error:", rtoDerivedRes.data.error);
      } else {
        setRtoDerivedKPIs(rtoDerivedRes.data);
        if (isDev) console.log("RTO Derived KPIs loaded");
      }
    }

    // Count successful loads
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value?.data && !r.value.data.error).length;
    const totalCount = results.length;

    if (successCount > 0) {
      toast.success(`RTO Analysis data loaded (${successCount}/${totalCount} endpoints)`);
    } else {
      toast.error("Failed to load RTO analysis data from all endpoints");
    }

    setLoading(false);
  }, [searchParams]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatCurrency = (num) => {
    if (!num && num !== 0) return "₹0";
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(2)}K`;
    return `₹${num.toFixed(2)}`;
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
    setDrillDownError(null);

    try {
      const state = searchParams.get("state_cd") || null;
      const rto = searchParams.get("rto") || null;

      let response;
      switch (type) {
        case 'rto_performance':
          // Fetch RTO performance ranking data (Top 5 and Bottom 5)
          try {
            const rankingResponse = await axios.get(`${API}/kpi/drilldown/rto-performance-ranking`);
            response = {
              data: {
                type,
                supporting_metrics: rtoPerformanceKPIs?.supporting_metrics || {},
                summary: rtoPerformanceKPIs?.kpis || {},
                rto_ranking: rankingResponse.data?.rto_ranking || [],
                data: [rtoPerformanceKPIs] || []
              }
            };
          } catch (rankingError) {
            // Fallback to existing data if ranking endpoint fails
            response = { 
              data: { 
                type,
                supporting_metrics: rtoPerformanceKPIs?.supporting_metrics || {},
                summary: rtoPerformanceKPIs?.kpis || {},
                data: [rtoPerformanceKPIs] || []
              }
            };
          }
          break;
        default:
          // Use existing RTO performance data
          response = { 
            data: { 
              type,
              supporting_metrics: rtoPerformanceKPIs?.supporting_metrics || {},
              summary: rtoPerformanceKPIs?.kpis || {},
              data: [rtoPerformanceKPIs] || []
            }
          };
      }

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
    } catch (error) {
      console.error("Error fetching drill-down data:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Unknown error occurred";
      setDrillDownError(errorMessage);
      toast.error(`Failed to load drill-down data: ${errorMessage}`);
      setDrillDownData(null);
    } finally {
      setDrillDownLoading(false);
    }
  }, [searchParams, rtoPerformanceKPIs]);

  const KPICard = ({ title, value, unit = "", icon: Icon, status, description, drillDownType, drillDownParams = {}, showProgress = false }) => {
    const statusInfo = status ? getKPIStatus(value) : null;
    const numValue = typeof value === "number" ? value : (typeof value === "string" ? parseFloat(value.replace(/[^0-9.-]/g, '')) : 0);
    const isPercentage = unit === "%" || title.toLowerCase().includes("score") || title.toLowerCase().includes("index") || title.toLowerCase().includes("ratio");
    const progressValue = isPercentage ? Math.min(Math.max(numValue, 0), 100) : 0;
    
    return (
      <Card 
        className="bg-gray-800/50 border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => drillDownType && handleDrillDown(drillDownType, title, description, drillDownParams)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
          {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {typeof value === "number" ? (
              <AnimatedCounter value={value} suffix={unit} />
            ) : (
              <>
                {value}
                {unit && <span className="text-sm text-gray-400 ml-1">{unit}</span>}
              </>
            )}
          </div>
          
          {(showProgress || isPercentage) && !isNaN(progressValue) && (
            <div className="mt-3">
              <Progress value={progressValue} className="h-2" />
            </div>
          )}
          
          {statusInfo && (
            <div className="flex items-center mt-2">
              <div className={`w-2 h-2 rounded-full ${statusInfo.color} mr-2`} />
              <span className="text-xs text-gray-300 font-medium">{statusInfo.text}</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-400 mt-1">
              {description}
              {drillDownType && <span className="text-orange-400 ml-1 font-medium">(Click for details)</span>}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  // Prepare chart data
  const topBottomChartData = useMemo(() => {
    if (!topBottom) return { top: [], bottom: [] };
    return {
      top: topBottom.top_rtos?.map(r => ({ rto: r.rto_code, marks: r.overall_marks })) || [],
      bottom: topBottom.bottom_rtos?.map(r => ({ rto: r.rto_code, marks: r.overall_marks })) || []
    };
  }, [topBottom]);

  const categoryComparisonData = useMemo(() => {
    if (!overview?.category_averages) return [];
    return Object.entries(overview.category_averages).map(([category, avg]) => ({
      category,
      average: avg,
      peak: overview.category_peaks?.[category] || 0
    }));
  }, [overview]);

  const scatterData = useMemo(() => {
    if (!rankMovement?.scatter_data || rankMovement.scatter_data.length === 0) return [];
    const data = rankMovement.scatter_data.map(d => ({
      x: Number(d.oct_rank) || 0,
      y: Number(d.nov_rank) || 0,
      rto: d.rto || "Unknown"
    })).filter(d => d.x > 0 && d.y > 0); // Filter out invalid data
    
    // Log for debugging (development only)
    if (data.length > 0 && process.env.NODE_ENV !== 'production') {
      console.log("Scatter data sample:", data.slice(0, 5));
      console.log("Data range - X:", Math.min(...data.map(d => d.x)), "to", Math.max(...data.map(d => d.x)));
      console.log("Data range - Y:", Math.min(...data.map(d => d.y)), "to", Math.max(...data.map(d => d.y)));
    }
    
    return data;
  }, [rankMovement]);

  const correlationData = useMemo(() => {
    if (!kpiDrivers?.driver_ranking) return [];
    return kpiDrivers.driver_ranking.map(d => ({
      component: d.component.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      correlation: d.correlation
    }));
  }, [kpiDrivers]);

  const onlineRevenueHistogram = useMemo(() => {
    if (!onlineRevenue?.online_percentage_distribution) return [];
    // Create bins for histogram
    const bins = Array.from({ length: 10 }, (_, i) => ({ range: `${i * 10}-${(i + 1) * 10}%`, count: 0 }));
    onlineRevenue.online_percentage_distribution?.forEach(pct => {
      const binIndex = Math.min(Math.floor(pct / 10), 9);
      bins[binIndex].count++;
    });
    return bins;
  }, [onlineRevenue]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
        <div className="flex items-center justify-center h-screen">
          <RefreshCw className="w-8 h-8 animate-spin text-white" />
          <span className="ml-3 text-white">Loading RTO Analysis...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <ScrollReveal delay={0}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 gradient-text-animated">
                RTO Performance Analysis
              </h1>
              <p className="text-white/60">Comprehensive RTO ranking and performance metrics</p>
            </div>
            <Button 
              onClick={fetchAllData} 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </ScrollReveal>

        {/* Overview KPI Cards */}
        {overview && (
          <ScrollReveal delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total RTOs</p>
                      <p className="text-2xl font-bold text-white">
                        <AnimatedCounter value={overview.total_rtos || 0} />
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Average Marks</p>
                      <p className="text-2xl font-bold text-white">
                        {overview.average_marks?.toFixed(2) || "0"} / 100
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Best Score</p>
                      <p className="text-2xl font-bold text-white">
                        {overview.best_score?.toFixed(2) || "0"}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Lowest Score</p>
                      <p className="text-2xl font-bold text-white">
                        {overview.lowest_score?.toFixed(2) || "0"}
                      </p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-800/50 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500">Overview</TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-orange-500">Performance</TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-orange-500">Revenue & Digital</TabsTrigger>
            <TabsTrigger value="pendency" className="data-[state=active]:bg-orange-500">Pendency Analysis</TabsTrigger>
            <TabsTrigger value="enforcement" className="data-[state=active]:bg-orange-500">Enforcement</TabsTrigger>
            <TabsTrigger value="drivers" className="data-[state=active]:bg-orange-500">KPI Drivers</TabsTrigger>
            <TabsTrigger value="rto-level" className="data-[state=active]:bg-orange-500">RTO Level KPIs</TabsTrigger>
            <TabsTrigger value="intelligence" className="data-[state=active]:bg-orange-500">RTO Performance Intelligence KPIs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Top/Bottom RTOs */}
            {topBottom && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Top 10 RTOs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topBottomChartData.top}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="rto" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }} />
                        <Bar dataKey="marks" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {topBottom.top_rtos?.slice(0, 5).map((rto, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-300">
                          <span>{rto.rto_code}</span>
                          <span className="font-semibold">{rto.overall_marks?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Bottom 10 RTOs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topBottomChartData.bottom}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="rto" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }} />
                        <Bar dataKey="marks" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {topBottom.bottom_rtos?.slice(0, 5).map((rto, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-300">
                          <span>{rto.rto_code}</span>
                          <span className="font-semibold">{rto.overall_marks?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Category Comparison */}
            {categoryComparisonData.length > 0 ? (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Category Performance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="category" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }} />
                      <Bar dataKey="average" fill="#3B82F6" name="Average" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="peak" fill="#10B981" name="Peak" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : overview ? (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-10 text-center">
                  <p className="text-gray-400">Category comparison data is not available.</p>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            {/* Rank Movement */}
            {rankMovement && rankMovement.scatter_data ? (
              <>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Rank Movement Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {rankMovement.most_improved && (
                        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 font-semibold">Most Improved</span>
                          </div>
                          <p className="text-white text-xl font-bold">{rankMovement.most_improved.rto_code}</p>
                          <p className="text-gray-300 text-sm">
                            Improved by {rankMovement.most_improved.rank_change} ranks
                            ({rankMovement.most_improved.oct_rank} → {rankMovement.most_improved.nov_rank})
                          </p>
                        </div>
                      )}
                      {rankMovement.largest_decline && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-5 h-5 text-red-400" />
                            <span className="text-red-400 font-semibold">Largest Decline</span>
                          </div>
                          <p className="text-white text-xl font-bold">{rankMovement.largest_decline.rto_code}</p>
                          <p className="text-gray-300 text-sm">
                            Declined by {Math.abs(rankMovement.largest_decline.rank_change)} ranks
                            ({rankMovement.largest_decline.oct_rank} → {rankMovement.largest_decline.nov_rank})
                          </p>
                        </div>
                      )}
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          type="number" 
                          dataKey="x" 
                          name="Oct Rank" 
                          label={{ value: "Oct Rank", position: "insideBottom", offset: -5, style: { fill: '#9CA3AF' } }}
                          stroke="#9CA3AF"
                          domain={scatterData.length > 0 ? ['dataMin - 1', 'dataMax + 1'] : [0, 50]}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="y" 
                          name="Nov Rank" 
                          label={{ value: "Nov Rank", angle: -90, position: "insideLeft", style: { fill: '#9CA3AF' } }}
                          stroke="#9CA3AF"
                          domain={scatterData.length > 0 ? ['dataMin - 1', 'dataMax + 1'] : [0, 50]}
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }} 
                          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6', borderRadius: '8px' }}
                          formatter={(value, name, props) => {
                            if (name === 'x') return [`Oct Rank: ${value}`, 'Oct Rank'];
                            if (name === 'y') return [`Nov Rank: ${value}`, 'Nov Rank'];
                            return [value, name];
                          }}
                          labelFormatter={(label, payload) => {
                            if (payload && payload[0] && payload[0].payload) {
                              return `RTO: ${payload[0].payload.rto || 'Unknown'}`;
                            }
                            return '';
                          }}
                        />
                        <ReferenceLine y={x => x} stroke="#6B7280" strokeDasharray="3 3" label={{ value: "No Change", position: "topRight", style: { fill: '#6B7280' } }} />
                        <Scatter name="RTOs" data={scatterData} fill="#3B82F6" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Performance Distribution */}
                {allData?.rtos && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Performance Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={allData.rtos.map(r => ({ rto: r.rto_code, marks: r.overall_marks || 0 })).sort((a, b) => b.marks - a.marks)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="rto" stroke="#9CA3AF" angle={-90} textAnchor="end" height={150} />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }} />
                          <Bar dataKey="marks" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-10 text-center">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-400">Rank movement data is loading or unavailable.</p>
                  <p className="text-gray-500 text-sm mt-2">Please check the console for details or refresh the page.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Revenue & Digital Tab */}
          <TabsContent value="revenue" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-white mr-3" />
                <span className="text-white">Loading revenue data...</span>
              </div>
            ) : onlineRevenue ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-5">
                      <p className="text-gray-400 text-sm mb-1">Weighted Online Share</p>
                      <p className="text-2xl font-bold text-white">
                        {onlineRevenue.weighted_online_share?.toFixed(2) || "0"}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-5">
                      <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(onlineRevenue.total_revenue || 0)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-5">
                      <p className="text-gray-400 text-sm mb-1">Online Revenue</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(onlineRevenue.online_revenue || 0)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Online Payment % Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={onlineRevenueHistogram}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="range" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }} />
                          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Top Revenue RTOs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {onlineRevenue.top_revenue_rtos?.slice(0, 10).map((rto, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                            <span className="text-white">{rto.rto_code}</span>
                            <div className="text-right">
                              <p className="text-white font-semibold">{formatCurrency(rto.total_revenue)}</p>
                              <p className="text-gray-400 text-xs">{rto.online_percentage?.toFixed(1)}% online</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Lowest Online % RTOs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-white">RTO</TableHead>
                          <TableHead className="text-right text-white">Total Revenue</TableHead>
                          <TableHead className="text-right text-white">Online %</TableHead>
                          <TableHead className="text-right text-white">Cash Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {onlineRevenue.lowest_online_rtos?.slice(0, 10).map((rto, idx) => (
                          <TableRow key={idx} className="border-gray-700">
                            <TableCell className="text-white">{rto.rto_code}</TableCell>
                            <TableCell className="text-right text-white">{formatCurrency(rto.total_revenue)}</TableCell>
                            <TableCell className="text-right text-white">{rto.online_percentage?.toFixed(2)}%</TableCell>
                            <TableCell className="text-right text-white">{formatCurrency(rto.cash_revenue)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-10 text-center">
                  <p className="text-gray-400">No revenue data available. Please refresh or check the API connection.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pendency Analysis Tab */}
          <TabsContent value="pendency" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-white mr-3" />
                <span className="text-white">Loading pendency data...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sarathi Pendency */}
                {sarathiPendency ? (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Sarathi Pendency Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm">Weighted Pendency Ratio</p>
                        <p className="text-2xl font-bold text-white">
                          {sarathiPendency.weighted_pendency_ratio?.toFixed(2) || "0"}%
                        </p>
                      </div>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart 
                          data={sarathiPendency.worst_pendency_rtos?.slice(0, 10).map(r => ({
                            rto: r.rto_code,
                            pendency: r.pendency_percentage
                          })) || []}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis type="number" stroke="#9CA3AF" />
                          <YAxis dataKey="rto" type="category" stroke="#9CA3AF" width={80} />
                          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }} />
                          <Bar dataKey="pendency" fill="#EF4444" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-4 space-y-2">
                        {sarathiPendency.worst_pendency_rtos?.slice(0, 5).map((rto, idx) => (
                          <div key={idx} className="flex justify-between text-sm text-gray-300">
                            <span>{rto.rto_code}</span>
                            <span className="font-semibold">{rto.pendency_percentage?.toFixed(2)}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-10 text-center">
                      <p className="text-gray-400">No Sarathi pendency data available.</p>
                    </CardContent>
                  </Card>
                )}

                {/* Vahan Pendency */}
                {vahanPendency ? (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Vahan Pendency Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm">Weighted Pendency Ratio</p>
                        <p className="text-2xl font-bold text-white">
                          {vahanPendency.weighted_pendency_ratio?.toFixed(2) || "0"}%
                        </p>
                      </div>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart 
                          data={vahanPendency.worst_pendency_rtos?.slice(0, 10).map(r => ({
                            rto: r.rto_code,
                            pendency: r.pendency_percentage
                          })) || []}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis type="number" stroke="#9CA3AF" />
                          <YAxis dataKey="rto" type="category" stroke="#9CA3AF" width={80} />
                          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }} />
                          <Bar dataKey="pendency" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-4 space-y-2">
                        {vahanPendency.worst_pendency_rtos?.slice(0, 5).map((rto, idx) => (
                          <div key={idx} className="flex justify-between text-sm text-gray-300">
                            <span>{rto.rto_code}</span>
                            <span className="font-semibold">{rto.pendency_percentage?.toFixed(2)}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-10 text-center">
                      <p className="text-gray-400">No Vahan pendency data available.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Enforcement Tab */}
          <TabsContent value="enforcement" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-white mr-3" />
                <span className="text-white">Loading enforcement data...</span>
              </div>
            ) : challanPendency ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-5">
                      <p className="text-gray-400 text-sm mb-1">Weighted Pending Ratio</p>
                      <p className="text-2xl font-bold text-white">
                        {challanPendency.weighted_pending_ratio?.toFixed(2) || "0"}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-5">
                      <p className="text-gray-400 text-sm mb-1">Total Challans</p>
                      <p className="text-2xl font-bold text-white">
                        {formatNumber(challanPendency.total_challans || 0)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-5">
                      <p className="text-gray-400 text-sm mb-1">Pending Challans</p>
                      <p className="text-2xl font-bold text-white">
                        {formatNumber(challanPendency.total_pending || 0)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Worst Pending % RTOs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart 
                        data={challanPendency.worst_pending_rtos?.slice(0, 10).map(r => ({
                          rto: r.rto_code,
                          pending: r.pending_percentage,
                          disposal: r.disposal_percentage,
                          device: r.device_collection_percentage
                        })) || []}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="rto" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }} />
                        <Bar dataKey="pending" fill="#EF4444" name="Pending %" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="disposal" fill="#10B981" name="Disposal %" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="device" fill="#3B82F6" name="Device Collection %" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Challan Management Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-white">RTO</TableHead>
                          <TableHead className="text-right text-white">Total</TableHead>
                          <TableHead className="text-right text-white">Pending</TableHead>
                          <TableHead className="text-right text-white">Disposed</TableHead>
                          <TableHead className="text-right text-white">Pending %</TableHead>
                          <TableHead className="text-right text-white">Device %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {challanPendency.worst_pending_rtos?.slice(0, 10).map((rto, idx) => (
                          <TableRow key={idx} className="border-gray-700">
                            <TableCell className="text-white">{rto.rto_code}</TableCell>
                            <TableCell className="text-right text-white">{formatNumber(rto.total_challans)}</TableCell>
                            <TableCell className="text-right text-white">{formatNumber(rto.pending)}</TableCell>
                            <TableCell className="text-right text-white">{formatNumber(rto.disposed)}</TableCell>
                            <TableCell className="text-right text-white">{rto.pending_percentage?.toFixed(2)}%</TableCell>
                            <TableCell className="text-right text-white">{rto.device_collection_percentage?.toFixed(2)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-10 text-center">
                  <p className="text-gray-400">No enforcement data available. Please refresh or check the API connection.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* KPI Drivers Tab */}
          <TabsContent value="drivers" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-white mr-3" />
                <span className="text-white">Loading KPI drivers data...</span>
              </div>
            ) : kpiDrivers ? (
              <>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">KPI Driver Impact Analysis</CardTitle>
                    <p className="text-gray-400 text-sm mt-2">
                      Correlation analysis showing which components most impact overall marks
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={correlationData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" domain={[-1, 1]} stroke="#9CA3AF" />
                        <YAxis dataKey="component" type="category" stroke="#9CA3AF" width={200} />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }} />
                        <Bar dataKey="correlation" fill="#8B5CF6" radius={[0, 4, 4, 0]}>
                          {correlationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.correlation > 0 ? '#10B981' : '#EF4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-6 space-y-3">
                      <h3 className="text-white font-semibold mb-3">Driver Ranking</h3>
                      {kpiDrivers.driver_ranking?.map((driver, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-blue-500' : 'bg-gray-500'
                            }`}>
                              {idx + 1}
                            </div>
                            <span className="text-white">
                              {driver.component.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                          <Badge variant={driver.correlation > 0.5 ? "default" : driver.correlation > 0 ? "secondary" : "destructive"}>
                            {driver.correlation.toFixed(3)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-10 text-center">
                  <p className="text-gray-400">No KPI drivers data available. Please refresh or check the API connection.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* RTO Level KPIs Tab */}
          <TabsContent value="rto-level" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-white mr-3" />
                <span className="text-white">Loading RTO Level KPIs...</span>
              </div>
            ) : (
              <Tabs defaultValue="performance" className="w-full">
                <TabsList className="bg-gray-800/50 border-gray-700 mb-6">
                  <TabsTrigger value="performance" className="data-[state=active]:bg-orange-500">Performance</TabsTrigger>
                  <TabsTrigger value="derived" className="data-[state=active]:bg-orange-500">Derived KPIs</TabsTrigger>
                </TabsList>
                
                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                  {rtoPerformanceData && rtoPerformanceData.length > 0 ? (
                    <>
                      {/* Calculate Top 5 and Bottom 5 RTOs by average SLA */}
                      {(() => {
                        const rtoDataWithAvg = rtoPerformanceData
                          .filter(rto => rto && (rto.RTO || rto["RTO"]))
                          .map(rto => {
                            const citizenSLA = Number(
                              rto["Citizen Service SLA % (within SLA)"] || 
                              rto["Citizen Service SLA"] || 
                              rto["CitizenServiceSLA"] || 
                              0
                            );
                            const grievanceSLA = Number(
                              rto["Grievance SLA % (within SLA)"] || 
                              rto["Grievance SLA"] || 
                              rto["GrievanceSLA"] || 
                              0
                            );
                            const avgSLA = (citizenSLA + grievanceSLA) / 2;
                            const rtoCode = rto.RTO || rto["RTO"] || "Unknown";
                            return {
                              ...rto,
                              RTO: rtoCode,
                              "Citizen Service SLA % (within SLA)": citizenSLA,
                              "Grievance SLA % (within SLA)": grievanceSLA,
                              avgSLA: avgSLA
                            };
                          })
                          .filter(rto => {
                            const hasCitizenSLA = (rto["Citizen Service SLA % (within SLA)"] || 0) > 0;
                            const hasGrievanceSLA = (rto["Grievance SLA % (within SLA)"] || 0) > 0;
                            return hasCitizenSLA || hasGrievanceSLA;
                          });
                        
                        rtoDataWithAvg.sort((a, b) => b.avgSLA - a.avgSLA);
                        const top5 = rtoDataWithAvg.slice(0, Math.min(5, rtoDataWithAvg.length));
                        const bottom5Count = Math.min(5, rtoDataWithAvg.length);
                        const bottom5 = rtoDataWithAvg.slice(-bottom5Count).reverse();
                        
                        return (
                          <>
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <Card 
                                className="bg-gray-800/50 border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => handleDrillDown('service_delivery', 'Service Delivery', 'View service delivery details')}
                              >
                                <CardContent className="p-5">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="text-gray-400 text-sm font-medium mb-1">Avg Faceless %</p>
                                      <p className="text-2xl font-bold text-white">
                                        {rtoPerformanceData.length > 0 
                                          ? (rtoPerformanceData.reduce((sum, r) => sum + (r["Faceless Application %"] || 0), 0) / rtoPerformanceData.length).toFixed(1)
                                          : 0}%
                                      </p>
                                    </div>
                                    <Shield className="w-8 h-8 text-purple-500" />
                                  </div>
                                </CardContent>
                              </Card>
                              <Card 
                                className="bg-gray-800/50 border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => handleDrillDown('service_delivery', 'Service SLA', 'View service SLA details')}
                              >
                                <CardContent className="p-5">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="text-gray-400 text-sm font-medium mb-1">Avg Service SLA</p>
                                      <p className="text-2xl font-bold text-white">
                                        {rtoPerformanceData.length > 0 
                                          ? (rtoPerformanceData.reduce((sum, r) => sum + (r["Citizen Service SLA % (within SLA)"] || 0), 0) / rtoPerformanceData.length).toFixed(1)
                                          : 0}%
                                      </p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                  </div>
                                </CardContent>
                              </Card>
                              <Card 
                                className="bg-gray-800/50 border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => handleDrillDown('revenue_trend', 'Revenue', 'View revenue details')}
                              >
                                <CardContent className="p-5">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="text-gray-400 text-sm font-medium mb-1">Total Revenue</p>
                                      <p className="text-2xl font-bold text-white">
                                        {formatCurrency(
                                          rtoPerformanceData.reduce((sum, r) => sum + (r["Revenue - Actual"] || 0), 0)
                                        )}
                                      </p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-green-500" />
                                  </div>
                                </CardContent>
                              </Card>
                              <Card 
                                className="bg-gray-800/50 border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => handleDrillDown('rto_breakdown', 'Tax Defaulters', 'View tax defaulters', { dataKey: 'rto_performance' })}
                              >
                                <CardContent className="p-5">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="text-gray-400 text-sm font-medium mb-1">Tax Defaulters</p>
                                      <p className="text-2xl font-bold text-white">
                                        {formatNumber(
                                          rtoPerformanceData.reduce((sum, r) => sum + (r["Tax Defaulter - Count"] || 0), 0)
                                        )}
                                      </p>
                                    </div>
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Top 5 RTO Performance Ranking */}
                            <Card className="bg-gray-800/50 border-gray-700">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                  <TrendingUp className="w-5 h-5 text-green-500" />
                                  Top 5 RTO Performance Ranking
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="h-80">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={top5} layout="vertical">
                                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                      <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" />
                                      <YAxis dataKey="RTO" type="category" width={120} stroke="#9CA3AF" />
                                      <Tooltip 
                                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                                        labelStyle={{ color: '#F3F4F6' }}
                                        itemStyle={{ color: '#F3F4F6' }}
                                        formatter={(value) => `${value}%`}
                                      />
                                      <Legend />
                                      <Bar dataKey="Citizen Service SLA % (within SLA)" fill="#10B981" name="Citizen Service SLA % (within SLA)" radius={[0, 4, 4, 0]} />
                                      <Bar dataKey="Grievance SLA % (within SLA)" fill="#3B82F6" name="Grievance SLA % (within SLA)" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Bottom 5 RTO Performance Ranking */}
                            <Card className="bg-gray-800/50 border-gray-700">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                  <TrendingDown className="w-5 h-5 text-red-500" />
                                  Bottom 5 RTO Performance Ranking
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="h-80">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bottom5} layout="vertical">
                                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                      <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" />
                                      <YAxis dataKey="RTO" type="category" width={120} stroke="#9CA3AF" />
                                      <Tooltip 
                                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                                        labelStyle={{ color: '#F3F4F6' }}
                                        itemStyle={{ color: '#F3F4F6' }}
                                        formatter={(value) => `${value}%`}
                                      />
                                      <Legend />
                                      <Bar dataKey="Citizen Service SLA % (within SLA)" fill="#10B981" name="Citizen Service SLA % (within SLA)" radius={[0, 4, 4, 0]} />
                                      <Bar dataKey="Grievance SLA % (within SLA)" fill="#3B82F6" name="Grievance SLA % (within SLA)" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </CardContent>
                            </Card>
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardContent className="p-10 text-center">
                        <p className="text-gray-400">No RTO performance data available</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Derived KPIs Tab */}
                <TabsContent value="derived" className="space-y-6">
                  {rtoDerivedKPIs && !rtoDerivedKPIs.error ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card 
                        className="bg-gray-800/50 border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleDrillDown('rto_breakdown', 'Performance Index', 'View RTO breakdown', { state: rtoDerivedKPIs.state, rto: rtoDerivedKPIs.rto })}
                      >
                        <CardContent className="p-5">
                          <p className="text-gray-400 text-sm font-medium mb-1">Performance Index</p>
                          <p className="text-2xl font-bold text-white">
                            {rtoDerivedKPIs.derived_kpis?.rto_performance_index || 0}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Click to view details</p>
                        </CardContent>
                      </Card>
                      <Card 
                        className="bg-gray-800/50 border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleDrillDown('rto_breakdown', 'Revenue per RTO', 'View revenue breakdown', { state: rtoDerivedKPIs.state, rto: rtoDerivedKPIs.rto })}
                      >
                        <CardContent className="p-5">
                          <p className="text-gray-400 text-sm font-medium mb-1">Revenue per RTO</p>
                          <p className="text-2xl font-bold text-white">
                            {formatCurrency(rtoDerivedKPIs.derived_kpis?.revenue_per_rto || 0)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Click to view breakdown</p>
                        </CardContent>
                      </Card>
                      <Card 
                        className="bg-gray-800/50 border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleDrillDown('enforcement', 'Enforcement Effectiveness', 'View enforcement analysis', { state: rtoDerivedKPIs.state })}
                      >
                        <CardContent className="p-5">
                          <p className="text-gray-400 text-sm font-medium mb-1">Enforcement Effectiveness</p>
                          <p className="text-2xl font-bold text-white">
                            {rtoDerivedKPIs.derived_kpis?.enforcement_effectiveness || 0}%
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Click to view analysis</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-5">
                          <p className="text-gray-400 text-sm font-medium mb-1">Faceless Application %</p>
                          <p className="text-2xl font-bold text-white">
                            {rtoDerivedKPIs.derived_kpis?.faceless_application_pct || 0}%
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardContent className="p-10 text-center">
                        <p className="text-gray-400">No derived KPIs data available</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </TabsContent>

          {/* RTO Performance Intelligence KPIs Tab */}
          <TabsContent value="intelligence" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-white mr-3" />
                <span className="text-white">Loading RTO Performance Intelligence KPIs...</span>
              </div>
            ) : rtoPerformanceKPIs ? (
              <>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Building2 className="h-5 w-5 text-orange-500" />
                      RTO Performance Intelligence KPIs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <KPICard
                        title="RTO Digital Maturity Score"
                        value={rtoPerformanceKPIs.kpis?.rto_digital_maturity_score}
                        unit=""
                        icon={Zap}
                        status={true}
                        description="Automation readiness"
                        drillDownType="rto_performance"
                        showProgress={true}
                      />
                      <KPICard
                        title="RTO Financial Health Index"
                        value={rtoPerformanceKPIs.kpis?.rto_financial_health_index}
                        icon={DollarSign}
                        description="Fiscal discipline"
                        drillDownType="rto_performance"
                      />
                      <KPICard
                        title="RTO Risk Flag"
                        value={rtoPerformanceKPIs.kpis?.rto_risk_flag}
                        icon={AlertTriangle}
                        description="Governance risk"
                        drillDownType="rto_performance"
                      />
                      <KPICard
                        title="Composite RTO Performance Index"
                        value={rtoPerformanceKPIs.kpis?.composite_rto_performance_index}
                        unit=""
                        icon={Award}
                        status={true}
                        description="Overall score"
                        drillDownType="rto_performance"
                        showProgress={true}
                      />
                    </div>
                    
                    {/* RTO Performance Metrics */}
                    <Card className="mt-4 bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">RTO Performance Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={[
                            { 
                              name: 'Faceless %', 
                              value: rtoPerformanceKPIs.supporting_metrics?.faceless_percentage || 0,
                              fill: '#3B82F6'
                            },
                            { 
                              name: 'SLA %', 
                              value: rtoPerformanceKPIs.supporting_metrics?.sla_percentage || 0,
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
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-10 text-center">
                  <p className="text-gray-400">No RTO Performance Intelligence KPIs data available. Please refresh or check the API connection.</p>
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

              {/* RTO Performance Ranking Chart - Top 5 and Bottom 5 */}
              {drillDownData.rto_ranking && Array.isArray(drillDownData.rto_ranking) && drillDownData.rto_ranking.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">RTO Performance Ranking (Top 5 & Bottom 5)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={drillDownData.rto_ranking} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" />
                          <YAxis dataKey="rto" type="category" stroke="#9CA3AF" width={120} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                            labelStyle={{ color: '#F3F4F6' }}
                            itemStyle={{ color: '#F3F4F6' }}
                            formatter={(value) => `${value}%`}
                          />
                          <Legend wrapperStyle={{ color: '#F3F4F6' }} />
                          <Bar dataKey="citizen_sla" fill="#10B981" name="Citizen Service SLA % (within SLA)" radius={[0, 4, 4, 0]} />
                          <Bar dataKey="grievance_sla" fill="#3B82F6" name="Grievance SLA % (within SLA)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
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
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RTOAnalysis;

