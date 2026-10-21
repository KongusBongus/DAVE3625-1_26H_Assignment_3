import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PlayerPanel from "../components/PlayerPanel";
import { useGame } from "../store/gameStore";

export default function LifeScreen() {
  const { players, newGame, history } = useGame();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.toolbar}>
        {[2, 3, 4].map((n) => (
          <Pressable key={n} style={styles.tbBtn} onPress={() => newGame(n, 40)}>
            <Text style={styles.tbText}>{n} players (40)</Text>
          </Pressable>
        ))}
        <Pressable style={styles.tbBtn} onPress={() => newGame(2, 20)}>
          <Text style={styles.tbText}>2 players (20)</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {players.map((p) => (
          <View key={p.id} style={styles.cell}>
            <PlayerPanel player={p} />
          </View>
        ))}
      </View>

      <Text style={styles.historyTitle}>History</Text>
      {history.length === 0 && <Text style={styles.hText}>No changes yet.</Text>}
      {history.slice(0, 20).map((h, i) => (
        <Text key={i} style={styles.hText}>{h}</Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1020" },
  content: { padding: 8, paddingBottom: 40 },
  toolbar: { flexDirection: "row", flexWrap: "wrap" },
  tbBtn: { backgroundColor: "#4f46e5", borderRadius: 10, padding: 8, margin: 4 },
  tbText: { color: "#fff" },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  cell: { width: "50%", minWidth: 160 },
  historyTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginTop: 16, marginBottom: 4 },
  hText: { color: "#9ca3af", fontSize: 12 },
});