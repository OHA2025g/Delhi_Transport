import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Ticket, Plus, Search, Filter, RefreshCw, Clock, CheckCircle, 
  AlertCircle, TrendingUp, TrendingDown, MoreHorizontal
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";
import InsightsSection from "@/components/InsightsSection";

const COLORS = ['#7C3AED', '#DB2777', '#0D9488', '#EA580C'];
const STATUS_COLORS = {
  'New': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Resolved': 'bg-emerald-100 text-emerald-700',
  'Closed': 'bg-gray-100 text-gray-700'
};
const PRIORITY_COLORS = {
  'Emergency': 'bg-red-100 text-red-700',
  'Urgent': 'bg-orange-100 text-orange-700',
  'Normal': 'bg-blue-100 text-blue-700',
  'Low': 'bg-gray-100 text-gray-700'
};

const TicketManagement = () => {
  const [kpis, setKpis] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    priority: "Normal",
    category: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kpisRes, ticketsRes] = await Promise.all([
        axios.get(`${API}/tickets/kpis`),
        axios.get(`${API}/tickets/list`)
      ]);
      setKpis(kpisRes.data);
      setTickets(ticketsRes.data.tickets || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch ticket data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTicket = async () => {
    try {
      await axios.post(`${API}/tickets/create`, newTicket);
      toast.success("Ticket created successfully");
      setIsCreateDialogOpen(false);
      setNewTicket({ subject: "", description: "", priority: "Normal", category: "" });
      fetchData();
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to create ticket");
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.Subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.Status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.Priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Transform data for charts
  const statusData = kpis?.by_status 
    ? Object.entries(kpis.by_status).map(([name, value]) => ({ name, value }))
    : [];

  const priorityData = kpis?.by_priority
    ? Object.entries(kpis.by_priority).map(([name, value]) => ({ name, value }))
    : [];

  const ticketNarrative = useMemo(() => {
    if (!kpis) return { insights: [], recommendations: [], actionItems: [] };
    const topStatus = statusData?.length ? [...statusData].sort((a, b) => (b.value || 0) - (a.value || 0))[0] : null;
    const topPriority = priorityData?.length ? [...priorityData].sort((a, b) => (b.value || 0) - (a.value || 0))[0] : null;
    const closure = Number(kpis.closure_rate || 0);
    const open = Number(kpis.open_tickets || 0);

    const insights = [
      `Total tickets: ${(kpis.total_tickets || 0).toLocaleString()} (open: ${open.toLocaleString()}).`,
      `Closure rate: ${closure.toFixed(1)}%; avg resolution: ${(kpis.avg_resolution_days || 0).toFixed(1)} days.`,
      topStatus ? `Most common status: ${topStatus.name} (${topStatus.value.toLocaleString()} tickets).` : null,
      topPriority ? `Most common priority: ${topPriority.name} (${topPriority.value.toLocaleString()} tickets).` : null,
      `Filtered view: ${filteredTickets.length.toLocaleString()} tickets matching current filters.`,
    ].filter(Boolean);

    const recommendations = [
      closure < 70 ? "Improve closure rate by prioritizing high-impact categories/modules and enforcing SLAs." : "Maintain closure discipline; monitor for spikes in new tickets.",
      open > 100 ? "Backlog is high—reassign tickets and set daily closure targets." : null,
      "Use filters (Status + Priority) to drive focused triage sessions.",
    ].filter(Boolean);

    const actionItems = [
      "Filter **Status = New/In Progress** and **Priority = Urgent/Emergency** for daily triage.",
      "Create a weekly report of top categories/modules and route to owners.",
      "Use the create ticket modal to standardize subject + description for faster routing.",
    ];

    return { insights, recommendations, actionItems };
  }, [kpis, statusData, priorityData, filteredTickets.length]);

  return (
    <div className="space-y-6" data-testid="ticket-management">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Ticket Management
          </h1>
          <p className="text-white/60">
            AI-powered ticketing with automatic categorization and SLA tracking
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                data-testid="create-ticket-btn"
                className="bg-gradient-to-r from-violet-500 to-pink-500 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    data-testid="ticket-subject-input"
                    placeholder="Enter ticket subject"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="ticket-description-input"
                    placeholder="Describe the issue in detail"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value) => setNewTicket({...newTicket, priority: value})}
                    >
                      <SelectTrigger data-testid="ticket-priority-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      data-testid="ticket-category-input"
                      placeholder="e.g., DL, RC, Challan"
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  data-testid="submit-ticket-btn"
                  onClick={handleCreateTicket}
                  className="bg-gradient-to-r from-violet-500 to-pink-500"
                >
                  Create Ticket
                </Button>
              </DialogFooter>

              <div className="pt-2">
                <InsightsSection
                  title="Create Ticket — Guidance"
                  insights={["Clear subjects + structured descriptions reduce resolution time and improve auto-routing."]}
                  recommendations={[
                    "Use module/category keywords (e.g., DL/RC/Challan) in the subject.",
                    "Add steps-to-reproduce and relevant identifiers (where applicable).",
                  ]}
                  actionItems={["Set Priority accurately and submit; then verify it appears in the filtered list."]}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="kpi-card" data-testid="kpi-total-tickets">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpis?.total_tickets?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card secondary" data-testid="kpi-open-tickets">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Open Tickets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpis?.open_tickets?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card accent" data-testid="kpi-closure-rate">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Closure Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpis?.closure_rate?.toFixed(1) || '0'}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
              <span className="text-emerald-600 text-sm font-medium">+3.8%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card warning" data-testid="kpi-avg-resolution">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Avg Resolution</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpis?.avg_resolution_days?.toFixed(1) || '0'} days
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <TrendingDown className="w-4 h-4 text-emerald-500 mr-1" />
              <span className="text-emerald-600 text-sm font-medium">-1.2 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights / Recommendations / Action Items */}
      {!loading && kpis && (
        <InsightsSection
          title="Ticket Ops Narrative"
          titleClassName="text-white/90"
          insights={ticketNarrative.insights}
          recommendations={ticketNarrative.recommendations}
          actionItems={ticketNarrative.actionItems}
        />
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-lg" data-testid="chart-status">
          <CardHeader>
            <CardTitle className="text-gray-900">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg" data-testid="chart-priority">
          <CardHeader>
            <CardTitle className="text-gray-900">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card className="bg-white shadow-lg" data-testid="tickets-table">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle className="text-gray-900">Recent Tickets</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  data-testid="search-tickets"
                  placeholder="Search tickets..."
                  className="pl-9 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="filter-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32" data-testid="filter-priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.slice(0, 10).map((ticket, index) => (
                  <TableRow key={index} data-testid={`ticket-row-${index}`}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {ticket.Subject}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {ticket.Project?.replace('eTransport MMP-', '')}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[ticket.Status] || 'bg-gray-100 text-gray-700'}>
                        {ticket.Status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={PRIORITY_COLORS[ticket.Priority] || 'bg-gray-100 text-gray-700'}>
                        {ticket.Priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {ticket.ModuleName?.replace('Vahan4-', '')}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        ticket.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' :
                        ticket.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {ticket.sentiment || 'neutral'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredTickets.length > 10 && (
            <div className="mt-4 text-center">
              <Button variant="outline">
                Load More ({filteredTickets.length - 10} remaining)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketManagement;
