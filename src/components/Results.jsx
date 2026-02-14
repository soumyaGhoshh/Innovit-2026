import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Award, Users } from 'lucide-react';
import Papa from 'papaparse';
import Phase2Results from './Phase2Results';

const Results = () => {
    const [mainTab, setMainTab] = useState('phase1'); // 'phase1' or 'phase2'
    const [activeTab, setActiveTab] = useState(0);
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(true);

    const themes = [
        { id: 'TH01', name: 'Open Innovation', color: '#FF9933', icon: '💡' },
        { id: 'TH02', name: 'Heritage & Culture', color: '#FFFFFF', icon: '🏛️' },
        { id: 'TH03', name: 'MedTech / BioTech / HealthTech', color: '#138808', icon: '🏥' },
        { id: 'TH04', name: 'Agriculture, FoodTech & Rural Development', color: '#FF9933', icon: '🌾' },
        { id: 'TH05', name: 'Blockchain & Cybersecurity', color: '#1E3A8A', icon: '🔐' }
    ];

    useEffect(() => {
        const loadResults = async () => {
            const resultsData = {};
            
            for (const theme of themes) {
                try {
                    const response = await fetch(`/Result-Phase-1/${theme.id}.csv`);
                    const csvText = await response.text();
                    
                    Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (result) => {
                            resultsData[theme.id] = result.data;
                        }
                    });
                } catch (error) {
                    console.error(`Error loading ${theme.id}:`, error);
                    resultsData[theme.id] = [];
                }
            }
            
            setResults(resultsData);
            setLoading(false);
        };

        loadResults();
        
        // Hide confetti after 5 seconds
        const confettiTimer = setTimeout(() => {
            setShowConfetti(false);
        }, 5000);

        return () => clearTimeout(confettiTimer);
    }, []);

    return (
        <section className="relative min-h-screen px-3 pt-24 pb-16 sm:px-4 sm:pt-28 md:pt-32 md:pb-20 lg:px-8">
            {/* Confetti Effect */}
            <AnimatePresence>
                {showConfetti && (
                    <div className="fixed inset-0 z-50 pointer-events-none">
                        {[...Array(50)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: -20,
                                    backgroundColor: ['#FF9933', '#FFFFFF', '#138808', '#FFD700', '#FF6B6B'][Math.floor(Math.random() * 5)]
                                }}
                                initial={{ y: -20, opacity: 1, rotate: 0 }}
                                animate={{
                                    y: window.innerHeight + 20,
                                    opacity: [1, 1, 0],
                                    rotate: 360 * (Math.random() > 0.5 ? 1 : -1)
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    delay: Math.random() * 0.5,
                                    ease: 'linear'
                                }}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <div className="w-full max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 text-center sm:mb-10 md:mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Trophy className="w-8 h-8 text-yellow-400 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                        <h1 className="text-2xl font-bold sm:text-3xl md:text-5xl lg:text-6xl gradient-text">
                            Results
                        </h1>
                        <Sparkles className="w-8 h-8 text-yellow-400 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                    </div>
                    <p className="max-w-3xl px-2 mx-auto text-sm sm:text-base md:text-lg lg:text-xl text-white/80">
                        🎉 Congratulations to all qualified teams! 🎉
                    </p>
                </motion.div>

                {/* Main Phase Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex justify-center gap-4 mb-8 sm:mb-10"
                >
                    <button
                        onClick={() => setMainTab('phase1')}
                        className={`px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-base sm:text-lg font-bold transition-all duration-300 ${
                            mainTab === 'phase1'
                                ? 'bg-gradient-to-br from-saffron-400 to-amber-500 text-white shadow-2xl scale-105'
                                : 'glass-strong text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        Phase 1
                    </button>
                    <button
                        onClick={() => setMainTab('phase2')}
                        className={`px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-base sm:text-lg font-bold transition-all duration-300 ${
                            mainTab === 'phase2'
                                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-2xl scale-105'
                                : 'glass-strong text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        Phase 2
                    </button>
                </motion.div>

                {/* Phase 2 Results */}
                {mainTab === 'phase2' && <Phase2Results />}

                {/* Phase 1 Results */}
                {mainTab === 'phase1' && (
                    <>
                        {/* Theme Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-6 overflow-x-auto sm:mb-8"
                >
                    <div className="flex gap-2 pb-2 sm:gap-3 min-w-max sm:min-w-0 sm:flex-wrap sm:justify-center">
                        {themes.map((theme, index) => (
                            <button
                                key={theme.id}
                                onClick={() => setActiveTab(index)}
                                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === index
                                        ? 'bg-gradient-to-br from-saffron-400 to-amber-500 text-white shadow-lg scale-105'
                                        : 'glass-strong text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <span className="text-base sm:text-lg">{theme.icon}</span>
                                <span className="hidden sm:inline">{theme.name}</span>
                                <span className="sm:hidden">{theme.id}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Results Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="p-4 border-2 rounded-xl sm:p-6 md:p-8 glass-strong border-saffron-400/30">
                            {/* Theme Header */}
                            <div className="pb-4 mb-4 border-b sm:pb-6 sm:mb-6 border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl sm:text-3xl">{themes[activeTab].icon}</span>
                                    <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
                                        {themes[activeTab].name}
                                    </h2>
                                </div>
                                <p className="text-sm sm:text-base text-white/70">
                                    {results[themes[activeTab].id]?.length || 0} Qualified Teams
                                </p>
                            </div>

                            {/* Results Table */}
                            {loading ? (
                                <div className="py-12 text-center">
                                    <div className="inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-saffron-400 animate-spin"></div>
                                    <p className="mt-4 text-white/70">Loading results...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="px-2 py-3 text-xs font-semibold sm:px-4 sm:text-sm md:text-base text-saffron-400">#</th>
                                                <th className="px-2 py-3 text-xs font-semibold sm:px-4 sm:text-sm md:text-base text-saffron-400">Team Name</th>
                                                <th className="px-2 py-3 text-xs font-semibold sm:px-4 sm:text-sm md:text-base text-saffron-400">Team Leader</th>
                                                <th className="hidden px-2 py-3 text-xs font-semibold md:table-cell sm:px-4 sm:text-sm md:text-base text-saffron-400">Solution Title</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results[themes[activeTab].id]?.map((team, index) => (
                                                <motion.tr
                                                    key={index}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.02 }}
                                                    className="transition-colors border-b border-white/5 hover:bg-white/5"
                                                >
                                                    <td className="px-2 py-3 text-xs font-medium sm:px-4 sm:text-sm md:text-base text-white/70">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-2 py-3 text-xs font-semibold text-white sm:px-4 sm:text-sm md:text-base">
                                                        {team['Team Name']}
                                                    </td>
                                                    <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm md:text-base text-white/80">
                                                        {team['Team Leader Name']}
                                                    </td>
                                                    <td className="hidden px-2 py-3 text-xs md:table-cell sm:px-4 sm:text-sm md:text-base text-white/70">
                                                        {team['Solution Title']}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Footer Message */}
                            <div className="pt-4 mt-6 text-center border-t sm:pt-6 sm:mt-8 border-white/10">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <Award className="w-5 h-5 text-yellow-400" />
                                    <p className="text-sm font-semibold text-white sm:text-base md:text-lg">
                                        Best of Luck for Phase 2!
                                    </p>
                                </div>
                                <p className="mb-4 text-xs sm:text-sm text-white/70">
                                    Submit your prototype by February 7, 2026
                                </p>
                                <a
                                    href="https://forms.gle/RjPbxwcGKTjqym6G7"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-6 py-2 text-sm rounded-full sm:px-8 sm:py-3 sm:text-base btn-primary"
                                >
                                    Submit Prototype →
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
                    </>
                )}
            </div>
        </section>
    );
};

export default Results;
