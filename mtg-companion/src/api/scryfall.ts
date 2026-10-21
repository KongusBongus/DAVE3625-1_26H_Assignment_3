import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card, SearchResponse } from "../types/card";

const BASE = "https://api.scryfall.com";
const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_GAP_MS = 500; // search endpoints: max 2 requests/second

const memory = new Map<string, { time: number; data: unknown }>();
let lastRequest = 0;
let queue: Promise<unknown> = Promise.resolve();

// Run requests one at a time, at least 500 ms apart.
function throttled<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = Math.max(0, lastRequest + MIN_GAP_MS - Date.now());
    if (wait) await new Promise((r) => setTimeout(r, wait));
    lastRequest = Date.now();
    return fn();
  });
  queue = run.catch(() => undefined);
  return run;
}

async function getJson<T>(path: string, useCache = true): Promise<T> {
  const key = "scry:" + path;

  if (useCache) {
    const hit = memory.get(key);
    if (hit && Date.now() - hit.time < DAY_MS) return hit.data as T;

    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() - parsed.time < DAY_MS) {
        memory.set(key, parsed);
        return parsed.data as T;
      }
    }
  }

  const data = await throttled(async () => {
    const res = await fetch(BASE + path, {
      headers: { Accept: "application/json;q=0.9,*/*;q=0.8" },
    });
    if (res.status === 429) {
      throw new Error("Rate limited by Scryfall. Wait 30 seconds and retry.");
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.details ?? `Scryfall error ${res.status}`);
    }
    return (await res.json()) as T;
  });

  if (useCache) {
    const entry = { time: Date.now(), data };
    memory.set(key, entry);
    AsyncStorage.setItem(key, JSON.stringify(entry)).catch(() => {});
  }
  return data;
}

export function searchCards(query: string): Promise<SearchResponse> {
  const q = encodeURIComponent(query.trim());
  return getJson<SearchResponse>(`/cards/search?q=${q}&order=name`);
}

export function autocomplete(query: string): Promise<{ data: string[] }> {
  return getJson(`/cards/autocomplete?q=${encodeURIComponent(query.trim())}`);
}

export function getCardByName(name: string): Promise<Card> {
  return getJson<Card>(`/cards/named?fuzzy=${encodeURIComponent(name)}`);
}

export function getRulings(cardId: string) {
  return getJson<{ data: { published_at: string; comment: string }[] }>(
    `/cards/${cardId}/rulings`
  );
}

// Helper: double-faced cards keep images on card_faces
export function cardImage(card: Card): string | undefined {
  return card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal;
}

export function getRandomCard(): Promise<Card> {
  return getJson<Card>("/cards/random", false);
}

// Artwork only (no frame or text). Double-faced cards keep it on card_faces.
export function cardArt(card: Card): string | undefined {
  return card.image_uris?.art_crop ?? card.card_faces?.[0]?.image_uris?.art_crop;
}

export function cardArtist(card: Card): string | undefined {
  return card.artist ?? card.card_faces?.[0]?.artist;
}