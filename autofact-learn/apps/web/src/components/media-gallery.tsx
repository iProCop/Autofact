"use client";

import { useState } from "react";

type MediaItem = { id: string; type: string; url: string; sortOrder?: number };

export function MediaGallery({
  items,
  locked,
}: {
  items: MediaItem[];
  locked?: boolean;
}) {
  const photos = items.filter((m) => m.type === "PHOTO" || !m.type || m.type === "photo");
  const videos = items.filter((m) => m.type === "VIDEO" || m.type === "video");
  const [active, setActive] = useState(0);
  const current = photos[active] ?? photos[0];

  if (!items.length) {
    return (
      <div className="card p-4 text-sm text-[var(--muted)]">Медиа пока нет</div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-[16/10] bg-[#0d121a]">
        {current && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt=""
            className={`h-full w-full object-cover ${locked ? "blur-[2px] brightness-75" : ""}`}
          />
        )}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35">
            <span className="rounded-full bg-[var(--elev)] px-3 py-1.5 text-xs font-semibold">
              Галерея после покупки
            </span>
          </div>
        )}
      </div>

      {!locked && photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-2">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(i)}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-xl border ${
                i === active ? "border-[var(--lime)]" : "border-[var(--line)]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {!locked && videos.length > 0 && (
        <div className="space-y-2 border-t border-[var(--line)] p-3">
          <p className="display text-sm font-bold">Видео осмотра</p>
          {videos.map((v) => (
            <video
              key={v.id}
              src={v.url}
              controls
              className="w-full rounded-xl border border-[var(--line)]"
            />
          ))}
        </div>
      )}
    </div>
  );
}
