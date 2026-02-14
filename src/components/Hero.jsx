import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Rocket, Sparkles, ChevronDown } from 'lucide-react';
import { Link } from 'react-scroll';
import ElectricBorder from './ElectricBorder';
import { ParticleCard } from './MagicEffects';
import PixelBlast from './PixelBlast';
import { useIsMobile } from '../hooks/useIsMobile';
import DecryptedText from './DecryptedText';
import Reveal from './Reveal';

const Hero = () => {
    const isMobile = useIsMobile();

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e) => {
        if (isMobile) return; // Disable on mobile for performance

        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // Calculate rotation angles (max 20 degrees in each direction)
        const rotateY = (mouseX / (rect.width / 2)) * 20;
        const rotateX = -(mouseY / (rect.height / 2)) * 20;

        setMousePosition({ x: rotateY, y: rotateX });
    };

    const handleMouseLeave = () => {
        setMousePosition({ x: 0, y: 0 });
        setIsHovering(false);
    };

    useEffect(() => {
        const finaleDate = new Date('2026-02-28T10:00:00');

        const timer = setInterval(() => {
            const now = new Date();
            const difference = finaleDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Create floating particles - reduced count on mobile for performance
    const particleCount = isMobile ? 6 : 30;
    const particles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 20}s`,
        animationDuration: `${15 + Math.random() * 10}s`
    }));

    return (
        <section className="relative flex items-center justify-center min-h-screen px-4 py-12 overflow-hidden">
            {/* Background - Static on mobile, animated on desktop */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {isMobile ? (
                    // Static gradient background for mobile - Patriotic theme
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#13131f] to-[#1a1a2a]">
                        <div className="absolute inset-0 opacity-30"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255, 153, 51, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(19, 136, 8, 0.15) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.1) 0%, transparent 60%)',
                            }}
                        />
                    </div>
                ) : (
                    // Animated PixelBlast for desktop - Saffron patriotic color
                    <PixelBlast
                        variant="circle"
                        pixelSize={4}
                        color="#FF9933"
                        patternScale={2.5}
                        patternDensity={0.8}
                        pixelSizeJitter={0.3}
                        enableRipples={true}
                        rippleSpeed={0.5}
                        rippleThickness={0.15}
                        rippleIntensityScale={2.0}
                        liquid={true}
                        liquidStrength={0.08}
                        liquidRadius={1.0}
                        liquidWobbleSpeed={4}
                        speed={2.5}
                        edgeFade={0.2}
                        transparent={true}
                    />
                )}
            </div>

            {/* Gradient Overlays for Text Visibility - Non-interactive */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 z-[1] pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 z-[1] pointer-events-none"></div>

            {/* Particles - Disabled on mobile for performance */}
            {!isMobile && (
                <div className="particles z-[2]">
                    {particles.map(particle => (
                        <div
                            key={particle.id}
                            className="particle"
                            style={{
                                left: particle.left,
                                animationDelay: particle.animationDelay,
                                animationDuration: particle.animationDuration
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Grid Overlay - Patriotic tri-color */}
            <div className="absolute inset-0 opacity-10 z-[2]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 153, 51, 0.4) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(19, 136, 8, 0.3) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}
            />

            {/* Content Container with proper spacing */}
            <div className="relative z-10 w-full max-w-6xl pt-24 mx-auto text-center sm:pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Badge - Patriotic styling */}
                    <Reveal className="inline-flex items-center gap-2 px-4 py-2 mb-6 glass" delay={0.15}>
                        <Sparkles className="w-4 h-4 text-saffron-400" />
                        <span className="text-xs font-medium sm:text-sm text-white/90">VIT Bhopal Blockchain Club Presents</span>
                    </Reveal>

                    {/* 3D Animated Logo with Continuous Loops */}
                    <Reveal variant="fade" delay={0.2}>
                        <motion.div
                            className="relative flex items-center justify-center mb-12"
                            style={{ perspective: '1500px' }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <motion.div
                                className="relative cursor-pointer logo-3d-container"
                                onMouseMove={handleMouseMove}
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={handleMouseLeave}
                                animate={{
                                    y: [0, -15, 0], // Floating animation
                                    rotateY: mousePosition.x,
                                    rotateX: mousePosition.y,
                                    scale: isHovering ? 1.08 : 1,
                                }}
                                transition={{
                                    y: {
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    },
                                    rotateY: {
                                        type: "spring",
                                        stiffness: 150,
                                        damping: 15,
                                    },
                                    rotateX: {
                                        type: "spring",
                                        stiffness: 150,
                                        damping: 15,
                                    },
                                    scale: {
                                        duration: 0.3,
                                        ease: "easeOut"
                                    }
                                }}
                                style={{
                                    transformStyle: 'preserve-3d',
                                }}
                            >
                                {/* Patriotic pulsing glow */}
                                <motion.div
                                    className="absolute inset-0 rounded-full blur-3xl"
                                    style={{
                                        background: 'radial-gradient(circle, rgba(255, 153, 51, 0.2) 0%, rgba(19, 136, 8, 0.12) 40%, rgba(30, 58, 138, 0.08) 60%, transparent 80%)',
                                        transform: 'translateZ(-80px) scale(1.3)',
                                    }}
                                    animate={{
                                        opacity: [0.25, 0.4, 0.25],
                                        scale: [1.2, 1.35, 1.2],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />

                                {/* Main logo image with proper sizing */}
                                <motion.img
                                    src="/innovit-logo-bg-removed.png"
                                    alt="INNOVIT 2026"
                                    className="relative z-10 w-[220px] sm:w-[280px] md:w-[340px] lg:w-[380px] h-auto object-contain"
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        maxWidth: '90vw',
                                    }}
                                    animate={{
                                        filter: isHovering
                                            ? 'drop-shadow(0 0 50px rgba(255, 153, 51, 0.9)) drop-shadow(0 0 80px rgba(19, 136, 8, 0.6))'
                                            : 'drop-shadow(0 0 25px rgba(255, 153, 51, 0.5)) drop-shadow(0 0 40px rgba(19, 136, 8, 0.3))',
                                        rotate: [0, 2, 0, -2, 0], // Subtle wiggle
                                    }}
                                    transition={{
                                        filter: { duration: 0.4 },
                                        rotate: {
                                            duration: 6,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }
                                    }}
                                />

                                {/* Orbiting particles - Tri-color patriotic */}
                                {[...Array(3)].map((_, i) => {
                                    const colors = ['#FF9933', '#FFFFFF', '#138808'];
                                    return (
                                        <motion.div
                                            key={i}
                                            className="absolute w-2 h-2 rounded-full"
                                            style={{
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translateZ(50px)',
                                                backgroundColor: colors[i],
                                                boxShadow: `0 0 10px ${colors[i]}, 0 0 20px ${colors[i]}`,
                                            }}
                                            animate={{
                                                x: [0, Math.cos((i * 120 * Math.PI) / 180) * 150, 0],
                                                y: [0, Math.sin((i * 120 * Math.PI) / 180) * 150, 0],
                                                opacity: [0.3, 0.8, 0.3],
                                                scale: [0.8, 1.2, 0.8],
                                            }}
                                            transition={{
                                                duration: 5 + i,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: i * 0.5,
                                            }}
                                        />
                                    );
                                })}
                            </motion.div>
                        </motion.div>
                    </Reveal>

                    {/* Subtitle */}
                    <Reveal className="max-w-2xl mx-auto mb-8 text-lg font-semibold sm:text-xl md:text-2xl text-white/90" delay={0.4}>
                        Ideas Powering Atmanirbhar Bharat
                    </Reveal>

                    <Reveal className="flex flex-wrap justify-center gap-2 px-4 mb-8 text-xs sm:gap-3 sm:text-sm" delay={0.5}>
                        <div className="glass px-3 py-1.5 rounded-lg text-white/90 border border-saffron-400/20">
                            <span className="text-saffron-400">🏆</span> Venue : AB1 - 316
                        </div>
                        <div className="glass px-3 py-1.5 rounded-lg text-white/90 border border-india-green-400/20">
                            <span className="text-india-green-400">📅</span> Finale: Feb 28, 2026
                        </div>
                        <div className="glass px-3 py-1.5 rounded-lg text-white/90 border border-orange-400/20">
                            <span className="text-orange-400">🔍</span> Phase 2 Evaluation in Progress
                        </div>
                    </Reveal>

                    {/* Countdown Timer */}
                    <Reveal className="px-4 mb-8" delay={0.6}>
                        <p className="mb-3 text-xs font-extrabold tracking-wider uppercase sm:text-lg text-white/90">Grand Finale in </p>
                        <div className="flex justify-center gap-2 sm:gap-3 md:gap-4">
                            {[
                                { label: 'Days', value: timeLeft.days, color: '#FF9933' },
                                { label: 'Hours', value: timeLeft.hours, color: '#FFFFFF' },
                                { label: 'Minutes', value: timeLeft.minutes, color: '#138808' },
                                { label: 'Seconds', value: timeLeft.seconds, color: '#1E3A8A' }
                            ].map((item, index) => (
                                <Reveal key={item.label} delay={0.65 + index * 0.05}>
                                    <ElectricBorder
                                        key={item.label}
                                        color={item.color}
                                        speed={0.3}
                                        chaos={0.5}
                                        thickness={2}
                                        style={{ borderRadius: 12 }}
                                    >
                                        <ParticleCard
                                            className="magic-card"
                                            particleCount={isMobile ? 3 : 6}
                                            glowColor={item.color.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16)).join(', ')}
                                            enableTilt={!isMobile}
                                            enableMagnetism={false}
                                            clickEffect={!isMobile}
                                            enableBorderGlow={!isMobile}
                                        >
                                            <div className="glass-strong p-2 sm:p-3 md:p-4 rounded-xl min-w-[60px] sm:min-w-[70px] md:min-w-[85px]">
                                                <div className="mb-1 text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl gradient-text">
                                                    {String(item.value).padStart(2, '0')}
                                                </div>
                                                <div className="text-[10px] sm:text-xs text-white/80 uppercase tracking-wider">
                                                    {item.label}
                                                </div>
                                            </div>
                                        </ParticleCard>
                                    </ElectricBorder>
                                </Reveal>
                            ))}
                        </div>
                    </Reveal>

                    {/* CTA Buttons */}
                    <Reveal className="flex flex-col items-center justify-center gap-3 px-4 sm:flex-row" delay={0.8}>
                        <Link to="timeline" smooth={true} duration={800}>
                            <button className="flex items-center w-full gap-2 btn-primary sm:w-auto">
                                <Rocket className="w-4 h-4" />
                                View Timeline
                            </button>
                        </Link>
                        <Link to="rounds" smooth={true} duration={800}>
                            <button className="flex items-center w-full gap-2 btn-secondary sm:w-auto">
                                <Calendar className="w-4 h-4" />
                                Explore Rounds
                            </button>
                        </Link>
                    </Reveal>
                </motion.div>

                {/* Scroll Indicator */}
                <Reveal className="absolute transform -translate-x-1/2 bottom-8 left-1/2" delay={1.0}>
                    <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-saffron-400 animate-bounce" />
                </Reveal>
            </div>
        </section>
    );
};

export default Hero;
