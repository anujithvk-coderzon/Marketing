'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '@/lib/api';
import { isAxiosError } from 'axios';
import { errorToast, successToast } from '@/helper/ToastMessage';
import { Email, PaginationMeta } from '@/lib/types';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination from '@/components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faUpload, faPen, faTrash,
    faMagnifyingGlass, faEnvelope, faXmark
} from '@fortawesome/free-solid-svg-icons';

export default function EmailsPage() {
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEmail, setEditingEmail] = useState<Email | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', district: '', state: '' });
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Email | null>(null);
    const [deleting, setDeleting] = useState(false);
    const csvRef = useRef<HTMLInputElement>(null);

    // Search, filter, pagination state
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [filterState, setFilterState] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationMeta>({
        page: 1, limit: 20, total: 0, totalPages: 0,
    });
    const [districts, setDistricts] = useState<string[]>([]);
    const [states, setStates] = useState<string[]>([]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchEmails = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', '20');
            if (debouncedSearch) params.set('search', debouncedSearch);
            if (filterDistrict) params.set('district', filterDistrict);
            if (filterState) params.set('state', filterState);

            const { data } = await api.get(`/emails?${params.toString()}`);
            setEmails(data.emails);
            setPagination(data.pagination);
        } catch (error) {
            if (isAxiosError(error)) {
                setEmails([]);
                setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
            }
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, filterDistrict, filterState]);

    const fetchFilters = async () => {
        try {
            const { data } = await api.get('/emails/filters');
            setDistricts(data.districts);
            setStates(data.states);
        } catch {
            // Silently fail — filters will just be empty
        }
    };

    useEffect(() => { fetchFilters(); }, []);
    useEffect(() => { fetchEmails(); }, [fetchEmails]);

    const handleDistrictChange = (value: string) => {
        setFilterDistrict(value);
        setPage(1);
    };

    const handleStateChange = (value: string) => {
        setFilterState(value);
        setPage(1);
    };

    const clearFilters = () => {
        setSearch('');
        setFilterDistrict('');
        setFilterState('');
        setPage(1);
    };

    const openCreate = () => {
        setEditingEmail(null);
        setFormData({ name: '', email: '', phone: '', district: '', state: '' });
        setShowModal(true);
    };

    const openEdit = (email: Email) => {
        setEditingEmail(email);
        setFormData({ name: email.name || '', email: email.email, phone: email.phone || '', district: email.district || '', state: email.state || '' });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingEmail) {
                await api.patch(`/email/edit/${editingEmail.id}`, formData);
                successToast('Email updated successfully');
            } else {
                await api.post('/email/create', formData);
                successToast('Email added successfully');
            }
            setShowModal(false);
            fetchEmails();
            fetchFilters();
        } catch (error) {
            if (isAxiosError(error)) {
                const data = error.response?.data;
                if (data?.errors?.length) {
                    data.errors.forEach((err: { message: string }) => errorToast(err.message));
                } else {
                    errorToast(data?.message || 'An error occurred');
                }
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/email/delete/${deleteTarget.id}`);
            successToast('Email deleted successfully');
            setDeleteTarget(null);
            fetchEmails();
            fetchFilters();
        } catch (error) {
            if (isAxiosError(error)) {
                errorToast(error.response?.data.message || 'An error occurred');
            }
        } finally {
            setDeleting(false);
        }
    };

    const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const form = new FormData();
        form.append('csv', file);
        try {
            await api.post('/csvEmail', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            successToast('CSV uploaded successfully');
            fetchEmails();
            fetchFilters();
        } catch (error) {
            if (isAxiosError(error)) {
                errorToast(error.response?.data.message || 'Upload failed');
            }
        }
        if (csvRef.current) csvRef.current.value = '';
    };

    const columns = [
        { key: 'email', header: 'Email' },
        { key: 'name', header: 'Name', render: (item: Email) => item.name || <span className="text-slate-400">-</span> },
        { key: 'phone', header: 'Phone', render: (item: Email) => item.phone || <span className="text-slate-400">-</span> },
        { key: 'district', header: 'District', render: (item: Email) => item.district || <span className="text-slate-400">-</span> },
        { key: 'state', header: 'State', render: (item: Email) => item.state || <span className="text-slate-400">-</span> },
        {
            key: 'createdAt', header: 'Added',
            render: (item: Email) => (
                <span className="text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    })}
                </span>
            )
        },
        {
            key: 'actions', header: '',
            render: (item: Email) => (
                <div className="flex items-center gap-0.5">
                    <button onClick={() => openEdit(item)} title="Edit"
                        className="w-8 h-8 flex items-center justify-center rounded-lg
                                   text-slate-400 hover:text-blue-600 hover:bg-blue-50
                                   transition-all duration-150">
                        <FontAwesomeIcon icon={faPen} className="text-xs" />
                    </button>
                    <button onClick={() => setDeleteTarget(item)} title="Delete"
                        className="w-8 h-8 flex items-center justify-center rounded-lg
                                   text-slate-400 hover:text-red-600 hover:bg-red-50
                                   transition-all duration-150">
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                </div>
            )
        },
    ];

    const hasFilters = debouncedSearch || filterDistrict || filterState;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 xs:gap-4">
                <div className="flex items-start gap-2.5 xs:gap-3">
                    <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600
                                    flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0 mt-0.5">
                        <FontAwesomeIcon icon={faEnvelope} className="text-white text-xs xs:text-sm sm:text-base" />
                    </div>
                    <div>
                        <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-slate-900">Emails</h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {pagination.total > 0
                                ? `${pagination.total} contact${pagination.total !== 1 ? 's' : ''} total`
                                : 'Manage your email contacts'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <input type="file" accept=".csv" ref={csvRef} onChange={handleCsvUpload} className="hidden" />
                    <button onClick={() => csvRef.current?.click()}
                        className="flex-1 sm:flex-initial px-3 xs:px-4 py-2.5 text-xs xs:text-sm font-medium
                                   text-slate-700 bg-white border border-slate-200 rounded-xl
                                   hover:bg-slate-50 hover:border-slate-300
                                   transition-all duration-200 flex items-center justify-center gap-1.5 xs:gap-2">
                        <FontAwesomeIcon icon={faUpload} className="text-[10px] xs:text-xs" />
                        <span className="hidden xs:inline">Upload</span> CSV
                    </button>
                    <button onClick={openCreate}
                        className="flex-1 sm:flex-initial px-3 xs:px-5 py-2.5 text-xs xs:text-sm font-semibold text-white
                                   bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl
                                   hover:from-blue-700 hover:to-blue-800
                                   shadow-lg shadow-blue-600/25 hover:shadow-blue-700/30
                                   transition-all duration-200 flex items-center justify-center gap-1.5 xs:gap-2">
                        <FontAwesomeIcon icon={faPlus} className="text-[10px] xs:text-xs" />
                        Add Email
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3 xs:p-4 sm:p-5 shadow-sm space-y-2.5 xs:space-y-3">
                <div className="relative">
                    <FontAwesomeIcon icon={faMagnifyingGlass}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm" />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        className="w-full pl-9 pr-3 py-2 xs:py-2.5 rounded-xl border border-slate-200 bg-white text-xs xs:text-sm
                                   placeholder:text-slate-400
                                   focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                   transition-all duration-200"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 sm:flex gap-1.5 xs:gap-2 sm:gap-3">
                    <select
                        className="w-full min-w-0 px-2 xs:px-3 py-2 xs:py-2.5 rounded-xl border border-slate-200
                                   bg-white text-[11px] xs:text-sm truncate
                                   focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                   transition-all duration-200 sm:w-44"
                        value={filterDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                    >
                        <option value="">All Districts</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select
                        className="w-full min-w-0 px-2 xs:px-3 py-2 xs:py-2.5 rounded-xl border border-slate-200
                                   bg-white text-[11px] xs:text-sm truncate
                                   focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                   transition-all duration-200 sm:w-44"
                        value={filterState}
                        onChange={(e) => handleStateChange(e.target.value)}
                    >
                        <option value="">All States</option>
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                {hasFilters && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs text-slate-500 font-medium">
                            {pagination.total} result{pagination.total !== 1 ? 's' : ''} found
                        </span>
                        <button onClick={clearFilters}
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                            <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            {/* Loading / Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <div className="animate-spin w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full" />
                </div>
            ) : (
                <DataTable columns={columns} data={emails} emptyMessage="No contacts found." />
            )}

            {/* Pagination */}
            {!loading && (
                <Pagination pagination={pagination} page={page} onPageChange={setPage} />
            )}

            {/* Create/Edit Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)}
                title={editingEmail ? 'Edit Contact' : 'Add Contact'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Name</label>
                            <input type="text" placeholder="Contact name"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                                           placeholder:text-slate-400
                                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                           transition-all duration-200"
                                value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <input type="email" required placeholder="email@example.com"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                                           placeholder:text-slate-400
                                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                           transition-all duration-200"
                                value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">
                            Phone <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <input type="tel" placeholder="10-digit phone number"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                                       placeholder:text-slate-400
                                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                       transition-all duration-200"
                            value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">
                                District <span className="text-slate-400 font-normal">(optional)</span>
                            </label>
                            <input type="text" placeholder="District"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                                           placeholder:text-slate-400
                                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                           transition-all duration-200"
                                value={formData.district} onChange={(e) => setFormData(p => ({ ...p, district: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">
                                State <span className="text-slate-400 font-normal">(optional)</span>
                            </label>
                            <input type="text" placeholder="State"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                                           placeholder:text-slate-400
                                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                           transition-all duration-200"
                                value={formData.state} onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
                        <button type="button" onClick={() => setShowModal(false)}
                            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100
                                       rounded-xl hover:bg-slate-200 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting}
                            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                                       bg-gradient-to-r from-blue-600 to-blue-700
                                       hover:from-blue-700 hover:to-blue-800
                                       shadow-lg shadow-blue-600/25
                                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : editingEmail ? 'Update Contact' : 'Add Contact'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete} title="Delete Contact"
                message={`Are you sure you want to delete "${deleteTarget?.email}"? This action cannot be undone.`}
                confirmText="Delete" isLoading={deleting} />
        </div>
    );
}
