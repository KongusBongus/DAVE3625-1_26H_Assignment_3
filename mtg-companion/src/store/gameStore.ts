import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
  changeCommanderDamage: (id: string, fromId: string, delta: number) => void;
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

      // Silent: called on every tick while a button is held
      changeLife: (id, delta) =>
        set((s) => ({
          players: s.players.map((p) => (p.id === id ? { ...p, life: p.life + delta } : p)),
        })),

      // One history line per press, with the total change
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

      changeCommanderDamage: (id, fromId, delta) =>
        set((s) => ({
          players: s.players.map((p) => {
            if (p.id !== id) return p;
            const current = p.commanderDamage[fromId] ?? 0;
            const next = Math.max(0, current + delta);
            return {
              ...p,
              life: p.life - (next - current),
              commanderDamage: { ...p.commanderDamage, [fromId]: next },
            };
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