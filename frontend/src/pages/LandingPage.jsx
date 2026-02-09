import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Car, MessageSquare, FileSearch, UserCheck, Truck, BarChart3, 
  Brain, AlertCircle, ArrowRight, Play, TrendingUp, Users, 
  Building2, Zap, ChevronRight, Shield, Globe, Database
} from "lucide-react";
import axios from "axios";
import { API } from "@/App";
import FloatingChatbot from "@/components/FloatingChatbot";
import AnimatedBackground from "@/components/AnimatedBackground";
import AnimatedCounter from "@/components/AnimatedCounter";
import ScrollReveal from "@/components/ScrollReveal";
import IndiaHeatMap from "@/components/IndiaHeatMap";

const LandingPage = () => {
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    ticketsClosed: 0,
    aiInsights: 0,
    activeUsers: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/dashboard/executive-summary`);
        setStats({
          totalRegistrations: response.data.total_registrations || 9536,
          ticketsClosed: response.data.total_tickets || 275,
          aiInsights: 187,
          activeUsers: 15000
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats({
          totalRegistrations: 9536,
          ticketsClosed: 275,
          aiInsights: 187,
          activeUsers: 15000
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const modules = [
    {
      icon: MessageSquare,
      title: "AI Chatbot",
      description: "Multilingual voice-enabled assistant for citizen queries",
      color: "from-orange-500 to-orange-600",
      link: "/chatbot"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Real-time KPIs, forecasts, and AI-generated insights",
      color: "from-blue-500 to-blue-600",
      link: "/dashboard"
    },
    {
      icon: Brain,
      title: "Sentiment Analysis",
      description: "Understand public mood from grievances and feedback",
      color: "from-teal-500 to-cyan-600",
      link: "/sentiment"
    },
    {
      icon: AlertCircle,
      title: "Ticketing System",
      description: "AI-powered ticket categorization and SLA tracking",
      color: "from-amber-500 to-orange-600",
      link: "/tickets"
    },
    {
      icon: FileSearch,
      title: "Document OCR",
      description: "Verify Aadhaar, DL, RC, Insurance documents instantly",
      color: "from-indigo-500 to-blue-600",
      link: "/document-verification"
    },
    {
      icon: UserCheck,
      title: "Facial Recognition",
      description: "Identity verification for DL issuance and enforcement",
      color: "from-emerald-500 to-green-600",
      link: "/facial-recognition"
    },
    {
      icon: Truck,
      title: "Vehicle Detection",
      description: "Automatic vehicle classification from CCTV/cameras",
      color: "from-red-500 to-rose-600",
      link: "/vehicle-detection"
    },
    {
      icon: Car,
      title: "Vehicle Analytics",
      description: "Comprehensive VAHAN data analysis and reporting",
      color: "from-sky-500 to-blue-600",
      link: "/vehicle-analytics"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <span className="text-white font-semibold text-lg">Citizen Assist</span>
                <span className="text-white/60 text-xs block">Transport Platform</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-white/80 hover:text-white transition-colors text-sm">Home</Link>
              <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors text-sm">Dashboard</Link>
              <Link to="/chatbot" className="text-white/80 hover:text-white transition-colors text-sm">Chatbot</Link>
              <Link to="/tickets" className="text-white/80 hover:text-white transition-colors text-sm">Tickets</Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to="/dashboard">
                <Button 
                  data-testid="view-dashboard-btn"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 text-white border-0"
                >
                  View Dashboard
                </Button>
              </Link>
              <Button 
                data-testid="sign-in-btn"
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section min-h-screen flex items-center relative pt-16 animated-gradient">
        <AnimatedBackground />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <ScrollReveal delay={0}>
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge 
                className="mb-6 px-4 py-2 glass-enhanced text-white border-white/20 badge-interactive scale-in"
            >
                <Zap className="w-4 h-4 mr-2 inline text-orange-400 glow-effect" />
              Powered by Advanced AI & Machine Learning
            </Badge>
            
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight fade-in">
              Citizen{" "}
                <span className="gradient-text-animated">
                Assistance
              </span>
              {" & "}
                <span className="gradient-text-animated" style={{ animationDelay: '0.5s' }}>
                Transport
              </span>
              {" "}Platform
            </h1>
            
              <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto blur-in">
              Transforming Governance Through Artificial Intelligence & Data Science. 
              Pioneering India's first state-level AI institution for digital transformation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button 
                  data-testid="explore-dashboard-btn"
                  size="lg" 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 text-white px-8 liquid-button hover-lift magnetic-hover"
                >
                  Explore AI Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button 
                data-testid="watch-demo-btn"
                size="lg" 
                variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 px-8 glass-enhanced hover-lift"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
          </ScrollReveal>
          
          {/* Stats Grid */}
          <ScrollReveal delay={200}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="stat-card glass-enhanced p-4 text-center hover-lift card-3d" data-testid="stat-registrations">
                <TrendingUp className="w-6 h-6 text-orange-400 mx-auto mb-2 floating-particle" />
              <div className="text-2xl md:text-3xl font-bold text-white">
                  {loading ? "..." : <AnimatedCounter value={stats.totalRegistrations} />}
              </div>
              <div className="text-white/60 text-sm">Vehicle Registrations</div>
            </div>
              <div className="stat-card glass-enhanced p-4 text-center hover-lift card-3d" data-testid="stat-tickets">
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-2 floating-particle" />
              <div className="text-2xl md:text-3xl font-bold text-white">
                  {loading ? "..." : <AnimatedCounter value={stats.ticketsClosed} />}
              </div>
              <div className="text-white/60 text-sm">Tickets Managed</div>
            </div>
              <div className="stat-card glass-enhanced p-4 text-center hover-lift card-3d" data-testid="stat-insights">
                <Database className="w-6 h-6 text-teal-400 mx-auto mb-2 floating-particle" />
              <div className="text-2xl md:text-3xl font-bold text-white">
                  {loading ? "..." : <AnimatedCounter value={2200000} suffix="M" />}
              </div>
              <div className="text-white/60 text-sm">Data Points Analyzed</div>
            </div>
              <div className="stat-card glass-enhanced p-4 text-center hover-lift card-3d" data-testid="stat-users">
                <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2 floating-particle" />
              <div className="text-2xl md:text-3xl font-bold text-white">
                  {loading ? "..." : <AnimatedCounter value={37} suffix="%" decimals={0} />}
              </div>
              <div className="text-white/60 text-sm">Efficiency Increase</div>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Heat Map Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal delay={0}>
            <div className="text-center mb-12">
              <Badge className="mb-4 px-4 py-2 bg-white/10 text-white border-white/20">
                Interactive Analytics
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                State-wise <span className="gradient-text">Performance Heat Map</span>
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Visualize vehicle registrations, accidents, revenue, and challans across all Indian states
              </p>
            </div>
            <IndiaHeatMap />
          </ScrollReveal>
        </div>
      </section>

      {/* AI Modules Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2 bg-white/10 text-white border-white/20">
              AI-Powered Modules
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Comprehensive <span className="gradient-text">AI Solutions</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Advanced AI solutions empowering citizens and streamlining transport department operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <ScrollReveal key={index} delay={index * 100} direction="up">
              <Link 
                to={module.link}
                data-testid={`module-card-${index}`}
              >
                  <Card className="module-card h-full cursor-pointer group kpi-card-enhanced magnetic-hover ripple-effect">
                  <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform glow-effect`}>
                      <module.icon className="w-6 h-6 text-white" />
                    </div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors gradient-text-animated">
                      {module.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {module.description}
                    </p>
                    <div className="flex items-center text-orange-600 text-sm font-medium">
                      Explore
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={0}>
        <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-600/90 to-blue-800/90 backdrop-blur-xl border-0 overflow-hidden glass-enhanced hover-lift">
            <CardContent className="p-8 md:p-12 text-center relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
              <div className="relative z-10">
                  <Shield className="w-12 h-12 text-white/80 mx-auto mb-4 floating-particle glow-effect" />
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 gradient-text-animated">
                  Ready to Transform Citizen Services?
                </h3>
                <p className="text-white/80 mb-8 max-w-xl mx-auto">
                  Access the full power of AI-driven analytics, voice-enabled chatbot, 
                  and automated document verification.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/dashboard">
                    <Button 
                      data-testid="get-started-btn"
                      size="lg" 
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:opacity-90 px-8 liquid-button hover-lift magnetic-hover"
                    >
                      Get Started Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/chatbot">
                    <Button 
                      data-testid="try-chatbot-btn"
                      size="lg" 
                      variant="outline" 
                        className="border-white/30 text-white hover:bg-white/10 px-8 glass-enhanced hover-lift"
                    >
                      Try AI Chatbot
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-white/60 text-sm">
              © 2025 Citizen Assistance & Transport Platform. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
      
      {/* Floating Chatbot */}
      <FloatingChatbot />
    </div>
  );
};

export default LandingPage;
