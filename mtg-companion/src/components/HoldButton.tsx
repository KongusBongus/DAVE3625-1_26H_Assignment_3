import { useEffect, useRef } from "react";
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";

interface Props {
  label: string;
  onStep: (amount: number) => void;      // called on press and on every repeat
  onRelease: (total: number) => void;    // called once on release with the total
  style?: StyleProp<ViewStyle>;
}

export default function HoldButton({ label, onStep, onRelease, style }: Props) {
  const delay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = useRef(0);

  const clear = () => {
    if (delay.current) clearTimeout(delay.current);
    if (timer.current) clearInterval(timer.current);
    delay.current = null;
    timer.current = null;
  };

  const step = (n: number) => {
    total.current += n;
    onStep(n);
  };

  const start = () => {
    clear();
    total.current = 0;
    step(1); // immediate first change
    delay.current = setTimeout(() => {
      let ticks = 0;
      timer.current = setInterval(() => {
        ticks++;
        step(ticks > 15 ? 5 : 1);
      }, 100);
    }, 400);
  };

  const stop = () => {
    clear();
    if (total.current !== 0) onRelease(total.current);
    total.current = 0;
  };

  useEffect(() => clear, []); // stop timers if the screen closes

  return (
    <Pressable style={[styles.btn, style]} onPressIn={start} onPressOut={stop}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(55,65,81,0.9)", alignItems: "center", justifyContent: "center" },
  text: { color: "#fff", fontSize: 32 },
});