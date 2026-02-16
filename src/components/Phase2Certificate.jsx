import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, User, Mail, Award, Search, Loader2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Papa from 'papaparse';
import QRCode from 'qrcode';

const themes = [
  { id: 'TH01', name: 'Open Innovation', color: '#FF9933' },
  { id: 'TH02', name: 'Heritage & Culture', color: '#FFFFFF' },
  { id: 'TH04', name: 'Agriculture, FoodTech & Rural Development', color: '#FF9933' },
  { id: 'TH05', name: 'Blockchain & Cybersecurity', color: '#1E3A8A' }
];

const usePhase2Certificate = ({
  onShare,
  pdfPreviewUrl,
  setPdfPreviewUrl,
  isPreviewLoading,
  setIsPreviewLoading,
  qrCodeUrl,
  setQrCodeUrl
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userData, setUserData] = useState(null);
  const [verifiedTheme, setVerifiedTheme] = useState(null);
  const [certificateType, setCertificateType] = useState(null); // 'qualified' or 'participated'
  const [results, setResults] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    team: ''
  });

  // Load results from all 4 theme CSV files for Phase 2
  useEffect(() => {
    const loadAllResults = async () => {
      const resultsData = {};

      for (const theme of themes) {
        try {
          const response = await fetch(`/Result-phase-2/${theme.id.toLowerCase()}.csv`);
          if (!response.ok) throw new Error(`Failed to fetch ${theme.id}.csv`);
          const csvText = await response.text();

          // Parse CSV with header trimming to handle "Team Name " (with trailing space)
          const result = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim() // Remove leading/trailing spaces from headers
          });
          resultsData[theme.id] = result.data;
          console.log(`✅ Loaded ${theme.id}: ${result.data.length} teams`);
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

  const updatePdfPreview = async (data, theme, certType) => {
    setIsPreviewLoading(true);
    try {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
      const blob = await generateCertificateBlob(data, theme, certType);
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);

      // Generate QR code for preview
      if (data.certificate_hash_id) {
        const verifyUrl = `https://innovit-2026.blockchainvitb.in/verify-certificate?id=${data.certificate_hash_id}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrDataUrl);
      }
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

    // Check if CSV data is loaded
    if (Object.keys(results).length === 0) {
      toast.error('System is still loading data. Please wait a moment...');
      return;
    }

    setIsVerifying(true);
    setUserData(null);
    setVerifiedTheme(null);
    setCertificateType(null);
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }

    try {
      // 1. Verify Email from Supabase
      const { data: sbUser, error } = await supabase
        .from('id_card_users')
        .select('*')
        .eq('email_id', formData.email.toLowerCase().trim())
        .maybeSingle();

      if (error) {
        toast.error('Verification failed. Please try again.');
        console.error('Supabase error:', error);
        return;
      }

      if (!sbUser) {
        toast.error('Email not found in our database. Please use your registered email.');
        return;
      }

      const teamNameFromSupabase = sbUser.team || '';
      const userNameFromSupabase = sbUser.name || '';
      let leaderName = '';

      // 2. Identify the Team Leader
      if (sbUser.team_position === 'Leader') {
        leaderName = userNameFromSupabase;
      } else if (teamNameFromSupabase) {
        // Find all potential leaders for this team
        const { data: potentialLeaders, error: leaderError } = await supabase
          .from('id_card_users')
          .select('name, team, created_at')
          .eq('team', teamNameFromSupabase)
          .eq('team_position', 'Leader');

        if (!leaderError && potentialLeaders && potentialLeaders.length > 0) {
          let bestLeader = null;
          if (potentialLeaders.length === 1) {
            bestLeader = potentialLeaders[0];
          } else {
            const userTime = new Date(sbUser.created_at).getTime();
            bestLeader = potentialLeaders.reduce((prev, curr) => {
              const prevDiff = Math.abs(new Date(prev.created_at).getTime() - userTime);
              const currDiff = Math.abs(new Date(curr.created_at).getTime() - userTime);
              return currDiff < prevDiff ? curr : prev;
            });
          }
          leaderName = bestLeader.name;
        } else {
          // Fallback: try case-insensitive
          const { data: caseInsensitiveLeaders } = await supabase
            .from('id_card_users')
            .select('name, team, created_at')
            .ilike('team', teamNameFromSupabase)
            .eq('team_position', 'Leader');

          if (caseInsensitiveLeaders && caseInsensitiveLeaders.length > 0) {
            const userTime = new Date(sbUser.created_at).getTime();
            const bestLeader = caseInsensitiveLeaders.reduce((prev, curr) => {
              const prevDiff = Math.abs(new Date(prev.created_at).getTime() - userTime);
              const currDiff = Math.abs(new Date(curr.created_at).getTime() - userTime);
              return currDiff < prevDiff ? curr : prev;
            });
            leaderName = bestLeader.name;
          } else {
            leaderName = userNameFromSupabase;
          }
        }
      }

      // 3. Search for Team in Phase 2 CSVs
      let foundTheme = null;
      let foundInCSV = null;
      let isQualified = false;

      const cleanName = (name) => (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const supabaseTeamName = teamNameFromSupabase.trim();
      const supabaseLeaderNameClean = cleanName(leaderName);

      // DEBUG: Log what we're searching for
      console.log('🔍 Searching for team in Phase 2 CSVs:');
      console.log('  📧 User Email:', formData.email);
      console.log('  👤 User Name:', userNameFromSupabase);
      console.log('  👥 Team from Supabase:', supabaseTeamName);
      console.log('  👨‍💼 Leader Name:', leaderName);
      console.log('  🔤 Leader Name (cleaned):', supabaseLeaderNameClean);

      // Search through all Phase 2 results
      for (const theme of themes) {
        const data = results[theme.id] || [];
        console.log(`\n  🎯 Searching ${theme.id} (${data.length} teams)...`);

        // Try exact team name match first
        let match = data.find(p => {
          const csvTeamName = (p['Team Name'] || '').trim();
          const csvLeaderNameClean = cleanName(p['Team Leader Name'] || '');
          return csvTeamName === supabaseTeamName && csvLeaderNameClean === supabaseLeaderNameClean;
        });

        // Fallback: case-insensitive match
        if (!match) {
          match = data.find(p => {
            const csvTeamNameLower = (p['Team Name'] || '').trim().toLowerCase();
            const csvLeaderNameClean = cleanName(p['Team Leader Name'] || '');
            return csvTeamNameLower === supabaseTeamName.toLowerCase() && csvLeaderNameClean === supabaseLeaderNameClean;
          });
        }

        // Second fallback: just team name
        if (!match) {
          match = data.find(p => {
            const csvTeamName = (p['Team Name'] || '').trim();
            return csvTeamName.toLowerCase() === supabaseTeamName.toLowerCase();
          });
        }

        if (match) {
          console.log(`  ✅ MATCH FOUND in ${theme.id}!`);
          console.log('  📋 CSV Team Name:', match['Team Name']);
          console.log('  👨‍💼 CSV Leader Name:', match['Team Leader Name']);
          console.log('  🏆 Shortlisted:', match['Shortlisted']);

          foundTheme = theme;
          foundInCSV = match;

          // Check if qualified (Shortlisted column = "YES" or "Yes")
          const shortlistedValue = (match['Shortlisted'] || '').trim().toUpperCase();
          isQualified = shortlistedValue === 'YES';

          break;
        }
      }

      if (!foundTheme) {
        console.log('\n  ❌ NO MATCH FOUND in any theme');
        console.log('  💡 Suggestion: Check if team name in Supabase matches CSV exactly');
        console.log('  💡 Team in Supabase:', supabaseTeamName);
      }

      // 4. Generate or retrieve Certificate Hash
      let finalHash = sbUser.certificate_hash_id;

      if (foundTheme && !finalHash) {
        // Generate a deterministic but unique hash
        const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
        const prefix = isQualified ? 'P2Q' : 'P2P'; // Phase 2 Qualified or Phase 2 Participated
        finalHash = `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomPart}`;

        // Update Supabase
        const { error: updateError } = await supabase
          .from('id_card_users')
          .update({ certificate_hash_id: finalHash })
          .eq('id', sbUser.id);

        if (updateError) {
          console.error('Error saving hash:', updateError);
        }
      }

      if (foundTheme) {
        const certType = isQualified ? 'qualified' : 'participated';
        const finalUserData = {
          ...sbUser,
          certificate_hash_id: finalHash,
          csvData: foundInCSV
        };

        setUserData(finalUserData);
        setVerifiedTheme(foundTheme);
        setCertificateType(certType);
        setFormData(prev => ({
          ...prev,
          name: userNameFromSupabase,
          team: teamNameFromSupabase
        }));

        const certTypeDisplay = isQualified ? 'Phase 2 Qualified' : 'Phase 2 Participated';
        toast.success(`Verified! Your ${certTypeDisplay} certificate for ${foundTheme.name} is ready.`);

        // Generate PDF preview
        await updatePdfPreview(finalUserData, foundTheme, certType);
      } else {
        const errorMsg = `Team "${supabaseTeamName}" not found in Phase 2. Check browser console for details.`;
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Verification error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsVerifying(false);
    }
  };

  const generateCertificateBlob = async (userData, verifiedTheme, certType) => {
    // Select template based on certificate type
    const templateUrl = certType === 'qualified'
      ? '/PHASE 2 QUALIFIED .pdf'
      : '/PHASE 2 PARTICIPATED.pdf';

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

    // Format name and team name
    const displayName = formatToTitleCase(userData.name);
    const displayTeam = formatToTitleCase(userData.team);

    // Combine name and team in format: "Name | Team: TeamName"
    const nameAndTeam = `${displayName} | Team: ${displayTeam}`;
    const nameFontSize = 22;
    const nameWidth = fontBold.widthOfTextAtSize(nameAndTeam, nameFontSize);

    // 1. Position Name & Team (Centered on the line below "This is to certify that")
    firstPage.drawText(nameAndTeam, {
      x: width / 2 - nameWidth / 2,
      y: height - 260,
      size: nameFontSize,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    // 2. Position Theme (Centered over the dotted line section)
    const themeText = `${verifiedTheme.id} : ${verifiedTheme.name}`;
    const themeFontSize = 18;
    const themeWidth = fontBold.widthOfTextAtSize(themeText, themeFontSize);

    firstPage.drawText(themeText, {
      x: width / 2 - themeWidth / 2 + 60,
      y: height - 370, 
      size: themeFontSize,
      font: fontBold,
      color: rgb(0.1, 0.2, 0.4),
    });

    // Draw Certificate Hash & QR
    if (userData.certificate_hash_id) {
      const hashText = `Certificate ID: ${userData.certificate_hash_id}`;
      const hashFontSize = 10;
      const hashWidth = fontRegular.widthOfTextAtSize(hashText, hashFontSize);

      firstPage.drawText(hashText, {
        x: width / 2 - hashWidth / 2,
        y: 25,
        size: hashFontSize,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
      });

      // QR Code
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
          x: width / 2 - 25,
          y: 40,
          width: 50,
          height: 50,
        });
      } catch (qrError) {
        console.error('Error generating QR code:', qrError);
      }
    }

    // Save and return blob
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  };

  const handleDownloadCertificate = async () => {
    if (!userData || !verifiedTheme || !certificateType) {
      toast.error('Please verify your email first');
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading('Downloading your certificate...');

    try {
      let blob;
      if (pdfPreviewUrl) {
        const response = await fetch(pdfPreviewUrl);
        blob = await response.blob();
      } else {
        blob = await generateCertificateBlob(userData, verifiedTheme, certificateType);
      }

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const certTypeLabel = certificateType === 'qualified' ? 'Phase2_Qualified' : 'Phase2_Participated';
      link.download = `${certTypeLabel}_${userData.name.replace(/\s+/g, '_')}.pdf`;
      link.click();

      toast.success('Certificate downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Failed to generate certificate: ' + error.message, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCertificateId = () => {
    if (!userData?.certificate_hash_id) return;
    navigator.clipboard.writeText(userData.certificate_hash_id);
    toast.success('Certificate ID copied to clipboard!');
  };

  return {
    formContent: (
      <div className="space-y-6">
        <h2 className="flex items-center gap-3 mb-8 text-2xl font-bold text-white">
          <Award className="w-6 h-6 text-yellow-500" />
          Phase 2 Verification
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

          {userData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
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

              {certificateType && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
                  <p className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
                    Certificate Type: {certificateType === 'qualified' ? 'Phase 2 Qualified ✨' : 'Phase 2 Participated 🎉'}
                  </p>
                </div>
              )}
            </motion.div>
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
      </div>
    ),
    previewActions: userData && verifiedTheme && certificateType && pdfPreviewUrl && !isPreviewLoading && (
      <>
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
            onClick={() => onShare(userData)}
            className="flex items-center justify-center flex-1 gap-3 py-4 font-bold text-white transition-all border bg-white/5 border-white/10 rounded-2xl hover:bg-white/10"
          >
            <Award className="w-5 h-5" />
            <span className="hidden sm:inline">Share Certificate</span>
            <span className="sm:hidden">Share</span>
          </motion.button>
        </div>
      </>
    ),
    userData,
    verifiedTheme,
    certificateType,
    isGenerating,
    handleDownloadCertificate,
    handleCopyCertificateId
  };
};

export default usePhase2Certificate;
