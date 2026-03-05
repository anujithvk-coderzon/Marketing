import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: IconDefinition;
    color: string;
}

const colorMap: Record<string, { bg: string; gradient: string; icon: string; shadow: string }> = {
    blue:   { bg: 'bg-blue-50',   gradient: 'from-blue-500 to-blue-600',   icon: 'text-white', shadow: 'shadow-blue-500/20' },
    green:  { bg: 'bg-emerald-50', gradient: 'from-emerald-500 to-teal-600', icon: 'text-white', shadow: 'shadow-emerald-500/20' },
    amber:  { bg: 'bg-amber-50',  gradient: 'from-amber-500 to-orange-600', icon: 'text-white', shadow: 'shadow-amber-500/20' },
    purple: { bg: 'bg-purple-50', gradient: 'from-purple-500 to-violet-600', icon: 'text-white', shadow: 'shadow-purple-500/20' },
};

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
    const c = colorMap[color] || colorMap.blue;
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-3 xs:p-4 sm:p-5
                        hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-2 xs:gap-3">
                <div className={`w-8 h-8 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-lg xs:rounded-xl bg-gradient-to-br ${c.gradient}
                                flex items-center justify-center flex-shrink-0 shadow-lg ${c.shadow}`}>
                    <FontAwesomeIcon icon={icon} className={`${c.icon} text-xs xs:text-sm sm:text-base`} />
                </div>
                <p className="text-[11px] xs:text-xs sm:text-sm text-slate-500 font-medium">{title}</p>
            </div>
            <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-slate-900 mt-2 xs:mt-3">{value}</p>
        </div>
    );
}
