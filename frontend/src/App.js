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
import TicketManagement from "@/pages/TicketManagement";
import SentimentAnalysis from "@/pages/SentimentAnalysis";
import ChatbotPage from "@/pages/ChatbotPage";
import DocumentVerification from "@/pages/DocumentVerification";
import AadhaarVerification from "@/pages/AadhaarVerification";
import FacialRecognition from "@/pages/FacialRecognition";
import VehicleDetection from "@/pages/VehicleDetection";
import ManufacturerMarket from "@/pages/ManufacturerMarket";

// Import components
import Sidebar from "@/components/Sidebar";
import FloatingChatbot from "@/components/FloatingChatbot";
import GeoFilterBar from "@/components/GeoFilterBar";

// In development we ALWAYS use CRA dev-server proxy (avoids CORS + LAN hostname issues).
// In production you can set REACT_APP_BACKEND_URL to a full backend origin.
const _isDev = process.env.NODE_ENV !== "production";
const _rawBackendUrl = (process.env.REACT_APP_BACKEND_URL || "").trim();
const _hasExplicitBackend =
  !!_rawBackendUrl && !["undefined", "null"].includes(_rawBackendUrl.toLowerCase());
const BACKEND_URL = _hasExplicitBackend ? _rawBackendUrl.replace(/\/+$/, "") : "";
export const API = _isDev ? "/api" : _hasExplicitBackend ? `${BACKEND_URL}/api` : "/api";

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
          <Route path="/vehicle-analytics" element={
            <DashboardLayout>
              <VehicleAnalytics />
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
          <Route path="/aadhaar-verification" element={
            <DashboardLayout>
              <AadhaarVerification />
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
