import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import type { ClosingSnapshot } from "../../services/closingPasteParser";

export const runtime = "nodejs";

const snapshotPath = path.join(process.cwd(), "data", "month-end-snapshot.json");

async function readSnapshotFile() {
  try {
    const raw = await readFile(snapshotPath, "utf8");
    return JSON.parse(raw) as ClosingSnapshot;
  } catch {
    return null;
  }
}

function isValidSnapshot(value: unknown): value is ClosingSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<ClosingSnapshot>;
  return Boolean(snapshot.id && snapshot.uploadedAt && snapshot.uploadedBy && Array.isArray(snapshot.issues));
}

export async function GET() {
  const snapshot = await readSnapshotFile();
  return NextResponse.json({ snapshot });
}

export async function POST(request: NextRequest) {
  const snapshot = await request.json();

  if (!isValidSnapshot(snapshot)) {
    return NextResponse.json({ message: "Invalid month-end snapshot" }, { status: 400 });
  }

  await mkdir(path.dirname(snapshotPath), { recursive: true });
  await writeFile(snapshotPath, JSON.stringify(snapshot, null, 2), "utf8");

  return NextResponse.json({ ok: true, snapshot });
}
