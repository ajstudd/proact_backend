// filepath: c:\Users\j7654\WorkStation\proact_backend\src\types\index.ts
import { Document } from 'mongoose';

export interface ICorruptionReport extends Document {
    project: string;
    description: string;
    fileUrl?: string;
    fileType: 'image' | 'pdf' | 'none';
    reportedBy: {
        userId?: string;
        isAnonymous: boolean;
    };
    status: 'pending' | 'investigating' | 'resolved' | 'rejected';
    aiAnalysis: {
        severity: number;
        summary: string;
        isValidReport: boolean;
        tags: string[];
    };
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

// ...existing code...
