import { useState } from "react";
import { View, Text, TextInput, Pressable, Image, StyleSheet } from "react-native";
import { Player, useGame } from "../store/gameStore";
import HoldButton from "./HoldButton";
import BackgroundPicker from "./BackgroundPicker";
import CommanderDamageModal from "./CommanderDamageModal";

export default function PlayerPanel({ player }: { player: Player }) {
  const { changeLife, logLife, changeCounter, rename, setBackground } = useGame();
  const [picking, setPicking] = useState(false);
  const [cmdr, setCmdr] = useState(false);

  const maxCmdr = Math.max(0, ...Object.values(player.commanderDamage));
  const dead = player.life <= 0 || player.poison >= 10 || maxCmdr >= 21;

  return (
    <View style={[styles.panel, dead && styles.dead]}>
      {player.background && (
        <Image source={{ uri: player.background }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      )}
      <View style={styles.overlay} pointerEvents="none" />

      {/* Big touch zones: left half = lose life, right half = gain life */}
      <View style={[StyleSheet.absoluteFill, styles.zones]}>
        <HoldButton
          label="-"
          style={styles.zone}
          onStep={(n) => changeLife(player.id, -n)}
          onRelease={(t) => logLife(player.id, -t)}
        />
        <HoldButton
          label="+"
          style={styles.zone}
          onStep={(n) => changeLife(player.id, n)}
          onRelease={(t) => logLife(player.id, t)}
        />
      </View>

      {/* Life total in the middle (does not block touches) */}
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.life}>{player.life}</Text>
        {dead && <Text style={styles.deadText}>Eliminated</Text>}
      </View>

      {/* Name at the top */}
      <View style={styles.top}>
        <TextInput
          style={styles.name}
          value={player.name}
          onChangeText={(t) => rename(player.id, t)}
          maxLength={14}
        />
      </View>

      {/* Chips along the bottom */}
      <View style={styles.bottom}>
        <Pressable style={styles.chip} onPress={() => setCmdr(true)}>
          <Text style={styles.chipText}>CMDR {maxCmdr}</Text>
        </Pressable>
        {([["poison", "PSN"], ["energy", "ENG"], ["experience", "EXP"]] as const).map(([k, label]) => (
          <Pressable
            key={k}
            style={styles.chip}
            onPress={() => changeCounter(player.id, k, 1)}
            onLongPress={() => changeCounter(player.id, k, -1)}
          >
            <Text style={styles.chipText}>{label} {player[k]}</Text>
          </Pressable>
        ))}
        <Pressable style={styles.chip} onPress={() => setPicking(true)}>
          <Text style={styles.chipText}>ART</Text>
        </Pressable>
      </View>

      <CommanderDamageModal visible={cmdr} onClose={() => setCmdr(false)} player={player} />
      <BackgroundPicker
        visible={picking}
        onClose={() => setPicking(false)}
        onPick={(url, artist) => setBackground(player.id, url, artist)}
        onClear={() => setBackground(player.id, undefined, undefined)}
      />
    </View>
  );
}

const fill = { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 } as const;

const styles = StyleSheet.create({
  panel: { flex: 1, margin: 3, borderRadius: 12, overflow: "hidden", backgroundColor: "#1f2937" },
  overlay: { ...fill, backgroundColor: "rgba(0,0,0,0.45)" },
  dead: { opacity: 0.5 },
  zones: { flexDirection: "row" },
  zone: { width: "50%", height: "100%", borderRadius: 0, backgroundColor: "transparent" },
  center: { ...fill, alignItems: "center", justifyContent: "center" },
  life: { color: "#fff", fontSize: 64, fontWeight: "800" },
  deadText: { color: "#f87171", fontWeight: "700" },
  top: { position: "absolute", top: 4, left: 0, right: 0, alignItems: "center" },
  name: { color: "#e5e7eb", fontSize: 16, fontWeight: "600", textAlign: "center", minWidth: 80 },
  bottom: { position: "absolute", bottom: 4, left: 0, right: 0, flexDirection: "row", justifyContent: "center", flexWrap: "wrap" },
  chip: { backgroundColor: "rgba(17,24,39,0.85)", borderRadius: 10, paddingVertical: 5, paddingHorizontal: 7, margin: 2 },
  chipText: { color: "#d1d5db", fontSize: 11 },
});