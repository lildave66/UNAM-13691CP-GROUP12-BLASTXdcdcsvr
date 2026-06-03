




import React, { useState, useMemo } from "react";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import FAB from "../components/FAB";

import { storage } from "../utils/storage";


const SAMPLE_BLASTS = [
  "BK-22_Stope3",
  "XC12_Ring_5",
  "MainRamp_South",
  "Sump_Level_1050",
  "BK-22_Stope3", 
  "Test_Blast_OK",
  "BK-22_Stope3_rev2",
];


const BlastsListScreen = () => {

  const navigation = useNavigation();

  const [query, setQuery] = useState("");


  const blasts = useMemo(() => SAMPLE_BLASTS, []);


  const filtered = blasts.filter((b) =>
    b.toLowerCase().includes(query.toLowerCase()),
  );


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


export default BlastsListScreen;


const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: "#F8F9FA" },

  header: { padding: 16 },

  title: { fontSize: 22, fontWeight: "bold", color: "#1A1F3A" },

  subtitle: { fontSize: 13, color: "#95A5A6" },

  searchRow: { paddingHorizontal: 12, paddingBottom: 8 },

  search: {

    backgroundColor: "#FFF",

    borderRadius: 10,

    padding: 12,

    borderWidth: 1,

    borderColor: "#E0E0E0",
  },

  item: {

    backgroundColor: "#FFF",

    padding: 14,

    borderRadius: 10,

    marginBottom: 10,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  itemText: { color: "#1A1F3A", fontWeight: "600" },

  check: { marginLeft: 8 },
});
