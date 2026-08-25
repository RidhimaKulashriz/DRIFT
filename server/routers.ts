import crypto from "node:crypto";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { acknowledgeAlert, addReview, addTelemetryRecord, createAssetRecord, createDemoMissionRecord, createEvidenceRecord, deleteAssetRecord, getMapData, getMissionOverview, listAlerts, listAssets, listAuditEvents, listDemoEvidence, listFilteredDefects, listMissionEvidence, listReportRecords, persistInferenceDefect, updateAssetRecord } from "./db";
import { requireDriftRole } from "./services/authorization";
import { generateDecisionNarrative } from "./services/aiDecision";
import { probeHardwareConnection, validateTelemetryPayload } from "./services/hardwareAdapter";
import { runVisionInference } from "./services/mlInference";
import { buildSimulatorMission } from "./services/simulator";
import { storagePut } from "./storage";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  drift: router({
    overview: publicProcedure.query(() => getMissionOverview()),
    hardwareStatus: publicProcedure.query(() => probeHardwareConnection()),
    validateTelemetry: protectedProcedure.input(z.unknown()).mutation(({ input }) => validateTelemetryPayload(input)),
    ingestTelemetry: protectedProcedure.input(z.object({ missionId: z.number().int().positive(), latitude: z.number(), longitude: z.number(), altitude: z.number().nonnegative(), speedMps: z.number().nonnegative(), batteryPercent: z.number().min(0).max(100), timestamp: z.number().int().positive() })).mutation(async ({ input }) => {
      const validation = validateTelemetryPayload(input);
      if (!validation.valid) throw new Error(validation.message);
      return addTelemetryRecord(input);
    }),
    runSimulator: publicProcedure.input(z.object({ name: z.string().min(3).max(180).default("Demo corridor patrol") })).mutation(async ({ ctx, input }) => {
      const simulator = await buildSimulatorMission(input.name);
      const record = await createDemoMissionRecord({ name: input.name, createdBy: ctx.user?.id ?? null, simulator });
      return { ...record, findings: simulator.findings, telemetry: simulator.telemetry };
    }),
    inferEvidence: protectedProcedure.input(z.object({ fileName: z.string().min(1), latitude: z.number(), longitude: z.number(), assetCriticality: z.number().int().min(1).max(5), priorOpenDefects: z.number().int().min(0).max(20), demo: z.boolean().default(false) })).mutation(({ input }) => runVisionInference(input)),
    decisionSupport: protectedProcedure.input(z.object({ defectType: z.string(), location: z.string(), missionName: z.string(), score: z.object({ score: z.number(), severity: z.enum(["low", "medium", "high", "critical"]), urgency: z.string(), explanation: z.array(z.string()), repairEstimateCents: z.number() }) })).mutation(({ input }) => generateDecisionNarrative(input)),
    evidence: router({
      list: protectedProcedure.input(z.object({ missionId: z.number().int().positive() })).query(({ input }) => listMissionEvidence(input.missionId)),
      demoList: publicProcedure.input(z.object({ missionId: z.number().int().positive() })).query(({ input }) => listDemoEvidence(input.missionId)),
      upload: protectedProcedure.input(z.object({ missionId: z.number().int().positive(), fileName: z.string().min(1).max(255), mimeType: z.string().min(3).max(120), base64: z.string().min(8), mediaKind: z.enum(["photo", "video", "annotation", "report"]), latitude: z.string().optional(), longitude: z.string().optional(), playbackSeconds: z.number().int().nonnegative().optional(), assetId: z.number().int().positive().optional(), assetCriticality: z.number().int().min(1).max(5).optional(), priorOpenDefects: z.number().int().min(0).max(100).optional(), runInference: z.boolean().default(true), capturedAt: z.number().int().positive().optional(), cameraId: z.string().max(120).optional() })).mutation(async ({ ctx, input }) => {
        const bytes = Buffer.from(input.base64.split(",").pop() ?? "", "base64");
        if (bytes.byteLength === 0 || bytes.byteLength > 50 * 1024 * 1024) throw new Error("Evidence upload must be between 1 byte and 50 MB.");
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const stored = await storagePut(`drift/${ctx.user.id}/missions/${input.missionId}/${Date.now()}-${safeName}`, bytes, input.mimeType);
        const evidenceRecord = await createEvidenceRecord({ missionId: input.missionId, uploadedBy: ctx.user.id, fileName: input.fileName, mimeType: input.mimeType, storageKey: stored.key, storageUrl: stored.url, mediaKind: input.mediaKind, latitude: input.latitude, longitude: input.longitude, playbackSeconds: input.playbackSeconds, source: "upload", sha256: crypto.createHash("sha256").update(bytes).digest("hex"), capturedAt: input.capturedAt ? new Date(input.capturedAt) : undefined, cameraId: input.cameraId });
        if (input.mediaKind !== "photo" || !input.runInference || !input.assetId || !input.assetCriticality || !input.latitude || !input.longitude) return { ...evidenceRecord, inference: null };
        const inference = await runVisionInference({ fileName: input.fileName, imageBase64: input.base64, latitude: Number(input.latitude), longitude: Number(input.longitude), assetCriticality: input.assetCriticality, priorOpenDefects: input.priorOpenDefects ?? 0 });
        const persisted = await persistInferenceDefect({ missionId: input.missionId, assetId: input.assetId, evidenceId: evidenceRecord.id, latitude: Number(input.latitude), longitude: Number(input.longitude), inference, createdBy: ctx.user.id });
        return { ...evidenceRecord, inference: persisted };
      }),
    }),
    assets: router({
      list: publicProcedure.query(() => listAssets()),
      create: protectedProcedure.input(z.object({ name: z.string().min(3).max(160), assetType: z.enum(["bridge", "road", "rail", "building", "utility"]), locality: z.string().min(3).max(160), latitude: z.string().min(3), longitude: z.string().min(3), criticality: z.number().int().min(1).max(5) })).mutation(({ ctx, input }) => { requireDriftRole(ctx.user, ["admin"]); return createAssetRecord(input); }),
      update: protectedProcedure.input(z.object({ id: z.number().int().positive(), name: z.string().min(3).max(160).optional(), assetType: z.enum(["bridge", "road", "rail", "building", "utility"]).optional(), locality: z.string().min(3).max(160).optional(), latitude: z.string().min(3).optional(), longitude: z.string().min(3).optional(), criticality: z.number().int().min(1).max(5).optional(), status: z.enum(["operational", "watch", "restricted", "closed"]).optional() })).mutation(({ ctx, input }) => { requireDriftRole(ctx.user, ["admin"]); const { id, ...changes } = input; return updateAssetRecord(id, changes); }),
      delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => { requireDriftRole(ctx.user, ["admin"]); return deleteAssetRecord(input.id); }),
    }),
    filters: router({
      defects: publicProcedure.input(z.object({ assetId: z.number().int().positive().optional(), missionId: z.number().int().positive().optional(), defectType: z.enum(["pothole", "crack", "structural"]).optional(), severity: z.enum(["low", "medium", "high", "critical"]).optional(), status: z.enum(["detected", "under_review", "verified", "scheduled", "resolved", "dismissed"]).optional(), reviewState: z.enum(["pending", "approved", "overridden", "rejected"]).optional() })).query(({ input }) => listFilteredDefects(input)),
      mapData: publicProcedure.input(z.object({ assetId: z.number().int().positive().optional(), missionId: z.number().int().positive().optional(), defectType: z.enum(["pothole", "crack", "structural"]).optional(), severity: z.enum(["low", "medium", "high", "critical"]).optional(), status: z.enum(["detected", "under_review", "verified", "scheduled", "resolved", "dismissed"]).optional(), reviewState: z.enum(["pending", "approved", "overridden", "rejected"]).optional() })).query(({ input }) => getMapData(input)),
    }),
    alerts: router({
      list: publicProcedure.query(() => listAlerts()),
      acknowledge: protectedProcedure.input(z.object({ alertId: z.number().int().positive() })).mutation(({ ctx, input }) => { requireDriftRole(ctx.user, ["admin", "engineer", "user"]); return acknowledgeAlert(input.alertId, ctx.user.id); }),
    }),
    reports: router({ list: publicProcedure.query(() => listReportRecords()) }),
    workspace: protectedProcedure.query(({ ctx }) => { const role = ctx.user.role; return { role, permissions: role === "admin" ? ["asset:create", "asset:update", "asset:delete", "review", "audit", "alert:acknowledge"] : role === "engineer" || role === "user" ? ["review", "audit", "alert:acknowledge"] : ["public:read"] }; }),
    audit: router({ list: protectedProcedure.input(z.object({ missionId: z.number().int().positive().optional() }).optional()).query(({ ctx, input }) => { requireDriftRole(ctx.user, ["admin", "engineer", "user"]); return listAuditEvents(input?.missionId); }) }),
    review: protectedProcedure.input(z.object({ defectId: z.number().int().positive(), decision: z.enum(["approve", "override", "reject", "needs_site_visit"]), priorityOverride: z.enum(["low", "medium", "high", "critical"]).optional(), note: z.string().min(4).max(2000) })).mutation(({ ctx, input }) => { requireDriftRole(ctx.user, ["admin", "engineer", "user"]); return addReview({ ...input, reviewerId: ctx.user.id }); }),
  }),
});

export type AppRouter = typeof appRouter;
