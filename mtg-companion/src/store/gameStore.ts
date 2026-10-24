import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Player {
  id: string;
  name: string;
  life: number;
  poison: number;
  energy: number;
  experience: number;
  commanderDamage: Record<string, number>;
  background?: string; // art_crop URL
  artist?: string;
}

interface GameState {
  players: Player[];
  startingLife: number;
  history: string[];
  newGame: (count: number, startingLife: number) => void;
  changeLife: (id: string, delta: number) => void;
  logLife: (id: string, total: number) => void;
  changeCounter: (id: string, kind: "poison" | "energy" | "experience", delta: number) => void;
  changeCommanderDamage: (id: string, key: string, delta: number) => void;
  rename: (id: string, name: string) => void;
  setBackground: (id: string, url?: string, artist?: string) => void;
}

const makePlayer = (i: number, life: number): Player => ({
  id: `p${i + 1}`,
  name: `Player ${i + 1}`,
  life,
  poison: 0,
  energy: 0,
  experience: 0,
  commanderDamage: {},
});

export const useGame = create<GameState>()(
  persist(
    (set) => ({
      players: [makePlayer(0, 40), makePlayer(1, 40)],
      startingLife: 40,
      history: [],

      newGame: (count, startingLife) =>
        set((s) => ({
          players: Array.from({ length: count }, (_, i) => ({
            ...makePlayer(i, startingLife),
            background: s.players[i]?.background,
            artist: s.players[i]?.artist,
          })),
          startingLife,
          history: [],
        })),

      changeLife: (id, delta) =>
        set((s) => ({
          players: s.players.map((p) => (p.id === id ? { ...p, life: p.life + delta } : p)),
        })),

      logLife: (id, total) =>
        set((s) => ({
          history: [
            `${s.players.find((p) => p.id === id)?.name}: ${total > 0 ? "+" : ""}${total} life`,
            ...s.history,
          ].slice(0, 100),
        })),

      changeCounter: (id, kind, delta) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === id ? { ...p, [kind]: Math.max(0, p[kind] + delta) } : p
          ),
        })),

      // Commander damage counters go from 0 to 21
      changeCommanderDamage: (id, key, delta) =>
        set((s) => ({
          players: s.players.map((p) => {
            if (p.id !== id) return p;
            const current = p.commanderDamage[key] ?? 0;
            const next = Math.min(21, Math.max(0, current + delta));
            return { ...p, commanderDamage: { ...p.commanderDamage, [key]: next } };
          }),
        })),

      rename: (id, name) =>
        set((s) => ({
          players: s.players.map((p) => (p.id === id ? { ...p, name } : p)),
        })),

      setBackground: (id, url, artist) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === id ? { ...p, background: url, artist } : p
          ),
        })),
    }),
    { name: "mtg-game", storage: createJSONStorage(() => AsyncStorage) }
  )
);