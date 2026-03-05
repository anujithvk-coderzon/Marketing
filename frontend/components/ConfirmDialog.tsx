'use client';
import React from 'react';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: string;
    isLoading?: boolean;
}

export default function ConfirmDialog({
    isOpen, onClose, onConfirm, title, message,
    confirmText = 'Confirm', confirmColor = 'red', isLoading = false
}: ConfirmDialogProps) {
    const btnClass = confirmColor === 'red'
        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500/40'
        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/40';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 sm:mb-3
                                ring-4 ring-red-50">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-500 text-lg" />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-6">
                <button onClick={onClose}
                    className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100
                               rounded-xl hover:bg-slate-200 transition-colors">
                    Cancel
                </button>
                <button onClick={onConfirm} disabled={isLoading}
                    className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl
                               transition-all duration-200
                               disabled:opacity-50 disabled:cursor-not-allowed ${btnClass}`}>
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                        </span>
                    ) : confirmText}
                </button>
            </div>
        </Modal>
    );
}
