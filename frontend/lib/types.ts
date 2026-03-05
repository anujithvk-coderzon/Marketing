export interface User {
    name: string;
    email: string;
    role: 'Admin' | 'User';
}

export interface Email {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    district?: string;
    state?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Template {
    id: string;
    name: string;
    subject: string;
    body: string;
    createdAt: string;
    updatedAt: string;
}

export interface Campaign {
    id: string;
    name: string;
    status: CampaignStatus;
    scheduledAt?: string;
    sentAt?: string;
    createdAt: string;
    updatedAt: string;
    templateId?: string;
}

export type CampaignStatus = 'Draft' | 'Scheduled' | 'Delivered' | 'Cancelled' | 'Sending';

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
