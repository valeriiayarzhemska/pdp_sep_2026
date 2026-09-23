'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
  formatBytes,
  isAllowedType,
} from '@/lib/upload-config';
import { assignAttachment, requestUploadUrl } from '@/app/actions/uploads';
import type { Attachment, DemoRecord } from '@/lib/types';

type UploadStatus =
  | 'validating'
  | 'requesting-url'
  | 'uploading'
  | 'assigning'
  | 'success'
  | 'error';

type UploadItem = {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
};

function uploadWithProgress(
  url: string,
  file: File,
  headers: Record<string, string>,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('PUT', url, true);

    for (const [name, value] of Object.entries(headers)) {
      xhr.setRequestHeader(name, value);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        let message = `Storage upload failed (HTTP ${xhr.status}).`;

        try {
          const body = JSON.parse(xhr.responseText);

          if (body?.error) {
            message = body.error;
          }
        } catch {
          // ignore parse errors, keep default message
        }

        reject(new Error(message));
      }
    };
    xhr.onerror = () =>
      reject(new Error('Network error while uploading to storage.'));
    xhr.send(file);
  });
}

function validateFile(file: File): string | null {
  if (!isAllowedType(file.type)) {
    return `"${file.type || 'unknown type'}" is not allowed. Accepted: ${ALLOWED_UPLOAD_TYPES.join(', ')}.`;
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return `File is ${formatBytes(file.size)}, which exceeds the ${formatBytes(MAX_UPLOAD_SIZE_BYTES)} limit.`;
  }

  return null;
}

export default function UploadWidget({
  records,
  initialAttachments,
}: {
  records: DemoRecord[];
  initialAttachments: Attachment[];
}) {
  const [recordId, setRecordId] = useState(records[0]?.id ?? '');
  const [items, setItems] = useState<UploadItem[]>([]);
  const [attachments, setAttachments] =
    useState<Attachment[]>(initialAttachments);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const visibleAttachments = useMemo(
    () => attachments.filter((a) => a.recordId === recordId),
    [attachments, recordId],
  );

  const updateItem = useCallback((id: string, patch: Partial<UploadItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
  }, []);

  const runUpload = useCallback(
    async (item: UploadItem, targetRecordId: string) => {
      const validationError = validateFile(item.file);

      if (validationError) {
        updateItem(item.id, { status: 'error', error: validationError });

        return;
      }

      try {
        updateItem(item.id, {
          status: 'requesting-url',
          error: undefined,
          progress: 0,
        });

        const presign = await requestUploadUrl({
          fileName: item.file.name,
          fileType: item.file.type,
          fileSize: item.file.size,
          recordId: targetRecordId,
        });

        if (!presign.ok) {
          updateItem(item.id, { status: 'error', error: presign.error });

          return;
        }

        updateItem(item.id, { status: 'uploading' });

        await uploadWithProgress(
          presign.uploadUrl,
          item.file,
          presign.headers,
          (pct) => updateItem(item.id, { progress: pct }),
        );

        updateItem(item.id, { status: 'assigning' });

        const assigned = await assignAttachment({
          key: presign.key,
          token: presign.token,
          fileName: item.file.name,
          fileType: item.file.type,
          fileSize: item.file.size,
          recordId: targetRecordId,
        });

        if (!assigned.ok) {
          updateItem(item.id, { status: 'error', error: assigned.error });

          return;
        }

        updateItem(item.id, { status: 'success', progress: 100 });
        setAttachments((prev) => [assigned.attachment, ...prev]);
      } catch (err) {
        updateItem(item.id, {
          status: 'error',
          error: err instanceof Error ? err.message : 'Unexpected error.',
        });
      }
    },
    [updateItem],
  );

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const newItems: UploadItem[] = Array.from(fileList).map((file) => ({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        status: 'validating',
        progress: 0,
      }));

      setItems((prev) => [...newItems, ...prev]);
      newItems.forEach((item) => void runUpload(item, recordId));
    },
    [recordId, runUpload],
  );

  const retryItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const target = prev.find((it) => it.id === id);
        
        if (target) {
          void runUpload(target, recordId);
        }

        return prev;
      });
    },
    [recordId, runUpload],
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor="record"
          className="text-sm font-medium text-neutral-300"
        >
          Attach to record
        </label>

        <select
          id="record"
          value={recordId}
          onChange={(e) => setRecordId(e.target.value)}
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-100"
        >
          {records.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length) {
            addFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            inputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-neutral-700 hover:border-neutral-500'
        }`}
      >
        <p className="text-sm text-neutral-300">
          Drag & drop a file here, or{' '}
          <span className="text-blue-400 underline">browse</span>
        </p>

        <p className="mt-1 text-xs text-neutral-500">
          {ALLOWED_UPLOAD_TYPES.join(', ')} · up to{' '}
          {formatBytes(MAX_UPLOAD_SIZE_BYTES)}
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_UPLOAD_TYPES.join(',')}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              addFiles(e.target.files);
            }
            e.target.value = '';
          }}
        />
      </div>

      {items.length > 0 && (
        <ul className="grid gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-neutral-200">
                    {item.file.name}
                  </span>

                  <span className="shrink-0 text-xs text-neutral-500">
                    {formatBytes(item.file.size)}
                  </span>
                </div>

                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${item.status === 'success' ? 100 : item.progress}%`,
                    }}
                  />
                </div>

                <div className="mt-1 flex items-center justify-between">
                  <span
                    className={`text-xs ${
                      item.status === 'error'
                        ? 'text-red-400'
                        : item.status === 'success'
                          ? 'text-emerald-400'
                          : 'text-neutral-500'
                    }`}
                  >
                    {statusLabel(item)}
                  </span>

                  {item.status === 'error' && (
                    <button
                      onClick={() => retryItem(item.id)}
                      className="text-xs font-medium text-blue-400 hover:underline"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-neutral-300">
          Attachments on this record ({visibleAttachments.length})
        </h3>

        {visibleAttachments.length === 0 ? (
          <p className="text-sm text-neutral-500">No attachments yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {visibleAttachments.map((a) => (
              <li
                key={a.id}
                className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60"
              >
                {a.fileType.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.url}
                    alt={a.fileName}
                    className="h-24 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-full items-center justify-center bg-neutral-800 text-2xl">
                    📄
                  </div>
                )}
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-neutral-200">
                    {a.fileName}
                  </p>

                  <p className="text-[11px] text-neutral-500">
                    {formatBytes(a.fileSize)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function statusLabel(item: UploadItem): string {
  switch (item.status) {
    case 'validating':
      return 'Validating…';
    case 'requesting-url':
      return 'Requesting upload URL…';
    case 'uploading':
      return `Uploading… ${item.progress}%`;
    case 'assigning':
      return 'Linking to record…';
    case 'success':
      return 'Uploaded';
    case 'error':
      return item.error ?? 'Failed';
  }
}
