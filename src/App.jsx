import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import Hero from './components/Hero';
import FinaleReveal from './components/FinaleReveal';
import JudgeReveal from './components/JudgeReveal';
import Timeline from './components/Timeline';
import LiveStream from './components/LiveStream';
import Rounds from './components/Rounds';
import Prizes from './components/Prizes';
import Mentoring from './components/Mentoring';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Contact from './components/Contact';
import Rules from './components/Rules';
import Guidelines from './components/Guidelines';
import ProblemStatement from './components/ProblemStatement';
import Results from './components/Results';
import RegisterToast from './components/RegisterToast';
import WhatsAppFloat from './components/WhatsAppFloat';
import DownloadFloat from './components/DownloadFloat';
import IDCard from './components/IDCard';
import Certificate from './components/Certificate';
import VerifyCertificate from './components/VerifyCertificate';
import Preloader from './components/Preloader';
import AnnouncementBanner from './components/AnnouncementBanner';
import { GlobalSpotlight } from './components/MagicEffects';
import { useIsMobile } from './hooks/useIsMobile';
import Background from './components/Background';

// Component to conditionally render float buttons
function FloatButtons() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  if (!isHomePage) return null;

  return (
    <>
      {/* WhatsApp Float Button */}
      <WhatsAppFloat />

      {/* Download Float Button */}
      <DownloadFloat />
    </>
  );
}

function App() {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {/* Preloader */}
      <Analytics />
      <Preloader onLoadComplete={() => setIsLoading(false)} />

      {/* Main App Content - Hidden until loading completes */}
      <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease-in' }}>
        <Background />
        <BrowserRouter>
          <div className="min-h-screen">
            {/* Navbar */}
            <Navbar />

            {/* Announcement Banner */}
            <AnnouncementBanner />

            {/* Register Toast Notification */}
            <RegisterToast />

            {/* Float Buttons - Only on Home Page */}
            <FloatButtons />

            {/* Disable GlobalSpotlight on mobile for performance */}
            <GlobalSpotlight
              enabled={!isMobile}
              spotlightRadius={300}
              glowColor="255, 153, 51"
              targetSelector=".magic-card"
            />

            <Routes>
              <Route path="/" element={
                <>
                  <Hero />
                  <FinaleReveal />
                  <JudgeReveal />
                  <Timeline />
                  <LiveStream />
                  <Rounds />
                  <Mentoring />
                  <Prizes />
                </>
              } />
              <Route path="/contact" element={<Contact />} />
              <Route path="/guidelines" element={<Guidelines />} />
              <Route path="/rules" element={<Guidelines />} />
              <Route path="/problem-statement" element={<ProblemStatement />} />
              <Route path="/results" element={<Results />} />
              <Route path="/id-card" element={<IDCard />} />
              <Route path="/certificate" element={<Certificate />} />
              <Route path="/verify-certificate" element={<VerifyCertificate />} />
            </Routes>

            <Footer />
          </div>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;