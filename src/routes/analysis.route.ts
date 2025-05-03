import { Router } from 'express';
import { catchAsync } from 'catch-async-express';
import { verifyToken } from '@/middlewares/verifyToken.middleware';
import { authMiddleware, UserRole } from '@/middlewares/auth.middleware';
import analysisController from '@/controllers/analysis.controller';

const router = Router();

router.get(
    '/dashboard',
    verifyToken({ strict: true }),
    authMiddleware([UserRole.GOVERNMENT]),
    catchAsync(analysisController.getGovernmentDashboard)
);

router.get(
    '/project/:projectId',
    verifyToken({ strict: true }),
    catchAsync(analysisController.getProjectAnalysis)
);

router.post(
    '/project/:projectId/regenerate',
    verifyToken({ strict: true }),
    catchAsync(analysisController.regenerateProjectAnalysis)
);

router.post(
    '/dashboard/regenerate',
    verifyToken({ strict: true }),
    authMiddleware([UserRole.GOVERNMENT]),
    catchAsync(analysisController.regenerateGovernmentAnalysis)
);

export default router;
