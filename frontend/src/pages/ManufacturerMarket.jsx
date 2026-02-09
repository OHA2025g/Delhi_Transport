import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API } from "@/App";
import { useSearchParams } from "react-router-dom";
import InsightsSection from "@/components/InsightsSection";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

const formatINRShort = (amount) => {
  const n = Number(amount || 0);
  if (!Number.isFinite(n)) return "₹0";
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
};

export default function ManufacturerMarket() {
  const [searchParams] = useSearchParams();
  const [oemSummary, setOemSummary] = useState(null);
  const [topModels, setTopModels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [makerOpen, setMakerOpen] = useState(false);
  const [makerDrilldown, setMakerDrilldown] = useState(null);
  const [makerLoading, setMakerLoading] = useState(false);
  const [selectedMaker, setSelectedMaker] = useState(null);

  const [modelOpen, setModelOpen] = useState(false);
  const [modelDrilldown, setModelDrilldown] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const geoParams = Object.fromEntries(
        ["state_cd", "c_district", "city"]
          .map((k) => [k, searchParams.get(k) || ""])
          .filter(([, v]) => v)
      );
      const [summaryRes, modelsRes] = await Promise.all([
        axios.get(`${API}/dashboard/vahan/oem/summary?limit=10`, { params: geoParams }),
        axios.get(`${API}/dashboard/vahan/oem/top-models?limit=10`, { params: geoParams }),
      ]);
      setOemSummary(summaryRes.data);
      setTopModels(modelsRes.data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const oems = oemSummary?.oems || [];
  const marketTotal = oemSummary?.market_total_value || 0;

  const chartVolume = useMemo(() => oems.map((o) => ({ maker_label: o.maker_label, volume: o.volume })), [oems]);
  const chartRevenue = useMemo(
    () => oems.map((o) => ({ maker_label: o.maker_label, total_value: o.total_value, share: o.revenue_share_pct })),
    [oems]
  );
  const chartAvgPrice = useMemo(() => oems.map((o) => ({ maker_label: o.maker_label, avg_price: o.avg_price })), [oems]);

  const dashboardNarrative = useMemo(() => {
    const totalVol = oems.reduce((acc, o) => acc + Number(o.volume || 0), 0);
    const topVol = oems.length ? [...oems].sort((a, b) => (b.volume || 0) - (a.volume || 0))[0] : null;
    const topRev = oems.length ? [...oems].sort((a, b) => (b.total_value || 0) - (a.total_value || 0))[0] : null;
    const topPrice = oems.length ? [...oems].sort((a, b) => (b.avg_price || 0) - (a.avg_price || 0))[0] : null;
    const topModel = topModels.length ? topModels[0] : null;

    const sharePct = topVol && totalVol ? ((topVol.volume / totalVol) * 100).toFixed(1) : null;

    return {
      "oem-volume": {
        insights: [
          topVol?.maker_label ? `Top OEM by volume: ${topVol.maker_label} (${(topVol.volume || 0).toLocaleString()} regs).` : null,
          sharePct ? `Top OEM contributes ~${sharePct}% of total volume (top 10 OEMs).` : null,
        ].filter(Boolean),
        recommendations: [
          "Use concentration to prioritize OEM engagement for compliance and service readiness.",
          "Monitor shifts in volume share after policy changes or new launches.",
        ],
        actionItems: ["Click an OEM card below the chart to open the drilldown (L1→L3)."],
      },
      models: {
        insights: [
          topModel?.maker_model ? `Top model: ${topModel.maker_model} (${(topModel.volume || 0).toLocaleString()} regs).` : null,
          topModel?.maker_label ? `Top OEM for this model: ${topModel.maker_label}.` : null,
        ].filter(Boolean),
        recommendations: ["Use model-level concentration to forecast RTO load and compliance demand by geography."],
        actionItems: ["Click a model card to open the model drilldown (OEM dependency → geography → specs)."],
      },
      revenue: {
        insights: [
          `Market total value: ${formatINRShort(marketTotal)}.`,
          topRev?.maker_label ? `Top OEM by revenue: ${topRev.maker_label} (${formatINRShort(topRev.total_value)}).` : null,
        ].filter(Boolean),
        recommendations: ["Focus revenue assurance on top-revenue OEMs and their highest-value categories."],
        actionItems: ["Cross-check revenue share vs volume share to identify premium OEMs."],
      },
      pricing: {
        insights: [topPrice?.maker_label ? `Highest avg price OEM: ${topPrice.maker_label} (${formatINRShort(topPrice.avg_price)}).` : null].filter(Boolean),
        recommendations: ["Investigate price outliers for data quality, valuation practices, or segment shifts."],
        actionItems: ["Use pricing drilldowns to compare avg/median and spread for selected OEMs."],
      },
    };
  }, [oems, topModels, marketTotal]);

  const makerNarrative = useMemo(() => {
    if (!makerDrilldown) return {};
    const topState = makerDrilldown?.l1_state?.[0] ? makerDrilldown.l1_state[0] : null;
    const topRto = makerDrilldown?.l2_rto?.top_rtos?.[0] ? makerDrilldown.l2_rto.top_rtos[0] : null;
    const lastYoY = makerDrilldown?.l3_time?.yoy?.length ? makerDrilldown.l3_time.yoy[makerDrilldown.l3_time.yoy.length - 1] : null;
    const topCatRev = makerDrilldown?.revenue?.by_category?.[0] ? makerDrilldown.revenue.by_category[0] : null;
    const topStateRev = makerDrilldown?.revenue?.by_state?.[0] ? makerDrilldown.revenue.by_state[0] : null;

    return {
      state: {
        insights: [
          topState?.state ? `Top state penetration: ${topState.state} (${(topState.oem_volume || 0).toLocaleString()} regs).` : null,
          topState?.oem_state_share_pct != null ? `Share within state: ${topState.oem_state_share_pct}%.` : null,
        ].filter(Boolean),
        recommendations: ["Use state penetration to optimize OEM support programs and capacity planning."],
        actionItems: ["Identify 2–3 high-share states and run targeted compliance + service drives."],
      },
      rto: {
        insights: [
          makerDrilldown?.l2_rto?.spread_index != null ? `Spread index: ${makerDrilldown.l2_rto.spread_index}.` : null,
          topRto?.rto ? `Top RTO load: ${topRto.rto} (${(topRto.count || 0).toLocaleString()} regs).` : null,
        ].filter(Boolean),
        recommendations: ["Balance RTO load for top hotspots using appointment smoothing and staffing."],
        actionItems: ["Assign owners for top 3 RTO hotspots and track weekly throughput."],
      },
      time: {
        insights: [
          lastYoY?.year ? `Latest YoY growth (${lastYoY.year}): ${lastYoY.yoy_growth_pct == null ? "—" : `${lastYoY.yoy_growth_pct}%`}.` : null,
          "Use trend inflections to detect launches/recalls impacting volume.",
        ].filter(Boolean),
        recommendations: ["Plan surge staffing around peak months for high-growth OEMs."],
        actionItems: ["Set a monthly alert for sudden drops/spikes (>15% MoM)."],
      },
      revenue: {
        insights: [
          topCatRev?.category ? `Top category revenue: ${topCatRev.category} (${formatINRShort(topCatRev.total_value)}).` : null,
          topStateRev?.state ? `Top state revenue: ${topStateRev.state} (${formatINRShort(topStateRev.total_value)}).` : null,
        ].filter(Boolean),
        recommendations: ["Focus audits on high-value categories and high-revenue states for this OEM."],
        actionItems: ["Export top category/state revenue breakdown for revenue assurance."],
      },
      pricing: {
        insights: [
          `Avg price: ${formatINRShort(makerDrilldown.pricing.avg_price)}; median: ${formatINRShort(makerDrilldown.pricing.median_price)}.`,
          `Spread (P25–P75): ${formatINRShort(makerDrilldown.pricing.p25)} – ${formatINRShort(makerDrilldown.pricing.p75)}.`,
          `Process avg delay: ${makerDrilldown.process.avg_delay_days}d; BS6 share: ${makerDrilldown.compliance.bs6_share_pct}%.`,
        ],
        recommendations: ["Watch for widening price spread or sudden median shifts (potential valuation/data issues)."],
        actionItems: ["Compare pricing spread across states/categories (Revenue tab) to explain variance."],
      },
    };
  }, [makerDrilldown]);

  const modelNarrative = useMemo(() => {
    if (!modelDrilldown) return {};
    const topMaker = modelDrilldown?.by_maker?.[0] ? modelDrilldown.by_maker[0] : null;
    const topState = modelDrilldown?.by_state?.[0] ? modelDrilldown.by_state[0] : null;
    const topFuel = modelDrilldown?.by_fuel?.[0] ? modelDrilldown.by_fuel[0] : null;
    const topClass = modelDrilldown?.by_vh_class?.[0] ? modelDrilldown.by_vh_class[0] : null;
    const topNorm = modelDrilldown?.by_norms?.[0] ? modelDrilldown.by_norms[0] : null;

    return {
      maker: {
        insights: [
          topMaker?.maker_label ? `Top OEM for this model: ${topMaker.maker_label} (${(topMaker.count || 0).toLocaleString()} regs).` : null,
        ].filter(Boolean),
        recommendations: ["Use OEM dependency to manage recalls/communications and service readiness."],
        actionItems: ["Validate OEM dependency against market share trends (Top OEMs tab)."],
      },
      geo: {
        insights: [topState?.state ? `Top state: ${topState.state} (${(topState.count || 0).toLocaleString()} regs).` : null].filter(Boolean),
        recommendations: ["Target regional campaigns where the model has high adoption."],
        actionItems: ["Create a state-wise watchlist for sudden adoption spikes."],
      },
      specs: {
        insights: [
          topFuel?.fuel ? `Top fuel variant: ${topFuel.fuel} (${(topFuel.count || 0).toLocaleString()} regs).` : null,
          topClass?.vh_class ? `Top usage class: ${topClass.vh_class} (${(topClass.count || 0).toLocaleString()} regs).` : null,
          topNorm?.norms ? `Top emission norm: ${topNorm.norms} (${(topNorm.count || 0).toLocaleString()} regs).` : null,
        ].filter(Boolean),
        recommendations: ["Use spec mix to tailor compliance checks and policy incentives (EV/norm upgrades)."],
        actionItems: ["Review norms mix quarterly to ensure emission compliance progress."],
      },
    };
  }, [modelDrilldown]);

  const openMaker = async (maker) => {
    const geoParams = Object.fromEntries(
      ["state_cd", "c_district", "city"]
        .map((k) => [k, searchParams.get(k) || ""])
        .filter(([, v]) => v)
    );
    setSelectedMaker(maker);
    setMakerOpen(true);
    setMakerDrilldown(null);
    setMakerLoading(true);
    try {
      const res = await axios.get(`${API}/dashboard/vahan/oem/maker/${maker.maker_id}/drilldown?top_n=12`, { params: geoParams });
      setMakerDrilldown(res.data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setMakerLoading(false);
    }
  };

  const openModel = async (model) => {
    const geoParams = Object.fromEntries(
      ["state_cd", "c_district", "city"]
        .map((k) => [k, searchParams.get(k) || ""])
        .filter(([, v]) => v)
    );
    setSelectedModel(model);
    setModelOpen(true);
    setModelDrilldown(null);
    setModelLoading(true);
    try {
      const res = await axios.get(`${API}/dashboard/vahan/oem/model/${encodeURIComponent(model.maker_model)}/drilldown?top_n=12`, { params: geoParams });
      setModelDrilldown(res.data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setModelLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="maker-dashboard">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Manufacturer &amp; Market</h1>
          <p className="text-white/60">OEM dominance, models, revenue share, and pricing segmentation</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <Badge className="bg-white/10 text-white border-white/20">Market Total: {formatINRShort(marketTotal)}</Badge>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={fetchAll}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="oem-volume" className="space-y-4">
        <TabsList className="bg-white/10 border border-white/20">
          <TabsTrigger value="oem-volume" className="data-[state=active]:bg-white data-[state=active]:text-violet-600">
            Top OEMs (Volume)
          </TabsTrigger>
          <TabsTrigger value="models" className="data-[state=active]:bg-white data-[state=active]:text-violet-600">
            Top Models
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-white data-[state=active]:text-violet-600">
            OEM Revenue Share
          </TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-white data-[state=active]:text-violet-600">
            Avg Price / OEM
          </TabsTrigger>
        </TabsList>

        <TabsContent value="oem-volume" className="space-y-6">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Top Manufacturers by Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartVolume} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#94A3B8" />
                    <YAxis dataKey="maker_label" type="category" width={160} stroke="#94A3B8" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="volume" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {oems.map((o) => (
                  <button
                    key={o.maker_id}
                    className="text-left p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
                    onClick={() => openMaker(o)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{o.maker_label}</div>
                      <Badge variant="outline">{o.volume.toLocaleString()} regs</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Revenue: {formatINRShort(o.total_value)} • Avg price: {formatINRShort(o.avg_price)}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <InsightsSection
            title="Top OEMs (Volume) — Insights"
            titleClassName="text-white/90"
            insights={dashboardNarrative["oem-volume"]?.insights || []}
            recommendations={dashboardNarrative["oem-volume"]?.recommendations || []}
            actionItems={dashboardNarrative["oem-volume"]?.actionItems || []}
          />
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Top Models by Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topModels} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#94A3B8" />
                    <YAxis dataKey="maker_model" type="category" width={220} stroke="#94A3B8" tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="volume" fill="#2563EB" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {topModels.map((m) => (
                  <button
                    key={m.maker_model}
                    className="text-left p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
                    onClick={() => openModel(m)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900 truncate">{m.maker_model}</div>
                      <Badge variant="outline">{m.volume.toLocaleString()} regs</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Top OEM: {m.maker_label || "—"}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <InsightsSection
            title="Top Models — Insights"
            titleClassName="text-white/90"
            insights={dashboardNarrative.models?.insights || []}
            recommendations={dashboardNarrative.models?.recommendations || []}
            actionItems={dashboardNarrative.models?.actionItems || []}
          />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">OEM Revenue Share</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartRevenue} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#94A3B8" />
                    <YAxis dataKey="maker_label" type="category" width={160} stroke="#94A3B8" tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value, name, props) => {
                        if (name === "total_value") return [formatINRShort(value), "Revenue"];
                        if (name === "share") return [`${value}%`, "Share"];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="total_value" name="Revenue" fill="#EA580C" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <InsightsSection
            title="Revenue Share — Insights"
            titleClassName="text-white/90"
            insights={dashboardNarrative.revenue?.insights || []}
            recommendations={dashboardNarrative.revenue?.recommendations || []}
            actionItems={dashboardNarrative.revenue?.actionItems || []}
          />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Average Price per OEM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartAvgPrice} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#94A3B8" />
                    <YAxis dataKey="maker_label" type="category" width={160} stroke="#94A3B8" tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatINRShort(v)} />
                    <Bar dataKey="avg_price" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <InsightsSection
            title="Avg Price / OEM — Insights"
            titleClassName="text-white/90"
            insights={dashboardNarrative.pricing?.insights || []}
            recommendations={dashboardNarrative.pricing?.recommendations || []}
            actionItems={dashboardNarrative.pricing?.actionItems || []}
          />
        </TabsContent>
      </Tabs>

      {/* Maker Drilldown */}
      <Dialog open={makerOpen} onOpenChange={setMakerOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{selectedMaker?.maker_label || "OEM"} — Drilldown</DialogTitle>
            <DialogDescription>L1 → L2 → L3 drill paths for OEM volume, revenue and operations.</DialogDescription>
          </DialogHeader>

          {makerLoading && <div className="py-10 text-sm text-muted-foreground">Loading…</div>}
          {!makerLoading && makerDrilldown && (
            <Tabs defaultValue="state" className="space-y-4">
              <TabsList className="bg-muted">
                <TabsTrigger value="state">L1 State</TabsTrigger>
                <TabsTrigger value="rto">L2 RTO</TabsTrigger>
                <TabsTrigger value="time">L3 Time</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
              </TabsList>

              <TabsContent value="state" className="space-y-4">
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900 text-base">OEM State Penetration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={makerDrilldown.l1_state} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis type="number" stroke="#94A3B8" />
                          <YAxis type="category" dataKey="state" width={60} stroke="#94A3B8" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="oem_volume" name="OEM Volume" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {makerDrilldown.l1_state.map((s) => (
                        <Badge key={s.state} variant="outline">
                          {s.state}: {s.oem_state_share_pct}% of state
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <InsightsSection
                  title="L1 State — Insights"
                  insights={makerNarrative.state?.insights || []}
                  recommendations={makerNarrative.state?.recommendations || []}
                  actionItems={makerNarrative.state?.actionItems || []}
                />
              </TabsContent>

              <TabsContent value="rto" className="space-y-4">
                <div className="text-xs text-gray-500">
                  Spread index: <span className="font-semibold">{makerDrilldown.l2_rto.spread_index}</span>
                </div>
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900 text-base">OEM RTO Load (Top)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={makerDrilldown.l2_rto.top_rtos} layout="vertical">
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
                <InsightsSection
                  title="L2 RTO — Insights"
                  insights={makerNarrative.rto?.insights || []}
                  recommendations={makerNarrative.rto?.recommendations || []}
                  actionItems={makerNarrative.rto?.actionItems || []}
                />
              </TabsContent>

              <TabsContent value="time" className="space-y-4">
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900 text-base">OEM Monthly Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={makerDrilldown.l3_time.monthly_trend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="month" stroke="#94A3B8" />
                          <YAxis stroke="#94A3B8" />
                          <Tooltip />
                          <Line type="monotone" dataKey="registrations" stroke="#EA580C" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex flex-wrap gap-2">
                  {makerDrilldown.l3_time.yoy.map((y) => (
                    <Badge key={y.year} variant="outline">
                      {y.year}: {y.yoy_growth_pct == null ? "—" : `${y.yoy_growth_pct}%`}
                    </Badge>
                  ))}
                </div>
                <InsightsSection
                  title="L3 Time — Insights"
                  insights={makerNarrative.time?.insights || []}
                  recommendations={makerNarrative.time?.recommendations || []}
                  actionItems={makerNarrative.time?.actionItems || []}
                />
              </TabsContent>

              <TabsContent value="revenue" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-900 text-base">OEM Category Revenue Share</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={makerDrilldown.revenue.by_category} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis type="number" stroke="#94A3B8" />
                            <YAxis type="category" dataKey="category" width={70} stroke="#94A3B8" />
                            <Tooltip formatter={(v) => formatINRShort(v)} />
                            <Bar dataKey="total_value" fill="#EA580C" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-900 text-base">OEM State Revenue Contribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={makerDrilldown.revenue.by_state} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis type="number" stroke="#94A3B8" />
                            <YAxis type="category" dataKey="state" width={60} stroke="#94A3B8" />
                            <Tooltip formatter={(v) => formatINRShort(v)} />
                            <Bar dataKey="total_value" fill="#2563EB" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <InsightsSection
                  title="Revenue — Insights"
                  insights={makerNarrative.revenue?.insights || []}
                  recommendations={makerNarrative.revenue?.recommendations || []}
                  actionItems={makerNarrative.revenue?.actionItems || []}
                />
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Card className="bg-white shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500">Avg Price</div>
                      <div className="text-xl font-bold text-gray-900">{formatINRShort(makerDrilldown.pricing.avg_price)}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500">Median Price</div>
                      <div className="text-xl font-bold text-gray-900">{formatINRShort(makerDrilldown.pricing.median_price)}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500">P25–P75 Spread</div>
                      <div className="text-sm text-gray-700 mt-1">
                        {formatINRShort(makerDrilldown.pricing.p25)} – {formatINRShort(makerDrilldown.pricing.p75)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Process: {makerDrilldown.process.avg_delay_days}d • BS6 share: {makerDrilldown.compliance.bs6_share_pct}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <InsightsSection
                  title="Pricing — Insights"
                  insights={makerNarrative.pricing?.insights || []}
                  recommendations={makerNarrative.pricing?.recommendations || []}
                  actionItems={makerNarrative.pricing?.actionItems || []}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Model Drilldown */}
      <Dialog open={modelOpen} onOpenChange={setModelOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{selectedModel?.maker_model || "Model"} — Drilldown</DialogTitle>
            <DialogDescription>Model → OEM dependency, geography, and specs.</DialogDescription>
          </DialogHeader>

          {modelLoading && <div className="py-10 text-sm text-muted-foreground">Loading…</div>}
          {!modelLoading && modelDrilldown && (
            <Tabs defaultValue="maker" className="space-y-4">
              <TabsList className="bg-muted">
                <TabsTrigger value="maker">L1 OEM</TabsTrigger>
                <TabsTrigger value="geo">L2 Geography</TabsTrigger>
                <TabsTrigger value="specs">L3 Specs</TabsTrigger>
              </TabsList>
              <TabsContent value="maker">
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900 text-base">OEM–Model Dependency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={modelDrilldown.by_maker} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis type="number" stroke="#94A3B8" />
                          <YAxis type="category" dataKey="maker_label" width={160} stroke="#94A3B8" tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <InsightsSection
                  title="L1 OEM — Insights"
                  insights={modelNarrative.maker?.insights || []}
                  recommendations={modelNarrative.maker?.recommendations || []}
                  actionItems={modelNarrative.maker?.actionItems || []}
                />
              </TabsContent>
              <TabsContent value="geo">
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900 text-base">Model Regional Popularity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={modelDrilldown.by_state} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis type="number" stroke="#94A3B8" />
                          <YAxis type="category" dataKey="state" width={60} stroke="#94A3B8" />
                          <Tooltip />
                          <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <InsightsSection
                  title="L2 Geography — Insights"
                  insights={modelNarrative.geo?.insights || []}
                  recommendations={modelNarrative.geo?.recommendations || []}
                  actionItems={modelNarrative.geo?.actionItems || []}
                />
              </TabsContent>
              <TabsContent value="specs" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-900 text-base">Fuel Variant Preference</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={modelDrilldown.by_fuel} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis type="number" stroke="#94A3B8" />
                            <YAxis type="category" dataKey="fuel" width={60} stroke="#94A3B8" />
                            <Tooltip />
                            <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-900 text-base">Usage Classification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={modelDrilldown.by_vh_class} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis type="number" stroke="#94A3B8" />
                            <YAxis type="category" dataKey="vh_class" width={60} stroke="#94A3B8" />
                            <Tooltip />
                            <Bar dataKey="count" fill="#EA580C" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-900 text-base">Emission Compliance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={modelDrilldown.by_norms} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis type="number" stroke="#94A3B8" />
                            <YAxis type="category" dataKey="norms" width={60} stroke="#94A3B8" />
                            <Tooltip />
                            <Bar dataKey="count" fill="#DB2777" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <InsightsSection
                  title="L3 Specs — Insights"
                  insights={modelNarrative.specs?.insights || []}
                  recommendations={modelNarrative.specs?.recommendations || []}
                  actionItems={modelNarrative.specs?.actionItems || []}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


