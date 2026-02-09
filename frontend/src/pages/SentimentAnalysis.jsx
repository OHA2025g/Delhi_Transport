import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  SmilePlus, Frown, Meh, TrendingUp, TrendingDown, RefreshCw,
  Download, AlertTriangle, ThumbsUp, ThumbsDown, BarChart3
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";
import InsightsSection from "@/components/InsightsSection";

const SENTIMENT_COLORS = {
  positive: '#10B981',
  neutral: '#F59E0B',
  negative: '#EF4444'
};

const SentimentAnalysis = () => {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/tickets/sentiment-analysis`);
      setSentimentData(response.data);
      toast.success("Sentiment data refreshed");
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
      toast.error("Failed to fetch sentiment analysis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const distributionData = sentimentData?.distribution
    ? Object.entries(sentimentData.distribution).map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: data.count,
        score: data.avg_score
      }))
    : [];

  const trendData = sentimentData?.trend || [];

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <SmilePlus className="w-6 h-6 text-emerald-500" />;
      case 'negative': return <Frown className="w-6 h-6 text-red-500" />;
      default: return <Meh className="w-6 h-6 text-amber-500" />;
    }
  };

  const overallScore = sentimentData?.sentiment_score || 0;
  const overallSentiment = overallScore > 0.2 ? 'Positive' : overallScore < -0.2 ? 'Negative' : 'Neutral';

  const sentimentNarrative = useMemo(() => {
    if (!sentimentData) return { insights: [], recommendations: [], actionItems: [] };
    const dist = sentimentData.distribution || {};
    const pos = Number(dist.positive?.count || 0);
    const neu = Number(dist.neutral?.count || 0);
    const neg = Number(dist.negative?.count || 0);
    const total = pos + neu + neg || 1;
    const negPct = ((neg / total) * 100).toFixed(1);
    const posPct = ((pos / total) * 100).toFixed(1);

    const trend = Array.isArray(sentimentData.trend) ? sentimentData.trend : [];
    const last = trend.length ? trend[trend.length - 1] : null;
    const prev = trend.length > 1 ? trend[trend.length - 2] : null;
    const negDelta = last && prev ? (Number(last.negative || 0) - Number(prev.negative || 0)) : null;

    const insights = [
      `Overall sentiment score: ${(Number(sentimentData.sentiment_score || 0) * 100).toFixed(0)}/100 (${sentimentData.overall_sentiment || overallSentiment}).`,
      `Negative share: ${negPct}% (positive: ${posPct}%).`,
      negDelta != null ? `Latest trend change: negative ${negDelta >= 0 ? "+" : ""}${negDelta} vs previous period.` : null,
    ].filter(Boolean);

    const recommendations = [
      Number(negPct) > 50 ? "Prioritize root-cause analysis for negative grievances and publish a weekly remediation plan." : "Maintain monitoring; investigate any sudden spikes in negative sentiment.",
      "Use trend to align staffing during high-volume complaint periods.",
      "Tie sentiment to SLA/closure KPIs to validate operational improvements.",
    ];

    const actionItems = [
      "Create a top-10 negative grievance list and assign owners + deadlines.",
      "Run a targeted communication campaign for the most affected service areas.",
      "Re-check sentiment after process changes to confirm impact.",
    ];

    return { insights, recommendations, actionItems };
  }, [sentimentData, overallSentiment]);

  return (
    <div className="space-y-6" data-testid="sentiment-analysis">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Sentiment Analysis
          </h1>
          <p className="text-white/60">
            AI-powered analysis of grievances and public feedback
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
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
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Sentiment Card */}
      <Card className="bg-white shadow-lg overflow-hidden" data-testid="overall-sentiment">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  overallScore > 0.2 ? 'bg-emerald-100' : 
                  overallScore < -0.2 ? 'bg-red-100' : 'bg-amber-100'
                }`}>
                  {overallScore > 0.2 ? (
                    <SmilePlus className="w-8 h-8 text-emerald-500" />
                  ) : overallScore < -0.2 ? (
                    <Frown className="w-8 h-8 text-red-500" />
                  ) : (
                    <Meh className="w-8 h-8 text-amber-500" />
                  )}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Overall Sentiment
              </h3>
              <Badge className={
                overallScore > 0.2 ? 'bg-emerald-100 text-emerald-700' : 
                overallScore < -0.2 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }>
                {overallSentiment}
              </Badge>
            </div>
            
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500 mb-2">Sentiment Score</p>
              <p className="text-4xl font-bold text-gray-900">
                {(overallScore * 100).toFixed(0)}
              </p>
              <p className="text-sm text-gray-500 mt-1">out of 100</p>
              <div className="flex items-center justify-center mt-2">
                {overallScore >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-emerald-600 text-sm">Improving</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-red-600 text-sm">Declining</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-6 text-center">
              <p className="text-sm text-gray-500 mb-4">Quick Stats</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Positive</span>
                  <span className="font-semibold text-emerald-600">
                    {distributionData.find(d => d.name === 'Positive')?.value || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Neutral</span>
                  <span className="font-semibold text-amber-600">
                    {distributionData.find(d => d.name === 'Neutral')?.value || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Negative</span>
                  <span className="font-semibold text-red-600">
                    {distributionData.find(d => d.name === 'Negative')?.value || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!loading && sentimentData && (
        <InsightsSection
          title="Sentiment Narrative"
          titleClassName="text-white/90"
          insights={sentimentNarrative.insights}
          recommendations={sentimentNarrative.recommendations}
          actionItems={sentimentNarrative.actionItems}
        />
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Trend */}
        <Card className="bg-white shadow-lg" data-testid="sentiment-trend">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-violet-500" />
              Sentiment Trend Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="positive" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="url(#colorPositive)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="neutral" 
                    stackId="1"
                    stroke="#F59E0B" 
                    fill="url(#colorNeutral)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="negative" 
                    stackId="1"
                    stroke="#EF4444" 
                    fill="url(#colorNegative)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Distribution Pie */}
        <Card className="bg-white shadow-lg" data-testid="sentiment-distribution">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <SmilePlus className="w-5 h-5 mr-2 text-pink-500" />
              Sentiment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={SENTIMENT_COLORS[entry.name.toLowerCase()] || '#94A3B8'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Alerts */}
      <Card className="bg-white shadow-lg" data-testid="sentiment-insights">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
            Sentiment Insights & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex items-start space-x-3">
                <Frown className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <Badge className="bg-red-100 text-red-700 mb-2">Alert</Badge>
                  <p className="text-gray-700">
                    Negative sentiment spiked by 15% after server downtime last week. 
                    Most complaints relate to payment processing delays.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <Badge className="bg-amber-100 text-amber-700 mb-2">Warning</Badge>
                  <p className="text-gray-700">
                    Staff behavior complaints rising in Pune RTO region. 
                    Consider staff training or process review.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg">
              <div className="flex items-start space-x-3">
                <ThumbsUp className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <Badge className="bg-emerald-100 text-emerald-700 mb-2">Positive</Badge>
                  <p className="text-gray-700">
                    Online DL renewal process receiving positive feedback. 
                    82% satisfaction rate this month.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department-wise Sentiment */}
      <Card className="bg-white shadow-lg" data-testid="department-sentiment">
        <CardHeader>
          <CardTitle className="text-gray-900">Department-wise Sentiment Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'DL Services', score: 72, sentiment: 'positive' },
              { name: 'RC Services', score: 65, sentiment: 'neutral' },
              { name: 'Challan Payment', score: 58, sentiment: 'neutral' },
              { name: 'Fitness Certificate', score: 45, sentiment: 'negative' },
              { name: 'Tax Services', score: 70, sentiment: 'positive' }
            ].map((dept, index) => (
              <div key={index} className="flex items-center space-x-4">
                <span className="w-36 text-sm text-gray-600">{dept.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      dept.score >= 70 ? 'bg-emerald-500' :
                      dept.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${dept.score}%` }}
                  />
                </div>
                <span className={`text-sm font-semibold w-12 text-right ${
                  dept.score >= 70 ? 'text-emerald-600' :
                  dept.score >= 50 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {dept.score}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentAnalysis;
