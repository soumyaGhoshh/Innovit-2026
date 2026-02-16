import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, Award, Users, Target } from 'lucide-react';
import Papa from 'papaparse';

const Phase2Results = () => {
    const [activeSubTab, setActiveSubTab] = useState('leaderboard'); // 'leaderboard' or 'finalist'
    const [activeTheme, setActiveTheme] = useState(0); // Default to TH05 since it has data
    const [results, setResults] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const themes = [
        { id: 'TH01', name: 'Open Innovation', color: '#FF9933', icon: '💡', maxScore: 60 },
        { id: 'TH02', name: 'Heritage & Culture', color: '#FFFFFF', icon: '🏛️', maxScore: 60 },
        { id: 'TH03', name: 'MedTech / BioTech / HealthTech', color: '#138808', icon: '🏥', maxScore: 80 },
        { id: 'TH04', name: 'Agriculture, FoodTech & Rural Development', color: '#FF9933', icon: '🌾', maxScore: 30 },
        { id: 'TH05', name: 'Blockchain & Cybersecurity', color: '#1E3A8A', icon: '🔐', maxScore: 40 }
    ];

    // Load Phase 2 results from CSV files
    useEffect(() => {
        const loadResults = async () => {
            setIsLoading(true);
            const resultsData = {};

            for (const theme of themes) {
                try {
                    const response = await fetch(`/Result-phase-2/${theme.id.toLowerCase()}.csv`);
                    if (!response.ok) {
                        console.log(`${theme.id} results not available yet`);
                        resultsData[theme.id] = [];
                        continue;
                    }
                    const csvText = await response.text();
                    const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
                    resultsData[theme.id] = result.data;
                } catch (error) {
                    console.error(`Error loading ${theme.id}:`, error);
                    resultsData[theme.id] = [];
                }
            }

            setResults(resultsData);
            setIsLoading(false);
        };

        loadResults();
    }, []);

    return (
        <div>
            {/* Sub Tabs - Leaderboard & Finalist */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex justify-center gap-3 mb-6 sm:mb-8"
            >
                <button
                    onClick={() => setActiveSubTab('leaderboard')}
                    className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-2 ${
                        activeSubTab === 'leaderboard'
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                            : 'glass-strong text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                >
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                    Leaderboard
                </button>
                <button
                    onClick={() => setActiveSubTab('finalist')}
                    className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-2 ${
                        activeSubTab === 'finalist'
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                            : 'glass-strong text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                >
                    <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                    Finalists
                </button>
            </motion.div>

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
                            onClick={() => setActiveTheme(index)}
                            className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                                activeTheme === index
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

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${activeSubTab}-${activeTheme}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="p-4 border-2 rounded-xl sm:p-6 md:p-8 glass-strong border-orange-400/30">
                        {/* Theme Header */}
                        <div className="pb-4 mb-4 border-b sm:pb-6 sm:mb-6 border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl sm:text-3xl">{themes[activeTheme].icon}</span>
                                <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
                                    {themes[activeTheme].name}
                                </h2>
                            </div>
                            <p className="text-sm sm:text-base text-white/70">
                                {activeSubTab === 'leaderboard' ? 'Team Rankings' : 'Grand Finale Qualifiers'}
                            </p>
                        </div>

                        {/* Coming Soon Message */}
                        {isLoading ? (
                            <div className="py-16 text-center sm:py-20 md:py-24">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500/20 to-orange-600/20">
                                        <Medal className="w-10 h-10 text-orange-400 sm:w-12 sm:h-12 animate-pulse" />
                                    </div>
                                    <h3 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                                        Loading Results...
                                    </h3>
                                </motion.div>
                            </div>
                        ) : results[themes[activeTheme].id]?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="px-2 py-3 text-xs font-bold tracking-wider text-orange-400 uppercase sm:px-4 sm:text-sm">Rank</th>
                                            <th className="px-2 py-3 text-xs font-bold tracking-wider text-orange-400 uppercase sm:px-4 sm:text-sm">Team Name</th>
                                            <th className="hidden px-2 py-3 text-xs font-bold tracking-wider text-orange-400 uppercase sm:table-cell sm:px-4 sm:text-sm">Leader</th>
                                            <th className="hidden px-2 py-3 text-xs font-bold tracking-wider text-orange-400 uppercase md:table-cell sm:px-4 sm:text-sm">Solution</th>
                                            <th className="px-2 py-3 text-xs font-bold tracking-wider text-center text-orange-400 uppercase sm:px-4 sm:text-sm">Score</th>
                                            <th className="px-2 py-3 text-xs font-bold tracking-wider text-center text-orange-400 uppercase sm:px-4 sm:text-sm">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results[themes[activeTheme].id]
                                            .filter(team => activeSubTab === 'leaderboard' || team.Shortlisted?.trim().toLowerCase() === 'yes')
                                            .map((team, index) => {
                                                const rank = parseInt(team.Rank);
                                                const isShortlisted = team.Shortlisted?.trim().toLowerCase() === 'yes';
                                                const currentMaxScore = themes[activeTheme].maxScore;
                                                const scoreKey = Object.keys(team).find(key => key.includes('Total (out of'));
                                                const score = team[scoreKey]?.trim();
                                                
                                                return (
                                                    <motion.tr
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className={`border-b border-white/5 transition-all hover:bg-white/5 ${
                                                            isShortlisted ? 'bg-green-500/10' : ''
                                                        }`}
                                                    >
                                                        <td className="px-2 py-3 sm:px-4 sm:py-4">
                                                            <div className="flex items-center gap-2">
                                                                {rank <= 3 && (
                                                                    <span className="text-lg sm:text-xl">
                                                                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                                                                    </span>
                                                                )}
                                                                <span className={`text-sm sm:text-base font-bold ${
                                                                    rank <= 3 ? 'text-yellow-400' : 'text-white'
                                                                }`}>
                                                                    #{rank}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-2 py-3 sm:px-4 sm:py-4">
                                                            <div className="font-semibold text-white text-sm sm:text-base max-w-[200px] sm:max-w-none">
                                                                {team['Team Name ']?.trim() || team['Team Name']?.trim()}
                                                            </div>
                                                        </td>
                                                        <td className="hidden px-2 py-3 sm:table-cell sm:px-4 sm:py-4">
                                                            <div className="text-xs text-white/70 sm:text-sm">
                                                                {team['Team Leader Name ']?.trim() || team['Team Leader Name']?.trim()}
                                                            </div>
                                                        </td>
                                                        <td className="hidden px-2 py-3 md:table-cell sm:px-4 sm:py-4">
                                                            <div className="text-xs text-white/60 sm:text-sm max-w-[300px] truncate">
                                                                {team['Solution Title ']?.trim() || team['Solution Title']?.trim()}
                                                            </div>
                                                        </td>
                                                        <td className="px-2 py-3 text-center sm:px-4 sm:py-4">
                                                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white rounded-full sm:px-3 sm:text-sm bg-gradient-to-r from-orange-500 to-amber-600">
                                                                {score}/{currentMaxScore}
                                                            </span>
                                                        </td>
                                                        <td className="px-2 py-3 text-center sm:px-4 sm:py-4">
                                                            {isShortlisted ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-green-400 rounded-full sm:px-3 sm:text-sm bg-green-500/20">
                                                                    <Star className="w-3 h-3 fill-current sm:w-4 sm:h-4" />
                                                                    <span className="hidden sm:inline">Qualified</span>
                                                                    <span className="sm:hidden">✓</span>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full text-white/50 sm:px-3 sm:text-sm bg-white/5">
                                                                    <span className="hidden sm:inline">Not Qualified</span>
                                                                    <span className="sm:hidden">-</span>
                                                                </span>
                                                            )}
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                    </tbody>
                                </table>

                                {/* Stats Footer */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="grid grid-cols-1 gap-3 p-4 mt-6 border sm:grid-cols-2 sm:gap-4 sm:p-6 rounded-xl bg-white/5 border-white/10"
                                >
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <Users className="w-4 h-4 text-blue-400 sm:w-5 sm:h-5" />
                                            <p className="text-xs font-semibold tracking-wider text-blue-400 uppercase sm:text-sm">Total Teams</p>
                                        </div>
                                        <p className="text-2xl font-bold text-white sm:text-3xl">
                                            {results[themes[activeTheme].id]?.length || 0}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <Star className="w-4 h-4 text-green-400 sm:w-5 sm:h-5" />
                                            <p className="text-xs font-semibold tracking-wider text-green-400 uppercase sm:text-sm">Finalists</p>
                                        </div>
                                        <p className="text-2xl font-bold text-white sm:text-3xl">
                                            {results[themes[activeTheme].id]?.filter(t => t.Shortlisted?.trim().toLowerCase() === 'yes').length || 0}
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="py-16 text-center sm:py-20 md:py-24">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500/20 to-orange-600/20">
                                        <Medal className="w-10 h-10 text-orange-400 sm:w-12 sm:h-12" />
                                    </div>
                                    <h3 className="mb-3 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                                        Coming Soon!
                                    </h3>
                                    <p className="max-w-md mx-auto text-sm sm:text-base md:text-lg text-white/70">
                                        {activeSubTab === 'leaderboard' 
                                            ? 'Phase 2 leaderboard will be announced after evaluation is complete.'
                                            : 'Finalists will be revealed soon. Stay tuned!'}
                                    </p>
                                    <div className="flex justify-center gap-2 mt-6">
                                        {[...Array(3)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{
                                                    y: [0, -10, 0],
                                                    opacity: [0.5, 1, 0.5],
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    delay: i * 0.2,
                                                }}
                                                className="w-2 h-2 bg-orange-400 rounded-full"
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Phase2Results;
