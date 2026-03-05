'use client';
import React, { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import { isAxiosError } from 'axios';
import { errorToast, successToast } from '@/helper/ToastMessage';
import { Template, PaginationMeta } from '@/lib/types';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination from '@/components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faPen, faEye, faTrash, faFileLines,
    faMagnifyingGlass, faEnvelope, faCalendar, faClock,
    faArrowUpWideShort, faArrowDownShortWide, faCode, faDesktop
} from '@fortawesome/free-solid-svg-icons';

type SortOrder = 'asc' | 'desc';
type PreviewTab = 'rendered' | 'source';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
    const [previewTab, setPreviewTab] = useState<PreviewTab>('rendered');
    const [formData, setFormData] = useState({ name: '', subject: '', body: '' });
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationMeta>({
        page: 1, limit: 20, total: 0, totalPages: 0,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', '20');
            params.set('sortBy', 'createdAt');
            params.set('sortOrder', sortOrder);
            if (debouncedSearch) params.set('search', debouncedSearch);

            const { data } = await api.get(`/templates?${params.toString()}`);
            setTemplates(data.templates || []);
            setPagination(data.pagination);
        } catch (error) {
            if (isAxiosError(error)) {
                setTemplates([]);
                setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
            }
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, sortOrder]);

    useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

    const handleSortToggle = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
        setPage(1);
    };

    const openCreate = () => {
        setEditingTemplate(null);
        setFormData({ name: '', subject: '', body: '' });
        setShowForm(true);
    };

    const openEdit = (t: Template) => {
        setEditingTemplate(t);
        setFormData({ name: t.name, subject: t.subject, body: t.body });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingTemplate) {
                await api.patch(`/template/edit/${editingTemplate.id}`, formData);
                successToast('Template updated successfully');
            } else {
                await api.post('/template/create', formData);
                successToast('Template created successfully');
            }
            setShowForm(false);
            fetchTemplates();
        } catch (error) {
            if (isAxiosError(error)) {
                errorToast(error.response?.data.message || 'An error occurred');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/template/delete/${deleteTarget.id}`);
            successToast('Template deleted');
            setDeleteTarget(null);
            fetchTemplates();
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

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();

    if (loading && templates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="animate-spin w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full" />
                <p className="text-sm text-slate-400">Loading templates...</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-5">
            {/* Page Header */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600
                                    flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                        <FontAwesomeIcon icon={faFileLines} className="text-white text-[10px] sm:text-xs" />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Templates</h1>
                        <p className="text-slate-500 text-xs mt-0.5 hidden xs:block">
                            {pagination.total === 0
                                ? 'Create reusable email templates'
                                : `${pagination.total} template${pagination.total !== 1 ? 's' : ''}`
                            }
                        </p>
                    </div>
                </div>
                <button onClick={openCreate}
                    className="px-3 xs:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white
                               bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl
                               hover:from-blue-700 hover:to-blue-800
                               shadow-lg shadow-blue-600/25 hover:shadow-blue-700/30
                               transition-all duration-200 flex items-center gap-1.5 flex-shrink-0">
                    <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                    <span className="hidden xs:inline">Create Template</span>
                    <span className="xs:hidden">New</span>
                </button>
            </div>

            {/* Search & Sort Bar */}
            {(pagination.total > 0 || debouncedSearch) && (
                <div className="flex gap-2 sm:gap-3">
                    <div className="relative flex-1">
                        <FontAwesomeIcon icon={faMagnifyingGlass}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm
                                       placeholder:text-slate-400
                                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                       transition-all duration-200"
                        />
                    </div>
                    <button onClick={handleSortToggle}
                        className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200
                                   bg-white text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300
                                   transition-all duration-200 flex-shrink-0">
                        <FontAwesomeIcon
                            icon={sortOrder === 'desc' ? faArrowDownShortWide : faArrowUpWideShort}
                            className="text-xs text-slate-500" />
                        <span className="hidden sm:inline">
                            {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                        </span>
                    </button>
                </div>
            )}

            {/* Template Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <div className="animate-spin w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full" />
                </div>
            ) : pagination.total === 0 && !debouncedSearch ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-14 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <FontAwesomeIcon icon={faFileLines} className="text-xl text-slate-400" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 mb-1.5">No templates yet</h3>
                    <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mb-5">
                        Templates let you create reusable email designs for campaigns.
                    </p>
                    <button onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white
                                   bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                        <FontAwesomeIcon icon={faPlus} className="text-xs" />
                        Create Your First Template
                    </button>
                </div>
            ) : templates.length === 0 && debouncedSearch ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-lg text-slate-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">No results found</h3>
                    <p className="text-slate-500 text-xs">
                        No templates match &quot;{debouncedSearch}&quot;
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {templates.map((t) => (
                        <div key={t.id}
                            className="group bg-white rounded-xl border border-slate-200
                                       hover:border-blue-200 hover:shadow-md hover:shadow-blue-100/50
                                       transition-all duration-200">
                            {/* Card top */}
                            <div className="px-3.5 xs:px-4 pt-3.5 xs:pt-4 pb-2 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0
                                                group-hover:bg-blue-100 transition-colors">
                                    <FontAwesomeIcon icon={faFileLines} className="text-blue-500 text-xs" />
                                </div>
                                <h3 className="font-semibold text-slate-900 truncate text-sm leading-snug min-w-0">
                                    {t.name}
                                </h3>
                            </div>

                            {/* Subject + Body Preview */}
                            <div className="px-3.5 xs:px-4 pb-2">
                                <div className="bg-slate-50/80 rounded-lg px-3 py-2.5 border border-slate-100/80">
                                    <p className="text-[11px] text-slate-600 truncate">
                                        <span className="font-semibold text-slate-500">Subject: </span>
                                        {t.subject}
                                    </p>
                                    <hr className="border-slate-200/80 my-1.5" />
                                    <div className="line-clamp-3 prose prose-sm max-w-none text-[11px] leading-relaxed
                                                    prose-headings:text-slate-700 prose-headings:text-[11px] prose-headings:font-semibold prose-headings:m-0
                                                    prose-p:text-slate-500 prose-p:m-0 prose-p:text-[11px]
                                                    prose-a:text-blue-500 prose-ul:m-0 prose-ol:m-0 prose-li:m-0
                                                    [&>*]:m-0 [&>*]:p-0"
                                        dangerouslySetInnerHTML={{ __html: t.body }} />
                                    <button type="button" onClick={() => { setPreviewTemplate(t); setPreviewTab('rendered'); }}
                                        className="text-[11px] text-blue-500 hover:text-blue-700 font-medium mt-1 transition-colors">
                                        more...
                                    </button>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="px-3.5 xs:px-4 pb-3 xs:pb-3.5 flex items-center justify-between">
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <FontAwesomeIcon icon={faCalendar} className="text-[9px]" />
                                    {formatDate(t.createdAt)}
                                </span>

                                <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setPreviewTemplate(t); setPreviewTab('rendered'); }}
                                        title="Preview"
                                        className="w-7 h-7 flex items-center justify-center rounded-md
                                                   text-slate-400 hover:text-blue-600 hover:bg-blue-50
                                                   transition-all duration-150">
                                        <FontAwesomeIcon icon={faEye} className="text-[11px]" />
                                    </button>
                                    <button onClick={() => openEdit(t)}
                                        title="Edit"
                                        className="w-7 h-7 flex items-center justify-center rounded-md
                                                   text-slate-400 hover:text-amber-600 hover:bg-amber-50
                                                   transition-all duration-150">
                                        <FontAwesomeIcon icon={faPen} className="text-[11px]" />
                                    </button>
                                    <button onClick={() => setDeleteTarget(t)}
                                        title="Delete"
                                        className="w-7 h-7 flex items-center justify-center rounded-md
                                                   text-slate-400 hover:text-red-600 hover:bg-red-50
                                                   transition-all duration-150">
                                        <FontAwesomeIcon icon={faTrash} className="text-[11px]" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && (
                <Pagination pagination={pagination} page={page} onPageChange={setPage} />
            )}

            {/* Create/Edit Form Modal */}
            <Modal isOpen={showForm} onClose={() => setShowForm(false)}
                title={editingTemplate ? 'Edit Template' : 'Create Template'}
                size="lg">
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        <div className="space-y-1">
                            <label className="text-xs sm:text-sm font-medium text-slate-700">Template Name</label>
                            <input type="text" required placeholder="e.g. Welcome Email"
                                className="w-full px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 bg-white text-sm
                                           placeholder:text-slate-400
                                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                           transition-all duration-200"
                                value={formData.name}
                                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs sm:text-sm font-medium text-slate-700">Subject Line</label>
                            <input type="text" required placeholder="Email subject line"
                                className="w-full px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 bg-white text-sm
                                           placeholder:text-slate-400
                                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                           transition-all duration-200"
                                value={formData.subject}
                                onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-xs sm:text-sm font-medium text-slate-700">Email Body</label>
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                                <FontAwesomeIcon icon={faCode} className="text-[9px]" />
                                HTML
                            </span>
                        </div>
                        <textarea required placeholder="<h1>Hello ${name}!</h1>&#10;<p>Your email content here...</p>"
                            rows={7}
                            className="w-full px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 bg-white text-sm font-mono
                                       leading-relaxed placeholder:text-slate-400
                                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                       transition-all duration-200 resize-y sm:min-h-[200px]"
                            value={formData.body}
                            onChange={(e) => setFormData(p => ({ ...p, body: e.target.value }))} />
                        <div className="mt-1 p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                            <p className="text-[11px] font-medium text-slate-500">
                                Personalize your template using variables — each recipient will see their own details:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                <code className="text-[10px] bg-white text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-semibold">{'${name}'}</code>
                                <code className="text-[10px] bg-white text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-semibold">{'${email}'}</code>
                                <code className="text-[10px] bg-white text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-semibold">{'${phone}'}</code>
                                <code className="text-[10px] bg-white text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-semibold">{'${district}'}</code>
                                <code className="text-[10px] bg-white text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-semibold">{'${state}'}</code>
                            </div>
                            <p className="text-[10px] text-slate-400">
                                Example: <code className="text-[10px] text-slate-500">{'<h1>Hi ${name}</h1>'}</code> → recipient Anujith sees <span className="font-medium text-slate-500">&quot;Hi Anujith&quot;</span>
                            </p>
                            <p className="text-[10px] text-amber-600 font-medium">
                                Note: If a field is empty for a recipient, it will appear blank. Make sure all variables used in the body are available in the recipient&apos;s contact details from &apos;Emails&apos;.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-0.5">
                        <button type="button" onClick={() => setShowForm(false)}
                            className="px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100
                                       rounded-xl hover:bg-slate-200 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting}
                            className="px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white
                                       bg-gradient-to-r from-blue-600 to-blue-700
                                       hover:from-blue-700 hover:to-blue-800
                                       shadow-lg shadow-blue-600/25
                                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : editingTemplate ? 'Update Template' : 'Create Template'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Preview Modal */}
            <Modal isOpen={!!previewTemplate} onClose={() => setPreviewTemplate(null)}
                title="Template Preview" size="lg">
                {previewTemplate && (
                    <div className="space-y-4">
                        {/* Template info cards */}
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3">
                            <div className="bg-slate-50 rounded-xl p-3 sm:p-3.5 border border-slate-100">
                                <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                                    Name
                                </p>
                                <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">{previewTemplate.name}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3 sm:p-3.5 border border-slate-100">
                                <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                                    Subject
                                </p>
                                <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">{previewTemplate.subject}</p>
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faCalendar} className="text-[9px]" />
                                {formatDate(previewTemplate.createdAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faClock} className="text-[9px]" />
                                {formatTime(previewTemplate.createdAt)}
                            </span>
                            {previewTemplate.updatedAt !== previewTemplate.createdAt && (
                                <span className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faPen} className="text-[9px]" />
                                    Updated {formatDate(previewTemplate.updatedAt)}
                                </span>
                            )}
                        </div>

                        {/* Preview with tabs */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Email Preview
                                </p>
                                <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
                                    <button type="button" onClick={() => setPreviewTab('rendered')}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all
                                                    ${previewTab === 'rendered'
                                                        ? 'bg-white text-slate-800 shadow-sm'
                                                        : 'text-slate-500 hover:text-slate-700'}`}>
                                        <FontAwesomeIcon icon={faDesktop} className="text-[9px]" />
                                        Preview
                                    </button>
                                    <button type="button" onClick={() => setPreviewTab('source')}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all
                                                    ${previewTab === 'source'
                                                        ? 'bg-white text-slate-800 shadow-sm'
                                                        : 'text-slate-500 hover:text-slate-700'}`}>
                                        <FontAwesomeIcon icon={faCode} className="text-[9px]" />
                                        Source
                                    </button>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                {/* Email header bar */}
                                <div className="bg-slate-50 border-b border-slate-200 px-3.5 sm:px-5 py-2.5 sm:py-3">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-[10px] sm:text-xs text-slate-400" />
                                        <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">{previewTemplate.subject}</span>
                                    </div>
                                </div>

                                {previewTab === 'rendered' ? (
                                    <div className="p-3.5 sm:p-6 bg-white max-h-[40vh] sm:max-h-[50vh] overflow-y-auto">
                                        <div className="prose prose-sm max-w-none
                                                        prose-headings:text-slate-900 prose-p:text-slate-600
                                                        prose-a:text-blue-600 text-xs sm:text-sm"
                                            dangerouslySetInnerHTML={{ __html: previewTemplate.body }} />
                                    </div>
                                ) : (
                                    <div className="bg-slate-900 p-3.5 sm:p-5 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto">
                                        <pre className="text-[11px] sm:text-xs text-green-400 font-mono whitespace-pre-wrap break-all leading-relaxed">
                                            {previewTemplate.body}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-1">
                            <button onClick={() => setPreviewTemplate(null)}
                                className="px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100
                                           rounded-xl hover:bg-slate-200 transition-colors">
                                Close
                            </button>
                            <button onClick={() => {
                                setPreviewTemplate(null);
                                openEdit(previewTemplate);
                            }}
                                className="px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white
                                           bg-gradient-to-r from-blue-600 to-blue-700
                                           hover:from-blue-700 hover:to-blue-800
                                           shadow-lg shadow-blue-600/25
                                           transition-all duration-200 flex items-center justify-center gap-1.5">
                                <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                Edit Template
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirm */}
            <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete} title="Delete Template"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                confirmText="Delete" isLoading={deleting} />
        </div>
    );
}
