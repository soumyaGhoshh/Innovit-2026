import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const isMobile = useIsMobile();
    const isHome = location.pathname === '/';

    const getLink = (hash) => {
        return isHome ? hash : `/${hash}`;
    };

    const handleRegister = () => {
        window.open('https://forms.gle/cA9QiQkBwetCixSu6', '_blank');
        setIsMenuOpen(false);
    };

    const navLinks = [
        { href: '#home', label: 'Home', isHash: true },
        { href: '#timeline', label: 'Timeline', isHash: true },
        { href: '#prizes', label: 'Prizes', isHash: true },
        { href: '/guidelines', label: 'Guidelines', isHash: false },
        { href: '/problem-statement', label: 'Problem Statement', isHash: false },
        { href: '/results', label: 'Results', isHash: false },
        { href: '/contact', label: 'Contact & FAQs', isHash: false }
    ];

    return (
        <>
            <motion.nav
                className="absolute z-50 w-full max-w-6xl px-4 transform -translate-x-1/2 top-2 left-1/2"
                initial={isMobile ? {} : { y: -100, opacity: 0 }}
                animate={isMobile ? {} : { y: 0, opacity: 1 }}
                transition={isMobile ? {} : { duration: 0.6, delay: 0.2 }}
            >
                <div className="flex items-center justify-between px-4 py-3 border-2 rounded-full shadow-lg glass-strong sm:px-6 backdrop-blur-xl border-saffron-400/30 shadow-saffron-400/15">
                    {/* Logo Section */}
                    <Link to="/" className="flex items-center gap-2">
                        <img
                            src="/Blockchain Club logo.png"
                            alt="Blockchain Club VIT Bhopal"
                            className="object-cover w-8 h-8 rounded-full"
                        />
                        <span className="text-base font-bold sm:text-lg gradient-text">Blockchain Club</span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="items-center hidden gap-8 md:flex">
                        {navLinks.map(link => (
                            link.isHash ? (
                                <a
                                    key={link.href}
                                    href={getLink(link.href)}
                                    className="text-sm font-medium text-white/90 hover:text-saffron-400 transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(255,153,51,0.6)]"
                                >
                                    {link.label}
                                </a>
                            ) : (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className="text-sm font-medium text-white/90 hover:text-saffron-400 transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(255,153,51,0.6)]"
                                >
                                    {link.label}
                                </Link>
                            )
                        ))}
                    </div>

                    {/* Desktop Register Button */}
                    <button
                        onClick={handleRegister}
                        className="hidden px-4 py-2 text-sm transition-transform rounded-full md:block btn-primary sm:px-6 hover:scale-105"
                    >
                         Rush Arena
                    </button>

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="transition-colors md:hidden text-white/90 hover:text-saffron-400"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed z-40 top-16 left-4 right-4 md:hidden"
                    >
                        <div className="p-4 border-2 shadow-2xl glass-strong rounded-2xl border-saffron-400/30 shadow-saffron-400/20 backdrop-blur-xl">
                            <div className="flex flex-col gap-3">
                                {navLinks.map(link => (
                                    link.isHash ? (
                                        <a
                                            key={link.href}
                                            href={getLink(link.href)}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="px-3 py-2 text-sm font-medium transition-colors border border-transparent rounded-lg text-white/90 hover:text-saffron-400 hover:bg-saffron-400/10 hover:border-saffron-400/20"
                                        >
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link
                                            key={link.href}
                                            to={link.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="px-3 py-2 text-sm font-medium transition-colors border border-transparent rounded-lg text-white/90 hover:text-saffron-400 hover:bg-saffron-400/10 hover:border-saffron-400/20"
                                        >
                                            {link.label}
                                        </Link>
                                    )
                                ))}
                                <button
                                    onClick={handleRegister}
                                    className="px-4 py-2 mt-2 text-sm rounded-lg btn-primary"
                                >
                                    Rush Arena
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
