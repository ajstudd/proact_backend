// import Report from '../models/report.model';
// import Project from '../models/project.model';
// import { HttpError } from '../helpers/HttpError';
// import mongoose from 'mongoose';
// import { analyzeReportWithAI } from './ai-analysis.service';
// import { uploadFile } from './fileUpload.service';

// interface CreateReportParams {
//     projectId: string;
//     description: string;
//     file?: Express.Multer.File;
//     userId?: string;
// }

// export const createReport = async ({
//     projectId,
//     description,
//     file,
//     userId,
// }: CreateReportParams) => {
//     try {
//         // Validate project exists
//         const project = await Project.findById(projectId);
//         if (!project) {
//             throw new HttpError({ message: 'Project not found', code: 404 });
//         }

//         // Process file if provided
//         let fileUrl = '';
//         let fileType = 'none';
//         if (file) {
//             const uploadResult = await uploadFile(file);
//             fileUrl = uploadResult.url;

//             // Determine file type
//             fileType = file.mimetype.includes('image')
//                 ? 'image'
//                 : file.mimetype.includes('pdf')
//                   ? 'pdf'
//                   : 'none';
//         }

//         // Analyze report with AI
//         const aiAnalysisResult = await analyzeReportWithAI(
//             description,
//             fileType,
//             fileUrl
//         );

//         // Create report
//         const report = new Report({
//             project: projectId,
//             description,
//             fileUrl,
//             fileType,
//             reportedBy: {
//                 userId: userId || null,
//                 isAnonymous: !userId,
//             },
//             aiAnalysis: aiAnalysisResult,
//             status: aiAnalysisResult.isValidReport ? 'pending' : 'rejected',
//             rejectionReason: !aiAnalysisResult.isValidReport
//                 ? 'AI detected this report as potentially invalid or irrelevant'
//                 : undefined,
//         });

//         await report.save();
//         return report;
//     } catch (error) {
//         console.error('Error creating report:', error);
//         if (error instanceof HttpError) throw error;
//         throw new HttpError({
//             message: 'Failed to create corruption report',
//             code: 500,
//         });
//     }
// };

// export const getReportsByProject = async (projectId: string) => {
//     try {
//         return await Report.find({ project: projectId }).sort({
//             createdAt: -1,
//         });
//     } catch (error) {
//         console.error('Error fetching project reports:', error);
//         throw new HttpError({
//             message: 'Failed to fetch reports for this project',
//             code: 500,
//         });
//     }
// };

// export const getReportsByProjectCreator = async (userId: string) => {
//     try {
//         // Find all projects created by this user (as contractor or government)
//         const userProjects = await Project.find({
//             $or: [{ contractor: userId }, { government: userId }],
//         }).select('_id');

//         // Get project IDs
//         const projectIds = userProjects.map((project) => project._id);

//         // Find all reports for these projects
//         return await Report.find({
//             project: { $in: projectIds },
//         })
//             .populate('project', 'title _id')
//             .sort({ createdAt: -1 });
//     } catch (error) {
//         console.error('Error fetching reports for user projects:', error);
//         throw new HttpError({
//             message: 'Failed to fetch reports for your projects',
//             code: 500,
//         });
//     }
// };

// export const updateReportStatus = async (
//     reportId: string,
//     status: 'accepted' | 'rejected',
//     rejectionReason?: string
// ) => {
//     try {
//         const report = await Report.findByIdAndUpdate(
//             reportId,
//             {
//                 status,
//                 rejectionReason:
//                     status === 'rejected' ? rejectionReason : undefined,
//             },
//             { new: true }
//         );

//         if (!report) {
//             throw new HttpError({ message: 'Report not found', code: 404 });
//         }

//         return report;
//     } catch (error) {
//         console.error('Error updating report status:', error);
//         if (error instanceof HttpError) throw error;
//         throw new HttpError({
//             message: 'Failed to update report status',
//             code: 500,
//         });
//     }
// };
