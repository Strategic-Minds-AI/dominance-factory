import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';
import PackReview from '@/pages/PackReview';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import WebsiteLibrary from '@/pages/WebsiteLibrary';
import SocialMediaLibrary from '@/pages/SocialMediaLibrary';
import LaunchPad from '@/pages/LaunchPad';
import SuperAgents from '@/pages/SuperAgents';
import VisualEditor from '@/pages/VisualEditor';
import DominanceShell from '@/pages/DominanceShell';
import IntelligenceHub from '@/pages/IntelligenceHub';
import OutreachManager from '@/pages/OutreachManager';
import MediaGenerator from '@/pages/MediaGenerator';
import ProvisioningDashboard from '@/pages/ProvisioningDashboard';
import GptSync from '@/pages/GptSync';
import FrontendPreview from '@/pages/FrontendPreview';
import OnboardingPipeline from '@/pages/OnboardingPipeline';
import SystemContents from '@/pages/SystemContents';
import BusinessNameGenerator from '@/pages/BusinessNameGenerator';
import IndustryIntelligence from '@/pages/IndustryIntelligence';
import SeoDominanceStrategy from '@/pages/SeoDominanceStrategy';
import GodModeSeo from '@/pages/GodModeSeo';
import DigitalDominance from '@/pages/DigitalDominance';
import AutonomousResearchEngine from '@/pages/AutonomousResearchEngine';
import SocialMediaAutomation from '@/pages/SocialMediaAutomation';
import ABTesting from '@/pages/ABTesting';
import Analytics from '@/pages/Analytics';
import SystemLibrary from '@/pages/SystemLibrary';
import AgentReference from '@/pages/AgentReference';
import SystemGapAnalysis from '@/pages/SystemGapAnalysis';
import SystemScanner from '@/pages/SystemScanner';
import BenchmarkEngine from '@/pages/BenchmarkEngine';
import BuildInitiation from '@/pages/BuildInitiation';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth/consent" element={<OAuthConsent />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<BusinessNameGenerator />} />
          <Route path="/industries" element={<IndustryIntelligence />} />
          <Route path="/seo-strategy" element={<SeoDominanceStrategy />} />
          <Route path="/onboarding" element={<OnboardingPipeline />} />
          <Route path="/god-mode" element={<GodModeSeo />} />
          <Route path="/digital-dominance" element={<DigitalDominance />} />
          <Route path="/research-engine" element={<AutonomousResearchEngine />} />
          <Route path="/social-automation" element={<SocialMediaAutomation />} />
          <Route path="/ab-testing" element={<ABTesting />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/websites" element={<WebsiteLibrary />} />
          <Route path="/social" element={<SocialMediaLibrary />} />
          <Route path="/launch" element={<LaunchPad />} />
          <Route path="/agents" element={<SuperAgents />} />
          <Route path="/packs" element={<PackReview />} />
          <Route path="/editor" element={<VisualEditor />} />
          <Route path="/dominance" element={<DominanceShell />} />
          <Route path="/intelligence" element={<IntelligenceHub />} />
          <Route path="/outreach" element={<OutreachManager />} />
          <Route path="/media" element={<MediaGenerator />} />
          <Route path="/provisioning" element={<ProvisioningDashboard />} />
          <Route path="/sync" element={<GptSync />} />
          <Route path="/frontend" element={<FrontendPreview />} />
          <Route path="/contents" element={<SystemContents />} />
          <Route path="/library" element={<SystemLibrary />} />
          <Route path="/agent-reference" element={<AgentReference />} />
          <Route path="/gap-analysis" element={<SystemGapAnalysis />} />
          <Route path="/system-scanner" element={<SystemScanner />} />
          <Route path="/benchmark-engine" element={<BenchmarkEngine />} />
          <Route path="/build-initiation" element={<BuildInitiation />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App