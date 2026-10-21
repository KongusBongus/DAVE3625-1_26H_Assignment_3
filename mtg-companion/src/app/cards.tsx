import { useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { cardImage, getRulings, searchCards } from "../api/scryfall";
import { Card } from "../types/card";

export default function CardsScreen() {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Card | null>(null);
  const [rulings, setRulings] = useState<string[]>([]);

  async function runSearch() {
    if (!query.trim()) return;
    setLoading(true); setError(null); setSelected(null);
    try {
      const res = await searchCards(query);
      setCards(res.data);
    } catch (e: any) {
      setCards([]); setError(e.message);
    } finally { setLoading(false); }
  }

  async function open(card: Card) {
    setSelected(card);
    try {
      const r = await getRulings(card.id);
      setRulings(r.data.map((x) => x.comment));
    } catch { setRulings([]); }
  }

  if (selected) {
  const img = cardImage(selected);
  const text =
    selected.oracle_text ??
    selected.card_faces?.map((f) => f.oracle_text).join("\n\n");

  return (
    <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detail}>
      <Pressable onPress={() => setSelected(null)}>
        <Text style={styles.back}>&lt; Back</Text>
      </Pressable>
      {img && <Image source={{ uri: img }} style={styles.big} resizeMode="contain" />}
      <Text style={styles.title}>{selected.name} {selected.mana_cost}</Text>
      <Text style={styles.text}>{selected.type_line}</Text>
      <Text style={styles.text}>{text}</Text>
      <Text style={styles.text}>Set: {selected.set_name} ({selected.rarity})</Text>
      <Text style={styles.text}>Price (USD): {selected.prices.usd ?? "n/a"}</Text>
      <Text style={styles.text}>Commander: {selected.legalities.commander}</Text>
      <Text style={styles.title}>Rulings</Text>
      {rulings.length === 0 && <Text style={styles.text}>No rulings.</Text>}
      {rulings.slice(0, 5).map((r, i) => (
        <Text key={i} style={styles.text}>- {r}</Text>
      ))}
    </ScrollView>
  );
}

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search cards, e.g. t:dragon c:r"
        placeholderTextColor="#9ca3af"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={runSearch}
        returnKeyType="search"
      />
      {loading && <ActivityIndicator />}
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={cards}
        numColumns={2}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <Pressable style={styles.cell} onPress={() => open(item)}>
            <Image source={{ uri: cardImage(item) }} style={styles.thumb} resizeMode="contain" />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1020", padding: 8 },
  input: { backgroundColor: "#1f2937", color: "#fff", padding: 12, borderRadius: 10, marginBottom: 8 },
  cell: { flex: 1, padding: 4 },
  thumb: { width: "100%", aspectRatio: 0.716 },
  detailScroll: { flex: 1, backgroundColor: "#0b1020" },
  detail: { padding: 16, paddingBottom: 48 },
  big: { width: "100%", height: 340 },
  title: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 8 },
  text: { color: "#d1d5db", marginTop: 4 },
  back: { color: "#818cf8", marginBottom: 8 },
  error: { color: "#f87171", marginVertical: 6 },
});