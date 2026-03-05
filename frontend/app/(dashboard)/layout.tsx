'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import Loader from '@/helper/loader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isLoading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="lg:ml-64">
                {/* Mobile top bar */}
                <div className="lg:hidden sticky top-0 z-30 h-12 flex items-center px-3
                                bg-white/80 backdrop-blur-md border-b border-slate-200/60">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg
                                   hover:bg-slate-100 active:bg-slate-200 transition-colors"
                    >
                        <FontAwesomeIcon icon={faBars} className="text-slate-600 text-sm" />
                    </button>
                    <div className="ml-2.5">
                        <span className="text-sm font-bold tracking-tight text-blue-500">CODERZON</span>
                        <p className="text-[9px] text-slate-400 leading-tight -mt-0.5">Marketing Management System</p>
                    </div>
                </div>

                <main className="px-2.5 pt-3 pb-1 sm:px-6 sm:pt-3 sm:pb-2 lg:px-8 lg:pt-2 lg:pb-2">
                    {children}
                </main>
            </div>
        </div>
    );
}
