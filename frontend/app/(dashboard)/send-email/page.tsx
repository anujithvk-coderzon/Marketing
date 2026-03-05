'use client';
import React, { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { isAxiosError } from 'axios';
import { errorToast, successToast } from '@/helper/ToastMessage';
import { Template, Email } from '@/lib/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPaperPlane, faFileLines, faFloppyDisk, faXmark,
    faMagnifyingGlass, faUsers, faEnvelope,
    faAt, faCheck, faCircleXmark, faCode, faPlus, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

type MobileTab = 'compose' | 'contacts';
const CONTACTS_PER_PAGE = 20;

export default function SendEmailPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);
    const [contactsTotal, setContactsTotal] = useState(0);
    const [contactsPage, setContactsPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [recipients, setRecipients] = useState<string[]>([]);
    const [recipientInput, setRecipientInput] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [saveAsTemplate, setSaveAsTemplate] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [sending, setSending] = useState(false);
    const [contactSearch, setContactSearch] = useState('');
    const [mobileTab, setMobileTab] = useState<MobileTab>('compose');
    const [addingEmail, setAddingEmail] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const listRef = useRef<HTMLDivElement>(null);
    const isEmailLike = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
    const searchHasExactMatch = emails.some(em => em.email.toLowerCase() === contactSearch.trim().toLowerCase());

    const handleQuickAdd = async () => {
        const email = contactSearch.trim().toLowerCase();
        if (!email) return;
        setAddingEmail(true);
        try {
            await api.post('/email/create', { email });
            successToast('Contact added');
            await fetchEmails(1, '');
            if (!recipients.includes(email)) setRecipients(prev => [...prev, email]);
            setContactSearch('');
        } catch (error) {
            if (isAxiosError(error)) errorToast(error.response?.data.message || 'Failed to add contact');
        } finally {
            setAddingEmail(false);
        }
    };

    const fetchEmails = async (page: number, search?: string) => {
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(CONTACTS_PER_PAGE) });
            if (search) params.set('search', search);
            const { data } = await api.get(`/emails?${params}`);
            setEmails(data.emails || []);
            setContactsTotal(data.pagination?.total ?? 0);
            setTotalPages(data.pagination?.totalPages ?? 1);
            setContactsPage(page);
            listRef.current?.scrollTo({ top: 0 });
        } catch (error) {
            if (isAxiosError(error)) errorToast('Failed to load contacts');
        }
    };

    useEffect(() => {
        async function fetchData() {
            const results = await Promise.allSettled([
                api.get('/templates'),
                api.get(`/emails?page=1&limit=${CONTACTS_PER_PAGE}`),
            ]);
            if (results[0].status === 'fulfilled') setTemplates(results[0].value.data.templates || []);
            if (results[1].status === 'fulfilled') {
                setEmails(results[1].value.data.emails || []);
                setContactsTotal(results[1].value.data.pagination?.total ?? 0);
                setTotalPages(results[1].value.data.pagination?.totalPages ?? 1);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    // Debounce search — fetch from API after 300ms
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(contactSearch.trim()), 300);
        return () => clearTimeout(timer);
    }, [contactSearch]);

    useEffect(() => {
        if (!loading) fetchEmails(1, debouncedSearch);
    }, [debouncedSearch]);

    const selectAllPage = () => {
        const newRecipients = new Set(recipients);
        emails.forEach(em => newRecipients.add(em.email));
        setRecipients([...newRecipients]);
    };

    const deselectAllPage = () => {
        const pageSet = new Set(emails.map(em => em.email));
        setRecipients(prev => prev.filter(r => !pageSet.has(r)));
    };

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplateId(templateId);
        if (!templateId) return;
        const template = templates.find(t => t.id === templateId);
        if (template) { setSubject(template.subject); setBody(template.body); }
    };

    const addRecipient = (email: string) => {
        const trimmed = email.trim().toLowerCase();
        if (!trimmed) return;
        if (recipients.includes(trimmed)) { errorToast('Recipient already added'); return; }
        setRecipients(prev => [...prev, trimmed]);
        setRecipientInput('');
    };

    const handleRecipientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addRecipient(recipientInput); }
    };

    const removeRecipient = (email: string) => setRecipients(prev => prev.filter(r => r !== email));

    const toggleExistingEmail = (email: string) => {
        if (recipients.includes(email)) removeRecipient(email);
        else setRecipients(prev => [...prev, email]);
    };

    const handleSend = async () => {
        if (recipients.length === 0) { errorToast('Add at least one recipient'); return; }
        if (!subject.trim()) { errorToast('Subject is required'); return; }
        if (!body.trim()) { errorToast('Email body is required'); return; }
        if (saveAsTemplate && !templateName.trim()) { errorToast('Template name is required'); return; }
        setSending(true);
        try {
            await api.post('/send/email', {
                email: recipients.length === 1 ? recipients[0] : recipients,
                subject, body, saveAsTemplate,
                ...(saveAsTemplate && { name: templateName }),
            });
            successToast('Email sent successfully');
            setRecipients([]); setRecipientInput(''); setSubject(''); setBody('');
            setSelectedTemplateId(''); setSaveAsTemplate(false); setTemplateName('');
        } catch (error) {
            if (isAxiosError(error)) {
                const data = error.response?.data;
                if (data?.errors?.length) data.errors.forEach((err: { message: string }) => errorToast(err.message));
                else errorToast(data?.message || 'Failed to send email');
            }
        } finally { setSending(false); }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="animate-spin w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full" />
                <p className="text-sm text-slate-400">Loading...</p>
            </div>
        );
    }

    /* ── Mobile: Contacts view ── */
    if (mobileTab === 'contacts') {
        return (
            <div className="lg:hidden space-y-3">
                {/* Back header */}
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setMobileTab('compose')}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500
                                   hover:bg-slate-100 active:bg-slate-200 transition-colors">
                        <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-base font-bold text-slate-900">Select Recipients</h2>
                        <p className="text-xs text-slate-500">{recipients.length} selected</p>
                    </div>
                    {recipients.length > 0 && (
                        <button type="button" onClick={() => setMobileTab('compose')}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-white
                                       bg-gradient-to-r from-blue-600 to-blue-700 shadow-md shadow-blue-600/20
                                       active:from-blue-700 active:to-blue-800 transition-all">
                            <FontAwesomeIcon icon={faPaperPlane} className="mr-1.5 text-[10px]" />
                            Compose
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <FontAwesomeIcon icon={faMagnifyingGlass}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                    <input type="text" placeholder="Search contacts..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                                   placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                   focus:border-blue-400 transition-all duration-200"
                        value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} />
                </div>

                {/* Select / Deselect */}
                {emails.length > 0 && (
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs text-slate-500 font-medium">
                            {((contactsPage - 1) * CONTACTS_PER_PAGE) + 1}–{Math.min(contactsPage * CONTACTS_PER_PAGE, contactsTotal)} of {contactsTotal}
                        </span>
                        <div className="flex gap-3">
                            <button type="button" onClick={selectAllPage}
                                className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">Select page</button>
                            <button type="button" onClick={deselectAllPage}
                                className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors">Deselect</button>
                        </div>
                    </div>
                )}

                {/* Contact list */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {emails.length === 0 && !isEmailLike(contactSearch) ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <FontAwesomeIcon icon={faEnvelope} className="text-xl text-slate-300 mb-2" />
                                <p className="text-sm text-slate-400">
                                    {emails.length === 0 ? 'No contacts yet.' : 'No matches found.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                {emails.map(em => {
                                    const isSelected = recipients.includes(em.email);
                                    return (
                                        <label key={em.id}
                                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer
                                                        transition-colors duration-150
                                                        ${isSelected ? 'bg-blue-50/50' : 'active:bg-slate-50'}`}>
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                                                             transition-all duration-150
                                                             ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                                {isSelected && <FontAwesomeIcon icon={faCheck} className="text-white text-[9px]" />}
                                            </div>
                                            <input type="checkbox" checked={isSelected}
                                                onChange={() => toggleExistingEmail(em.email)} className="sr-only" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-slate-800 truncate font-medium">{em.email}</p>
                                                <p className="text-xs text-slate-400 truncate mt-0.5">
                                                    {[em.name, em.district, em.state].filter(Boolean).join(' · ') || 'No details'}
                                                </p>
                                            </div>
                                        </label>
                                    );
                                })}

                                {isEmailLike(contactSearch) && !searchHasExactMatch && (
                                    <button type="button" onClick={handleQuickAdd} disabled={addingEmail}
                                        className="w-full flex items-center gap-3 px-4 py-3
                                                   text-left transition-colors duration-150
                                                   active:bg-emerald-50/50 disabled:opacity-60">
                                        <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                            {addingEmail
                                                ? <span className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                : <FontAwesomeIcon icon={faPlus} className="text-emerald-600 text-[9px]" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-emerald-700 font-medium truncate">
                                                Add &quot;{contactSearch.trim()}&quot;
                                            </p>
                                            <p className="text-[11px] text-emerald-500/70">Add as new contact and select</p>
                                        </div>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <button type="button" onClick={() => fetchEmails(contactsPage - 1, debouncedSearch)}
                            disabled={contactsPage <= 1}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                                       disabled:text-slate-300 disabled:cursor-not-allowed
                                       text-slate-600 active:bg-slate-100">
                            Prev
                        </button>
                        <span className="text-xs text-slate-500">{contactsPage} / {totalPages}</span>
                        <button type="button" onClick={() => fetchEmails(contactsPage + 1, debouncedSearch)}
                            disabled={contactsPage >= totalPages}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                                       disabled:text-slate-300 disabled:cursor-not-allowed
                                       text-slate-600 active:bg-slate-100">
                            Next
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="lg:h-[calc(100vh-2rem)] lg:flex lg:flex-col space-y-3">
            {/* Page Header */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600
                                flex items-center justify-center shadow-md shadow-violet-500/20 flex-shrink-0">
                    <FontAwesomeIcon icon={faPaperPlane} className="text-white text-[10px] sm:text-xs" />
                </div>
                <div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Send Email</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Compose and send emails to your contacts</p>
                </div>
            </div>

            {/* Layout */}
            <div className="lg:flex lg:gap-5 lg:flex-1 lg:min-h-0">
                {/* Compose card */}
                <div className="lg:flex-1 lg:h-full lg:flex lg:flex-col">
                    <div className="bg-white rounded-2xl border border-slate-200 px-3 py-2 xs:px-4 xs:py-2.5 sm:px-5 sm:py-3 shadow-sm
                                    space-y-2 sm:space-y-3 lg:flex-1 lg:flex lg:flex-col">
                        {/* Recipients */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faAt} className="text-slate-400 text-xs" />
                                    Recipients
                                </label>
                                <div className="flex items-center gap-2">
                                    {recipients.length > 0 && (
                                        <button type="button" onClick={() => setRecipients([])}
                                            className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors flex items-center gap-1">
                                            <FontAwesomeIcon icon={faCircleXmark} className="text-[10px]" />
                                            Clear all
                                        </button>
                                    )}
                                    {/* Mobile: select recipients button */}
                                    <button type="button" onClick={() => setMobileTab('contacts')}
                                        className="lg:hidden px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600
                                                   bg-blue-50 ring-1 ring-blue-200/50 active:bg-blue-100 transition-colors
                                                   flex items-center gap-1.5">
                                        <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
                                        Select
                                        {recipients.length > 0 && (
                                            <span className="w-4.5 h-4.5 flex items-center justify-center rounded-full bg-blue-600 text-white text-[9px] font-bold ml-0.5">
                                                {recipients.length > 99 ? '99+' : recipients.length}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="min-h-[38px] sm:min-h-[44px] flex flex-wrap gap-1.5 p-1.5 xs:p-2 sm:p-2.5 rounded-xl border border-slate-200
                                            bg-slate-50/50 focus-within:ring-2 focus-within:ring-blue-500/20
                                            focus-within:border-blue-400 focus-within:bg-white transition-all duration-200">
                                {recipients.map(r => (
                                    <span key={r} className="inline-flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 py-1 rounded-lg
                                                              bg-blue-50 text-blue-700 text-xs font-medium ring-1 ring-blue-200/50 max-w-full">
                                        <span className="truncate">{r}</span>
                                        <button type="button" onClick={() => removeRecipient(r)}
                                            className="hover:text-blue-900 transition-colors flex-shrink-0 w-4 h-4 flex items-center justify-center">
                                            <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                        </button>
                                    </span>
                                ))}
                                <input type="email"
                                    placeholder={recipients.length === 0 ? 'Type email and press Enter' : 'Add more...'}
                                    className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-slate-400 py-0.5"
                                    value={recipientInput} onChange={(e) => setRecipientInput(e.target.value)}
                                    onKeyDown={handleRecipientKeyDown}
                                    onBlur={() => { if (recipientInput.trim()) addRecipient(recipientInput); }} />
                            </div>
                        </div>

                        {/* Template */}
                        <div className="space-y-1">
                            <label className="text-xs sm:text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faFileLines} className="text-slate-400 text-xs" />
                                Use Template
                            </label>
                            <select className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                                               focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                                value={selectedTemplateId} onChange={(e) => handleTemplateSelect(e.target.value)}>
                                <option value="">None — compose from scratch</option>
                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>

                        {/* Subject */}
                        <div className="space-y-1">
                            <label className="text-xs sm:text-sm font-medium text-slate-700">Subject</label>
                            <input type="text" placeholder="Email subject line"
                                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-400
                                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                                value={subject} onChange={(e) => setSubject(e.target.value)} />
                        </div>

                        {/* Body */}
                        <div className="space-y-1 lg:flex-1 lg:flex lg:flex-col">
                            <div className="flex items-center justify-between">
                                <label className="text-xs sm:text-sm font-medium text-slate-700">Email Body</label>
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                                    <FontAwesomeIcon icon={faCode} className="text-[9px]" />
                                    HTML
                                </span>
                            </div>
                            <textarea placeholder="<h1>Hello ${name}!</h1>&#10;<p>Your email content here...</p>"
                                rows={6}
                                className="w-full px-3 py-2 sm:px-3.5 sm:py-3 rounded-xl border border-slate-200 bg-white text-sm font-mono
                                           leading-relaxed placeholder:text-slate-400
                                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                                           transition-all duration-200 resize-y sm:min-h-[160px] lg:flex-1 lg:min-h-[120px]"
                                value={body} onChange={(e) => setBody(e.target.value)} />
                            <div className="mt-1 p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                                <p className="text-[11px] font-medium text-slate-500">
                                    Personalize your email using variables — each recipient will see their own details:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    <code className="text-[10px] bg-white text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-semibold">{'${name}'}</code>
                                    <code className="text-[10px] bg-white text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-semibold">{'${email}'}</code>
                                    <code className="text-[10px] bg-white text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-semibold">{'${phone}'}</code>
                                    <code className="text-[10px] bg-white text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-semibold">{'${district}'}</code>
                                    <code className="text-[10px] bg-white text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-semibold">{'${state}'}</code>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                    Example: <code className="text-[10px] text-slate-500">{'<h1>Hi ${name}</h1>'}</code> → recipient John Smith sees <span className="font-medium text-slate-500">&quot;Hi John Smith&quot;</span>
                                </p>
                                <p className="text-[10px] text-amber-600 font-medium">
                                    Note: If a field is empty for a recipient, it will appear blank. Make sure all variables used in the body are available in the recipient&apos;s contact details from &apos;Emails&apos;.
                                </p>
                            </div>
                        </div>

                        {/* Save as template + Send button */}
                        <div className="border-t border-slate-100 pt-1 sm:pt-1.5 space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={saveAsTemplate}
                                        onChange={(e) => setSaveAsTemplate(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" />
                                    <span className="text-xs sm:text-sm text-slate-700 flex items-center gap-1.5">
                                        <FontAwesomeIcon icon={faFloppyDisk} className="text-slate-400 text-xs" />
                                        Save as template
                                    </span>
                                </label>
                                <button type="button" onClick={handleSend} disabled={sending}
                                    className="px-4 sm:px-8 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white
                                               bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                                               shadow-lg shadow-blue-600/25 hover:shadow-blue-700/30
                                               transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                               flex items-center gap-2">
                                    {sending ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending...
                                        </span>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
                                            Send Email
                                        </>
                                    )}
                                </button>
                            </div>
                            {saveAsTemplate && (
                                <input type="text" placeholder="Template name"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-400
                                               focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                                    value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Contacts sidebar — desktop only */}
                <div className="hidden lg:flex lg:flex-col lg:w-80 lg:h-full">
                    <div className="bg-white rounded-2xl border border-slate-200 px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm
                                    space-y-2.5 flex-1 flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faUsers} className="text-xs text-slate-400" />
                                <h3 className="text-sm font-semibold text-slate-900">Contacts</h3>
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg">
                                    {contactsTotal}
                                </span>
                            </div>
                            {recipients.length > 0 && (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg ring-1 ring-blue-200/50">
                                    {recipients.length} selected
                                </span>
                            )}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <FontAwesomeIcon icon={faMagnifyingGlass}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                            <input type="text" placeholder="Search contacts..."
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm
                                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                           focus:border-blue-400 transition-all duration-200"
                                value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} />
                        </div>

                        {/* Select / Deselect */}
                        {emails.length > 0 && (
                            <div className="flex items-center justify-between px-1">
                                <span className="text-xs text-slate-500 font-medium">
                                    {((contactsPage - 1) * CONTACTS_PER_PAGE) + 1}–{Math.min(contactsPage * CONTACTS_PER_PAGE, contactsTotal)} of {contactsTotal}
                                </span>
                                <div className="flex gap-3">
                                    <button type="button" onClick={selectAllPage}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">Select page</button>
                                    <button type="button" onClick={deselectAllPage}
                                        className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors">Deselect</button>
                                </div>
                            </div>
                        )}

                        {/* Contact list area */}
                        <div className="rounded-xl bg-slate-50 border border-slate-200 relative flex-1 min-h-0">
                            <div ref={listRef} className="absolute inset-0 overflow-y-auto divide-y divide-slate-100">
                                {emails.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-lg text-slate-300 mb-1.5" />
                                        <p className="text-xs text-slate-400">
                                            {emails.length === 0 ? 'No contacts yet.' : 'No contacts match your search.'}
                                        </p>
                                    </div>
                                ) : emails.map(em => {
                                    const isSelected = recipients.includes(em.email);
                                    return (
                                        <label key={em.id}
                                            className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer
                                                        transition-colors duration-150
                                                        ${isSelected ? 'bg-blue-50/50' : 'hover:bg-white'}`}>
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                                                             transition-all duration-150
                                                             ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                                {isSelected && <FontAwesomeIcon icon={faCheck} className="text-white text-[9px]" />}
                                            </div>
                                            <input type="checkbox" checked={isSelected}
                                                onChange={() => toggleExistingEmail(em.email)} className="sr-only" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-slate-800 truncate font-medium">{em.email}</p>
                                                <p className="text-xs text-slate-400 truncate mt-0.5">
                                                    {[em.name, em.district, em.state].filter(Boolean).join(' · ') || 'No details'}
                                                </p>
                                            </div>
                                        </label>
                                    );
                                })}

                                {/* Quick-add row */}
                                {isEmailLike(contactSearch) && !searchHasExactMatch && (
                                    <button type="button" onClick={handleQuickAdd} disabled={addingEmail}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5
                                                   text-left transition-colors duration-150
                                                   hover:bg-emerald-50/50 disabled:opacity-60">
                                        <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                            {addingEmail
                                                ? <span className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                : <FontAwesomeIcon icon={faPlus} className="text-emerald-600 text-[9px]" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-emerald-700 font-medium truncate">
                                                Add &quot;{contactSearch.trim()}&quot;
                                            </p>
                                            <p className="text-[11px] text-emerald-500/70">Add as new contact and select</p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-1 flex-shrink-0">
                                <button type="button" onClick={() => fetchEmails(contactsPage - 1, debouncedSearch)}
                                    disabled={contactsPage <= 1}
                                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                                               disabled:text-slate-300 disabled:cursor-not-allowed
                                               text-slate-600 hover:bg-slate-100">
                                    Prev
                                </button>
                                <span className="text-xs text-slate-500">
                                    {contactsPage} / {totalPages}
                                </span>
                                <button type="button" onClick={() => fetchEmails(contactsPage + 1, debouncedSearch)}
                                    disabled={contactsPage >= totalPages}
                                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                                               disabled:text-slate-300 disabled:cursor-not-allowed
                                               text-slate-600 hover:bg-slate-100">
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
