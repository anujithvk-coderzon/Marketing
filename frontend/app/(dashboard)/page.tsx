'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import { Template, Campaign, Email } from '@/lib/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEnvelope, faFileLines, faBullhorn, faRocket, faGauge,
    faCalendar, faArrowRight, faAt, faClockRotateLeft
} from '@fortawesome/free-solid-svg-icons';

export default function DashboardHome() {
    const { user } = useAuth();
    const router = useRouter();
    const [totalEmails, setTotalEmails] = useState(0);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const results = await Promise.allSettled([
                api.get('/emails?limit=3&page=1'),
                api.get('/templates?limit=3&sortBy=createdAt&sortOrder=desc'),
                api.get('/campaigns?limit=3'),
            ]);

            if (results[0].status === 'fulfilled') {
                setEmails(results[0].value.data.emails || []);
                setTotalEmails(results[0].value.data.pagination?.total ?? 0);
            }
            if (results[1].status === 'fulfilled') setTemplates(results[1].value.data.templates || []);
            if (results[2].status === 'fulfilled') setCampaigns(results[2].value.data.campaigns || []);

            setLoading(false);
        }
        fetchData();
    }, []);

    const activeCampaigns = campaigns.filter(c => c.status === 'Scheduled' || c.status === 'Sending').length;

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return formatDate(dateStr);
    };

    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();

    type Activity = {
        id: string;
        type: 'campaign' | 'template' | 'contact';
        title: string;
        detail: string;
        date: string;
    };

    const recentActivity: Activity[] = [
        ...campaigns.map(c => ({
            id: `c-${c.id}`,
            type: 'campaign' as const,
            title: c.name,
            detail: c.status === 'Draft' ? 'Campaign created' :
                    c.status === 'Scheduled' ? 'Campaign scheduled' :
                    c.status === 'Delivered' ? 'Campaign delivered' :
                    c.status === 'Cancelled' ? 'Campaign cancelled' : 'Campaign in progress',
            date: c.updatedAt || c.createdAt,
        })),
        ...templates.map(t => ({
            id: `t-${t.id}`,
            type: 'template' as const,
            title: t.name,
            detail: t.updatedAt !== t.createdAt ? 'Template updated' : 'Template created',
            date: t.updatedAt || t.createdAt,
        })),
        ...emails.map(em => ({
            id: `e-${em.id}`,
            type: 'contact' as const,
            title: em.email,
            detail: em.name ? `Contact added — ${em.name}` : 'Contact added',
            date: em.createdAt,
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    const activityIcon = (type: Activity['type']) => {
        switch (type) {
            case 'campaign': return { icon: faBullhorn, bg: 'bg-amber-50', text: 'text-amber-500' };
            case 'template': return { icon: faFileLines, bg: 'bg-purple-50', text: 'text-purple-500' };
            case 'contact': return { icon: faEnvelope, bg: 'bg-blue-50', text: 'text-blue-500' };
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="animate-spin w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full" />
                <p className="text-sm text-slate-400">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600
                                flex items-center justify-center shadow-md shadow-indigo-500/20 flex-shrink-0">
                    <FontAwesomeIcon icon={faGauge} className="text-white text-[10px] sm:text-xs" />
                </div>
                <div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                        Welcome back, {user?.name}
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5 hidden xs:block">Here is the Coderzon marketing overview</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
                <StatsCard title="Total Emails" value={totalEmails} icon={faEnvelope} color="blue" />
                <StatsCard title="Templates" value={templates.length} icon={faFileLines} color="purple" />
                <StatsCard title="Campaigns" value={campaigns.length} icon={faBullhorn} color="amber" />
                <StatsCard title="Active" value={activeCampaigns} icon={faRocket} color="green" />
            </div>

            {/* 3 Containers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">

                {/* Recent Campaigns */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-3.5 xs:px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center">
                                <FontAwesomeIcon icon={faBullhorn} className="text-amber-500 text-[10px]" />
                            </div>
                            <h2 className="text-sm font-semibold text-slate-900">Campaigns</h2>
                        </div>
                        <button onClick={() => router.push('/campaigns')}
                            className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
                            View all
                            <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                        </button>
                    </div>

                    {campaigns.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <FontAwesomeIcon icon={faBullhorn} className="text-lg text-slate-300 mb-1.5" />
                            <p className="text-xs text-slate-400">No campaigns yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {campaigns.slice(0, 3).map(c => (
                                <div key={c.id} className="px-3.5 xs:px-4 py-2.5 xs:py-3 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                                        <StatusBadge status={c.status} />
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <FontAwesomeIcon icon={faCalendar} className="text-[9px]" />
                                            {formatDate(c.createdAt)}
                                        </span>
                                        {c.scheduledAt && (
                                            <span className="flex items-center gap-1">
                                                <FontAwesomeIcon icon={faRocket} className="text-[9px]" />
                                                {formatDate(c.scheduledAt)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Templates */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-3.5 xs:px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-purple-50 flex items-center justify-center">
                                <FontAwesomeIcon icon={faFileLines} className="text-purple-500 text-[10px]" />
                            </div>
                            <h2 className="text-sm font-semibold text-slate-900">Templates</h2>
                        </div>
                        <button onClick={() => router.push('/templates')}
                            className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
                            View all
                            <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                        </button>
                    </div>

                    {templates.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <FontAwesomeIcon icon={faFileLines} className="text-lg text-slate-300 mb-1.5" />
                            <p className="text-xs text-slate-400">No templates yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {templates.slice(0, 3).map(t => (
                                <div key={t.id} className="px-3.5 xs:px-4 py-2.5 xs:py-3 hover:bg-slate-50/50 transition-colors">
                                    <p className="text-sm font-medium text-slate-800 truncate mb-0.5">{t.name}</p>
                                    <p className="text-[11px] text-slate-500 truncate mb-1">
                                        <span className="text-slate-400 font-medium">Subject: </span>{t.subject}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] text-slate-400 line-clamp-1">{stripHtml(t.body) || 'No content'}</p>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0 ml-2">
                                            <FontAwesomeIcon icon={faCalendar} className="text-[8px]" />
                                            {formatDate(t.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Emails (Contacts) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-3.5 xs:px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center">
                                <FontAwesomeIcon icon={faEnvelope} className="text-blue-500 text-[10px]" />
                            </div>
                            <h2 className="text-sm font-semibold text-slate-900">Contacts</h2>
                        </div>
                        <button onClick={() => router.push('/emails')}
                            className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
                            View all
                            <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                        </button>
                    </div>

                    {emails.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <FontAwesomeIcon icon={faEnvelope} className="text-lg text-slate-300 mb-1.5" />
                            <p className="text-xs text-slate-400">No contacts yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {emails.slice(0, 3).map(em => (
                                <div key={em.id} className="px-3.5 xs:px-4 py-2.5 xs:py-3 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <FontAwesomeIcon icon={faAt} className="text-[9px] text-slate-400" />
                                        <p className="text-sm font-medium text-slate-800 truncate">{em.email}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] text-slate-500 truncate">
                                            {[em.name, em.district, em.state].filter(Boolean).join(' · ') || 'No details'}
                                        </p>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0 ml-2">
                                            <FontAwesomeIcon icon={faCalendar} className="text-[8px]" />
                                            {formatDate(em.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-3.5 xs:px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center">
                            <FontAwesomeIcon icon={faClockRotateLeft} className="text-slate-500 text-[10px]" />
                        </div>
                        <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {recentActivity.map((item) => {
                            const config = activityIcon(item.type);
                            return (
                                <div key={item.id} className="px-3.5 xs:px-4 py-2.5 xs:py-3 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                                    <div className={`w-7 h-7 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                                        <FontAwesomeIcon icon={config.icon} className={`text-[9px] ${config.text}`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs sm:text-sm text-slate-800 truncate">
                                            <span className="font-medium">{item.title}</span>
                                        </p>
                                        <p className="text-[11px] text-slate-400">{item.detail}</p>
                                    </div>
                                    <span className="text-[10px] sm:text-[11px] text-slate-400 flex-shrink-0">{timeAgo(item.date)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
