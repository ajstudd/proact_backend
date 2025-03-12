// filepath: c:\Users\j7654\WorkStation\proact_backend\src\routes\corruption-report.route.ts
import { Router } from 'express';
import * as corruptionReportController from '@/controllers/corruption-report.controller';
import { verifyToken } from '@/middlewares/verifyToken.middleware';
import { upload } from '@/services/fileUpload.service';
import { catchAsync } from 'catch-async-express';
import { Request, Response } from 'express';

const router = Router();

// Create a corruption report (anonymous or authenticated)
interface MulterRequest extends Request {
    files: {
        [fieldname: string]: Express.Multer.File[];
    };
}

interface CreateReportRequest extends MulterRequest {
    body: {
        title: string;
        description: string;
        projectId: string;
    };
}

router.post(
    '/create',
    upload.fields([{ name: 'attachment', maxCount: 1 }]),
    verifyToken({ strict: false }), // Optional authentication
    catchAsync((req: CreateReportRequest, res: Response) =>
        corruptionReportController.createReport(req as any, res)
    )
);

// Get reports for a specific project (only for project creator)
router.get(
    '/project/:projectId',
    verifyToken({ strict: true }),
    catchAsync(corruptionReportController.getProjectReports)
);

// Get a specific report by ID (anonymous or authenticated)
router.get(
    '/info/:reportId',
    verifyToken({ strict: false }), // Optional authentication
    catchAsync(corruptionReportController.getReportById)
);

// Get all reports for projects created by the logged-in user
router.get(
    '/user-projects',
    verifyToken({ strict: true }),
    catchAsync(corruptionReportController.getUserProjectReports)
);

// Update report status (only for project creator)
router.patch(
    '/:reportId/status',
    verifyToken({ strict: true }),
    catchAsync(corruptionReportController.updateReportStatus)
);

export default router;
