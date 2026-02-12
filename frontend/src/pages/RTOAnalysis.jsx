import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, 
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Treemap, ReferenceLine
} from "recharts";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";
import { 
  TrendingUp, TrendingDown, Award, AlertTriangle, RefreshCw,
  BarChart3, Target, Activity, DollarSign, FileCheck, Shield
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import AnimatedCounter from "@/components/AnimatedCounter";
import InsightsSection from "@/components/InsightsSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const COLORS = ['#F97316', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B'];

const RTOAnalysis = () => {
  const [overview, setOverview] = useState(null);
  const [topBottom, setTopBottom] = useState(null);
  const [rankMovement, setRankMovement] = useState(null);
  const [kpiDrivers, setKpiDrivers] = useState(null);
  const [onlineRevenue, setOnlineRevenue] = useState(null);
  const [sarathiPendency, setSarathiPendency] = useState(null);
  const [vahanPendency, setVahanPendency] = useState(null);
  const [challanPendency, setChallanPendency] = useState(null);
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        overviewRes,
        topBottomRes,
        rankMovementRes,
        kpiDriversRes,
        onlineRevenueRes,
        sarathiRes,
        vahanRes,
        challanRes,
        allDataRes
      ] = await Promise.all([
        axios.get(`${API}/rto-analysis/overview`),
        axios.get(`${API}/rto-analysis/top-bottom?limit=10`),
        axios.get(`${API}/rto-analysis/rank-movement`),
        axios.get(`${API}/rto-analysis/kpi-drivers`),
        axios.get(`${API}/rto-analysis/online-revenue`),
        axios.get(`${API}/rto-analysis/sarathi-pendency`),
        axios.get(`${API}/rto-analysis/vahan-pendency`),
        axios.get(`${API}/rto-analysis/challan-pendency`),
        axios.get(`${API}/rto-analysis/all-data`)
      ]);

      setOverview(overviewRes.data);
      setTopBottom(topBottomRes.data);
      setRankMovement(rankMovementRes.data);
      setKpiDrivers(kpiDriversRes.data);
      setOnlineRevenue(onlineRevenueRes.data);
      setSarathiPendency(sarathiRes.data);
      setVahanPendency(vahanRes.data);
      setChallanPendency(challanRes.data);
      setAllData(allDataRes.data);

      toast.success("RTO Analysis data loaded");
    } catch (error) {
      console.error("Error fetching RTO analysis data:", error);
      toast.error("Failed to load RTO analysis data");
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (!rankMovement?.scatter_data) return [];
    return rankMovement.scatter_data.map(d => ({
      x: d.oct_rank,
      y: d.nov_rank,
      rto: d.rto
    }));
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
            {categoryComparisonData.length > 0 && (
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
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            {/* Rank Movement */}
            {rankMovement && (
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
                        <XAxis type="number" dataKey="x" name="Oct Rank" stroke="#9CA3AF" />
                        <YAxis type="number" dataKey="y" name="Nov Rank" stroke="#9CA3AF" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }} />
                        <ReferenceLine y={x => x} stroke="#6B7280" strokeDasharray="3 3" />
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
            )}
          </TabsContent>

          {/* Revenue & Digital Tab */}
          <TabsContent value="revenue" className="space-y-6">
            {onlineRevenue && (
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
            )}
          </TabsContent>

          {/* Pendency Analysis Tab */}
          <TabsContent value="pendency" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sarathi Pendency */}
              {sarathiPendency && (
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
              )}

              {/* Vahan Pendency */}
              {vahanPendency && (
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
              )}
            </div>
          </TabsContent>

          {/* Enforcement Tab */}
          <TabsContent value="enforcement" className="space-y-6">
            {challanPendency && (
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
            )}
          </TabsContent>

          {/* KPI Drivers Tab */}
          <TabsContent value="drivers" className="space-y-6">
            {kpiDrivers && (
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RTOAnalysis;

