export type PresignTicket = {
  key: string;
  token: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  recordId: string;
  expiresAt: number;
  used: boolean;
};

export type StoredObject = {
  key: string;
  fileType: string;
  fileSize: number;
  data: Buffer;
  uploadedAt: number;
};

export type Attachment = {
  id: string;
  recordId: string;
  key: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  createdAt: number;
};

export type DemoRecord = {
  id: string;
  title: string;
};

export type RequestUploadUrlInput = {
  fileName: string;
  fileType: string;
  fileSize: number;
  recordId: string;
};

export type RequestUploadUrlResult =
  | {
      ok: true;
      uploadUrl: string;
      key: string;
      token: string;
      expiresAt: number;
      method: 'PUT';
      headers: Record<string, string>;
    }
  | { ok: false; error: string };

export type AssignAttachmentInput = {
  key: string;
  token: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  recordId: string;
};

export type AssignAttachmentResult =
  { ok: true; attachment: Attachment } | { ok: false; error: string };
