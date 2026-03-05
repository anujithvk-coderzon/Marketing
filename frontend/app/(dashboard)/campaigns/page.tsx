'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { isAxiosError } from 'axios';
import { errorToast, successToast } from '@/helper/ToastMessage';
import { Campaign, Template, Email, PaginationMeta } from '@/lib/types';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faPen, faBan, faTrash, faUpload, faMagnifyingGlass,
    faFilter, faCircleInfo, faBullhorn, faCalendar, faUsers, faXmark, faCheck, faFileLines, faClock,
    faArrowRight, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

const STATUS_OPTIONS = ['', 'Draft', 'Scheduled', 'Sending', 'Delivered', 'Cancelled'] as const;
const STATUS_LABELS: Record<string, string> = {
    '': 'All Status', Draft: 'Draft', Scheduled: 'Scheduled',
    Sending: 'Sending', Delivered: 'Delivered', Cancelled: 'Cancelled',
};

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);

    // Search, filter, pagination
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationMeta>({
        page: 1, limit: 20, total: 0, totalPages: 0,
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createName, setCreateName] = useState('');
    const [creating, setCreating] = useState(false);

    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [editForm, setEditForm] = useState({
        name: '', templateId: '', scheduledAt: '', recipients: [] as string[]
    });
    const [saving, setSaving] = useState(false);
    const [editStep, setEditStep] = useState<'recipients' | 'compose'>('recipients');
    const [addingEmail, setAddingEmail] = useState(false);

    const [cancelTarget, setCancelTarget] = useState<Campaign | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [contactSearch, setContactSearch] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [filterState, setFilterState] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [contactsPage, setContactsPage] = useState(1);
    const [contactsTotal, setContactsTotal] = useState(0);
    const [contactsTotalPages, setContactsTotalPages] = useState(1);
    const CONTACTS_PER_PAGE = 20;
    const csvRef = useRef<HTMLInputElement>(null);
    const [detailsCampaign, setDetailsCampaign] = useState<Campaign | null>(null);
    const [detailsRecipients, setDetailsRecipients] = useState<Array<{
        status: string; sentAt: string | null;
        email: { email: string; name: string | null };
    }>>([]);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', '20');
            if (debouncedSearch) params.set('search', debouncedSearch);
            if (statusFilter) params.set('status', statusFilter);

            const { data } = await api.get(`/campaigns?${params.toString()}`);
            setCampaigns(data.campaigns || []);
            setPagination(data.pagination);
        } catch (error) {
            if (isAxiosError(error)) {
                setCampaigns([]);
                setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
            }
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, statusFilter]);

    const fetchContacts = async (pg: number) => {
        try {
            const { data } = await api.get(`/emails?page=${pg}&limit=${CONTACTS_PER_PAGE}`);
            setEmails(data.emails || []);
            setContactsTotal(data.pagination?.total ?? 0);
            setContactsTotalPages(data.pagination?.totalPages ?? 1);
            setContactsPage(pg);
        } catch {
            // silently fail
        }
    };

    const fetchSupportData = async () => {
        const results = await Promise.allSettled([
            api.get('/templates'),
            api.get(`/emails?page=1&limit=${CONTACTS_PER_PAGE}`),
        ]);
        if (results[0].status === 'fulfilled') setTemplates(results[0].value.data.templates || []);
        if (results[1].status === 'fulfilled') {
            setEmails(results[1].value.data.emails || []);
            setContactsTotal(results[1].value.data.pagination?.total ?? 0);
            setContactsTotalPages(results[1].value.data.pagination?.totalPages ?? 1);
        }
    };

    useEffect(() => { fetchSupportData(); }, []);
    useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        setPage(1);
    };

    const openDetails = async (campaign: Campaign) => {
        setDetailsCampaign(campaign);
        setDetailsLoading(true);
        setDetailsRecipients([]);
        try {
            const { data } = await api.get(`/campaign/recipients?campaignId=${campaign.id}`);
            setDetailsRecipients(data.recipients);
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) {
                setDetailsRecipients([]);
            } else if (isAxiosError(error)) {
                errorToast(error.response?.data.message || 'Failed to load details');
            }
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post('/campaign/create', { name: createName });
            successToast('Campaign created successfully');
            setShowCreateModal(false);
            setCreateName('');
            fetchCampaigns();
        } catch (error) {
            if (isAxiosError(error)) errorToast(error.response?.data.message || 'An error occurred');
        } finally {
            setCreating(false);
        }
    };

    const openEdit = (c: Campaign) => {
        setEditingCampaign(c);
        setEditForm({
            name: c.name,
            templateId: c.templateId || '',
            scheduledAt: c.scheduledAt ? new Date(c.scheduledAt).toISOString().slice(0, 16) : '',
            recipients: [],
        });
        setEditStep('compose');
        setContactSearch('');
        setFilterDistrict('');
        setFilterState('');
        setShowFilters(false);
        setContactsPage(1);
        fetchContacts(1);
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCampaign) return;
        setSaving(true);
        try {
            const body: Record<string, unknown> = { name: editForm.name };
            if (editForm.templateId) body.templateId = editForm.templateId;
            if (editForm.recipients.length > 0) body.recipients = editForm.recipients;
            if (editForm.scheduledAt) body.scheduledAt = new Date(editForm.scheduledAt).toISOString();
            await api.put(`/edit/campaign/${editingCampaign.id}`, body);
            successToast('Campaign updated successfully');
            setEditingCampaign(null);
            fetchCampaigns();
        } catch (error) {
            if (isAxiosError(error)) errorToast(error.response?.data.message || 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const toggleRecipient = (id: string) => {
        setEditForm(p => ({
            ...p,
            recipients: p.recipients.includes(id)
                ? p.recipients.filter(r => r !== id)
                : [...p.recipients, id]
        }));
    };

    const districts = [...new Set(emails.map(e => e.district).filter(Boolean))] as string[];
    const states = [...new Set(emails.map(e => e.state).filter(Boolean))] as string[];

    const filteredEmails = emails.filter(em => {
        const s = contactSearch.toLowerCase();
        const matchesSearch = !s
            || em.email.toLowerCase().includes(s)
            || (em.name?.toLowerCase().includes(s))
            || (em.district?.toLowerCase().includes(s))
            || (em.state?.toLowerCase().includes(s));
        const matchesDistrict = !filterDistrict || em.district === filterDistrict;
        const matchesState = !filterState || em.state === filterState;
        return matchesSearch && matchesDistrict && matchesState;
    });

    const isEmailLike = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
    const searchHasExactMatch = emails.some(em => em.email.toLowerCase() === contactSearch.trim().toLowerCase());

    const handleQuickAdd = async () => {
        const email = contactSearch.trim().toLowerCase();
        if (!email) return;
        setAddingEmail(true);
        try {
            await api.post('/email/create', { email });
            successToast('Contact added');
            const { data } = await api.get(`/emails?page=1&limit=${CONTACTS_PER_PAGE}`);
            const freshEmails: Email[] = data.emails || [];
            setEmails(freshEmails);
            setContactsTotal(data.pagination?.total ?? 0);
            setContactsTotalPages(data.pagination?.totalPages ?? 1);
            setContactsPage(1);
            const newContact = freshEmails.find(em => em.email.toLowerCase() === email);
            if (newContact) {
                setEditForm(p => ({ ...p, recipients: [...new Set([...p.recipients, newContact.id])] }));
            }
            setContactSearch('');
        } catch (error) {
            if (isAxiosError(error)) errorToast(error.response?.data.message || 'Failed to add contact');
        } finally {
            setAddingEmail(false);
        }
    };

    const selectAllFiltered = () => {
        const newRecipients = new Set(editForm.recipients);
        filteredEmails.forEach(em => newRecipients.add(em.id));
        setEditForm(p => ({ ...p, recipients: [...newRecipients] }));
    };

    const deselectAllFiltered = () => {
        const filteredSet = new Set(filteredEmails.map(em => em.id));
        setEditForm(p => ({ ...p, recipients: p.recipients.filter(r => !filteredSet.has(r)) }));
    };

    const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const existingIds = new Set(emails.map(em => em.id));
        const form = new FormData();
        form.append('csv', file);
        try {
            await api.post('/csvEmail', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            successToast('CSV uploaded — new contacts auto-selected');
            const { data } = await api.get(`/emails?page=1&limit=${CONTACTS_PER_PAGE}`);
            const freshEmails: Email[] = data.emails || [];
            setEmails(freshEmails);
            setContactsTotal(data.pagination?.total ?? 0);
            setContactsTotalPages(data.pagination?.totalPages ?? 1);
            setContactsPage(1);
            const newIds = freshEmails.filter(em => !existingIds.has(em.id)).map(em => em.id);
            if (newIds.length > 0) {
                setEditForm(p => ({ ...p, recipients: [...new Set([...p.recipients, ...newIds])] }));
            }
        } catch (error) {
            if (isAxiosError(error)) errorToast(error.response?.data.message || 'Upload failed');
        }
        if (csvRef.current) csvRef.current.value = '';
    };

    const handleCancel = async () => {
        if (!cancelTarget) return;
        setCancelling(true);
        try {
            await api.put(`/campaign/cancel/${cancelTarget.id}`);
            successToast('Campaign cancelled');
            setCancelTarget(null);
            fetchCampaigns();
        } catch (error) {
            if (isAxiosError(error)) errorToast(error.response?.data.message || 'An error occurred');
        } finally {
            setCancelling(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/campaign/delete/${deleteTarget.id}`);
            successToast('Campaign deleted');
            setDeleteTarget(null);
            fetchCampaigns();
        } catch (error) {
            if (isAxiosError(error)) errorToast(error.response?.data.message || 'An error occurred');
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const columns = [
        { key: 'name', header: 'Campaign' },
        {
            key: 'status', header: 'Status',
            render: (item: Campaign) => <StatusBadge status={item.status} />
        },
        {
            key: 'scheduledAt', header: 'Scheduled',
            render: (item: Campaign) => item.scheduledAt
                ? (
                    <span className="flex items-center gap-1.5 text-slate-600">
                        <FontAwesomeIcon icon={faCalendar} className="text-[10px] text-slate-400" />
                        {new Date(item.scheduledAt).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </span>
                )
                : <span className="text-slate-400">Not scheduled</span>
        },
        {
            key: 'createdAt', header: 'Created',
            render: (item: Campaign) => (
                <span className="text-slate-500">{formatDate(item.createdAt)}</span>
            )
        },
        {
            key: 'actions', header: '',
            render: (item: Campaign) => (
                <div className="flex items-center gap-0.5">
                    {item.status === 'Draft' && (
                        <button onClick={() => openEdit(item)} title="Edit"
                            className="w-8 h-8 flex items-center justify-center rounded-lg
                                       text-slate-400 hover:text-blue-600 hover:bg-blue-50
                                       transition-all duration-150">
                            <FontAwesomeIcon icon={faPen} className="text-xs" />
                        </button>
                    )}
                    {(item.status === 'Scheduled' || item.status === 'Sending') && (
                        <button onClick={() => setCancelTarget(item)} title="Cancel"
                            className="w-8 h-8 flex items-center justify-center rounded-lg
                                       text-slate-400 hover:text-amber-600 hover:bg-amber-50
                                       transition-all duration-150">
                            <FontAwesomeIcon icon={faBan} className="text-xs" />
                        </button>
                    )}
                    {item.status !== 'Draft' && (
                        <button onClick={() => openDetails(item)} title="View Details"
                            className="w-8 h-8 flex items-center justify-center rounded-lg
                                       text-slate-400 hover:text-indigo-600 hover:bg-indigo-50
                                       transition-all duration-150">
                            <FontAwesomeIcon icon={faCircleInfo} className="text-xs" />
                        </button>
                    )}
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

    if (loading && campaigns.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="animate-spin w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full" />
                <p className="text-sm text-slate-400">Loading campaigns...</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 xs:gap-4">
                <div className="flex items-start gap-2.5 xs:gap-3">
                    <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600
                                    flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0 mt-0.5">
                        <FontAwesomeIcon icon={faBullhorn} className="text-white text-xs xs:text-sm sm:text-base" />
                    </div>
                    <div>
                        <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-slate-900">Campaigns</h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {pagination.total === 0
                                ? 'Create and manage your email campaigns'
                                : `${pagination.total} campaign${pagination.total !== 1 ? 's' : ''} total`
                            }
                        </p>
                    </div>
                </div>
                <button onClick={() => setShowCreateModal(true)}
                    className="w-full sm:w-auto px-4 xs:px-5 py-2.5 text-xs xs:text-sm font-semibold text-white
                               bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl
                               hover:from-blue-700 hover:to-blue-800
                               shadow-lg shadow-blue-600/25 hover:shadow-blue-700/30
                               transition-all duration-200 flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faPlus} className="text-[10px] xs:text-xs" />
                    Create Campaign
                </button>
            </div>

            {/* Search & Status Filter */}
            {(pagination.total > 0 || debouncedSearch || statusFilter) && (
                <div className="space-y-3">
                    <div className="relative">
                        <FontAwesomeIcon icon={faMagnifyingGlass}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search campaigns by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                                       placeholder:text-slate-400
                                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                       transition-all duration-200"
                        />
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="flex flex-wrap gap-1.5 xs:gap-2">
                        {STATUS_OPTIONS.map((status) => (
                            <button
                                key={status || 'all'}
                                onClick={() => handleStatusFilter(status)}
                                className={`px-2.5 xs:px-3.5 py-1 xs:py-1.5 rounded-lg text-[11px] xs:text-xs font-semibold transition-all duration-150
                                    ${statusFilter === status
                                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                    }`}
                            >
                                {STATUS_LABELS[status]}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Campaign Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <div className="animate-spin w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full" />
                </div>
            ) : (
                <DataTable columns={columns} data={campaigns} emptyMessage="No campaigns found." />
            )}

            {/* Pagination */}
            {!loading && (
                <Pagination pagination={pagination} page={page} onPageChange={setPage} />
            )}

            {/* Create Modal */}
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Campaign">
                <form onSubmit={handleCreate} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Campaign Name</label>
                        <input type="text" required placeholder="e.g. Spring Sale 2026"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                                       placeholder:text-slate-400
                                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                       transition-all duration-200"
                            value={createName} onChange={(e) => setCreateName(e.target.value)} />
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-1">
                        <button type="button" onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100
                                       rounded-xl hover:bg-slate-200 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={creating}
                            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                                       bg-gradient-to-r from-blue-600 to-blue-700
                                       hover:from-blue-700 hover:to-blue-800
                                       shadow-lg shadow-blue-600/25
                                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                            {creating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </span>
                            ) : 'Create Campaign'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={!!editingCampaign} onClose={() => setEditingCampaign(null)}
                title={editStep === 'recipients' ? 'Select Recipients' : 'Edit Campaign'} size="lg">

                {/* Step 1: Campaign Setup */}
                {editStep === 'compose' && (
                    <form onSubmit={handleEdit} className="space-y-4">
                        {/* Campaign Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs sm:text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faBullhorn} className="text-[10px] text-amber-500" />
                                Campaign Name
                            </label>
                            <input type="text" required placeholder="e.g. Spring Sale 2026"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                                           placeholder:text-slate-400
                                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                           transition-all duration-200"
                                value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} />
                        </div>

                        {/* Template */}
                        <div className="space-y-1.5">
                            <label className="text-xs sm:text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faFileLines} className="text-[10px] text-purple-500" />
                                Template
                            </label>
                            <select required
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                           transition-all duration-200"
                                value={editForm.templateId} onChange={(e) => setEditForm(p => ({ ...p, templateId: e.target.value }))}>
                                <option value="">Select a template</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Recipients */}
                        <div className="space-y-1.5">
                            <label className="text-xs sm:text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faUsers} className="text-[10px] text-blue-500" />
                                Recipients
                                {editForm.recipients.length > 0 && (
                                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-semibold rounded-md ring-1 ring-blue-200/50">
                                        {editForm.recipients.length} selected
                                    </span>
                                )}
                            </label>
                            <button type="button" onClick={() => setEditStep('recipients')}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200
                                    ${editForm.recipients.length > 0
                                        ? 'border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-50'
                                        : 'border-slate-200 bg-white text-slate-400 hover:border-blue-300 hover:text-blue-600'}`}>
                                <span className="flex items-center gap-2">
                                    {editForm.recipients.length > 0
                                        ? `${editForm.recipients.length} recipient${editForm.recipients.length !== 1 ? 's' : ''} selected`
                                        : 'Select recipients...'}
                                </span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                            </button>
                        </div>

                        {/* Schedule — only enabled when template + recipients are set */}
                        <div className="space-y-1.5">
                            <label className={`text-xs sm:text-sm font-medium flex items-center gap-1.5
                                ${editForm.templateId && editForm.recipients.length > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                                <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                                Schedule
                                <span className="text-[10px] font-normal">(optional)</span>
                            </label>
                            {editForm.templateId && editForm.recipients.length > 0 ? (
                                <input type="datetime-local"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                                               focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                               transition-all duration-200"
                                    value={editForm.scheduledAt} onChange={(e) => setEditForm(p => ({ ...p, scheduledAt: e.target.value }))} />
                            ) : (
                                <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-400 cursor-not-allowed">
                                    Select template & recipients first
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2 border-t border-slate-100">
                            <button type="button" onClick={() => setEditingCampaign(null)}
                                className="px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100
                                           rounded-xl hover:bg-slate-200 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving}
                                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white
                                           bg-gradient-to-r from-blue-600 to-blue-700
                                           hover:from-blue-700 hover:to-blue-800
                                           shadow-lg shadow-blue-600/25
                                           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                {saving ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </span>
                                ) : 'Update Campaign'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 2: Select Recipients */}
                {editStep === 'recipients' && (
                    <div className="space-y-2.5">
                        {/* Search + CSV + Filter */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <FontAwesomeIcon icon={faMagnifyingGlass}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                                <input type="text" placeholder="Search contacts..."
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm
                                               placeholder:text-slate-400
                                               focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                               transition-all duration-200"
                                    value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} />
                            </div>
                            <input type="file" accept=".csv" ref={csvRef} onChange={handleCsvUpload} className="hidden" />
                            <button type="button" onClick={() => csvRef.current?.click()}
                                title="Upload CSV — auto-selects new contacts"
                                className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 transition-all duration-150
                                           text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                <FontAwesomeIcon icon={faUpload} className="text-xs" />
                            </button>
                            <button type="button" onClick={() => setShowFilters(p => !p)}
                                className={`flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 transition-all duration-150
                                    ${showFilters ? 'text-blue-700 bg-blue-50 ring-1 ring-blue-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                                <FontAwesomeIcon icon={faFilter} className="text-xs" />
                            </button>
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                <select className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs
                                                   focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                                   transition-all duration-200"
                                    value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}>
                                    <option value="">All Districts</option>
                                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <select className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs
                                                   focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                                   transition-all duration-200"
                                    value={filterState} onChange={(e) => setFilterState(e.target.value)}>
                                    <option value="">All States</option>
                                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}

                        {/* Select/Deselect + Range */}
                        {filteredEmails.length > 0 && (
                            <div className="flex items-center justify-between px-0.5">
                                <span className="text-[11px] text-slate-500 font-medium">
                                    {((contactsPage - 1) * CONTACTS_PER_PAGE) + 1}–{Math.min(contactsPage * CONTACTS_PER_PAGE, contactsTotal)} of {contactsTotal}
                                </span>
                                <div className="flex gap-3">
                                    <button type="button" onClick={selectAllFiltered}
                                        className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                                        Select page
                                    </button>
                                    <button type="button" onClick={deselectAllFiltered}
                                        className="text-[11px] text-slate-500 hover:text-slate-700 font-medium transition-colors">
                                        Deselect
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Contact list */}
                        {emails.length === 0 && !isEmailLike(contactSearch) ? (
                            <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                                <FontAwesomeIcon icon={faUsers} className="text-xl text-slate-300 mb-2" />
                                <p className="text-xs text-slate-400">No contacts available</p>
                            </div>
                        ) : filteredEmails.length === 0 && !isEmailLike(contactSearch) ? (
                            <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xl text-slate-300 mb-2" />
                                <p className="text-xs text-slate-400">No contacts match your search</p>
                            </div>
                        ) : (
                            <>
                            <div className="border border-slate-200 rounded-xl bg-white divide-y divide-slate-100">
                                {filteredEmails.map(em => {
                                    const isSelected = editForm.recipients.includes(em.id);
                                    return (
                                        <label key={em.id}
                                            className={`flex items-center gap-2.5 px-3 py-2 xs:py-2.5 cursor-pointer
                                                        transition-colors duration-150
                                                        ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                                            <div className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center flex-shrink-0
                                                             transition-all duration-150
                                                             ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                                {isSelected && <FontAwesomeIcon icon={faCheck} className="text-white text-[8px]" />}
                                            </div>
                                            <input type="checkbox" checked={isSelected}
                                                onChange={() => toggleRecipient(em.id)} className="sr-only" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs sm:text-sm text-slate-800 truncate font-medium">{em.email}</p>
                                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                                    {[em.name, em.district, em.state].filter(Boolean).join(' · ') || 'No details'}
                                                </p>
                                            </div>
                                        </label>
                                    );
                                })}

                                {/* Quick-add row */}
                                {isEmailLike(contactSearch) && !searchHasExactMatch && (
                                    <button type="button" onClick={handleQuickAdd} disabled={addingEmail}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 xs:py-3
                                                   text-left transition-colors duration-150
                                                   hover:bg-emerald-50/50 disabled:opacity-60">
                                        <div className="w-[18px] h-[18px] rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                            {addingEmail
                                                ? <span className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                : <FontAwesomeIcon icon={faPlus} className="text-emerald-600 text-[8px]" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs sm:text-sm text-emerald-700 font-medium truncate">
                                                Add &quot;{contactSearch.trim()}&quot;
                                            </p>
                                            <p className="text-[11px] text-emerald-500/70">Add as new contact and select</p>
                                        </div>
                                    </button>
                                )}
                            </div>

                            {/* Contact Pagination */}
                            {contactsTotalPages > 1 && (
                                <div className="flex items-center justify-between pt-0.5">
                                    <button type="button" onClick={() => fetchContacts(contactsPage - 1)}
                                        disabled={contactsPage <= 1}
                                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                                                   disabled:text-slate-300 disabled:cursor-not-allowed
                                                   text-slate-600 hover:bg-slate-100">
                                        Prev
                                    </button>
                                    <span className="text-[11px] text-slate-500">
                                        {contactsPage} / {contactsTotalPages}
                                    </span>
                                    <button type="button" onClick={() => fetchContacts(contactsPage + 1)}
                                        disabled={contactsPage >= contactsTotalPages}
                                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                                                   disabled:text-slate-300 disabled:cursor-not-allowed
                                                   text-slate-600 hover:bg-slate-100">
                                        Next
                                    </button>
                                </div>
                            )}
                            </>
                        )}

                        {/* Compose button — appears when 1+ selected */}
                        {editForm.recipients.length > 0 && (
                            <div className="sticky bottom-0 pt-3 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-1 bg-gradient-to-t from-white via-white to-white/80">
                                <button type="button" onClick={() => setEditStep('compose')}
                                    className="w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-white
                                               bg-gradient-to-r from-blue-600 to-blue-700
                                               hover:from-blue-700 hover:to-blue-800
                                               shadow-lg shadow-blue-600/25
                                               transition-all duration-200 flex items-center justify-center gap-2">
                                    Compose
                                    <span className="px-1.5 py-0.5 bg-white/20 rounded-md text-[10px] sm:text-xs font-bold">
                                        {editForm.recipients.length}
                                    </span>
                                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px] sm:text-xs" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Cancel Confirm */}
            <ConfirmDialog isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)}
                onConfirm={handleCancel} title="Cancel Campaign"
                message={`Are you sure you want to cancel "${cancelTarget?.name}"? This will stop any pending email deliveries.`}
                confirmText="Cancel Campaign" confirmColor="red" isLoading={cancelling} />

            {/* Delete Confirm */}
            <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete} title="Delete Campaign"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                confirmText="Delete" isLoading={deleting} />

            {/* Details Modal */}
            <Modal isOpen={!!detailsCampaign} onClose={() => setDetailsCampaign(null)}
                title="Campaign Details" size="lg">
                {detailsCampaign && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Campaign</p>
                                <p className="text-sm font-semibold text-slate-900">{detailsCampaign.name}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Status</p>
                                <div className="mt-0.5"><StatusBadge status={detailsCampaign.status} /></div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Scheduled</p>
                                <p className="text-sm font-medium text-slate-800">
                                    {detailsCampaign.scheduledAt
                                        ? new Date(detailsCampaign.scheduledAt).toLocaleString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })
                                        : 'Not scheduled'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUsers} className="text-xs text-slate-400" />
                                    <p className="text-sm font-semibold text-slate-700">Recipients</p>
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg">
                                        {detailsRecipients.length}
                                    </span>
                                </div>
                            </div>

                            {detailsLoading ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <div className="animate-spin w-6 h-6 border-[3px] border-blue-600 border-t-transparent rounded-full" />
                                    <p className="text-xs text-slate-400 mt-2">Loading recipients...</p>
                                </div>
                            ) : detailsRecipients.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                                    <FontAwesomeIcon icon={faUsers} className="text-2xl text-slate-300 mb-2" />
                                    <p className="text-sm text-slate-400">No recipients found</p>
                                </div>
                            ) : (
                                <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl bg-white
                                                divide-y divide-slate-100">
                                    {detailsRecipients.map((r, i) => (
                                        <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between
                                                                 px-4 py-3 gap-2 sm:gap-0 hover:bg-slate-50/50
                                                                 transition-colors duration-150">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-slate-800 truncate">{r.email.email}</p>
                                                {r.email.name && (
                                                    <p className="text-xs text-slate-400 truncate mt-0.5">{r.email.name}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 sm:ml-4 flex-shrink-0">
                                                <StatusBadge status={r.status} />
                                                {r.sentAt && (
                                                    <span className="text-xs text-slate-400 whitespace-nowrap">
                                                        {new Date(r.sentAt).toLocaleString('en-US', {
                                                            month: 'short', day: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-1">
                            <button onClick={() => setDetailsCampaign(null)}
                                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100
                                           rounded-xl hover:bg-slate-200 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
