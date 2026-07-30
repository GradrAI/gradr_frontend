import { MongoDBDefault } from "./MongoDBDefault";

export type ResourceType =
  | "guide"
  | "question"
  | "answers"
  | "report"
  | "generatedExam"
  | "material";

/** How a source material reached us. */
export type SourceKind = "file" | "url" | "youtube" | "text";

export type IngestStatus = "pending" | "ready" | "failed";

export type Resource = MongoDBDefault & {
  name: string;
  categoryId?: string | null;
  courseId?: string;
  type: ResourceType;
  /** Null for url/youtube/text source materials, which have no file. */
  fileUrl: string | null;
  studentId?: string;
  lecturerId?: string;
  examId?: string;

  // ── Source-material fields (type: "material") ──
  kind?: SourceKind;
  /** Original locator for url/youtube sources. */
  sourceUrl?: string | null;
  /** Characters of normalised text extracted from this source. */
  charCount?: number;
  truncated?: boolean;
  ingestStatus?: IngestStatus;
  /** User-facing reason shown inline when ingestStatus is "failed". */
  failureReason?: string | null;
};

export type CreateSourceBody =
  | { kind: "file"; courseId: string; categoryId?: string; resourceId: string; title?: string }
  | { kind: "url" | "youtube"; courseId: string; categoryId?: string; url: string; title?: string }
  | { kind: "text"; courseId: string; categoryId?: string; text: string; title?: string };
