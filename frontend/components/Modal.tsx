'use client';
import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-2.5 sm:px-4 py-4 sm:py-8">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} z-10
                            max-h-[90vh] overflow-y-auto ring-1 ring-slate-200/50
                            animate-[modalIn_0.2s_ease-out]`}>
                <div className="sticky top-0 z-10 bg-white rounded-t-2xl border-b border-slate-100 px-4 sm:px-6 py-3.5 sm:py-4">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm sm:text-lg font-semibold text-slate-900 truncate">{title}</h3>
                        <button onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400
                                       hover:text-slate-600 hover:bg-slate-100 transition-all duration-150
                                       flex-shrink-0">
                            <FontAwesomeIcon icon={faXmark} className="text-sm" />
                        </button>
                    </div>
                </div>
                <div className="px-4 sm:px-6 py-4 sm:py-5">
                    {children}
                </div>
            </div>
        </div>
    );
}
