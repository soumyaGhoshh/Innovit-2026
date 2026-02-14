import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Sparkles, Star } from 'lucide-react';
import { ParticleCard } from './MagicEffects';
import { useIsMobile } from '../hooks/useIsMobile';

const JudgeReveal = () => {
    const isMobile = useIsMobile();
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <section className="relative py-12 overflow-hidden md:py-16 lg:py-20">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-orange-950/10 to-black" />
            
            {/* Animated Stars */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(isMobile ? 10 : 20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-orange-400/30"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 0.8, 0.3],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    >
                        <Sparkles size={isMobile ? 12 : 16} />
                    </motion.div>
                ))}
            </div>

            <div className="container relative z-10 px-4 mx-auto sm:px-6 lg:px-8">
                {/* Title Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-8 text-center md:mb-12 lg:mb-16"
                >
                    <motion.div
                        className="inline-flex items-center gap-2 mb-3 md:gap-3 md:mb-4"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Award className="text-orange-500" size={isMobile ? 24 : 32} />
                        <h2 className="text-3xl font-bold text-transparent sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600">
                            Meet Our Judges
                        </h2>
                        <Award className="text-orange-500" size={isMobile ? 24 : 32} />
                    </motion.div>
                    
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="max-w-2xl px-4 mx-auto text-base text-gray-400 sm:text-lg md:text-xl"
                    >
                        Introducing the esteemed panel of experts who will evaluate your innovations!
                    </motion.p>
                </motion.div>

                {/* Poster Reveal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="mx-auto w-fit"
                >
                    <ParticleCard
                        className="relative overflow-hidden magic-card group rounded-2xl"
                        enabled={!isMobile}
                    >
                        {/* Glowing Border Effect */}
                        <div className="absolute inset-0 transition-opacity duration-500 opacity-0 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 group-hover:opacity-100 blur-xl" />
                        
                        {/* Card Container */}
                        <div className="relative overflow-hidden border bg-black/40 backdrop-blur-sm rounded-xl md:rounded-2xl border-orange-500/30">
                            {/* Top Shine Effect */}
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
                            
                            {/* Image Container */}
                            <motion.div
                                className="relative flex justify-center p-2 sm:p-3 md:p-4 lg:p-6"
                                whileHover={{ scale: isMobile ? 1 : 1.02 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Loading Shimmer */}
                                {!imageLoaded && (
                                    <div className="absolute w-48 sm:w-64 md:w-80 lg:w-96 h-64 sm:h-80 md:h-96 lg:h-[28rem] rounded-lg bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse md:rounded-xl" />
                                )}
                                
                                {/* Poster Image */}
                                <motion.img
                                    src="/judge-reveal.png"
                                    alt="Innovit 2026 Judges"
                                    className="h-64 sm:h-80 md:h-96 lg:h-[28rem] w-auto rounded-lg shadow-2xl md:rounded-xl mx-auto"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: imageLoaded ? 1 : 0 }}
                                    transition={{ duration: 0.5 }}
                                    onLoad={() => setImageLoaded(true)}
                                />
                                
                                {/* Corner Decorations */}
                                <div className="absolute w-4 h-4 border-t-2 border-l-2 top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 sm:w-6 sm:h-6 md:w-8 md:h-8 border-orange-500/50" />
                                <div className="absolute w-4 h-4 border-t-2 border-r-2 top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 sm:w-6 sm:h-6 md:w-8 md:h-8 border-orange-500/50" />
                                <div className="absolute w-4 h-4 border-b-2 border-l-2 bottom-2 left-2 sm:bottom-3 sm:left-3 md:bottom-4 md:left-4 sm:w-6 sm:h-6 md:w-8 md:h-8 border-orange-500/50" />
                                <div className="absolute w-4 h-4 border-b-2 border-r-2 bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4 sm:w-6 sm:h-6 md:w-8 md:h-8 border-orange-500/50" />
                            </motion.div>
                            
                            {/* Bottom Shine Effect */}
                            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
                        </div>
                    </ParticleCard>
                </motion.div>

                {/* Decorative Elements */}
                <motion.div
                    className="flex justify-center gap-2 mt-6 sm:gap-3 md:gap-4 sm:mt-8 md:mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        >
                            <Star className="text-orange-500" size={isMobile ? 16 : 20} fill="currentColor" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default JudgeReveal;
