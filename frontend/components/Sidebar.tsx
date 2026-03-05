'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGauge, faEnvelope, faFileLines, faBullhorn,
    faPaperPlane, faXmark, faUser, faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    { href: '/', icon: faGauge, label: 'Dashboard' },
    { href: '/emails', icon: faEnvelope, label: 'Emails' },
    { href: '/templates', icon: faFileLines, label: 'Templates' },
    { href: '/campaigns', icon: faBullhorn, label: 'Campaigns' },
    { href: '/send-email', icon: faPaperPlane, label: 'Send Email' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`fixed top-0 left-0 z-50 h-full w-[75vw] max-w-64
                bg-gradient-to-b from-slate-900 to-slate-800
                text-white flex flex-col
                transition-transform duration-300 ease-in-out
                lg:w-64 lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-14 lg:h-16 flex items-center justify-between px-4 lg:px-5 border-b border-slate-700/50">
                    <div>
                        <span className="text-lg lg:text-xl font-bold tracking-tight text-blue-400">CODERZON</span>
                        <p className="text-[9px] lg:text-[10px] text-slate-400 leading-tight -mt-0.5">Marketing Management System</p>
                    </div>
                    <button onClick={onClose}
                        className="lg:hidden p-2 -mr-2 rounded-lg text-slate-400 hover:text-white
                                   active:bg-slate-700/50 transition-colors">
                        <FontAwesomeIcon icon={faXmark} className="text-lg" />
                    </button>
                </div>

                <nav className="flex-1 py-3 lg:py-4 px-2.5 lg:px-3 space-y-0.5 lg:space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                                    transition-all duration-200
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white active:bg-slate-700'
                                    }`}
                            >
                                <FontAwesomeIcon icon={item.icon} className="w-4 text-center flex-shrink-0" />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User profile + logout */}
                <div className="border-t border-slate-700/50 px-2.5 lg:px-3 py-3">
                    <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faUser} className="text-blue-400 text-xs" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400
                                       hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                            title="Logout"
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} className="text-xs" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
