import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Car, Fuel, TrendingUp, MapPin, Factory, Clock, AlertTriangle,
  BarChart3, Download, RefreshCw, Filter
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from "recharts";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import InsightsSection from "@/components/InsightsSection";

const COLORS = ['#7C3AED', '#DB2777', '#0D9488', '#EA580C', '#2563EB', '#10B981', '#F59E0B'];

const VehicleAnalytics = () => {
  const [searchParams] = useSearchParams();
  const [kpis, setKpis] = useState(null);
  const [topManufacturers, setTopManufacturers] = useState([]);
  const [vehicleClasses, setVehicleClasses] = useState([]);
  const [delayStats, setDelayStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registrationsOpen, setRegistrationsOpen] = useState(false);
  const [registrationsDrilldown, setRegistrationsDrilldown] = useState(null);
  const [registrationsDrilldownLoading, setRegistrationsDrilldownLoading] = useState(false);
  const [valueOpen, setValueOpen] = useState(false);
  const [valueDrilldown, setValueDrilldown] = useState(null);
  const [valueDrilldownLoading, setValueDrilldownLoading] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [complianceData, setComplianceData] = useState(null);
  const [complianceLoading, setComplianceLoading] = useState(false);

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
      const [kpisRes, manuRes, classRes, delayRes] = await Promise.all([
        axios.get(`${API}/dashboard/vahan/kpis`, { params: geoParams() }),
        axios.get(`${API}/dashboard/vahan/top-manufacturers`, { params: geoParams() }),
        axios.get(`${API}/dashboard/vahan/vehicle-class-distribution`, { params: geoParams() }),
        axios.get(`${API}/dashboard/vahan/registration-delay-stats`, { params: geoParams() })
      ]);
      
      setKpis(kpisRes.data);
      setTopManufacturers(manuRes.data);
      setVehicleClasses(classRes.data);
      setDelayStats(delayRes.data);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch vehicle analytics");
    } finally {
      setLoading(false);
    }
  }, [geoParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchRegistrationsDrilldown = useCallback(async () => {
    setRegistrationsDrilldownLoading(true);
    try {
      const res = await axios.get(`${API}/dashboard/vahan/registrations/drilldown`, { params: geoParams() });
      setRegistrationsDrilldown(res.data);
    } catch (error) {
      console.error("Error fetching registrations drilldown:", error);
      toast.error("Failed to fetch registrations drilldown");
    } finally {
      setRegistrationsDrilldownLoading(false);
    }
  }, [geoParams]);

  useEffect(() => {
    if (registrationsOpen && !registrationsDrilldown && !registrationsDrilldownLoading) {
      fetchRegistrationsDrilldown();
    }
  }, [registrationsOpen, registrationsDrilldown, registrationsDrilldownLoading, fetchRegistrationsDrilldown]);

  const fetchValueDrilldown = useCallback(async () => {
    setValueDrilldownLoading(true);
    try {
      const res = await axios.get(`${API}/dashboard/vahan/value/drilldown`, { params: geoParams() });
      setValueDrilldown(res.data);
    } catch (error) {
      console.error("Error fetching value drilldown:", error);
      toast.error("Failed to fetch value drilldown");
    } finally {
      setValueDrilldownLoading(false);
    }
  }, [geoParams]);

  useEffect(() => {
    if (valueOpen && !valueDrilldown && !valueDrilldownLoading) {
      fetchValueDrilldown();
    }
  }, [valueOpen, valueDrilldown, valueDrilldownLoading, fetchValueDrilldown]);

  const fetchComplianceValidity = useCallback(async () => {
    setComplianceLoading(true);
    try {
      const res = await axios.get(`${API}/dashboard/vahan/compliance-validity`, { params: geoParams() });
      setComplianceData(res.data);
    } catch (error) {
      console.error("Error fetching compliance & validity:", error);
      toast.error("Failed to fetch compliance & validity");
    } finally {
      setComplianceLoading(false);
    }
  }, [geoParams]);

  useEffect(() => {
    if (complianceOpen && !complianceData && !complianceLoading) {
      fetchComplianceValidity();
    }
  }, [complianceOpen, complianceData, complianceLoading, fetchComplianceValidity]);

  const formatINRShort = (amount) => {
    const n = Number(amount || 0);
    if (!Number.isFinite(n)) return "₹0";
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
    if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
    return `₹${Math.round(n)}`;
  };

  // Transform fuel data for pie chart
  const fuelData = kpis?.registration_by_fuel 
    ? Object.entries(kpis.registration_by_fuel).map(([name, value]) => ({ name, value }))
    : [];

  // Transform category data
  const categoryData = kpis?.registration_by_category
    ? Object.entries(kpis.registration_by_category).map(([name, value]) => ({ name, value }))
    : [];

  // Transform state data for bar chart
  const stateData = kpis?.registration_by_state
    ? Object.entries(kpis.registration_by_state)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([state, count]) => ({ state, count }))
    : [];

  const dashboardNarrative = useMemo(() => {
    if (!kpis) return { insights: [], recommendations: [], actionItems: [] };

    const topCategory = categoryData?.[0]?.name
      ? [...categoryData].sort((a, b) => (b.value || 0) - (a.value || 0))[0]
      : null;
    const topFuel = fuelData?.[0]?.name ? [...fuelData].sort((a, b) => (b.value || 0) - (a.value || 0))[0] : null;
    const peakMonth = Array.isArray(kpis.monthly_trend)
      ? [...kpis.monthly_trend].sort((a, b) => (b.registrations || 0) - (a.registrations || 0))[0]
      : null;
    const topMaker = Array.isArray(topManufacturers) && topManufacturers.length ? topManufacturers[0] : null;

    const insights = [
      `Total registrations: ${(kpis.total_registrations || 0).toLocaleString()} (unique vehicles: ${(kpis.unique_vehicles || 0).toLocaleString()}).`,
      topCategory ? `Largest category: ${topCategory.name} (${topCategory.value.toLocaleString()} regs).` : null,
      topFuel ? `Dominant fuel: ${topFuel.name} (${topFuel.value.toLocaleString()} regs).` : null,
      peakMonth?.month ? `Peak month: ${peakMonth.month} (${(peakMonth.registrations || 0).toLocaleString()} regs).` : null,
      topMaker?.maker_label ? `Top manufacturer: ${topMaker.maker_label} (${(topMaker.count || 0).toLocaleString()} vehicles).` : null,
      `Compliance alerts: ${(kpis.compliance_alerts || 0).toLocaleString()}; Data quality: ${kpis.data_quality_score || 0}%.`,
    ].filter(Boolean);

    const recommendations = [
      (kpis.compliance_alerts || 0) > 0 ? "Run a compliance campaign for expiring/expired registrations and fitness." : null,
      (delayStats?.delayed_percentage || 0) > 10 ? "Improve processing SLA by prioritizing delayed buckets and fixing bottlenecks." : null,
      topCategory ? `Allocate resources to the highest-volume category (${topCategory.name}) for maximum impact.` : null,
    ].filter(Boolean);

    const actionItems = [
      "Open **Total Registrations — Drilldown** to validate mix + volatility drivers.",
      "Open **Avg Vehicle Value — Drilldown** to identify revenue concentration by state/category.",
      "Open **Compliance & Validity** drilldown to act on expiring/expired buckets.",
    ];

    return { insights, recommendations, actionItems };
  }, [kpis, categoryData, fuelData, topManufacturers, delayStats]);

  const tabsNarrative = useMemo(() => {
    if (!kpis) return {};

    const topState = stateData?.[0] || null;
    const topCategory = categoryData?.[0] ? [...categoryData].sort((a, b) => (b.value || 0) - (a.value || 0))[0] : null;
    const topFuel = fuelData?.[0] ? [...fuelData].sort((a, b) => (b.value || 0) - (a.value || 0))[0] : null;
    const topClass = Array.isArray(vehicleClasses) && vehicleClasses.length ? vehicleClasses[0] : null;
    const topMaker = Array.isArray(topManufacturers) && topManufacturers.length ? topManufacturers[0] : null;
    const onTime = (100 - Number(delayStats?.delayed_percentage || 0)).toFixed(1);

    return {
      overview: {
        insights: [
          topState?.state ? `Top state: ${topState.state} (${(topState.count || 0).toLocaleString()} regs).` : null,
          "Use monthly trend to spot seasonality and plan capacity.",
        ].filter(Boolean),
        recommendations: ["Validate state outliers by drilling into category/fuel composition."],
        actionItems: ["Export top-10 states and share with state ops leads."],
      },
      composition: {
        insights: [
          topCategory ? `Largest category: ${topCategory.name} (${topCategory.value.toLocaleString()} regs).` : null,
          topFuel ? `Dominant fuel: ${topFuel.name} (${topFuel.value.toLocaleString()} regs).` : null,
          topClass?.class ? `Top class: ${topClass.class} (${(topClass.count || 0).toLocaleString()} regs).` : null,
        ].filter(Boolean),
        recommendations: ["Use composition splits to tailor policy nudges (EV, emission norms) and capacity planning."],
        actionItems: ["Review top 3 classes monthly for compliance + road-safety impact."],
      },
      efficiency: {
        insights: [
          `On-time processing rate: ${onTime}% (delayed: ${delayStats?.delayed_percentage || 0}%).`,
          `Avg delay: ${delayStats?.avg_delay_days || 0}d; median: ${delayStats?.median_delay_days || 0}d; P90: ${delayStats?.p90_delay_days || 0}d.`,
        ],
        recommendations: [(delayStats?.delayed_percentage || 0) > 10 ? "Reduce delayed share by focusing on the largest delay bucket and process bottlenecks." : "Maintain SLA performance; monitor the largest delay bucket for drift."],
        actionItems: ["Assign owners to the top delay bucket and track weekly burn-down."],
      },
      manufacturers: {
        insights: [topMaker?.maker_label ? `Top manufacturer: ${topMaker.maker_label} (${(topMaker.count || 0).toLocaleString()} vehicles).` : null].filter(Boolean),
        recommendations: ["Use OEM split to align enforcement, recall comms, and revenue projections."],
        actionItems: ["Click through to **Maker Dashboard** for OEM drilldowns on volume, revenue, and pricing."],
      },
    };
  }, [kpis, stateData, categoryData, fuelData, vehicleClasses, topManufacturers, delayStats]);

  const registrationsNarrative = useMemo(() => {
    if (!registrationsDrilldown) return {};

    const topCat = registrationsDrilldown?.mix?.vehicle_category_mix?.[0]
      ? [...registrationsDrilldown.mix.vehicle_category_mix].sort((a, b) => (b.count || 0) - (a.count || 0))[0]
      : null;
    const topFuel = registrationsDrilldown?.mix?.fuel_type_penetration?.[0]
      ? [...registrationsDrilldown.mix.fuel_type_penetration].sort((a, b) => (b.count || 0) - (a.count || 0))[0]
      : null;
    const peak = registrationsDrilldown?.time?.peak_registration_month;
    const vol = registrationsDrilldown?.time?.registration_volatility?.volatility_index;
    const topClass = registrationsDrilldown?.distribution?.vehicle_class_distribution?.[0]
      ? [...registrationsDrilldown.distribution.vehicle_class_distribution].sort((a, b) => (b.count || 0) - (a.count || 0))[0]
      : null;
    const topBody = registrationsDrilldown?.distribution?.body_type_distribution?.[0]
      ? [...registrationsDrilldown.distribution.body_type_distribution].sort((a, b) => (b.count || 0) - (a.count || 0))[0]
      : null;
    const topState = registrationsDrilldown?.operational?.state_wise_registration_volume?.[0]
      ? [...registrationsDrilldown.operational.state_wise_registration_volume].sort((a, b) => (b.count || 0) - (a.count || 0))[0]
      : null;
    const topRto = registrationsDrilldown?.operational?.rto_wise_registration_load?.[0]
      ? [...registrationsDrilldown.operational.rto_wise_registration_load].sort((a, b) => (b.count || 0) - (a.count || 0))[0]
      : null;

    const mix = {
      insights: [
        topCat ? `Top category: ${topCat.category} (${(topCat.count || 0).toLocaleString()} regs, ${topCat.pct || 0}%).` : null,
        topFuel ? `Top fuel: ${topFuel.fuel} (${(topFuel.count || 0).toLocaleString()} regs).` : null,
      ].filter(Boolean),
      recommendations: [
        "Align service capacity to the top category/fuel mix to reduce queueing at RTOs.",
        "Use emission-norm distribution to plan enforcement and scrappage nudges.",
      ],
      actionItems: ["Export the mix view and share with operations for staffing/slot planning."],
    };

    const distribution = {
      insights: [
        topClass ? `Top class: ${topClass.class} (${(topClass.count || 0).toLocaleString()} regs).` : null,
        topBody ? `Top body type: ${topBody.body} (${(topBody.count || 0).toLocaleString()} regs).` : null,
      ].filter(Boolean),
      recommendations: [
        "Prioritize compliance checks for the highest-volume classes/body types.",
        "Use body-type distribution for targeted road-safety messaging.",
      ],
      actionItems: ["Flag the top 3 classes for weekly monitoring in the KPI review."],
    };

    const time = {
      insights: [
        peak?.month ? `Peak month: ${peak.month} (${(peak.registrations || 0).toLocaleString()} regs).` : null,
        vol != null ? `Registration volatility index (CV): ${vol}.` : null,
      ].filter(Boolean),
      recommendations: [
        vol != null && vol > 0.4 ? "High volatility detected—plan surge staffing for peak months." : "Volatility is manageable—keep steady staffing with minor seasonal adjustments.",
        "Track YoY growth to validate impact of policy changes.",
      ],
      actionItems: ["Set an alert on month-over-month deviation beyond ±15%."],
    };

    const operational = {
      insights: [
        topState?.state ? `Highest volume state: ${topState.state} (${(topState.count || 0).toLocaleString()} regs).` : null,
        topRto?.rto ? `Highest load RTO: ${topRto.rto} (${(topRto.count || 0).toLocaleString()} regs).` : null,
      ].filter(Boolean),
      recommendations: [
        "Rebalance workloads across top RTOs using slot caps and appointment smoothing.",
        "Improve citizen comms for registration status types with high counts.",
      ],
      actionItems: ["Assign owners for the top 3 RTOs and track weekly throughput."],
    };

    return { mix, distribution, time, operational };
  }, [registrationsDrilldown]);

  const valueNarrative = useMemo(() => {
    if (!valueDrilldown) return {};
    const topState = valueDrilldown?.by_state?.[0]
      ? [...valueDrilldown.by_state].sort((a, b) => (b.total_value || 0) - (a.total_value || 0))[0]
      : null;
    const topCategory = valueDrilldown?.by_category?.[0]
      ? [...valueDrilldown.by_category].sort((a, b) => (b.avg_value || 0) - (a.avg_value || 0))[0]
      : null;

    const overview = {
      insights: [
        `Total transaction value: ${formatINRShort(valueDrilldown.totals.total_transaction_value)}.`,
        `Avg value: ${formatINRShort(valueDrilldown.totals.avg_vehicle_value)}; median: ${formatINRShort(valueDrilldown.totals.median_vehicle_value)}.`,
        `High-value threshold (P95): ${formatINRShort(valueDrilldown.totals.p95_vehicle_value)}; count: ${(valueDrilldown.totals.high_value_vehicle_count || 0).toLocaleString()}.`,
      ],
      recommendations: [
        "Focus audits on states with unusually high average value and high-value counts.",
        "Use revenue share to optimize fee collection and compliance enforcement.",
      ],
      actionItems: ["Export top-10 revenue states and align with enforcement + revenue teams."],
    };

    const state = {
      insights: [
        topState?.state ? `Top revenue state: ${topState.state} (${formatINRShort(topState.total_value)}).` : null,
        topState?.state ? `Avg value in ${topState.state}: ${formatINRShort(topState.avg_value)}.` : null,
      ].filter(Boolean),
      recommendations: ["Investigate outliers (very high avg/median) for valuation or data-quality issues."],
      actionItems: ["Create a watchlist of top 5 states by avg value and review monthly."],
    };

    const category = {
      insights: [
        topCategory?.category ? `Highest avg value category: ${topCategory.category} (${formatINRShort(topCategory.avg_value)}).` : null,
      ].filter(Boolean),
      recommendations: ["Use category pricing differences to tailor policy incentives and compliance checks."],
      actionItems: ["Review high-value counts by category for potential fraud/under-reporting patterns."],
    };

    return { overview, state, category };
  }, [valueDrilldown]);

  const complianceNarrative = useMemo(() => {
    if (!complianceData) return { insights: [], recommendations: [], actionItems: [] };
    const exp30 = Number(complianceData?.registrations_expiring_soon?.le_30 || 0);
    const expired = Number(complianceData?.expired_registrations || 0);
    const unfit = Number(complianceData?.unfit_vehicles || 0);
    return {
      insights: [
        `Reference date: ${complianceData.reference_date}.`,
        exp30 ? `${exp30.toLocaleString()} registrations are expiring within 30 days.` : null,
        expired ? `${expired.toLocaleString()} registrations are already expired.` : null,
        unfit ? `${unfit.toLocaleString()} vehicles are unfit (fitness expired).` : null,
      ].filter(Boolean),
      recommendations: [
        "Automate reminders for expiring registrations (≤30/60/90 days) and track conversion.",
        "Prioritize enforcement on expired + unfit segments; coordinate with RTO inspection capacity.",
      ],
      actionItems: [
        "Generate daily expiring/expired lists per RTO and assign follow-up owners.",
        "Run a weekly fitness renewal drive for high-risk buckets.",
      ],
    };
  }, [complianceData]);

  return (
    <div className="space-y-6" data-testid="vehicle-analytics">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Vehicle Analytics
          </h1>
          <p className="text-white/60">
            Comprehensive analysis of VAHAN registration data
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button 
            data-testid="filter-btn"
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button 
            data-testid="refresh-btn"
            onClick={fetchData}
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            data-testid="export-btn"
            className="bg-gradient-to-r from-violet-500 to-pink-500 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="kpi-card cursor-pointer hover:shadow-xl transition-shadow"
          data-testid="kpi-total-registrations"
          onClick={() => setRegistrationsOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setRegistrationsOpen(true);
          }}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpis?.total_registrations?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Car className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
              <span className="text-emerald-600 text-sm font-medium">+5.2%</span>
              <span className="text-gray-400 text-sm ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card
          className="kpi-card secondary cursor-pointer hover:shadow-xl transition-shadow"
          data-testid="kpi-avg-value"
          onClick={() => setValueOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setValueOpen(true);
          }}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Avg Vehicle Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{((kpis?.avg_vehicle_value || 0) / 100000).toFixed(1)}L
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-pink-600" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <span className="text-gray-500 text-sm">
                Median: ₹{((kpis?.median_vehicle_value || 0) / 100000).toFixed(1)}L
              </span>
            </div>
          </CardContent>
        </Card>

        <Card
          className="kpi-card accent cursor-pointer hover:shadow-xl transition-shadow"
          data-testid="kpi-compliance-alerts"
          onClick={() => setComplianceOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setComplianceOpen(true);
          }}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Compliance Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpis?.compliance_alerts || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <span className="text-amber-600 text-sm font-medium">Expiring soon</span>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card warning" data-testid="kpi-data-quality">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Data Quality Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpis?.data_quality_score || 0}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
              <span className="text-emerald-600 text-sm font-medium">Good</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {!loading && kpis && (
        <InsightsSection
          title="Vehicle Analytics Narrative"
          titleClassName="text-white/90"
          insights={dashboardNarrative.insights}
          recommendations={dashboardNarrative.recommendations}
          actionItems={dashboardNarrative.actionItems}
        />
      )}

      {/* Drilldown: Total Registrations */}
      <Dialog open={registrationsOpen} onOpenChange={setRegistrationsOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Total Registrations — Drilldown</DialogTitle>
            <DialogDescription>
              Breakdown of registrations by mix, distribution, and time-series indicators.
            </DialogDescription>
          </DialogHeader>

          {registrationsDrilldownLoading && (
            <div className="py-10 text-sm text-muted-foreground">Loading drilldown…</div>
          )}

          {!registrationsDrilldownLoading && registrationsDrilldown && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">Total registrations</div>
                    <div className="text-xl font-bold text-gray-900">
                      {registrationsDrilldown.totals.total_registrations.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">Unique vehicles</div>
                    <div className="text-xl font-bold text-gray-900">
                      {registrationsDrilldown.totals.unique_vehicles_registered.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">Peak month</div>
                    <div className="text-xl font-bold text-gray-900">
                      {registrationsDrilldown.time.peak_registration_month?.month || "—"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {registrationsDrilldown.time.peak_registration_month?.registrations?.toLocaleString() || ""} regs
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">Volatility index (CV)</div>
                    <div className="text-xl font-bold text-gray-900">
                      {registrationsDrilldown.time.registration_volatility?.volatility_index ?? "—"}
                    </div>
                    <div className="text-xs text-gray-500">
                      σ {registrationsDrilldown.time.registration_volatility?.monthly_stddev ?? "—"} / μ{" "}
                      {registrationsDrilldown.time.registration_volatility?.monthly_mean ?? "—"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="mix" className="space-y-4">
                <TabsList className="bg-muted">
                  <TabsTrigger value="mix">Mix</TabsTrigger>
                  <TabsTrigger value="distribution">Distribution</TabsTrigger>
                  <TabsTrigger value="time">Time</TabsTrigger>
                  <TabsTrigger value="operational">Operational</TabsTrigger>
                </TabsList>

                <TabsContent value="mix" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">Vehicle Category Mix</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={registrationsDrilldown.mix.vehicle_category_mix.map((d) => ({
                                category: d.category,
                                count: d.count,
                                pct: d.pct,
                              }))}
                              layout="vertical"
                              margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis type="number" stroke="#94A3B8" />
                              <YAxis
                                type="category"
                                dataKey="category"
                                width={70}
                                stroke="#94A3B8"
                                tick={{ fontSize: 11 }}
                              />
                              <Tooltip
                                formatter={(value, name, props) => {
                                  if (name === "count") return [`${value.toLocaleString()} regs`, "Registrations"];
                                  if (name === "pct") return [`${value}%`, "Share"];
                                  return [value, name];
                                }}
                              />
                              <Bar dataKey="count" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">Fuel Type Penetration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={registrationsDrilldown.mix.fuel_type_penetration.map((d) => ({ name: d.fuel, value: d.count }))}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={90}
                              >
                                {registrationsDrilldown.mix.fuel_type_penetration.map((_, idx) => (
                                  <Cell key={idx} fill={COLORS[(idx + 2) % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">Emission Norm Compliance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={registrationsDrilldown.mix.emission_norm_compliance.map((d) => ({ norm: d.norm, count: d.count }))}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis dataKey="norm" stroke="#94A3B8" />
                              <YAxis stroke="#94A3B8" />
                              <Tooltip />
                              <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <InsightsSection
                    title="Mix — Insights"
                    insights={registrationsNarrative?.mix?.insights || []}
                    recommendations={registrationsNarrative?.mix?.recommendations || []}
                    actionItems={registrationsNarrative?.mix?.actionItems || []}
                  />
                </TabsContent>

                <TabsContent value="distribution" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">Vehicle Class Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={registrationsDrilldown.distribution.vehicle_class_distribution}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis dataKey="class" stroke="#94A3B8" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={70} />
                              <YAxis stroke="#94A3B8" />
                              <Tooltip />
                              <Bar dataKey="count" fill="#DB2777" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">Body Type Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={registrationsDrilldown.distribution.body_type_distribution}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis dataKey="body" stroke="#94A3B8" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={70} />
                              <YAxis stroke="#94A3B8" />
                              <Tooltip />
                              <Bar dataKey="count" fill="#0D9488" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <InsightsSection
                    title="Distribution — Insights"
                    insights={registrationsNarrative?.distribution?.insights || []}
                    recommendations={registrationsNarrative?.distribution?.recommendations || []}
                    actionItems={registrationsNarrative?.distribution?.actionItems || []}
                  />
                </TabsContent>

                <TabsContent value="time" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">Monthly Registration Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={registrationsDrilldown.time.monthly_registration_trend}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis dataKey="month" stroke="#94A3B8" />
                              <YAxis stroke="#94A3B8" />
                              <Tooltip />
                              <Line type="monotone" dataKey="registrations" stroke="#2563EB" strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">YoY Registration Growth</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={registrationsDrilldown.time.yoy_registration_growth}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis dataKey="year" stroke="#94A3B8" />
                              <YAxis stroke="#94A3B8" />
                              <Tooltip
                                formatter={(value, name, props) => {
                                  if (name === "registrations") return [value, "Registrations"];
                                  return [value, name];
                                }}
                                labelFormatter={(label) => `Year ${label}`}
                              />
                              <Bar dataKey="registrations" fill="#EA580C" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {registrationsDrilldown.time.yoy_registration_growth.map((y) => (
                            <Badge key={y.year} variant="outline">
                              {y.year}: {y.yoy_growth_pct == null ? "—" : `${y.yoy_growth_pct}%`}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <InsightsSection
                    title="Time — Insights"
                    insights={registrationsNarrative?.time?.insights || []}
                    recommendations={registrationsNarrative?.time?.recommendations || []}
                    actionItems={registrationsNarrative?.time?.actionItems || []}
                  />
                </TabsContent>

                <TabsContent value="operational" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">State-wise Registration Volume</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={registrationsDrilldown.operational.state_wise_registration_volume} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis type="number" stroke="#94A3B8" />
                              <YAxis type="category" dataKey="state" width={60} stroke="#94A3B8" />
                              <Tooltip />
                              <Bar dataKey="count" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">RTO-wise Registration Load</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={registrationsDrilldown.operational.rto_wise_registration_load} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis type="number" stroke="#94A3B8" />
                              <YAxis type="category" dataKey="rto" width={60} stroke="#94A3B8" />
                              <Tooltip />
                              <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">Registration Type Mix</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={registrationsDrilldown.operational.registration_type_mix}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis dataKey="type" stroke="#94A3B8" />
                              <YAxis stroke="#94A3B8" />
                              <Tooltip />
                              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">Registration Status Mix</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={registrationsDrilldown.operational.registration_status_mix}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis dataKey="status" stroke="#94A3B8" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                              <YAxis stroke="#94A3B8" />
                              <Tooltip />
                              <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <InsightsSection
                    title="Operational — Insights"
                    insights={registrationsNarrative?.operational?.insights || []}
                    recommendations={registrationsNarrative?.operational?.recommendations || []}
                    actionItems={registrationsNarrative?.operational?.actionItems || []}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {!registrationsDrilldownLoading && !registrationsDrilldown && (
            <div className="py-10 text-sm text-muted-foreground">
              No drilldown data available.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Drilldown: Avg Vehicle Value */}
      <Dialog open={valueOpen} onOpenChange={setValueOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Avg Vehicle Value — Drilldown</DialogTitle>
            <DialogDescription>
              Revenue & value KPIs derived from transaction value (`sale_amt`) across state and category.
            </DialogDescription>
          </DialogHeader>

          {valueDrilldownLoading && (
            <div className="py-10 text-sm text-muted-foreground">Loading drilldown…</div>
          )}

          {!valueDrilldownLoading && valueDrilldown && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">Total transaction value</div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatINRShort(valueDrilldown.totals.total_transaction_value)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">Average vehicle value</div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatINRShort(valueDrilldown.totals.avg_vehicle_value)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">Median vehicle value</div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatINRShort(valueDrilldown.totals.median_vehicle_value)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">High-value threshold (P95)</div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatINRShort(valueDrilldown.totals.p95_vehicle_value)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">High-value vehicles (≥ P95)</div>
                    <div className="text-xl font-bold text-gray-900">
                      {(valueDrilldown.totals.high_value_vehicle_count || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      of {(valueDrilldown.totals.record_count || 0).toLocaleString()} transactions
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-muted">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="state">By State</TabsTrigger>
                  <TabsTrigger value="category">By Category</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">State-wise Revenue Share</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={valueDrilldown.state_revenue_share} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis type="number" stroke="#94A3B8" />
                              <YAxis type="category" dataKey="state" width={60} stroke="#94A3B8" />
                              <Tooltip
                                formatter={(value, name, props) => {
                                  if (name === "total_value") return [formatINRShort(value), "Revenue"];
                                  if (name === "pct") return [`${value}%`, "Share"];
                                  return [value, name];
                                }}
                              />
                              <Bar dataKey="total_value" fill="#2563EB" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">High-Value Vehicle Count (Top States)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={valueDrilldown.by_state} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis type="number" stroke="#94A3B8" />
                              <YAxis type="category" dataKey="state" width={60} stroke="#94A3B8" />
                              <Tooltip />
                              <Bar dataKey="high_value_count" fill="#EA580C" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <InsightsSection
                    title="Revenue & Value — Overview"
                    insights={valueNarrative?.overview?.insights || []}
                    recommendations={valueNarrative?.overview?.recommendations || []}
                    actionItems={valueNarrative?.overview?.actionItems || []}
                  />
                </TabsContent>

                <TabsContent value="state" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">Average Vehicle Value by State</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={valueDrilldown.by_state} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis type="number" stroke="#94A3B8" />
                              <YAxis type="category" dataKey="state" width={60} stroke="#94A3B8" />
                              <Tooltip formatter={(v) => formatINRShort(v)} />
                              <Bar dataKey="avg_value" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">Median Vehicle Value by State</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={valueDrilldown.by_state.filter((d) => d.median_value != null)}
                              layout="vertical"
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis type="number" stroke="#94A3B8" />
                              <YAxis type="category" dataKey="state" width={60} stroke="#94A3B8" />
                              <Tooltip formatter={(v) => formatINRShort(v)} />
                              <Bar dataKey="median_value" fill="#10B981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <InsightsSection
                    title="Revenue & Value — By State"
                    insights={valueNarrative?.state?.insights || []}
                    recommendations={valueNarrative?.state?.recommendations || []}
                    actionItems={valueNarrative?.state?.actionItems || []}
                  />
                </TabsContent>

                <TabsContent value="category" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">Average Vehicle Value by Category</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={valueDrilldown.by_category} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis type="number" stroke="#94A3B8" />
                              <YAxis type="category" dataKey="category" width={70} stroke="#94A3B8" />
                              <Tooltip formatter={(v) => formatINRShort(v)} />
                              <Bar dataKey="avg_value" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900 text-base">High-Value Vehicle Count by Category</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={valueDrilldown.by_category} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis type="number" stroke="#94A3B8" />
                              <YAxis type="category" dataKey="category" width={70} stroke="#94A3B8" />
                              <Tooltip />
                              <Bar dataKey="high_value_count" fill="#EA580C" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <InsightsSection
                    title="Revenue & Value — By Category"
                    insights={valueNarrative?.category?.insights || []}
                    recommendations={valueNarrative?.category?.recommendations || []}
                    actionItems={valueNarrative?.category?.actionItems || []}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {!valueDrilldownLoading && !valueDrilldown && (
            <div className="py-10 text-sm text-muted-foreground">No drilldown data available.</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Drilldown: Compliance & Validity */}
      <Dialog open={complianceOpen} onOpenChange={setComplianceOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Compliance &amp; Validity</DialogTitle>
            <DialogDescription>
              Registration and fitness validity risk computed from `regn_upto` and `fit_upto` (reference: `op_dt` when available).
            </DialogDescription>
          </DialogHeader>

          {complianceLoading && (
            <div className="py-10 text-sm text-muted-foreground">Loading drilldown…</div>
          )}

          {!complianceLoading && complianceData && (
            <div className="space-y-4">
              <div className="text-xs text-gray-500">
                Reference date: {complianceData.reference_date}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">Registrations Expiring Soon</div>
                    <div className="text-sm text-gray-700 mt-1">
                      ≤30d: <span className="font-semibold">{(complianceData.registrations_expiring_soon?.le_30 || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      ≤60d: <span className="font-semibold">{(complianceData.registrations_expiring_soon?.le_60 || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      ≤90d: <span className="font-semibold">{(complianceData.registrations_expiring_soon?.le_90 || 0).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">Expired Registrations</div>
                    <div className="text-xl font-bold text-gray-900 mt-1">
                      {(complianceData.expired_registrations || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Missing regn_upto: {(complianceData.missing_dates?.regn_upto || 0).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">Fitness Expiry Risk</div>
                    <div className="text-sm text-gray-700 mt-1">
                      ≤30d: <span className="font-semibold">{(complianceData.fitness_expiry_risk?.le_30 || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      ≤60d: <span className="font-semibold">{(complianceData.fitness_expiry_risk?.le_60 || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      ≤90d: <span className="font-semibold">{(complianceData.fitness_expiry_risk?.le_90 || 0).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">Unfit Vehicles Count</div>
                    <div className="text-xl font-bold text-gray-900 mt-1">
                      {(complianceData.unfit_vehicles || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Missing fit_upto: {(complianceData.missing_dates?.fit_upto || 0).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900 text-base">Registration Validity Buckets (regn_upto)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={complianceData.buckets?.regn_upto || []}>
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

                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900 text-base">Fitness Validity Buckets (fit_upto)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={complianceData.buckets?.fit_upto || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="bucket" stroke="#94A3B8" />
                          <YAxis stroke="#94A3B8" />
                          <Tooltip />
                          <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <InsightsSection
                title="Compliance & Validity — Narrative"
                insights={complianceNarrative.insights}
                recommendations={complianceNarrative.recommendations}
                actionItems={complianceNarrative.actionItems}
              />
            </div>
          )}

          {!complianceLoading && !complianceData && (
            <div className="py-10 text-sm text-muted-foreground">No drilldown data available.</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Charts Grid */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white/10 border border-white/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-violet-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="composition" className="data-[state=active]:bg-white data-[state=active]:text-violet-600">
            Vehicle Composition
          </TabsTrigger>
          <TabsTrigger value="efficiency" className="data-[state=active]:bg-white data-[state=active]:text-violet-600">
            Efficiency
          </TabsTrigger>
          <TabsTrigger value="manufacturers" className="data-[state=active]:bg-white data-[state=active]:text-violet-600">
            Manufacturers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* State-wise Registration */}
            <Card className="bg-white shadow-lg" data-testid="chart-state-wise">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-violet-500" />
                  State-wise Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stateData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis type="number" stroke="#94A3B8" />
                      <YAxis dataKey="state" type="category" width={50} stroke="#94A3B8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="count" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trend */}
            <Card className="bg-white shadow-lg" data-testid="chart-monthly-trend">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-pink-500" />
                  Monthly Registration Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={kpis?.monthly_trend || []}>
                      <defs>
                        <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="registrations" 
                        stroke="#7C3AED" 
                        fill="url(#colorReg)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          <InsightsSection
            title="Overview — Insights"
            titleClassName="text-white/90"
            insights={tabsNarrative?.overview?.insights || []}
            recommendations={tabsNarrative?.overview?.recommendations || []}
            actionItems={tabsNarrative?.overview?.actionItems || []}
          />
        </TabsContent>

        <TabsContent value="composition" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fuel Type Distribution */}
            <Card className="bg-white shadow-lg" data-testid="chart-fuel-distribution">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center">
                  <Fuel className="w-5 h-5 mr-2 text-teal-500" />
                  Fuel Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fuelData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {fuelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Class Distribution */}
            <Card className="bg-white shadow-lg" data-testid="chart-class-distribution">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center">
                  <Car className="w-5 h-5 mr-2 text-violet-500" />
                  Vehicle Class Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vehicleClasses.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="class" stroke="#94A3B8" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="count" fill="#DB2777" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          <InsightsSection
            title="Vehicle Composition — Insights"
            titleClassName="text-white/90"
            insights={tabsNarrative?.composition?.insights || []}
            recommendations={tabsNarrative?.composition?.recommendations || []}
            actionItems={tabsNarrative?.composition?.actionItems || []}
          />
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registration Delay Stats */}
            <Card className="bg-white shadow-lg" data-testid="chart-delay-stats">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-500" />
                  Registration Delay Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-violet-50 rounded-lg">
                      <p className="text-sm text-gray-500">Avg Delay</p>
                      <p className="text-2xl font-bold text-violet-600">
                        {delayStats?.avg_delay_days || 0} days
                      </p>
                    </div>
                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <p className="text-sm text-gray-500">Median Delay</p>
                      <p className="text-2xl font-bold text-pink-600">
                        {delayStats?.median_delay_days || 0} days
                      </p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-gray-500">P90 Delay</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {delayStats?.p90_delay_days || 0} days
                      </p>
                    </div>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={delayStats?.delay_buckets || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="bucket" stroke="#94A3B8" />
                        <YAxis stroke="#94A3B8" />
                        <Tooltip />
                        <Bar dataKey="count" fill="#0D9488" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delayed Percentage */}
            <Card className="bg-white shadow-lg" data-testid="chart-delayed-percentage">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                  SLA Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-40 h-40">
                        <circle
                          className="text-gray-200"
                          strokeWidth="12"
                          stroke="currentColor"
                          fill="transparent"
                          r="60"
                          cx="80"
                          cy="80"
                        />
                        <circle
                          className="text-emerald-500"
                          strokeWidth="12"
                          strokeDasharray={`${(100 - (delayStats?.delayed_percentage || 0)) * 3.77} 377`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="60"
                          cx="80"
                          cy="80"
                          transform="rotate(-90 80 80)"
                        />
                      </svg>
                      <span className="absolute text-3xl font-bold text-gray-900">
                        {(100 - (delayStats?.delayed_percentage || 0)).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-gray-500 mt-4">On-time Processing Rate</p>
                  </div>
                  <div className="flex justify-center space-x-8">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Within SLA</p>
                      <p className="text-lg font-semibold text-emerald-600">
                        {(100 - (delayStats?.delayed_percentage || 0)).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Delayed</p>
                      <p className="text-lg font-semibold text-red-600">
                        {delayStats?.delayed_percentage || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <InsightsSection
            title="Efficiency — Insights"
            titleClassName="text-white/90"
            insights={tabsNarrative?.efficiency?.insights || []}
            recommendations={tabsNarrative?.efficiency?.recommendations || []}
            actionItems={tabsNarrative?.efficiency?.actionItems || []}
          />
        </TabsContent>

        <TabsContent value="manufacturers" className="space-y-6">
          <Card className="bg-white shadow-lg" data-testid="chart-manufacturers">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Factory className="w-5 h-5 mr-2 text-violet-500" />
                Top Manufacturers by Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topManufacturers} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#94A3B8" />
                    <YAxis
                      dataKey="maker_label"
                      type="category"
                      width={160}
                      stroke="#94A3B8"
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [
                        name === 'count' ? `${value.toLocaleString()} vehicles` : `₹${(value / 10000000).toFixed(1)} Cr`,
                        name === 'count' ? 'Volume' : 'Revenue'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="count" name="Volume" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <InsightsSection
            title="Manufacturers — Insights"
            titleClassName="text-white/90"
            insights={tabsNarrative?.manufacturers?.insights || []}
            recommendations={tabsNarrative?.manufacturers?.recommendations || []}
            actionItems={tabsNarrative?.manufacturers?.actionItems || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleAnalytics;
