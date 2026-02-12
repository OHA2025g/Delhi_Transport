import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, Car, Ticket, SmilePlus, MessageSquare, 
  FileSearch, UserCheck, Truck, ChevronLeft, ChevronRight,
  Home, Settings, HelpCircle, LogOut, Factory, BarChart3, Brain, CreditCard, TrendingUp
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: LayoutDashboard, label: "Executive Dashboard", path: "/dashboard" },
  { icon: BarChart3, label: "KPI Dashboard", path: "/kpi-dashboard" },
  { icon: Brain, label: "Advanced KPIs", path: "/advanced-kpi-dashboard" },
  { icon: TrendingUp, label: "RTO Analysis", path: "/rto-analysis" },
  { icon: Car, label: "Vehicle Analytics", path: "/vehicle-analytics" },
  { icon: Factory, label: "Maker Dashboard", path: "/maker" },
  { icon: Ticket, label: "Ticket Management", path: "/tickets" },
  { icon: SmilePlus, label: "Sentiment Analysis", path: "/sentiment" },
  { icon: MessageSquare, label: "AI Chatbot", path: "/chatbot" },
  { icon: FileSearch, label: "Document Verification", path: "/document-verification" },
  { icon: CreditCard, label: "Aadhaar Verification", path: "/aadhaar-verification" },
  { icon: UserCheck, label: "Facial Recognition", path: "/facial-recognition" },
  { icon: Truck, label: "Vehicle Detection", path: "/vehicle-detection" },
];

const bottomNavItems = [
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: HelpCircle, label: "Help & Support", path: "/help" },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-xl border-r border-gray-100 shadow-xl transition-all duration-300 z-40 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
      data-testid="sidebar"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 magnetic-hover">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 glow-effect hover-lift">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              {isOpen && (
                <div className="overflow-hidden fade-in">
                  <span className="font-semibold text-gray-900 block gradient-text-animated">Citizen Assist</span>
                  <span className="text-xs text-gray-500">Transport Platform</span>
                </div>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-gray-600 liquid-button magnetic-hover"
              data-testid="toggle-sidebar"
            >
              {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div
                    className={`nav-item flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all magnetic-hover ripple-effect ${
                      isActive 
                        ? 'active bg-gradient-to-r from-orange-50 to-blue-50 text-orange-700 glow-effect' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 floating-particle ${isActive ? 'text-orange-600' : ''}`} />
                    {isOpen && (
                      <span className={`font-medium text-sm transition-all ${isActive ? 'text-orange-700 gradient-text-animated' : ''}`}>
                        {item.label}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-100 p-3 space-y-1">
          {bottomNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="nav-item flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </div>
            </Link>
          ))}
          
          <div className="nav-item flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer transition-all">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && (
              <span className="font-medium text-sm">Sign Out</span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
