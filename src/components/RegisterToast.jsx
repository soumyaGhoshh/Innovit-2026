import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';

const RegisterToast = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show toast after 3 seconds
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
    };

    const handleRegister = () => {
        window.open('https://forms.gle/cA9QiQkBwetCixSu6', '_blank');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-4 top-20 z-[100] w-[85vw] sm:w-80"
                >
                    <div className="p-4 border shadow-2xl glass-strong rounded-2xl border-yellow-500/30 shadow-yellow-500/20 backdrop-blur-xl">
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-2 right-2 text-[#fff1ce] hover:text-yellow-400 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Content */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600">
                                <Calendar className="w-5 h-5 text-black" />
                            </div>
                            <div className="flex-1 pr-4">
                                <h3 className="text-sm font-bold sm:text-base gradient-text">
                                    Rush Arena @ Advitya 2026
                                </h3>
                                <p className="text-xs text-[#fff1ce]/80">
                                    Register for Blockchain Club event
                                </p>
                            </div>
                        </div>

                        {/* Register button */}
                        <button
                            onClick={handleRegister}
                            className="w-full py-2 text-sm font-semibold transition-transform btn-primary rounded-xl hover:scale-105"
                        >
                            Register Now →
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RegisterToast;
