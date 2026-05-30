/*
 * File: src\screens\BlastsListScreen.jsx
 * Description: Source file for BlastXApp.
 * Added comments to improve readability and explain app behavior.
 */

// Import project dependencies
import React, { useState, useMemo } from "react";
// Import project dependencies
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";
// Import project dependencies
import { useNavigation } from "@react-navigation/native";
// Import project dependencies
import FAB from "../components/FAB";
// Import project dependencies
import { storage } from "../utils/storage";

// Declare a constant or variable
const SAMPLE_BLASTS = [
  "BK-22_Stope3",
  "XC12_Ring_5",
  "MainRamp_South",
  "Sump_Level_1050",
  "BK-22_Stope3", 
  "Test_Blast_OK",
  "BK-22_Stope3_rev2",
];

// Define a function or component using an arrow function
const BlastsListScreen = () => {
// Declare a constant or variable
  const navigation = useNavigation();
// Declare a constant or variable
  const [query, setQuery] = useState("");

// Declare a constant or variable
  const blasts = useMemo(() => SAMPLE_BLASTS, []);

// Declare a constant or variable
  const filtered = blasts.filter((b) =>
    b.toLowerCase().includes(query.toLowerCase()),
  );

// Return JSX layout
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Blasts</Text>
        <Text style={styles.subtitle}>Operational Blast Plans</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search blasts (e.g., BK-22, MainRamp)"
          style={styles.search}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, idx) => item + idx}
        renderItem={({ item }) => (
          <Pressable
            style={styles.item}
            onPress={() =>
              navigation.navigate("RecordBlastResults", {
                blast: { title: item, id: item },
              })
            }
          >
            <Text style={styles.itemText}>{item}</Text>
            {item === "Test_Blast_OK" && <Text style={styles.check}>✅</Text>}
          </Pressable>
        )}
        contentContainerStyle={{ padding: 12 }}
      />

      <FAB onPress={() => navigation.navigate("PlanEvent")} />
    </View>
  );
};

// Export the default component or module
export default BlastsListScreen;

// Declare a constant or variable
const styles = StyleSheet.create({
// Style object property
  container: { flex: 1, backgroundColor: "#F8F9FA" },
// Style object property
  header: { padding: 16 },
// Style object property
  title: { fontSize: 22, fontWeight: "bold", color: "#1A1F3A" },
// Style object property
  subtitle: { fontSize: 13, color: "#95A5A6" },
// Style object property
  searchRow: { paddingHorizontal: 12, paddingBottom: 8 },
// Style object property
  search: {
// Style object property
    backgroundColor: "#FFF",
// Style object property
    borderRadius: 10,
// Style object property
    padding: 12,
// Style object property
    borderWidth: 1,
// Style object property
    borderColor: "#E0E0E0",
  },
// Style object property
  item: {
// Style object property
    backgroundColor: "#FFF",
// Style object property
    padding: 14,
// Style object property
    borderRadius: 10,
// Style object property
    marginBottom: 10,
// Style object property
    flexDirection: "row",
// Style object property
    justifyContent: "space-between",
// Style object property
    alignItems: "center",
  },
// Style object property
  itemText: { color: "#1A1F3A", fontWeight: "600" },
// Style object property
  check: { marginLeft: 8 },
});
