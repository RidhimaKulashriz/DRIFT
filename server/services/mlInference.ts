import { z } from "zod";
import { scoreZeroError, type DefectKind } from "./scoring";

export type InferenceInput = {
  fileName: string;
  latitude: number;
  longitude: number;
  assetCriticality: number;
  priorOpenDefects: number;
  demo?: boolean;
  imageBase64?: string;
};

export type InferenceResult = {
  model: string;
  label: DefectKind;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
  severityInput: Record<string, number>;
  score: ReturnType<typeof scoreZeroError>;
  annotationNote: string;
  source: "production-cv" | "deterministic-fallback";
};

const cvResponseSchema = z.object({
  model: z.string().min(1).max(200),
  label: z.enum(["pothole", "crack", "structural"]),
  confidence: z.number().min(0).max(1),
  boundingBox: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100), width: z.number().min(0).max(100), height: z.number().min(0).max(100) }),
});

function fallbackInference(input: InferenceInput): InferenceResult {
  const normalized = input.fileName.toLowerCase();
  const label: DefectKind = normalized.includes("crack") ? "crack" : normalized.includes("struct") || normalized.includes("bridge") ? "structural" : "pothole";
  const seed = Array.from(input.fileName).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const confidence = Math.min(0.97, 0.76 + (seed % 20) / 100);
  const score = scoreZeroError({ defectType: label, confidence, latitude: input.latitude, longitude: input.longitude, assetCriticality: input.assetCriticality, priorOpenDefects: input.priorOpenDefects, observationCount: 1 + (seed % 3) });
  return { model: input.demo ? "DRIFT-CV simulator adapter v1" : "DRIFT-CV deterministic fallback v1", label, confidence, boundingBox: { x: 18 + (seed % 22), y: 20 + (seed % 17), width: 38, height: 29 }, severityInput: { confidence, assetCriticality: input.assetCriticality, priorOpenDefects: input.priorOpenDefects }, score, annotationNote: `Detected ${label} candidate from ${input.demo ? "reproducible simulator evidence" : "fallback inference"}; manual engineer review is required before work-order release.`, source: "deterministic-fallback" };
}

async function callProductionCv(input: InferenceInput): Promise<z.infer<typeof cvResponseSchema> | null> {
  const endpoint = process.env.ML_INFERENCE_URL;
  if (!endpoint || !input.imageBase64 || input.demo) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: { "content-type": "application/json", accept: "application/json", ...(process.env.ML_INFERENCE_TOKEN ? { authorization: `Bearer ${process.env.ML_INFERENCE_TOKEN}` } : {}) },
      body: JSON.stringify({ fileName: input.fileName, imageBase64: input.imageBase64, latitude: input.latitude, longitude: input.longitude }),
    });
    if (!response.ok) return null;
    const parsed = cvResponseSchema.safeParse(await response.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function runVisionInference(input: InferenceInput): Promise<InferenceResult> {
  const production = await callProductionCv(input);
  if (!production) return fallbackInference(input);
  const score = scoreZeroError({ defectType: production.label, confidence: production.confidence, latitude: input.latitude, longitude: input.longitude, assetCriticality: input.assetCriticality, priorOpenDefects: input.priorOpenDefects, observationCount: 1 });
  return { ...production, severityInput: { confidence: production.confidence, assetCriticality: input.assetCriticality, priorOpenDefects: input.priorOpenDefects }, score, annotationNote: `Detected ${production.label} candidate using ${production.model}; ZeroError prioritization is advisory and requires human review.`, source: "production-cv" };
}
