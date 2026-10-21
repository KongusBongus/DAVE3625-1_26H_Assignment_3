import { useState } from "react";
import { ActivityIndicator, FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { cardArt, cardArtist, getRandomCard, searchCards } from "../api/scryfall";
import { Card } from "../types/card";

interface Props {
  visible: boolean;
  onClose: () => void;
  onPick: (url: string, artist?: string) => void;
  onClear: () => void;
}

export default function BackgroundPicker({ visible, onClose, onPick, onClear }: Props) {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pick(card: Card) {
    const art = cardArt(card);
    if (art) {
      onPick(art, cardArtist(card));
      onClose();
    }
  }

  async function search() {
    if (!query.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await searchCards(query);
      setCards(res.data.filter((c) => cardArt(c)).slice(0, 30));
    } catch (e: any) {
      setCards([]); setError(e.message);
    } finally { setLoading(false); }
  }

  async function random() {
    setLoading(true); setError(null);
    try {
      pick(await getRandomCard());
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Search art, e.g. dragon"
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
            returnKeyType="search"
          />
        </View>
        <View style={styles.row}>
          <Pressable style={styles.btn} onPress={random}><Text style={styles.btnText}>Random</Text></Pressable>
          <Pressable style={styles.btn} onPress={() => { onClear(); onClose(); }}><Text style={styles.btnText}>Remove</Text></Pressable>
          <Pressable style={styles.btn} onPress={onClose}><Text style={styles.btnText}>Close</Text></Pressable>
        </View>
        {loading && <ActivityIndicator />}
        {error && <Text style={styles.error}>{error}</Text>}
        <FlatList
          data={cards}
          numColumns={2}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <Pressable style={styles.cell} onPress={() => pick(item)}>
              <Image source={{ uri: cardArt(item) }} style={styles.thumb} resizeMode="cover" />
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1020", padding: 12, paddingTop: 48 },
  row: { flexDirection: "row", marginBottom: 8 },
  input: { flex: 1, backgroundColor: "#1f2937", color: "#fff", padding: 12, borderRadius: 10 },
  btn: { backgroundColor: "#4f46e5", borderRadius: 10, padding: 10, marginRight: 8 },
  btnText: { color: "#fff" },
  error: { color: "#f87171", marginVertical: 6 },
  cell: { flex: 1, padding: 4 },
  thumb: { width: "100%", aspectRatio: 1.37, borderRadius: 8 },
});