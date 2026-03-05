'use client';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { PaginationMeta } from '@/lib/types';

interface PaginationProps {
    pagination: PaginationMeta;
    page: number;
    onPageChange: (page: number) => void;
}

function generatePageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
}

export default function Pagination({ pagination, page, onPageChange }: PaginationProps) {
    if (pagination.totalPages <= 1) return null;

    const from = (pagination.page - 1) * pagination.limit + 1;
    const to = Math.min(pagination.page * pagination.limit, pagination.total);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 px-3 sm:px-5 py-2.5 sm:py-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] sm:text-xs text-slate-500 flex-shrink-0">
                    <span className="hidden sm:inline">
                        Showing <span className="font-medium text-slate-700">{from}</span>–<span className="font-medium text-slate-700">{to}</span> of{' '}
                        <span className="font-medium text-slate-700">{pagination.total}</span>
                    </span>
                    <span className="sm:hidden">
                        {page} / {pagination.totalPages}
                    </span>
                </p>
                <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                    <button
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg
                                   text-slate-600 hover:bg-slate-100
                                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} className="text-[9px] sm:text-xs" />
                    </button>
                    {/* Page numbers - hidden on very small screens */}
                    <div className="hidden xs:flex items-center gap-0.5 sm:gap-1">
                        {generatePageNumbers(page, pagination.totalPages).map((p, i) =>
                            p === '...' ? (
                                <span key={`dots-${i}`} className="px-0.5 sm:px-1 text-[10px] sm:text-xs text-slate-400">...</span>
                            ) : (
                                <button
                                    key={p}
                                    onClick={() => onPageChange(p as number)}
                                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg text-[11px] sm:text-xs font-medium transition-all duration-150
                                        ${page === p
                                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                                            : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {p}
                                </button>
                            )
                        )}
                    </div>
                    {/* Compact page indicator for very small screens (below xs) */}
                    <span className="xs:hidden px-2 text-[11px] font-medium text-slate-700">
                        {page} / {pagination.totalPages}
                    </span>
                    <button
                        disabled={page === pagination.totalPages}
                        onClick={() => onPageChange(page + 1)}
                        className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg
                                   text-slate-600 hover:bg-slate-100
                                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <FontAwesomeIcon icon={faChevronRight} className="text-[9px] sm:text-xs" />
                    </button>
                </div>
            </div>
        </div>
    );
}
