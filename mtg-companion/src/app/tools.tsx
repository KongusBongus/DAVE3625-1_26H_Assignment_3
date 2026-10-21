import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Tools() {
  const [result, setResult] = useState("Roll something");
  const roll = (sides: number) => setResult(`d${sides}: ${Math.floor(Math.random() * sides) + 1}`);
  const flip = () => setResult(Math.random() < 0.5 ? "Heads" : "Tails");

  return (
    <View style={styles.c}>
      <Text style={styles.r}>{result}</Text>
      <View style={styles.row}>
        {[6, 10, 20].map((s) => (
          <Pressable key={s} style={styles.b} onPress={() => roll(s)}><Text style={styles.t}>d{s}</Text></Pressable>
        ))}
        <Pressable style={styles.b} onPress={flip}><Text style={styles.t}>Coin</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#0b1020", alignItems: "center", justifyContent: "center" },
  r: { color: "#fff", fontSize: 40, marginBottom: 24 },
  row: { flexDirection: "row" },
  b: { backgroundColor: "#4f46e5", padding: 16, borderRadius: 12, margin: 6 },
  t: { color: "#fff", fontSize: 18 },
});