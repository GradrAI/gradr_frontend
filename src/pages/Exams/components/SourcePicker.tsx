import { useMemo, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, XIcon } from "lucide-react";

import api from "@/lib/axios";
import useStore from "@/state";
import { createSource, deleteSource, listMaterials } from "@/requests/exam";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "@/requests/constants";
import type { CreateSourceBody, Resource, SourceKind } from "@/types/Resource";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

/** Mirrors MAX_SOURCES_PER_QUIZ on the backend. */
const MAX_SOURCES = 5;
/** Mirrors MIN_SOURCE_TEXT_CHARS on the backend. */
const MIN_TEXT_CHARS = 200;

const KIND_LABELS: Record<SourceKind, string> = {
  file: "File",
  url: "Link",
  youtube: "YouTube",
  text: "Text",
};

/** "840 characters read" / "12.4k characters read". */
const formatCharCount = (charCount?: number) => {
  if (!charCount || charCount <= 0) return "Not read yet";
  if (charCount < 1000) return `${charCount} characters read`;
  return `${(charCount / 1000).toFixed(1)}k characters read`;
};

type SourceFailure = {
  /** Resource id when the backend kept the failed row, else a local key. */
  id: string;
  name: string;
  kind?: SourceKind;
  reason: string;
  /** True when the backend persisted the row and it can be cleaned up. */
  persisted: boolean;
};

type FailurePayload = { error?: unknown; data?: Partial<Resource> };

/**
 * A source the backend could not read comes back as 422 carrying the
 * user-facing reason in `error` and the failed Resource in `data`.
 */
const readSourceFailure = (error: unknown): SourceFailure | null => {
  if (!isAxiosError(error) || error.response?.status !== 422) return null;
  const body: unknown = error.response.data;
  const payload: FailurePayload =
    typeof body === "object" && body !== null ? (body as FailurePayload) : {};
  const resource = payload.data;
  return {
    id: resource?._id ?? `failed-${Date.now()}`,
    name: resource?.name || "Unnamed source",
    kind: resource?.kind,
    reason:
      typeof payload.error === "string" && payload.error
        ? payload.error
        : resource?.failureReason || "This source could not be read.",
    persisted: Boolean(resource?._id),
  };
};

type UploadResponse = { success?: boolean; resources?: Resource[] };

export interface SourcePickerProps {
  courseId: string;
  categoryId?: string;
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  /**
   * Context `POST /upload` needs to file an uploaded material under the right
   * course and category. Only the Upload tab uses it.
   */
  uploadMeta: {
    courseName: string;
    categoryName: string;
    categoryType: string;
    maxScoreAttainable: number;
  };
}

const SourcePicker = ({
  courseId,
  categoryId,
  value,
  onChange,
  disabled = false,
  uploadMeta,
}: SourcePickerProps) => {
  const { user } = useStore();
  const queryClient = useQueryClient();

  const [created, setCreated] = useState<Resource[]>([]);
  const [pendingLabels, setPendingLabels] = useState<string[]>([]);
  const [failures, setFailures] = useState<SourceFailure[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pastedText, setPastedText] = useState("");

  const materialsQuery = useQuery({
    queryKey: ["materials", courseId],
    queryFn: async () => {
      try {
        return await listMaterials(user?.role || "lecturer", courseId);
      } catch (error) {
        // The endpoint 404s when the course has no materials yet.
        if (isAxiosError(error) && error.response?.status === 404) {
          return [] as Resource[];
        }
        throw error;
      }
    },
    enabled: Boolean(courseId),
    refetchOnWindowFocus: false,
  });

  const library = materialsQuery.data ?? [];

  /** Every resource we know anything about, newest write winning. */
  const known = useMemo(() => {
    const byId = new Map<string, Resource>();
    library.forEach((resource) => byId.set(resource._id, resource));
    created.forEach((resource) => byId.set(resource._id, resource));
    return byId;
  }, [library, created]);

  const busy = pendingLabels.length > 0;
  const atMax = value.length >= MAX_SOURCES;
  const locked = disabled || busy || atMax || !courseId;

  const finishPending = (label: string) =>
    setPendingLabels((labels) => {
      const index = labels.indexOf(label);
      if (index === -1) return labels;
      return [...labels.slice(0, index), ...labels.slice(index + 1)];
    });

  const addSource = async (body: CreateSourceBody, label: string) => {
    setPendingLabels((labels) => [...labels, label]);
    try {
      const resource = await createSource(body);
      setCreated((previous) => [
        ...previous.filter((r) => r._id !== resource._id),
        resource,
      ]);
      if (!value.includes(resource._id)) onChange([...value, resource._id]);
      queryClient.invalidateQueries({ queryKey: ["materials", courseId] });
      return true;
    } catch (error) {
      const failure = readSourceFailure(error);
      if (failure) {
        setFailures((previous) => [
          ...previous.filter((f) => f.id !== failure.id),
          failure,
        ]);
      } else {
        toast.error("Could not add that source. Please try again.");
      }
      return false;
    } finally {
      finishPending(label);
    }
  };

  const handleFiles = async (files: FileList) => {
    const chosen = Array.from(files);
    if (!chosen.length) return;

    if (!uploadMeta.categoryName || !uploadMeta.categoryType) {
      toast.error("Set the category name and type before uploading a file.");
      return;
    }
    if (value.length + chosen.length > MAX_SOURCES) {
      toast.error(`You can use at most ${MAX_SOURCES} sources per quiz.`);
      return;
    }
    const tooLarge = chosen.find((file) => file.size > MAX_FILE_SIZE);
    if (tooLarge) {
      toast.error(`"${tooLarge.name}" is larger than 50MB.`);
      return;
    }
    const wrongType = chosen.find(
      (file) => !ACCEPTED_FILE_TYPES.includes(file.type)
    );
    if (wrongType) {
      toast.error(`"${wrongType.name}" is not a supported file type.`);
      return;
    }

    const label = chosen.map((file) => file.name).join(", ");
    setPendingLabels((labels) => [...labels, label]);

    try {
      const formData = new FormData();
      chosen.forEach((file) => formData.append("file", file));
      formData.append("lecturerId", user?._id || "");
      formData.append("name", uploadMeta.courseName);
      formData.append("fileType", "material");
      formData.append("categoryName", uploadMeta.categoryName);
      formData.append("categoryType", uploadMeta.categoryType);
      formData.append(
        "maxScoreAttainable",
        String(uploadMeta.maxScoreAttainable)
      );
      formData.append("uploader", JSON.stringify(user));
      formData.append("uploaderType", "lecturer");

      const response = await api.post<UploadResponse>("/upload", formData);
      const uploaded = response.data?.resources ?? [];
      if (!uploaded.length) {
        toast.error("Upload failed. Please try again.");
        return;
      }
      finishPending(label);

      for (const resource of uploaded) {
        await addSource(
          { kind: "file", courseId, categoryId, resourceId: resource._id },
          resource.name || resource._id
        );
      }
    } catch (error) {
      const failure = readSourceFailure(error);
      if (failure) {
        setFailures((previous) => [...previous, failure]);
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } finally {
      finishPending(label);
    }
  };

  const handleAddLink = async (kind: "url" | "youtube") => {
    const raw = (kind === "url" ? linkUrl : youtubeUrl).trim();
    if (!raw) return;
    const ok = await addSource({ kind, courseId, categoryId, url: raw }, raw);
    if (ok) {
      if (kind === "url") setLinkUrl("");
      else setYoutubeUrl("");
    }
  };

  const handleAddText = async () => {
    const text = pastedText.trim();
    if (text.length < MIN_TEXT_CHARS) return;
    const ok = await addSource(
      { kind: "text", courseId, categoryId, text },
      "Pasted text"
    );
    if (ok) setPastedText("");
  };

  const dismissFailure = (failure: SourceFailure) => {
    setFailures((previous) => previous.filter((f) => f.id !== failure.id));
    if (failure.persisted) {
      // The row is unusable; drop it so it never clutters the library.
      deleteSource(failure.id).catch(() => undefined);
    }
  };

  const toggleLibrary = (resourceId: string, checked: boolean) => {
    if (!checked) {
      onChange(value.filter((id) => id !== resourceId));
      return;
    }
    if (value.includes(resourceId)) return;
    if (value.length >= MAX_SOURCES) {
      toast.error(`You can use at most ${MAX_SOURCES} sources per quiz.`);
      return;
    }
    onChange([...value, resourceId]);
  };

  const libraryReady = library.filter(
    (resource) => (resource.ingestStatus ?? "ready") === "ready"
  );

  const textShortfall = pastedText.trim().length;

  return (
    <div className="space-y-4 min-w-0">
      <Tabs defaultValue="upload" className="w-full min-w-0">
        <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="link">Link</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="text">Paste text</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-2">
          <Label htmlFor="source-file-input">Upload a document</Label>
          <div className="flex items-center gap-2 min-w-0">
            <Input
              id="source-file-input"
              type="file"
              multiple
              accept={ACCEPTED_FILE_TYPES.join(",")}
              className="bg-background min-w-0"
              disabled={locked}
              onChange={(event) => {
                if (event.target.files) handleFiles(event.target.files);
                event.target.value = "";
              }}
            />
            {busy && <Loader2Icon className="h-4 w-4 shrink-0 animate-spin" />}
          </div>
          <p className="text-[11px] text-muted-foreground">
            PDF files up to 50MB. We read the text, tables and diagram captions.
          </p>
        </TabsContent>

        <TabsContent value="link" className="space-y-2">
          <Label htmlFor="source-link-input">Web page or document link</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
            <Input
              id="source-link-input"
              type="url"
              inputMode="url"
              placeholder="https://example.com/article"
              className="bg-background min-w-0"
              value={linkUrl}
              disabled={locked}
              onChange={(event) => setLinkUrl(event.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              disabled={locked || !linkUrl.trim()}
              onClick={() => handleAddLink("url")}
            >
              Add
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Any public web page, article, or tutorial — or a Google Doc/Drive
            file shared with "Anyone with the link".
          </p>
        </TabsContent>

        <TabsContent value="youtube" className="space-y-2">
          <Label htmlFor="source-youtube-input">YouTube video link</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
            <Input
              id="source-youtube-input"
              type="url"
              inputMode="url"
              placeholder="https://www.youtube.com/watch?v=..."
              className="bg-background min-w-0"
              value={youtubeUrl}
              disabled={locked}
              onChange={(event) => setYoutubeUrl(event.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              disabled={locked || !youtubeUrl.trim()}
              onClick={() => handleAddLink("youtube")}
            >
              Add
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Public videos up to 45 minutes. We read the captions automatically.
          </p>
        </TabsContent>

        <TabsContent value="text" className="space-y-2">
          <Label htmlFor="source-text-input">Paste your material</Label>
          <Textarea
            id="source-text-input"
            rows={5}
            placeholder="Paste lecture notes, an outline, or any text the quiz should be based on."
            className="bg-background min-w-0"
            value={pastedText}
            disabled={locked}
            onChange={(event) => setPastedText(event.target.value)}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p
              className={`text-[11px] ${
                textShortfall < MIN_TEXT_CHARS
                  ? "text-muted-foreground"
                  : "text-foreground"
              }`}
              aria-live="polite"
            >
              {textShortfall} / {MIN_TEXT_CHARS} minimum
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={locked || textShortfall < MIN_TEXT_CHARS}
              onClick={handleAddText}
            >
              Add
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {!courseId && (
        <p className="text-[11px] text-muted-foreground">
          Select a course first, then add the material this quiz is built from.
        </p>
      )}

      {atMax && (
        <p className="text-[11px] font-medium text-amber-600 dark:text-amber-500">
          Maximum of 5 sources
        </p>
      )}

      {libraryReady.length > 0 && (
        <fieldset className="space-y-2 rounded-md border p-3 min-w-0">
          <legend className="px-1 text-xs font-medium text-muted-foreground">
            Reuse a source from this course
          </legend>
          {libraryReady.map((resource) => {
            const selected = value.includes(resource._id);
            return (
              <div
                key={resource._id}
                className="flex items-center gap-2 min-w-0"
              >
                <Checkbox
                  id={`library-${resource._id}`}
                  checked={selected}
                  disabled={disabled || (atMax && !selected)}
                  onCheckedChange={(checked) =>
                    toggleLibrary(resource._id, checked === true)
                  }
                />
                <Label
                  htmlFor={`library-${resource._id}`}
                  className="min-w-0 flex-1 truncate text-xs font-normal"
                >
                  {resource.name || "Untitled source"}
                  <span className="ml-2 text-muted-foreground">
                    {formatCharCount(resource.charCount)}
                  </span>
                </Label>
              </div>
            );
          })}
        </fieldset>
      )}

      <ul aria-live="polite" className="space-y-2 min-w-0">
        {value.map((resourceId) => {
          const resource = known.get(resourceId);
          const name = resource?.name || "Untitled source";
          const kind = resource?.kind ?? "file";
          return (
            <li
              key={resourceId}
              className="flex items-center gap-2 rounded-md border bg-background p-2 min-w-0 dark:bg-zinc-900"
            >
              <Badge variant="secondary" className="shrink-0">
                {KIND_LABELS[kind]}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatCharCount(resource?.charCount)}
                  {resource?.truncated ? " (truncated)" : ""}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label={`Remove ${name}`}
                disabled={disabled}
                onClick={() =>
                  onChange(value.filter((id) => id !== resourceId))
                }
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </li>
          );
        })}

        {failures.map((failure) => (
          <li
            key={failure.id}
            className="flex items-start gap-2 rounded-md border border-destructive/40 p-2 min-w-0"
          >
            <Badge variant="destructive" className="shrink-0">
              {failure.kind ? KIND_LABELS[failure.kind] : "Failed"}
            </Badge>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{failure.name}</p>
              <p className="text-[11px] text-destructive" role="alert">
                {failure.reason}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label={`Remove ${failure.name}`}
              onClick={() => dismissFailure(failure)}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </li>
        ))}

        {pendingLabels.map((label) => (
          <li key={`pending-${label}`} className="min-w-0">
            <Skeleton className="h-12 w-full rounded-md" />
            <span className="sr-only">Reading {label}</span>
          </li>
        ))}
      </ul>

      {value.length === 0 && failures.length === 0 && !busy && (
        <p className="text-[11px] italic text-muted-foreground">
          No sources added yet. The quiz is generated only from what you add
          here.
        </p>
      )}
    </div>
  );
};

export default SourcePicker;
