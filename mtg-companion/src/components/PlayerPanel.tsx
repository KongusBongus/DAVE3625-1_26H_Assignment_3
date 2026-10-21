import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { Player, useGame } from "../store/gameStore";
import BackgroundPicker from "./BackgroundPicker";
import HoldButton from "./HoldButton";

export default function PlayerPanel({ player }: { player: Player }) {
  const { changeLife, logLife, changeCounter, setBackground } = useGame();
  const [picking, setPicking] = useState(false);
  const dead = player.life <= 0 || player.poison >= 10;

  const body = (
    <>
      <Text style={styles.name}>{player.name}</Text>

      <View style={styles.row}>
        <HoldButton
          label="-"
          onStep={(n) => changeLife(player.id, -n)}
          onRelease={(t) => logLife(player.id, -t)}
        />
        <Text style={styles.life}>{player.life}</Text>
        <HoldButton
          label="+"
          onStep={(n) => changeLife(player.id, n)}
          onRelease={(t) => logLife(player.id, t)}
        />
      </View>
      <Text style={styles.hint}>Tap = 1, hold = repeat</Text>

      <View style={styles.row}>
        {(["poison", "energy", "experience"] as const).map((k) => (
          <Pressable key={k} style={styles.chip}
            onPress={() => changeCounter(player.id, k, 1)}
            onLongPress={() => changeCounter(player.id, k, -1)}>
            <Text style={styles.chipText}>{k}: {player[k]}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.chip} onPress={() => setPicking(true)}>
        <Text style={styles.chipText}>Background</Text>
      </Pressable>
      {player.artist && <Text style={styles.credit}>Art: {player.artist}</Text>}
      {dead && <Text style={styles.deadText}>Eliminated</Text>}

      <BackgroundPicker
        visible={picking}
        onClose={() => setPicking(false)}
        onPick={(url, artist) => setBackground(player.id, url, artist)}
        onClear={() => setBackground(player.id, undefined, undefined)}
      />
    </>
  );

  return player.background ? (
    <ImageBackground
      source={{ uri: player.background }}
      style={[styles.panel, dead && styles.dead]}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      {body}
    </ImageBackground>
  ) : (
    <View style={[styles.panel, styles.plain, dead && styles.dead]}>{body}</View>
  );
}

const styles = StyleSheet.create({
  panel: { margin: 6, padding: 12, borderRadius: 16, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  plain: { backgroundColor: "#1f2937" },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.5)" },
  dead: { opacity: 0.45 },
  name: { color: "#e5e7eb", fontSize: 18, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", marginVertical: 6, flexWrap: "wrap", justifyContent: "center" },
  life: { color: "#fff", fontSize: 44, fontWeight: "800", marginHorizontal: 8 },
  hint: { color: "#d1d5db", fontSize: 11 },
  chip: { backgroundColor: "rgba(17,24,39,0.85)", borderRadius: 12, paddingVertical: 6, paddingHorizontal: 10, margin: 3 },
  chipText: { color: "#d1d5db", fontSize: 12 },
  credit: { color: "#d1d5db", fontSize: 10, marginTop: 4 },
  deadText: { color: "#f87171", fontWeight: "700" },
});