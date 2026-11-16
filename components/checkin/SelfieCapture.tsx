"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { saveSelfie, type SelfieState } from "@/app/(checkin)/checkin/actions";
import { buttonClasses } from "@/components/ui/Button";

/*
 * First check-in selfie. Opens the front camera live in the page, so the photo is
 * taken now rather than picked from the camera roll. If the camera is blocked or
 * missing, it falls back to the phone's own camera via a file input (capture="user").
 *
 * The photo is cropped to 4:5 and shrunk to 480x600 JPEG in the browser before it is
 * sent, so it is small to store and quick to upload on gym wifi.
 */

const W = 480;
const H = 600;

function drawCover(source: CanvasImageSource, sw: number, sh: number, mirror: boolean): string {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const scale = Math.max(W / sw, H / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  if (mirror) {
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, (W - dw) / 2, (H - dh) / 2, dw, dh);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function SelfieCapture({ who }: { who: string }) {
  const [state, action, pending] = useActionState<SelfieState, FormData>(saveSelfie, {});
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [mode, setMode] = useState<"starting" | "live" | "fallback">("starting");
  const [photo, setPhoto] = useState<string | null>(null);

  const stop = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);

  const start = useCallback(async () => {
    setPhoto(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setMode("fallback");
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 1200 } },
        audio: false,
      });
      stream.current = s;
      if (video.current) {
        video.current.srcObject = s;
        await video.current.play().catch(() => {});
      }
      setMode("live");
    } catch {
      setMode("fallback");
    }
  }, []);

  useEffect(() => {
    void start();
    return stop;
  }, [start, stop]);

  function snap() {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    setPhoto(drawCover(v, v.videoWidth, v.videoHeight, true));
    stop();
  }

  function fromFile(file: File | undefined) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setPhoto(drawCover(img, img.naturalWidth, img.naturalHeight, false));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  return (
    <div>
      <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-md border border-paper/20 bg-ink-soft">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Your selfie" className="h-full w-full object-cover" />
        ) : (
          <video
            ref={video}
            playsInline
            muted
            className={`h-full w-full -scale-x-100 object-cover ${mode === "live" ? "" : "hidden"}`}
          />
        )}
        {!photo && mode !== "live" ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-steel-300">
            {mode === "starting" ? "Opening your camera..." : "Tap below to take your selfie."}
          </div>
        ) : null}
        {!photo && mode === "live" ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-[12%] rounded-[50%] border-2 border-paper/40" />
        ) : null}
      </div>

      {state.error ? <p className="mt-4 text-center text-sm text-ember">{state.error}</p> : null}

      <div className="mx-auto mt-6 max-w-xs space-y-3">
        {photo ? (
          <form action={action} className="space-y-3">
            <input type="hidden" name="who" value={who} />
            <input type="hidden" name="photo" value={photo} />
            <button type="submit" disabled={pending} className={buttonClasses("primary", true)}>
              {pending ? "Saving..." : "Use this photo"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => (mode === "fallback" ? setPhoto(null) : void start())}
              className={buttonClasses("outline", true)}
            >
              Retake
            </button>
          </form>
        ) : mode === "live" ? (
          <button type="button" onClick={snap} className={buttonClasses("primary", true)}>
            Take photo
          </button>
        ) : mode === "fallback" ? (
          <label className={`${buttonClasses("primary", true)} cursor-pointer`}>
            Open camera
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="sr-only"
              onChange={(e) => fromFile(e.target.files?.[0])}
            />
          </label>
        ) : null}
      </div>
    </div>
  );
}
