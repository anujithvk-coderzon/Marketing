'use client';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInbox } from '@fortawesome/free-solid-svg-icons';

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    emptyMessage?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataTable<T extends Record<string, any>>({
    columns, data, emptyMessage = 'No data found'
}: DataTableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 sm:p-14 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faInbox} className="text-xl text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">{emptyMessage}</p>
            </div>
        );
    }

    const actionsCol = columns.find(c => c.key === 'actions');
    const dataColumns = columns.filter(c => c.key !== 'actions');

    return (
        <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden
                            shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm table-auto">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80">
                                {columns.map((col) => (
                                    <th key={col.key}
                                        className="px-5 lg:px-6 py-3.5 text-left text-xs font-semibold
                                                   text-slate-500 uppercase tracking-wider whitespace-nowrap first:pl-6">
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors duration-150">
                                    {columns.map((col) => (
                                        <td key={col.key}
                                            className="px-5 lg:px-6 py-3.5 text-slate-700 first:pl-6 first:font-medium">
                                            {col.render ? col.render(item) : String(item[col.key] ?? '')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
                {data.map((item, idx) => {
                    const titleCol = dataColumns[0];
                    const subtitleCol = dataColumns[1];
                    const detailCols = dataColumns.slice(2);

                    return (
                        <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden
                                                   shadow-sm hover:shadow-md transition-shadow duration-200">
                            {/* Card header */}
                            <div className="flex items-start justify-between gap-2 px-3 xs:px-4 pt-3 xs:pt-4 pb-1">
                                <div className="min-w-0 flex-1">
                                    {titleCol && (
                                        <p className="text-[13px] xs:text-sm font-semibold text-slate-900 truncate leading-snug">
                                            {titleCol.render
                                                ? titleCol.render(item)
                                                : String(item[titleCol.key] ?? '')}
                                        </p>
                                    )}
                                    {subtitleCol && (
                                        <div className="mt-1.5">
                                            {subtitleCol.render
                                                ? subtitleCol.render(item)
                                                : <p className="text-xs text-slate-500 truncate">
                                                    {String(item[subtitleCol.key] ?? '')}
                                                  </p>
                                            }
                                        </div>
                                    )}
                                </div>
                                {actionsCol && (
                                    <div className="flex items-center flex-shrink-0 -mr-0.5">
                                        {actionsCol.render ? actionsCol.render(item) : null}
                                    </div>
                                )}
                            </div>

                            {/* Detail fields */}
                            {detailCols.length > 0 && (
                                <div className="grid grid-cols-2 gap-x-3 xs:gap-x-4 gap-y-2 xs:gap-y-2.5 px-3 xs:px-4 pt-2.5 xs:pt-3 pb-3 xs:pb-4
                                                border-t border-slate-100 mt-2.5 xs:mt-3">
                                    {detailCols.map((col) => {
                                        const value = col.render ? col.render(item) : String(item[col.key] ?? '');
                                        return (
                                            <div key={col.key} className="min-w-0">
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                                                    {col.header}
                                                </p>
                                                <div className="text-xs sm:text-sm text-slate-700 truncate">
                                                    {value}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
