import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PlayerPanel from "../components/PlayerPanel";
import Seat from "../components/Seat";
import { useGame } from "../store/gameStore";

// Rotation of each seat: [top row], [bottom row]
const LAYOUTS: Record<number, number[][]> = {
  2: [[180], [0]],
  3: [[90, -90], [0]],
  4: [[90, -90], [90, -90]],
};

export default function LifeScreen() {
  const { players, startingLife, newGame } = useGame();
  const [die, setDie] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const rows = LAYOUTS[players.length] ?? LAYOUTS[2];

  function renderRow(rowIndex: number) {
    const start = rows.slice(0, rowIndex).flat().length;
    return (
      <View style={styles.row}>
        {rows[rowIndex].map((rotation, i) => {
          const p = players[start + i];
          return p ? (
            <Seat key={p.id} rotation={rotation}>
              <PlayerPanel player={p} />
            </Seat>
          ) : null;
        })}
      </View>
    );
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    newGame(players.length, startingLife);
    setConfirmReset(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {renderRow(0)}

      <View style={styles.strip}>
        <Pressable style={[styles.btn, confirmReset && styles.btnWarn]} onPress={handleReset}>
          <Text style={styles.btnText}>{confirmReset ? "Tap again" : "New game"}</Text>
        </Pressable>
        {[2, 3, 4].map((n) => (
          <Pressable
            key={n}
            style={[styles.btn, players.length === n && styles.btnOn]}
            onPress={() => newGame(n, startingLife)}
          >
            <Text style={styles.btnText}>{n}</Text>
          </Pressable>
        ))}
        <Pressable style={styles.btn} onPress={() => newGame(players.length, startingLife === 40 ? 20 : 40)}>
          <Text style={styles.btnText}>Life {startingLife}</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={() => setDie(Math.floor(Math.random() * 20) + 1)}>
          <Text style={styles.btnText}>d20{die !== null ? `: ${die}` : ""}</Text>
        </Pressable>
      </View>

      {renderRow(1)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1020" },
  row: { flex: 1, flexDirection: "row" },
  strip: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#111827" },
  btn: { backgroundColor: "#374151", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, marginHorizontal: 3 },
  btnOn: { backgroundColor: "#4f46e5" },
  btnWarn: { backgroundColor: "#b91c1c" },
  btnText: { color: "#fff", fontSize: 13 },
});