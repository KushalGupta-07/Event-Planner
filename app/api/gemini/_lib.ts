import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const MAX_TEXT_LENGTH = 500;

export type JsonRecord = Record<string, unknown>;

export function getModel(systemInstruction?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: "gemini-1.5-flash",
    ...(systemInstruction ? { systemInstruction } : {}),
  });
}

export function text(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, MAX_TEXT_LENGTH);
}

export function positiveNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 1_000_000) : fallback;
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function parseModelJson<T>(value: string): T {
  const cleaned = value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  return JSON.parse(cleaned) as T;
}
