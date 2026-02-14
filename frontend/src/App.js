import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import axios from "axios";

// Import pages
import LandingPage from "@/pages/LandingPage";
import ExecutiveDashboard from "@/pages/ExecutiveDashboard";
import KPIDashboard from "@/pages/KPIDashboard";
import AdvancedKPIDashboard from "@/pages/AdvancedKPIDashboard";
import VehicleAnalytics from "@/pages/VehicleAnalytics";
import FleetAnalytics from "@/pages/FleetAnalytics";
import TicketManagement from "@/pages/TicketManagement";
import SentimentAnalysis from "@/pages/SentimentAnalysis";
import ChatbotPage from "@/pages/ChatbotPage";
import DocumentVerification from "@/pages/DocumentVerification";
import FacialRecognition from "@/pages/FacialRecognition";
import VehicleDetection from "@/pages/VehicleDetection";
import ManufacturerMarket from "@/pages/ManufacturerMarket";
import RTOAnalysis from "@/pages/RTOAnalysis";

// Import components
import Sidebar from "@/components/Sidebar";
import FloatingChatbot from "@/components/FloatingChatbot";
import GeoFilterBar from "@/components/GeoFilterBar";

// Backend URL configuration - using relative paths in production (proxied through nginx)
// In production, always use relative path /api which nginx proxies to backend
// In development, use explicit backend URL
const _isDev = process.env.NODE_ENV !== "production";

// Determine API URL based on environment
// In production, always use relative path (nginx proxy handles it)
// In development, use environment variable or default to localhost
let API_URL;
if (_isDev) {
  // Development: use explicit backend URL from env or default to localhost
  const _rawBackendUrl = (process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || "").trim();
  const _hasExplicitBackend = !!_rawBackendUrl && !["undefined", "null"].includes(_rawBackendUrl.toLowerCase());
  
  if (process.env.REACT_APP_API_URL) {
    API_URL = process.env.REACT_APP_API_URL.trim().replace(/\/+$/, "");
  } else if (_hasExplicitBackend) {
    const backendUrl = _rawBackendUrl.replace(/\/+$/, "");
    API_URL = `${backendUrl}/api`;
  } else {
    API_URL = "http://localhost:8003/api";
  }
} else {
  // Production: always use relative path (nginx proxy)
  API_URL = "/api";
}

// Export API constant
export const API = API_URL;

// Layout wrapper for dashboard pages
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-6 lg:p-8">
          <div className="mb-6">
            <GeoFilterBar />
          </div>
          {children}
        </div>
      </main>
      <FloatingChatbot />
    </div>
  );
};

function App() {
  return (
    <div className="App min-h-screen">
      <BrowserRouter>
        <Routes>
          {/* Landing page - no sidebar */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Dashboard pages with sidebar */}
          <Route path="/dashboard" element={
            <DashboardLayout>
              <ExecutiveDashboard />
            </DashboardLayout>
          } />
          <Route path="/kpi-dashboard" element={
            <DashboardLayout>
              <KPIDashboard />
            </DashboardLayout>
          } />
          <Route path="/advanced-kpi-dashboard" element={
            <DashboardLayout>
              <AdvancedKPIDashboard />
            </DashboardLayout>
          } />
          <Route path="/rto-analysis" element={
            <DashboardLayout>
              <RTOAnalysis />
            </DashboardLayout>
          } />
          <Route path="/vehicle-analytics" element={
            <DashboardLayout>
              <VehicleAnalytics />
            </DashboardLayout>
          } />
          <Route path="/fleet-analytics" element={
            <DashboardLayout>
              <FleetAnalytics />
            </DashboardLayout>
          } />
          <Route path="/tickets" element={
            <DashboardLayout>
              <TicketManagement />
            </DashboardLayout>
          } />
          <Route path="/sentiment" element={
            <DashboardLayout>
              <SentimentAnalysis />
            </DashboardLayout>
          } />
          <Route path="/chatbot" element={
            <DashboardLayout>
              <ChatbotPage />
            </DashboardLayout>
          } />
          <Route path="/document-verification" element={
            <DashboardLayout>
              <DocumentVerification />
            </DashboardLayout>
          } />
          <Route path="/facial-recognition" element={
            <DashboardLayout>
              <FacialRecognition />
            </DashboardLayout>
          } />
          <Route path="/vehicle-detection" element={
            <DashboardLayout>
              <VehicleDetection />
            </DashboardLayout>
          } />
          <Route path="/maker" element={
            <DashboardLayout>
              <ManufacturerMarket />
            </DashboardLayout>
          } />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
