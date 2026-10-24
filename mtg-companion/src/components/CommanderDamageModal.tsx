import { useState } from "react";
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Player, useGame } from "../store/gameStore";

interface CommanderDamageModalProps {
    visible: boolean;
    onClose: () => void;
    player: Player;
}

export default function CommanderDamageModal({ visible, onClose, player }: CommanderDamageModalProps) {
    const { players, changeCommanderDamage } = useGame();
    const [partner, setPartner] = useState(false);
    const opponents = players.filter((p) => p.id !== player.id);

    return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.container}>
        <Text style={styles.title}>Commander damage to {player.name}</Text>
        <View style={styles.topRow}>
            <Pressable style={[styles.btn, partner && styles.btnOn]} onPress={() => setPartner(!partner)}>
            <Text style={styles.btnText}>Partner commanders: {partner ? "on" : "off"}</Text>
            </Pressable>
            <Pressable style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Done</Text>
            </Pressable>
        </View>

        <ScrollView>
            {opponents.map((opp) =>
            (partner ? [opp.id, `${opp.id}-b`] : [opp.id]).map((key) => {
                const value = player.commanderDamage[key] ?? 0;
                return (
                <View key={key} style={styles.row}>
                    <Text style={styles.label}>
                    {opp.name}
                    {key.endsWith("-b") ? " (partner)" : ""}
                    </Text>
                    <Pressable style={styles.round} onPress={() => changeCommanderDamage(player.id, key, -1)}>
                    <Text style={styles.roundText}>-</Text>
                    </Pressable>
                    <Text style={[styles.value, value >= 21 && styles.lethal]}>{value} / 21</Text>
                    <Pressable style={styles.round} onPress={() => changeCommanderDamage(player.id, key, 1)}>
                    <Text style={styles.roundText}>+</Text>
                    </Pressable>
                </View>
                );
            })
            )}
        </ScrollView>
        </View>
    </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0b1020", padding: 16, paddingTop: 56 },
    title: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 12 },
    topRow: { flexDirection: "row", marginBottom: 12 },
    btn: { backgroundColor: "#374151", borderRadius: 10, padding: 10, marginRight: 8 },
    btnOn: { backgroundColor: "#4f46e5" },
    btnText: { color: "#fff" },
    row: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
    label: { flex: 1, color: "#e5e7eb", fontSize: 16 },
    round: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#374151", alignItems: "center", justifyContent: "center" },
    roundText: { color: "#fff", fontSize: 28 },
    value: { color: "#fff", fontSize: 20, fontWeight: "700", width: 90, textAlign: "center" },
    lethal: { color: "#f87171" },
});