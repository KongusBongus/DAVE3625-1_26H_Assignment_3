import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0b1020" },
        headerTintColor: "#ffffff",
        tabBarStyle: { backgroundColor: "#0b1020", borderTopColor: "#1f2937" },
        tabBarActiveTintColor: "#818cf8",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: { fontSize: 14 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Life" }} />
      <Tabs.Screen name="cards" options={{ title: "Cards" }} />
      <Tabs.Screen name="tools" options={{ title: "Dice" }} />
    </Tabs>
  );
}