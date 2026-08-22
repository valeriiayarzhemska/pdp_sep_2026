import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-db';
import { MAX_UPLOAD_SIZE_BYTES } from '@/lib/upload-config';

export const runtime = 'nodejs';

// This route stands in for a cloud storage bucket (S3/GCS/etc). It is
// intentionally dumb: it only trusts the token embedded in the presigned
// URL, never a session cookie or auth header — exactly how a real bucket
// behaves, since the browser talks to it directly and never sends your
// app's auth to a third-party storage host.

type RouteParams = { params: Promise<{ key: string[] }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { key: keyParts } = await params;

  const key = keyParts.join('/');
  const token = request.nextUrl.searchParams.get('token');

  const ticket = mockDb.presignTickets.get(key);

  if (!ticket) {
    return NextResponse.json({ error: 'Unknown upload key.' }, { status: 404 });
  }

  if (ticket.token !== token) {
    return NextResponse.json(
      { error: 'Invalid or missing token.' },
      { status: 403 },
    );
  }

  if (ticket.used) {
    return NextResponse.json(
      { error: 'This presigned URL has already been used.' },
      { status: 409 },
    );
  }

  if (Date.now() > ticket.expiresAt) {
    mockDb.presignTickets.delete(key);

    return NextResponse.json(
      { error: 'This presigned URL has expired. Request a new one.' },
      { status: 410 },
    );
  }

  const contentType = request.headers.get('content-type') ?? '';

  if (contentType !== ticket.fileType) {
    return NextResponse.json(
      { error: `Content-Type mismatch. Expected ${ticket.fileType}.` },
      { status: 400 },
    );
  }

  const contentLength = Number(request.headers.get('content-length') ?? '0');

  if (contentLength <= 0 || contentLength > MAX_UPLOAD_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'File exceeds the allowed size.' },
      { status: 413 },
    );
  }

  const arrayBuffer = await request.arrayBuffer();
  const data = Buffer.from(arrayBuffer);

  // Simulate realistic bucket latency so the UI's progress bar has
  // something meaningful to show instead of resolving instantly.
  await new Promise((resolve) =>
    setTimeout(resolve, 500 + Math.random() * 700),
  );

  mockDb.objects.set(key, {
    key,
    fileType: ticket.fileType,
    fileSize: data.byteLength,
    data,
    uploadedAt: Date.now(),
  });
  ticket.used = true;

  const etag = createHash('md5').update(data).digest('hex');

  return NextResponse.json({ ok: true, key, etag }, { status: 200 });
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { key: keyParts } = await params;
  const key = keyParts.join('/');

  const object = mockDb.objects.get(key);

  if (!object) {
    return NextResponse.json({ error: 'Object not found.' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(object.data), {
    status: 200,
    headers: {
      'Content-Type': object.fileType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
