import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware";
import { getDashboardStats } from "../controllers/dashboard.controller";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardStats:
 *       type: object
 *       properties:
 *         totalVideos:
 *           type: integer
 *         totalViews:
 *           type: integer
 *         totalFollowers:
 *           type: integer
 *         totalLikes:
 *           type: integer
 */

router.use(authenticate);

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get channel dashboard statistics
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Dashboard stats fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStats'
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
router.route("/stats").get(getDashboardStats);

export default router;
