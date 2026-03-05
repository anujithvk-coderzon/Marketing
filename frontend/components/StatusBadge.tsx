import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCircle, faClock, faPaperPlane, faCheck, faXmark, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const statusConfig: Record<string, { bg: string; text: string; dot: string; icon: IconDefinition }> = {
    Draft:      { bg: 'bg-slate-50',  text: 'text-slate-600', dot: 'text-slate-400', icon: faCircle },
    Scheduled:  { bg: 'bg-blue-50',   text: 'text-blue-700',  dot: 'text-blue-500',  icon: faClock },
    Sending:    { bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'text-amber-500', icon: faSpinner },
    Delivered:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'text-emerald-500', icon: faCheck },
    Cancelled:  { bg: 'bg-red-50',    text: 'text-red-700',   dot: 'text-red-500',   icon: faXmark },
    Pending:    { bg: 'bg-slate-50',  text: 'text-slate-600', dot: 'text-slate-400', icon: faClock },
    Success:    { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'text-emerald-500', icon: faCheck },
    Failed:     { bg: 'bg-red-50',    text: 'text-red-700',   dot: 'text-red-500',   icon: faXmark },
    Sent:       { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'text-emerald-500', icon: faPaperPlane },
};

const defaultConfig = { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'text-slate-400', icon: faCircle };

export default function StatusBadge({ status }: { status: string }) {
    const config = statusConfig[status] || defaultConfig;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold
                          ${config.bg} ${config.text} ring-1 ring-inset
                          ${config.bg === 'bg-slate-50' ? 'ring-slate-200' : 'ring-transparent'}`}>
            <FontAwesomeIcon icon={config.icon}
                className={`text-[8px] ${config.dot} ${status === 'Sending' ? 'animate-spin' : ''}`} />
            {status}
        </span>
    );
}
