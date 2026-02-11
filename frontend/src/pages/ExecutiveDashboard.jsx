import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, TrendingDown, Car, FileText, Users, AlertTriangle, 
  Clock, CheckCircle, BarChart3, RefreshCw, Download, Settings,
  Lightbulb, AlertCircle, Info
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSearchParams } from "react-router-dom";
import InsightsSection from "@/components/InsightsSection";
import AnimatedCounter from "@/components/AnimatedCounter";
import ScrollReveal from "@/components/ScrollReveal";

const COLORS = ['#F97316', '#3B82F6', '#0D9488', '#EA580C', '#10B981'];

const ExecutiveDashboard = () => {
  const [searchParams] = useSearchParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [processOpen, setProcessOpen] = useState(false);
  const [processData, setProcessData] = useState(null);
  const [processLoading, setProcessLoading] = useState(false);

  const geoParams = useCallback(() => {
    return Object.fromEntries(
      ["state_cd", "c_district", "city"]
        .map((k) => [k, searchParams.get(k) || ""])
        .filter(([, v]) => v)
    );
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Debug: helps diagnose proxy/env/CORS issues in the browser console.
      console.log("[ExecutiveDashboard] API base:", API, "origin:", window?.location?.origin);
      const response = await axios.get(`${API}/dashboard/executive-summary`, { params: geoParams() });
      console.log("[ExecutiveDashboard] Raw API response:", response.data);
      console.log("[ExecutiveDashboard] median_vehicle_value:", response.data?.median_vehicle_value, "type:", typeof response.data?.median_vehicle_value);
      if (response.data?.median_vehicle_value) {
        const calculated = response.data.median_vehicle_value / 100000;
        console.log("[ExecutiveDashboard] Calculated display value:", calculated, "toFixed(1):", calculated.toFixed(1));
      }
      setSummary(response.data);
      setLastUpdated(new Date());
      toast.success("Dashboard data refreshed");
    } catch (error) {
      console.error("Error fetching executive summary:", error);
      const status = error?.response?.status;
      const url = error?.config?.url;
      const msg = error?.message || "Request failed";
      toast.error(`Failed to fetch dashboard data${status ? ` (HTTP ${status})` : ""}: ${msg}${url ? ` — ${url}` : ""}`);
    } finally {
      setLoading(false);
    }
  }, [geoParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchProcessEfficiency = useCallback(async () => {
    setProcessLoading(true);
    try {
      const res = await axios.get(`${API}/dashboard/vahan/process-efficiency`, { params: geoParams() });
      setProcessData(res.data);
    } catch (e) {
      console.error("Error fetching process efficiency:", e);
      toast.error("Failed to fetch process efficiency data");
    } finally {
      setProcessLoading(false);
    }
  }, [geoParams]);

  useEffect(() => {
    if (processOpen && !processData && !processLoading) {
      fetchProcessEfficiency();
    }
  }, [processOpen, processData, processLoading, fetchProcessEfficiency]);

  const kpiCards = summary ? [
    {
      title: "Total Registrations",
      value: summary.total_registrations?.toLocaleString() || "0",
      change: summary.monthly_growth_percent,
      trend: "up",
      icon: Car,
      color: "primary"
    },
    {
      title: "Median Vehicle Value",
      value: (() => {
        const medianValue = summary.median_vehicle_value;
        if (!medianValue || medianValue <= 0) return "N/A";
        // Ensure it's a number
        const numValue = typeof medianValue === 'string' ? parseFloat(medianValue) : Number(medianValue);
        if (isNaN(numValue) || numValue <= 0) return "N/A";
        const displayValue = (numValue / 100000).toFixed(1);
        console.log("[ExecutiveDashboard] Display calculation - raw:", medianValue, "numValue:", numValue, "displayValue:", displayValue);
        return `₹${displayValue}L`;
      })(),
      change: 5.2,
      trend: "up",
      icon: TrendingUp,
      color: "secondary"
    },
    {
      title: "Avg Registration Delay",
      value: `${summary.avg_registration_delay} days`,
      change: -2.1,
      trend: "down",
      icon: Clock,
      color: "accent"
    },
    {
      title: "Active Registrations",
      value: `${summary.active_registrations_percent}%`,
      change: 1.4,
      trend: "up",
      icon: CheckCircle,
      color: "info"
    },
    {
      title: "Total Tickets",
      value: summary.total_tickets?.toLocaleString() || "0",
      change: summary.ticket_closure_rate,
      trend: "up",
      icon: FileText,
      color: "warning"
    },
    {
      title: "Ticket Closure Rate",
      value: `${summary.ticket_closure_rate}%`,
      change: 3.8,
      trend: "up",
      icon: CheckCircle,
      color: "primary"
    },
    {
      title: "Avg Resolution Time",
      value: `${summary.avg_resolution_time} days`,
      change: -1.2,
      trend: "down",
      icon: Clock,
      color: "secondary"
    },
    {
      title: "Data Quality Score",
      value: `${summary.data_quality_score}%`,
      change: 0.5,
      trend: "up",
      icon: BarChart3,
      color: "accent"
    }
  ] : [];

  const getInsightIcon = (type) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "recommendation": return <Lightbulb className="w-5 h-5 text-orange-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getInsightBg = (type) => {
    switch (type) {
      case "warning": return "bg-amber-50 border-l-amber-500";
      case "recommendation": return "bg-orange-50 border-l-orange-500";
      default: return "bg-blue-50 border-l-blue-500";
    }
  };

  // Mock trend data
  const trendData = [
    { month: "Jan", registrations: 850, tickets: 45 },
    { month: "Feb", registrations: 920, tickets: 52 },
    { month: "Mar", registrations: 780, tickets: 38 },
    { month: "Apr", registrations: 1100, tickets: 61 },
    { month: "May", registrations: 950, tickets: 48 },
    { month: "Jun", registrations: 1050, tickets: 55 }
  ];

  // Calculate compliance data with actual counts
  const complianceData = useMemo(() => {
    const totalRegistrations = summary?.total_registrations || 10000;
    const complianceRiskCount = summary?.compliance_risk_count || 0;
    const activePercent = summary?.active_registrations_percent || 96.4;
    
    // Calculate counts based on percentages and risk count
    const compliantPercent = activePercent;
    const expiredPercent = (complianceRiskCount / totalRegistrations) * 100;
    const expiringPercent = Math.max(0, 100 - compliantPercent - expiredPercent);
    
    const compliantCount = Math.round((compliantPercent / 100) * totalRegistrations);
    const expiringCount = Math.round((expiringPercent / 100) * totalRegistrations);
    const expiredCount = complianceRiskCount;
    
    return [
      { name: "Compliant", value: compliantPercent, count: compliantCount, color: "#10B981" },
      { name: "Expiring Soon", value: expiringPercent, count: expiringCount, color: "#F59E0B" },
      { name: "Expired", value: expiredPercent, count: expiredCount, color: "#EF4444" }
  ];
  }, [summary]);

  const executiveNarrative = useMemo(() => {
    if (!summary) return { insights: [], recommendations: [], actionItems: [] };

    const ai = Array.isArray(summary.ai_insights) ? summary.ai_insights : [];
    const aiInsights = ai.filter((x) => x?.type !== "recommendation").map((x) => x.message).filter(Boolean);
    const aiRecs = ai.filter((x) => x?.type === "recommendation").map((x) => x.message).filter(Boolean);

    const insights = [
      `Total registrations: ${(summary.total_registrations || 0).toLocaleString()} (MoM: ${summary.monthly_growth_percent || 0}%).`,
      `Ticket closure rate: ${summary.ticket_closure_rate || 0}% (avg resolution: ${summary.avg_resolution_time || 0} days).`,
      `Active registrations: ${summary.active_registrations_percent || 0}%. Data quality score: ${summary.data_quality_score || 0}%.`,
      ...aiInsights,
    ].filter(Boolean);

    const recommendations = [
      ...(aiRecs.length ? aiRecs : []),
      (summary.avg_registration_delay || 0) > 30 ? "Reduce registration delays by prioritizing long-lag cases and fixing upstream data issues." : null,
      (summary.compliance_risk_count || 0) > 0 ? "Run targeted compliance drives for expiring/expired registrations (SMS/IVR nudges + RTO queue)." : null,
    ].filter(Boolean);

    const actionItems = [
      "Open **Process Efficiency** drilldown and focus on buckets >60 days.",
      (summary.stale_ticket_percent || 0) > 25 ? "Create a ‘stale ticket’ war-room: reassign >30-day tickets and publish daily closure targets." : null,
      (summary.compliance_risk_count || 0) > 0 ? "Generate compliance-risk list and schedule automated reminders for expiring cases." : null,
    ].filter(Boolean);

    return { insights, recommendations, actionItems };
  }, [summary]);

  const processNarrative = useMemo(() => {
    if (!processData) return { insights: [], recommendations: [], actionItems: [] };
    const gt60 = Number(processData?.delayed_pct?.gt_60 || 0);
    const invalid = Number(processData?.invalid_date_sequence_count || 0);

    const topBucket = Array.isArray(processData.lag_buckets)
      ? [...processData.lag_buckets].sort((a, b) => (b.count || 0) - (a.count || 0))[0]
      : null;

    const insights = [
      `Avg delay: ${processData.avg_delay_days}d; median: ${processData.median_delay_days}d; P95: ${processData.p95_delay_days}d.`,
      topBucket?.bucket ? `Highest volume lag bucket: ${topBucket.bucket} (${(topBucket.count || 0).toLocaleString()} records).` : null,
      gt60 ? `${gt60}% registrations are delayed >60 days.` : null,
      invalid ? `${invalid.toLocaleString()} records have invalid date sequences.` : null,
    ].filter(Boolean);

    const recommendations = [
      gt60 > 10 ? "Prioritize clearing cases delayed >60 days; add SLA escalation and daily backlog burn-down." : "Maintain current SLA performance; monitor P95 for early signals.",
      invalid > 0 ? "Add data validation at source (purchase_dt/regn_dt) and auto-flag negative lags for review." : null,
    ].filter(Boolean);

    const actionItems = [
      "Identify top contributing RTOs/regions for the highest lag bucket and assign owners.",
      "Create an exception queue for invalid sequences and fix at ingestion.",
      "Re-run the drilldown after fixes to confirm lag distribution shift.",
    ];

    return { insights, recommendations, actionItems };
  }, [processData]);

  return (
    <div className="space-y-6" data-testid="executive-dashboard">
      {/* Header */}
      <ScrollReveal delay={0}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 gradient-text-animated">
            Executive Dashboard
          </h1>
            <p className="text-white/60 blur-in">
            Real-time insights and analytics for transport governance
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <span className="text-white/50 text-sm pulse-ring">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button 
            data-testid="refresh-btn"
            onClick={fetchData} 
            variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 liquid-button magnetic-hover"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            data-testid="download-report-btn"
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white liquid-button hover-lift magnetic-hover"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      </ScrollReveal>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <ScrollReveal key={index} delay={index * 100} direction="up">
          <Card 
              className={`kpi-card-enhanced ${kpi.color} hover-lift card-3d magnetic-hover ripple-effect`}
            data-testid={`kpi-card-${index}`}
            role={kpi.title === "Avg Registration Delay" ? "button" : undefined}
            tabIndex={kpi.title === "Avg Registration Delay" ? 0 : undefined}
            onClick={() => {
              if (kpi.title === "Avg Registration Delay") setProcessOpen(true);
            }}
            onKeyDown={(e) => {
              if (kpi.title === "Avg Registration Delay" && (e.key === "Enter" || e.key === " ")) {
                setProcessOpen(true);
              }
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {typeof kpi.value === 'string' && (kpi.value.includes('%') || kpi.value.includes('₹') || kpi.value.includes('L') || kpi.value.includes('days') || kpi.value === 'N/A') ? (
                        kpi.value
                      ) : (
                        <AnimatedCounter 
                          value={typeof kpi.value === 'string' ? parseFloat(kpi.value.replace(/[^0-9.-]/g, '')) : kpi.value} 
                          suffix={kpi.value.toString().includes('%') ? '%' : ''}
                        />
                      )}
                    </p>
                </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center floating-particle glow-effect ${
                  kpi.color === 'primary' ? 'bg-orange-100' :
                  kpi.color === 'secondary' ? 'bg-blue-100' :
                  kpi.color === 'accent' ? 'bg-teal-100' :
                  kpi.color === 'warning' ? 'bg-amber-100' :
                  'bg-blue-100'
                }`}>
                  <kpi.icon className={`w-5 h-5 ${
                    kpi.color === 'primary' ? 'text-orange-600' :
                    kpi.color === 'secondary' ? 'text-blue-600' :
                    kpi.color === 'accent' ? 'text-teal-600' :
                    kpi.color === 'warning' ? 'text-amber-600' :
                    'text-blue-600'
                  }`} />
                </div>
              </div>
              <div className="flex items-center mt-3">
                {kpi.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1 floating-particle" />
                ) : (
                    <TrendingDown className="w-4 h-4 text-emerald-500 mr-1 floating-particle" />
                )}
                <span className="text-emerald-600 text-sm font-medium">
                  {kpi.change > 0 ? '+' : ''}{kpi.change}%
                </span>
                <span className="text-gray-400 text-sm ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
          </ScrollReveal>
        ))}
      </div>

      {/* Insights / Recommendations / Action Items */}
      {!loading && summary && (
        <InsightsSection
          title="Executive Narrative"
          titleClassName="text-white/90"
          insights={executiveNarrative.insights}
          recommendations={executiveNarrative.recommendations}
          actionItems={executiveNarrative.actionItems}
        />
      )}

      {/* Drilldown: Process Efficiency (Avg Registration Delay) */}
      <Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Process Efficiency</DialogTitle>
            <DialogDescription>
              Registration processing efficiency computed from `purchase_dt` → `regn_dt`.
            </DialogDescription>
          </DialogHeader>

          {processLoading && (
            <div className="py-10 text-sm text-muted-foreground">Loading…</div>
          )}

          {!processLoading && processData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">Avg Registration Delay</div>
                    <div className="text-xl font-bold text-gray-900">{processData.avg_delay_days} days</div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">Median Registration Delay</div>
                    <div className="text-xl font-bold text-gray-900">{processData.median_delay_days} days</div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">P95 Registration Delay</div>
                    <div className="text-xl font-bold text-gray-900">{processData.p95_delay_days} days</div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">Delayed Registrations %</div>
                    <div className="text-sm text-gray-700">
                      &gt;30d: <span className="font-semibold">{processData.delayed_pct.gt_30}%</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      &gt;60d: <span className="font-semibold">{processData.delayed_pct.gt_60}%</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      &gt;90d: <span className="font-semibold">{processData.delayed_pct.gt_90}%</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">Invalid Date Sequence Count</div>
                    <div className="text-xl font-bold text-gray-900">
                      {processData.invalid_date_sequence_count?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      out of {processData.record_count?.toLocaleString()} valid records
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900 text-base">Lag Bucket Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processData.lag_buckets || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="bucket" stroke="#94A3B8" />
                        <YAxis stroke="#94A3B8" />
                        <Tooltip />
                        <Bar dataKey="count" fill="#0D9488" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <InsightsSection
                title="Process Efficiency Narrative"
                insights={processNarrative.insights}
                recommendations={processNarrative.recommendations}
                actionItems={processNarrative.actionItems}
              />
            </div>
          )}

          {!processLoading && !processData && (
            <div className="py-10 text-sm text-muted-foreground">No data available.</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 bg-white shadow-lg" data-testid="trend-chart">
          <CardHeader>
            <CardTitle className="text-gray-900">Registration & Ticket Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" />
                  <YAxis yAxisId="left" stroke="#94A3B8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="registrations" 
                    stroke="#F97316" 
                    fill="url(#colorRegistrations)"
                    strokeWidth={2}
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="tickets" 
                    stroke="#3B82F6" 
                    fill="url(#colorTickets)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Pie Chart */}
        <Card className="bg-white shadow-lg" data-testid="compliance-chart">
          <CardHeader>
            <CardTitle className="text-gray-900">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complianceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {complianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${props.payload.count?.toLocaleString() || 0} (${value.toFixed(1)}%)`,
                      props.payload.name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-6">
              {complianceData.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="flex items-center mb-1">
                  <div 
                      className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  />
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {item.count?.toLocaleString() || 0}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({item.value.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {summary?.ai_insights && (
        <Card className="bg-white shadow-lg" data-testid="ai-insights">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-orange-500" />
                AI-Generated Insights
              </CardTitle>
              <Badge className="bg-orange-100 text-orange-700">
                {summary.ai_insights.length} New Insights
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.ai_insights.map((insight, index) => (
                <div className={`p-4 rounded-lg border-l-4 ${getInsightBg(insight.type)}`}
                  data-testid={`insight-${index}`}
                >
                  <div className="flex items-start space-x-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <Badge 
                        variant="outline" 
                        className={`mb-2 ${
                          insight.type === 'warning' ? 'border-amber-300 text-amber-700' :
                          insight.type === 'recommendation' ? 'border-orange-300 text-orange-700' :
                          'border-blue-300 text-blue-700'
                        }`}
                      >
                        {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                      </Badge>
                      <p className="text-gray-700">{insight.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          data-testid="action-generate-report"
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center bg-white hover:bg-gray-50"
        >
          <Download className="w-6 h-6 mb-2 text-orange-600" />
          <span className="text-gray-700">Generate Report</span>
        </Button>
        <Button 
          data-testid="action-set-kpis"
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center bg-white hover:bg-gray-50"
        >
          <Settings className="w-6 h-6 mb-2 text-blue-600" />
          <span className="text-gray-700">Set KPIs</span>
        </Button>
        <Button 
          data-testid="action-refresh-data"
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center bg-white hover:bg-gray-50"
          onClick={fetchData}
        >
          <RefreshCw className="w-6 h-6 mb-2 text-teal-600" />
          <span className="text-gray-700">Refresh Data</span>
        </Button>
        <Button 
          data-testid="action-export-csv"
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center bg-white hover:bg-gray-50"
        >
          <FileText className="w-6 h-6 mb-2 text-orange-600" />
          <span className="text-gray-700">Download CSV</span>
        </Button>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
