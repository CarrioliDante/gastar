import { View, Text, SafeAreaView } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F2" }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 48,
        }}
      >
        <Text
          style={{
            color: "rgba(0,0,0,0.28)",
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 8,
            fontFamily: "System",
          }}
        >
          Gastar
        </Text>
        <Text
          style={{
            color: "#111111",
            fontSize: 28,
            fontWeight: "300",
            letterSpacing: -1,
            fontFamily: "System",
          }}
        >
          Good morning.
        </Text>
      </View>
    </SafeAreaView>
  );
}
