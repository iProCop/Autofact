"use client";

import { Star } from "lucide-react";
import type { DemoExpert } from "@/lib/demo-data";

type Expert = {
  id: string;
  fullName: string;
  rating: number;
  inspectionsCount: number;
  salesCount: number;
  region: string;
  city: string;
  specializations?: string[];
  avatarUrl?: string;
  priceLabel?: string;
};

type Props = {
  expert: Expert | DemoExpert;
  favorited?: boolean;
  onToggleFavorite?: () => void;
  priceLabel?: string;
};

export function ExpertCard({
  expert,
  favorited,
  onToggleFavorite,
  priceLabel,
}: Props) {
  const price =
    priceLabel ??
    ("priceLabel" in expert && expert.priceLabel ? expert.priceLabel : "3000₽");
  const avatar =
    ("avatarUrl" in expert && expert.avatarUrl) ||
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=300&q=80";

  return (
    <article className="card relative flex gap-3 p-3">
      <button
        type="button"
        className="absolute right-3 top-3 z-10"
        onClick={onToggleFavorite}
        aria-label="Избранное"
      >
        <Star
          size={18}
          fill={favorited ? "var(--star)" : "none"}
          color={favorited ? "var(--star)" : "#9aa6b5"}
        />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatar}
        alt=""
        className="h-[118px] w-[100px] shrink-0 rounded-2xl object-cover"
      />

      <div className="min-w-0 flex-1 pr-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="display text-[16px] font-bold underline-lime">
            {expert.fullName.split(" ").slice(-1)[0] || "Эксперт"}
          </h3>
          <span className="grade grade-a">
            {expert.rating.toFixed(1).replace(".", ",")}
          </span>
        </div>

        <ul className="mt-2 space-y-1 text-[12px] text-[var(--muted)]">
          <li>• {expert.fullName}</li>
          <li>
            • <span className="lime font-semibold">{expert.salesCount}</span>{" "}
            завершённые сделки
          </li>
          <li>
            • Проверено машин:{" "}
            <span className="lime font-semibold">{expert.inspectionsCount}</span>
          </li>
          <li>
            • Рейтинг: ⭐{" "}
            <span className="lime font-semibold">
              {expert.rating.toFixed(1).replace(".", ",")}
            </span>
          </li>
          <li>
            • {expert.city}, {expert.region}
          </li>
        </ul>

        <div className="mt-3 flex justify-end">
          <span className="price-pill">{price}</span>
        </div>
      </div>
    </article>
  );
}
