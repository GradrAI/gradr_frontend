import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { Loader2Icon, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { VIVA_LANGUAGE_LABELS } from "@/lib/vivaLanguages";
import { uploadVivaRecording } from "@/requests/exam";
import type { VivaLanguage } from "@/types/Attempt";

/** Recordings stop on their own after two minutes. */
const MAX_RECORDING_MS = 120_000;
/** English is always requested; students add at most this many more. */
const MAX_EXTRA_LANGS = 2;
const EXTRA_LANGS: VivaLanguage[] = ["pcm", "yo", "ha", "ig", "sw", "rw", "zu", "af"];

type RecorderState =
  | "idle"
  | "recording"
  | "processing"
  | "processed"
  | "no_speech"
  | "failed"
  | "limit"
  | "rate_limited";

const STATUS_COPY: Partial<Record<RecorderState, string>> = {
  processing: "Processing…",
  processed: "Explanation received",
  no_speech: "No speech detected — try again",
  failed: "Couldn't process this recording; your written answer still counts",
  limit: "Recording limit reached",
  rate_limited: "Too many recordings — wait a minute and try again",
};

/** The first container this browser's MediaRecorder can produce, or "" for its default. */
const pickMimeType = () =>
  ["audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type)) ?? "";

type VivaRecorderProps = { attemptId: string; questionId: string };

/**
 * Lets a student record a spoken explanation of an essay answer for their
 * teacher. Purely advisory: every failure is reported inline and never
 * blocks the written answer or submission.
 */
const VivaRecorder = ({ attemptId, questionId }: VivaRecorderProps) => {
  const [consent, setConsent] = useState(false);
  const [extraLangs, setExtraLangs] = useState<VivaLanguage[]>(["pcm"]);
  const [state, setState] = useState<RecorderState>("idle");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const stopTimerRef = useRef<number | undefined>(undefined);

  // Release the microphone if the student leaves the question mid-recording.
  useEffect(
    () => () => {
      clearTimeout(stopTimerRef.current);
      const recorder = recorderRef.current;
      if (recorder) {
        recorder.onstop = null;
        if (recorder.state !== "inactive") recorder.stop();
        recorder.stream.getTracks().forEach((track) => track.stop());
      }
    },
    []
  );

  const toggleLang = (lang: VivaLanguage) => {
    setExtraLangs((prev) =>
      prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : prev.length < MAX_EXTRA_LANGS
          ? [...prev, lang]
          : prev
    );
  };

  const upload = async (blob: Blob) => {
    setState("processing");
    try {
      const { status } = await uploadVivaRecording(attemptId, questionId, blob, [
        "en",
        ...extraLangs,
      ]);
      setState(status);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 429) {
        const code = error.response.data?.error ?? error.response.data?.message;
        setState(code === "VIVA_RATE_LIMITED" ? "rate_limited" : "limit");
      } else {
        setState("failed");
      }
    }
  };

  const startRecording = async () => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setState("failed");
      return;
    }
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => {
      clearTimeout(stopTimerRef.current);
      stream.getTracks().forEach((track) => track.stop());
      recorderRef.current = null;
      void upload(
        new Blob(chunks, { type: mimeType || recorder.mimeType.split(";")[0] })
      );
    };
    recorderRef.current = recorder;
    recorder.start();
    setState("recording");
    stopTimerRef.current = window.setTimeout(() => recorder.stop(), MAX_RECORDING_MS);
  };

  const busy = state === "recording" || state === "processing";
  const statusCopy = STATUS_COPY[state];

  return (
    <div className="space-y-3 rounded-md border p-3">
      <p className="text-sm font-medium">Explain your answer out loud (optional)</p>

      <div className="flex items-start gap-2">
        <Checkbox
          id={`viva-consent-${questionId}`}
          checked={consent}
          disabled={busy}
          onCheckedChange={(checked) => setConsent(checked === true)}
        />
        <Label
          htmlFor={`viva-consent-${questionId}`}
          className="text-xs font-normal leading-snug"
        >
          I agree to have my spoken explanation transcribed and assessed by AI
          for my teacher. The audio is not stored.
        </Label>
      </div>

      <div
        role="group"
        aria-label="Languages you will speak"
        className="flex flex-wrap gap-1.5"
      >
        <span className="rounded-full border bg-primary/15 px-3 py-1 text-xs font-medium">
          {VIVA_LANGUAGE_LABELS.en}
        </span>
        {EXTRA_LANGS.map((lang) => {
          const selected = extraLangs.includes(lang);
          return (
            <button
              key={lang}
              type="button"
              aria-pressed={selected}
              disabled={busy || (!selected && extraLangs.length >= MAX_EXTRA_LANGS)}
              onClick={() => toggleLang(lang)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                selected ? "border-primary bg-primary/15" : "bg-background"
              }`}
            >
              {VIVA_LANGUAGE_LABELS[lang]}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {state === "recording" ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => recorderRef.current?.stop()}
          >
            <Square className="mr-2 h-4 w-4" /> Stop recording
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!consent || state === "processing" || state === "limit"}
            onClick={startRecording}
          >
            <Mic className="mr-2 h-4 w-4" /> Record explanation
          </Button>
        )}
        {statusCopy && (
          <span role="status" className="flex items-center text-sm text-muted-foreground">
            {state === "processing" && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            {statusCopy}
          </span>
        )}
      </div>
    </div>
  );
};

export default VivaRecorder;
