"use server";

import { randomUUID } from "node:crypto";
import { mockDb } from "@/lib/mock-db";
import {
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
  PRESIGN_EXPIRY_MS,
  isAllowedType,
} from "@/lib/upload-config";
import type {
  AssignAttachmentInput,
  AssignAttachmentResult,
  Attachment,
  DemoRecord,
  RequestUploadUrlInput,
  RequestUploadUrlResult,
} from "@/lib/types";

/**
 * Step 1 of the direct-upload flow: the client asks the backend for a
 * presigned URL before any bytes move. The backend never sees the file here
 * — it only decides *whether* this upload is allowed and issues a
 * short-lived, single-use ticket scoped to one exact file name/type/size.
 */
export async function requestUploadUrl(
  input: RequestUploadUrlInput
): Promise<RequestUploadUrlResult> {
  const { fileName, fileType, fileSize, recordId } = input;

  if (!fileName || !fileType || !recordId) {
    return { ok: false, error: "Missing required fields." };
  }

  if (!isAllowedType(fileType)) {
    return {
      ok: false,
      error: `File type "${fileType}" is not allowed. Accepted: ${ALLOWED_UPLOAD_TYPES.join(", ")}.`,
    };
  }

  if (fileSize <= 0 || fileSize > MAX_UPLOAD_SIZE_BYTES) {
    return {
      ok: false,
      error: `File is too large. Max size is ${MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)}MB.`,
    };
  }

  if (!mockDb.records.has(recordId)) {
    return { ok: false, error: "Unknown record." };
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const key = `uploads/${recordId}/${randomUUID()}-${safeName}`;
  const token = randomUUID();
  const expiresAt = Date.now() + PRESIGN_EXPIRY_MS;

  mockDb.presignTickets.set(key, {
    key,
    token,
    fileName,
    fileType,
    fileSize,
    recordId,
    expiresAt,
    used: false,
  });

  return {
    ok: true,
    // In a real integration this would be a signed S3/GCS URL. Here the
    // Route Handler below plays the role of "the bucket".
    uploadUrl: `/api/mock-storage/${key}?token=${token}`,
    key,
    token,
    expiresAt,
    method: "PUT",
    headers: { "Content-Type": fileType },
  };
}

/**
 * Step 3 of the flow: after the browser has PUT the file straight to
 * storage, it tells the backend "this key now belongs to this record". The
 * backend re-checks that the object actually exists in storage rather than
 * trusting the client's word for it — otherwise a caller could register an
 * attachment for a key it never uploaded.
 */
export async function assignAttachment(
  input: AssignAttachmentInput
): Promise<AssignAttachmentResult> {
  const { key, token, fileName, fileType, fileSize, recordId } = input;

  const ticket = mockDb.presignTickets.get(key);

  if (!ticket || ticket.token !== token) {
    return { ok: false, error: "Unknown or invalid upload ticket." };
  }

  if (ticket.recordId !== recordId) {
    return { ok: false, error: "This upload was not issued for this record." };
  }

  if (!ticket.used || !mockDb.objects.has(key)) {
    return {
      ok: false,
      error: "Upload was not completed — the object does not exist in storage yet.",
    };
  }

  const attachment: Attachment = {
    id: randomUUID(),
    recordId,
    key,
    fileName,
    fileType,
    fileSize,
    url: `/api/mock-storage/${key}`,
    createdAt: Date.now(),
  };

  mockDb.attachments.set(attachment.id, attachment);
  
  return { ok: true, attachment };
}

export async function listAttachments(recordId: string): Promise<Attachment[]> {
  return Array.from(mockDb.attachments.values())
    .filter((a) => a.recordId === recordId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllAttachments(): Promise<Attachment[]> {
  return Array.from(mockDb.attachments.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getDemoRecords(): Promise<DemoRecord[]> {
  return Array.from(mockDb.records.values());
}
