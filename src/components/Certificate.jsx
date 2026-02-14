import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, FileText, User, Mail, CheckCircle, Award, Search, ShieldCheck, Loader2, X, Copy, ExternalLink, RefreshCw, ZoomIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

import Papa from 'papaparse';
import QRCode from 'qrcode';

const themes = [
  { id: 'TH01', name: 'Open Innovation', color: '#FF9933' },
  { id: 'TH02', name: 'Heritage & Culture', color: '#FFFFFF' },
  { id: 'TH03', name: 'MedTech / BioTech / HealthTech', color: '#138808' },
  { id: 'TH04', name: 'Agriculture, FoodTech & Rural Development', color: '#FF9933' },
  { id: 'TH05', name: 'Blockchain & Cybersecurity', color: '#1E3A8A' }
];

const Certificate = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userData, setUserData] = useState(null);
  const [verifiedTheme, setVerifiedTheme] = useState(null);
  const [results, setResults] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    team: ''
  });
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [iframeScale, setIframeScale] = useState(1);
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('phase1'); // 'phase1', 'phase2', 'officials'
  const [officialRole, setOfficialRole] = useState('judge'); // 'judge', 'volunteer', 'student_coordinator'

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Base width for PDF preview (A4 Landscape at ~133dpi or high density)
        // 1122 is a good balance for quality and scaling
        const pdfBaseWidth = 1122;
        setIframeScale(containerWidth / pdfBaseWidth);
      }
    };

    updateScale();
    const timer = setTimeout(updateScale, 500); // Delayed check for animation completion

    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timer);
    };
  }, [userData, pdfPreviewUrl]);

  // Load results from all 5 theme CSV files
  useEffect(() => {
    const loadAllResults = async () => {
      const resultsData = {};

      for (const theme of themes) {
        try {
          const response = await fetch(`/Result-Phase-1/${theme.id}.csv`);
          if (!response.ok) throw new Error(`Failed to fetch ${theme.id}.csv`);
          const csvText = await response.text();

          const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
          resultsData[theme.id] = result.data;
        } catch (error) {
          console.error(`Error loading ${theme.id}:`, error);
          resultsData[theme.id] = [];
        }
      }

      setResults(resultsData);
    };

    loadAllResults();
  }, []);

  // Clean up PDF preview URL on unmount or change
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  const updatePdfPreview = async (data, theme) => {
    setIsPreviewLoading(true);
    try {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
      const blob = await generateCertificateBlob(data, theme);
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
    } catch (error) {
      console.error('Preview generation failed', error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleVerifyUser = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsVerifying(true);
    setUserData(null);
    setVerifiedTheme(null);
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }

    try {
      // Pure frontend simulation for Phase 1 as requested
      setTimeout(async () => {
        const dummyData = {
          name: formData.name || "Test Participant",
          team: formData.team || "Test Team",
          email_id: formData.email,
          certificate_hash_id: "P1-" + Math.random().toString(36).substr(2, 9).toUpperCase()
        };

        const dummyTheme = { id: "Participation", name: "Phase 1 Hackathon" };

        setUserData(dummyData);
        setVerifiedTheme(dummyTheme);

        // Generate PDF Preview
        await updatePdfPreview(dummyData, dummyTheme);

        setIsVerifying(false);
        toast.success('Verified! Your Phase 1 certificate is ready.');
      }, 1500);
    } catch (error) {
      console.error('Verification process failed:', error);
      toast.error('An unexpected error occurred during verification.');
      setIsVerifying(false);
    }
  };

  const handleVerifyOfficial = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsVerifying(true);
    setUserData(null);
    setVerifiedTheme(null);
    setPdfPreviewUrl(null);

    try {
      // Map dropdown role to database role
      let dbRole = officialRole;
      if (officialRole === 'judge') dbRole = 'mentor';

      const { data, error } = await supabase
        .from('id_card_users')
        .select('*')
        .eq('email_id', formData.email)
        .eq('user_type', dbRole)
        .single();

      if (error || !data) {
        throw new Error('User not found or role mismatch');
      }

      // If certificate_hash_id is missing, generate one and save it to the database
      if (!data.certificate_hash_id) {
        const prefix = officialRole === 'judge' ? 'JUD-' :
          officialRole === 'volunteer' ? 'VOL-' : 'CRD-';
        const newId = prefix + Math.random().toString(36).substr(2, 9).toUpperCase();

        // Save to database
        const { error: updateError } = await supabase
          .from('id_card_users')
          .update({ certificate_hash_id: newId })
          .eq('id', data.id);

        if (updateError) {
          console.error('Error saving certificate ID:', updateError);
          throw new Error('Failed to generate and save certificate ID');
        }

        // Update local data
        data.certificate_hash_id = newId;
      }

      const roleDisplay = officialRole.toUpperCase().replace('_', ' ');
      const dummyTheme = { id: roleDisplay, name: "INNOVIT 2026 OFFICIAL" };

      setUserData(data);
      setVerifiedTheme(dummyTheme);

      // Generate PDF Preview
      await updatePdfPreview(data, dummyTheme);

      setIsVerifying(false);
      toast.success(`Verified! Your ${officialRole.replace('_', ' ')} certificate is ready.`);
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error(error.message || 'Verification failed. Please check your email and role.');
      setIsVerifying(false);
    }
  };


  const generateCertificateBlob = async (userData, verifiedTheme) => {
    // Determine if this is an official certificate based on user_type or activeTab/verifiedTheme
    const isOfficial = ['mentor', 'judge', 'volunteer', 'student_coordinator'].includes(userData.user_type) || verifiedTheme.id === 'JUDGE' || verifiedTheme.id === 'VOLUNTEER' || verifiedTheme.id === 'STUDENT COORDINATOR';

    let templateUrl = '/phase-1-innovit_certitcate (1).pdf';

    if (isOfficial) {
      // Map role to template file
      // Note: verifiedTheme.id comes from handleVerifyOfficial as uppercased role
      if (verifiedTheme.id === 'JUDGE' || userData.user_type === 'mentor') {
        templateUrl = '/JUDGE.pdf';
      } else if (verifiedTheme.id === 'VOLUNTEER' || userData.user_type === 'volunteer') {
        templateUrl = '/VOLUNTEER.pdf';
      } else if (verifiedTheme.id === 'STUDENT COORDINATOR' || userData.user_type === 'student_coordinator') {
        templateUrl = '/STUDENT COORDINATOR.pdf';
      }
    }

    // Fetch the PDF template
    const response = await fetch(templateUrl);
    if (!response.ok) throw new Error('Failed to download template');
    const templateBytes = await response.arrayBuffer();

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Embed fonts
    const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    const formatToTitleCase = (str) => {
      if (!str) return '';
      return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    if (!isOfficial) {
      // --- PARTICIPANT CERTIFICATE LOGIC ---
      const displayName = formatToTitleCase(userData.name);
      const displayTeam = formatToTitleCase(userData.team);
      const combinedNameTeam = `${displayName} | Team: ${displayTeam}`;

      const nameFontSize = 24;
      const nameWidth = fontBold.widthOfTextAtSize(combinedNameTeam, nameFontSize);

      // Draw Name & Team
      firstPage.drawText(combinedNameTeam, {
        x: width / 2 - nameWidth / 2 + 85,
        y: height - 262,
        size: nameFontSize,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      // Draw Theme
      const themeText = `${verifiedTheme.id} : ${verifiedTheme.name}`;
      const themeFontSize = 22;
      const themeWidth = fontRegular.widthOfTextAtSize(themeText, themeFontSize);
      firstPage.drawText(themeText, {
        x: width / 2 - themeWidth / 2 + 85,
        y: height - 377,
        size: themeFontSize,
        font: fontRegular,
        color: rgb(0.12, 0.16, 0.22),
      });

      // Draw Date
      const today = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const dateFontSize = 12;
      firstPage.drawText(today, {
        x: 180,
        y: height - 718,
        size: dateFontSize,
        font: fontRegular,
        color: rgb(0.12, 0.16, 0.22),
      });

      // Draw Certificate Hash
      if (userData.certificate_hash_id) {
        const hashText = `Certificate ID: ${userData.certificate_hash_id}`;
        const hashFontSize = 9;
        const hashWidth = fontRegular.widthOfTextAtSize(hashText, hashFontSize);

        firstPage.drawText(hashText, {
          x: width / 2 - hashWidth / 2 + 85,
          y: 25,
          size: hashFontSize,
          font: fontRegular,
          color: rgb(0.3, 0.3, 0.3),
        });

        // Generate and Draw QR Code
        const verifyUrl = `https://innovit-2026.blockchainvitb.in/verify-certificate?id=${userData.certificate_hash_id}`;
        try {
          const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
            width: 100,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF00'
            }
          });

          const qrImageBytes = await fetch(qrCodeDataUrl).then(res => res.arrayBuffer());
          const qrImage = await pdfDoc.embedPng(qrImageBytes);

          firstPage.drawImage(qrImage, {
            x: width / 2 - 25 + 85,
            y: 40,
            width: 50,
            height: 50,
          });
        } catch (qrError) {
          console.error('Error generating QR code:', qrError);
        }
      }
    } else {
      // --- OFFICIAL CERTIFICATE LOGIC ---
      // Coordinates need to be adjusted based on the new templates.
      // Assuming similar layout or centered text for now.

      const displayName = formatToTitleCase(userData.name);
      const nameFontSize = 30; // Slightly larger for officials
      const nameWidth = fontBold.widthOfTextAtSize(displayName, nameFontSize);

      // Center Name - Approximate Y position, adjust as needed
      firstPage.drawText(displayName, {
        x: width / 2 - nameWidth / 2,
        y: height / 2 + 20, // Approximate center
        size: nameFontSize,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      // Draw Certificate Hash & QR
      if (userData.certificate_hash_id) {
        const hashText = `Certificate ID: ${userData.certificate_hash_id}`;
        const hashFontSize = 10;
        const hashWidth = fontRegular.widthOfTextAtSize(hashText, hashFontSize);

        // Bottom Center for ID (matching participant style)
        firstPage.drawText(hashText, {
          x: width / 2 - hashWidth / 2,
          y: 25,
          size: hashFontSize,
          font: fontRegular,
          color: rgb(0.3, 0.3, 0.3),
        });

        // QR Code - Center above ID (matching participant style)
        const verifyUrl = `https://innovit-2026.blockchainvitb.in/verify-certificate?id=${userData.certificate_hash_id}`;
        try {
          const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
            width: 100,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF00'
            }
          });

          const qrImageBytes = await fetch(qrCodeDataUrl).then(res => res.arrayBuffer());
          const qrImage = await pdfDoc.embedPng(qrImageBytes);

          firstPage.drawImage(qrImage, {
            x: width / 2 - 25, // Centered
            y: 40,
            width: 50,
            height: 50,
          });
        } catch (qrError) {
          console.error('Error generating QR code:', qrError);
        }
      }
    }

    // Save and return blob
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  };

  const handleDownloadCertificate = async () => {
    if (!userData || !verifiedTheme) {
      toast.error('Please verify your email first');
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading('Downloading your certificate...');

    try {
      let blob;
      if (pdfPreviewUrl) {
        // Reuse the blob from preview if available
        const response = await fetch(pdfPreviewUrl);
        blob = await response.blob();
      } else {
        blob = await generateCertificateBlob(userData, verifiedTheme);
      }

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Certificate_${userData.name.replace(/\s+/g, '_')}.pdf`;
      link.click();

      toast.success('Certificate downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Failed to generate certificate: ' + error.message, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };




  const handleShare = async () => {
    if (!userData || !userData.certificate_hash_id) {
      toast.error('Please verify your certificate first');
      return;
    }

    // Generate QR code for share modal
    try {
      const verifyUrl = getShareLink();
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }

    setIsShareModalOpen(true);
  };

  const getShareLink = () => {
    if (!userData?.certificate_hash_id) return '';
    return `https://innovit-2026.blockchainvitb.in/verify-certificate?id=${userData.certificate_hash_id}`;
  };

  const handleCopyLink = () => {
    const link = getShareLink();
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const handleCopyCertificateId = () => {
    if (!userData?.certificate_hash_id) return;
    navigator.clipboard.writeText(userData.certificate_hash_id);
    toast.success('Certificate ID copied to clipboard!');
  };

  return (
    <div className="min-h-screen w-full pt-24 pb-12 px-4 relative overflow-hidden bg-[#0a0a0f]">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1410',
            color: '#fff1ce',
            border: '1px solid rgba(245, 188, 34, 0.3)',
          },
        }}
      />

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsShareModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111] border border-white/10 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl max-w-lg w-full relative shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Reset background glow for modal */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[50px] pointer-events-none" />

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="absolute z-10 p-1 text-gray-400 transition-colors rounded-full top-3 right-3 sm:top-4 sm:right-4 hover:text-white bg-black/50"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="mb-4 text-center sm:mb-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 border rounded-full sm:w-16 sm:h-16 sm:mb-4 bg-yellow-500/10 border-yellow-500/20">
                  <Award className="w-6 h-6 text-yellow-500 sm:w-8 sm:h-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">Share Certificate</h3>
                <p className="text-xs text-gray-400 sm:text-sm">
                  Share your achievement with the world!
                </p>
              </div>

              {/* QR Code Display */}
              {qrCodeUrl && (
                <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-4 sm:p-6 mb-3 sm:mb-4 flex flex-col items-center">
                  <p className="mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase sm:mb-3">Scan QR Code to Verify</p>
                  <div className="p-2 bg-white rounded-lg sm:p-3">
                    <img src={qrCodeUrl} alt="Certificate QR Code" className="w-32 h-32 sm:w-40 sm:h-40" />
                  </div>
                </div>
              )}

              {/* Certificate ID Box */}
              <div className="bg-[#0a0a0f] border border-yellow-500/20 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 relative group">
                <p className="mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Certificate ID</p>
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <p className="font-mono text-xs font-bold text-yellow-400 break-all sm:text-sm">
                    {userData?.certificate_hash_id}
                  </p>
                  <button
                    onClick={handleCopyCertificateId}
                    className="flex-shrink-0 p-2 text-gray-400 transition-colors rounded-lg hover:bg-white/5 hover:text-white"
                    title="Copy Certificate ID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Verification Link Box */}
              <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 relative group">
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase sm:mb-2">Verification Link</p>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="bg-green-500/10 p-1.5 rounded-lg flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="font-mono text-xs text-white break-all transition-opacity sm:text-sm opacity-80 group-hover:opacity-100">
                    {getShareLink()}
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:gap-3">
                <button
                  onClick={handleCopyLink}
                  className="w-full py-3 sm:py-3.5 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors text-sm sm:text-base"
                >
                  <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Copy Link</span>
                </button>
                <button
                  onClick={() => window.open(getShareLink(), '_blank')}
                  className="w-full py-3 sm:py-3.5 bg-white/5 border border-white/10 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors text-sm sm:text-base"
                >
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Open Link</span>
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-yellow-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-600/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-8 text-yellow-400 transition-colors hover:text-yellow-300 group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-semibold">Back to Home</span>
        </motion.button>



        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 border rounded-full bg-yellow-500/10 border-yellow-500/20"
          >
            <Award className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-bold tracking-wider text-yellow-500 uppercase">Official Certification</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-4xl font-black text-transparent md:text-5xl lg:text-7xl bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-amber-600 drop-shadow-sm"
          >
            Download Certificate
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto text-base leading-relaxed text-gray-400 md:text-lg"
          >
            Validate your achievements and download your official INNOVIT 2026 participation certificates.
          </motion.p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-5">
          {/* Left Side: Verification Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 lg:col-span-2"
          >
            <div className="glass-strong p-8 rounded-3xl border border-yellow-500/10 bg-[#111]/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
              <div className="absolute w-24 h-24 transition-all rounded-full -top-12 -right-12 bg-yellow-500/10 blur-2xl group-hover:bg-yellow-500/20" />

              {/* Tabs */}
              <div className="flex p-1 mb-8 space-x-1 rounded-xl bg-blue-900/20 glass-strong">
                {['phase1', 'phase2', 'officials'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setUserData(null);
                      setVerifiedTheme(null);
                      setPdfPreviewUrl(null);
                      setFormData({ email: '', name: '', team: '' });
                    }}
                    className={`
                          w-full py-2.5 text-sm font-medium leading-5 rounded-lg
                          focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60
                          ${activeTab === tab
                        ? 'bg-white shadow text-blue-700'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                      }
                        `}
                  >
                    {tab === 'phase1' ? 'Phase 1' : tab === 'phase2' ? 'Phase 2' : 'Officials'}
                  </button>
                ))}
              </div>

              {activeTab === 'phase1' && (
                <>
                  <h2 className="flex items-center gap-3 mb-8 text-2xl font-bold text-white">
                    <ShieldCheck className="w-6 h-6 text-yellow-500" />
                    Participant Verification
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[#fff1ce] font-semibold mb-3 text-sm uppercase tracking-wider">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-yellow-400/50" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter registered email"
                          className="w-full pl-12 pr-4 py-4 bg-[#0a0a0f]/80 border border-yellow-500/20 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 transition-all font-medium"
                        />
                      </div>
                      <p className="mt-2 ml-1 text-xs text-gray-500">Use the email you used during registration.</p>
                    </div>

                    {!userData && (
                      <>
                        <div>
                          <label className="block text-[#fff1ce] font-semibold mb-3 text-sm uppercase tracking-wider">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-yellow-400/50" />
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Enter your name"
                              className="w-full pl-12 pr-4 py-4 bg-[#0a0a0f]/80 border border-yellow-500/20 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 transition-all font-medium"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[#fff1ce] font-semibold mb-3 text-sm uppercase tracking-wider">
                            Team Name
                          </label>
                          <div className="relative">
                            <Award className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-yellow-400/50" />
                            <input
                              type="text"
                              name="team"
                              value={formData.team}
                              onChange={handleInputChange}
                              placeholder="Enter team name"
                              className="w-full pl-12 pr-4 py-4 bg-[#0a0a0f]/80 border border-yellow-500/20 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 transition-all font-medium"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {userData && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[#fff1ce] font-semibold mb-3 text-sm uppercase tracking-wider">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-yellow-400/50" />
                            <input
                              type="text"
                              value={formData.name}
                              readOnly
                              className="w-full pl-12 pr-4 py-4 bg-[#0a0a0f]/40 border border-yellow-500/10 rounded-2xl text-gray-400 cursor-not-allowed font-medium"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[#fff1ce] font-semibold mb-3 text-sm uppercase tracking-wider">
                            Team Name
                          </label>
                          <div className="relative">
                            <Award className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-yellow-400/50" />
                            <input
                              type="text"
                              value={formData.team}
                              readOnly
                              className="w-full pl-12 pr-4 py-4 bg-[#0a0a0f]/40 border border-yellow-500/10 rounded-2xl text-gray-400 cursor-not-allowed font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02, translateY: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleVerifyUser}
                      disabled={!formData.email || isVerifying}
                      className={`
                          w-full py-4 rounded-2xl font-black text-lg
                          transition-all duration-300 flex items-center justify-center gap-3 shadow-xl
                          ${formData.email && !isVerifying
                          ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-[#0a0a0f] hover:shadow-yellow-500/30'
                          : 'bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'
                        }
                          `}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-6 h-6" />
                          <span>{userData ? 'Re-verify' : 'Verify & Preview'}</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </>
              )}

              {activeTab === 'phase2' && (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="p-4 mb-4 rounded-full bg-yellow-500/10">
                    <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Coming Soon</h3>
                  <p className="mt-2 text-gray-400">Phase 2 certificates will be available shortly.</p>
                </div>
              )}

              {activeTab === 'officials' && (
                <>
                  <h2 className="flex items-center gap-3 mb-8 text-2xl font-bold text-white">
                    <ShieldCheck className="w-6 h-6 text-yellow-500" />
                    Official Verification
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[#fff1ce] font-semibold mb-3 text-sm uppercase tracking-wider">
                        Select Role
                      </label>
                      <select
                        value={officialRole}
                        onChange={(e) => setOfficialRole(e.target.value)}
                        className="w-full px-4 py-4 bg-[#0a0a0f]/80 border border-yellow-500/20 rounded-2xl text-white focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 transition-all font-medium appearance-none"
                      >
                        <option value="judge">Judge</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="student_coordinator">Student Coordinator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#fff1ce] font-semibold mb-3 text-sm uppercase tracking-wider">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-yellow-400/50" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter official email"
                          className="w-full pl-12 pr-4 py-4 bg-[#0a0a0f]/80 border border-yellow-500/20 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02, translateY: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleVerifyOfficial}
                      disabled={!formData.email || isVerifying}
                      className={`
                          w-full py-4 rounded-2xl font-black text-lg
                          transition-all duration-300 flex items-center justify-center gap-3 shadow-xl
                          ${formData.email && !isVerifying
                          ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-[#0a0a0f] hover:shadow-yellow-500/30'
                          : 'bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'
                        }
                          `}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-6 h-6" />
                          <span>{userData ? 'Re-verify' : 'Verify & Preview'}</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border glass-strong rounded-3xl border-blue-500/10 bg-blue-500/5">
              <div className="flex gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="mb-1 font-bold text-blue-400">Email Verification Required</h4>
                  <p className="text-sm leading-relaxed text-blue-200/60">
                    You must use your registered email address to download your certificate. Manual entries are not permitted for security and authenticity.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Preview Display */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6 lg:col-span-3"
          >
            <div className="glass-strong p-8 rounded-3xl border border-white/10 bg-[#111]/80 backdrop-blur-2xl shadow-2xl min-h-[500px] flex flex-col">
              <h2 className="mb-8 text-2xl font-bold text-white">Certificate Preview</h2>

              <AnimatePresence mode="wait">
                {isPreviewLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center flex-1 p-12 text-center"
                  >
                    <div className="relative flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-yellow-500/10">
                      <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                    </div>
                    <h3 className="text-xl font-bold text-[#fff1ce] mb-2">Generating Actual PDF</h3>
                    <p className="max-w-xs leading-relaxed text-gray-500">
                      Preparing your official certificate preview using the high-resolution template...
                    </p>
                  </motion.div>
                ) : userData && verifiedTheme && pdfPreviewUrl ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col flex-1"
                  >
                    <div
                      ref={containerRef}
                      className="relative w-full aspect-[1.414/1] bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden mb-8 shadow-2xl flex items-center justify-center"
                    >
                      {pdfPreviewUrl && (
                        <div
                          style={{
                            width: '1122px', // Fixed base width
                            height: '793px', // Fixed base height (1122 / 1.414)
                            transform: `scale(${iframeScale})`,
                            transformOrigin: 'top left',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            pointerEvents: 'auto'
                          }}
                        >
                          <iframe
                            src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                            className="w-full h-full border-none"
                            title="Certificate PDF Preview"
                          />
                        </div>
                      )}

                      {/* Fallback & Overlay */}
                      {!pdfPreviewUrl && !isPreviewLoading && (
                        <div className="flex flex-col items-center text-gray-500">
                          <Search className="w-12 h-12 mb-4 opacity-20" />
                          <p>Verifying your details...</p>
                        </div>
                      )}

                      {/* Decorative border overlay */}
                      <div className="absolute inset-0 border-2 pointer-events-none border-yellow-500/20 rounded-2xl" />

                      {/* Quality notice for mobile */}
                      {isMobile && (
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 pointer-events-none">
                          <ZoomIn className="w-3 h-3 text-yellow-500" />
                          <span className="text-[10px] text-white font-medium">Interactive Preview</span>
                        </div>
                      )}
                    </div>

                    {/* Certificate ID and QR Code Section */}
                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                      {/* QR Code Box */}
                      {qrCodeUrl && (
                        <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-4 flex flex-col items-center">
                          <p className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Scan to Verify</p>
                          <div className="p-2 bg-white rounded-lg">
                            <img src={qrCodeUrl} alt="Certificate QR Code" className="w-28 h-28" />
                          </div>
                        </div>
                      )}

                      {/* Certificate ID Box */}
                      <div className="bg-[#0a0a0f] border border-yellow-500/20 rounded-xl p-4 flex flex-col justify-center">
                        <p className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Certificate ID</p>
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <p className="font-mono text-sm font-bold text-yellow-400 break-all">
                            {userData?.certificate_hash_id}
                          </p>
                          <button
                            onClick={handleCopyCertificateId}
                            className="flex-shrink-0 p-2 text-gray-400 transition-colors rounded-lg hover:bg-white/5 hover:text-white"
                            title="Copy Certificate ID"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={handleCopyCertificateId}
                          className="flex items-center justify-center w-full gap-2 py-2 text-xs font-semibold text-yellow-400 transition-colors border rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy ID</span>
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownloadCertificate}
                        disabled={isGenerating}
                        className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0a0a0f] py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:shadow-yellow-500/20 transition-all disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="hidden sm:inline">Generating...</span>
                            <span className="sm:hidden">Generating...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5" />
                            <span className="hidden sm:inline">Download High-Res PDF</span>
                            <span className="sm:hidden">Download PDF</span>
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleShare}
                        className="flex items-center justify-center flex-1 gap-3 py-4 font-bold text-white transition-all border bg-white/5 border-white/10 rounded-2xl hover:bg-white/10"
                      >
                        <FileText className="w-5 h-5" />
                        <span className="hidden sm:inline">Share Certificate</span>
                        <span className="sm:hidden">Share</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center flex-1 p-12 text-center"
                  >
                    <div className="relative flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-yellow-500/5">
                      <div className="absolute inset-0 rounded-full bg-yellow-500/10 animate-pulse" />
                      <Search className="w-10 h-10 text-yellow-500/30" />
                    </div>
                    <h3 className="text-xl font-bold text-[#fff1ce] mb-2">No Certificate Selected</h3>
                    <p className="max-w-xs leading-relaxed text-gray-500">
                      Please enter and verify your registered email address to unlock your certificates.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Floating Verification Icon - Bottom Right */}
        <motion.button
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/verify-certificate')}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-3 rounded-full bg-[#111]/90 border border-yellow-500/30 text-yellow-500 shadow-2xl shadow-yellow-500/10 backdrop-blur-xl hover:border-yellow-500/60 hover:bg-[#111] transition-all group"
        >
          <span className="text-sm font-bold tracking-wide uppercase">Verify Certificate</span>
          <div className="p-2 transition-colors border rounded-full bg-yellow-500/10 border-yellow-500/20 group-hover:bg-yellow-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default Certificate;
