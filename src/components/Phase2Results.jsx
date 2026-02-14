import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star } from 'lucide-react';

const Phase2Results = () => {
    const [activeSubTab, setActiveSubTab] = useState('leaderboard'); // 'leaderboard' or 'finalist'
    const [activeTheme, setActiveTheme] = useState(0);

    const themes = [
        { id: 'TH01', name: 'Open Innovation', color: '#FF9933', icon: '💡' },
        { id: 'TH02', name: 'Heritage & Culture', color: '#FFFFFF', icon: '🏛️' },
        { id: 'TH03', name: 'MedTech / BioTech / HealthTech', color: '#138808', icon: '🏥' },
        { id: 'TH04', name: 'Agriculture, FoodTech & Rural Development', color: '#FF9933', icon: '🌾' },
        { id: 'TH05', name: 'Blockchain & Cybersecurity', color: '#1E3A8A', icon: '🔐' }
    ];

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
                        <div className="py-16 text-center sm:py-20 md:py-24">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500/20 to-orange-600/20">
                                    <Medal className="w-10 h-10 sm:w-12 sm:h-12 text-orange-400" />
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
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Phase2Results;
