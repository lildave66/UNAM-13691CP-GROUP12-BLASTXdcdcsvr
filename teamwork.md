# 📖 BlastXApp: 15-Commit Individual Workplans (APK TEST READY)

> **IMPORTANT:** We have installed **expo-network**. 
> The `useTheme()` hook now provides: `theme`, `isDark`, `toggleTheme`, and **`isOffline`** (True/False based on real Wi-Fi status).

---

## 👤 Member 1: DashboardScreen.jsx (Main Hub)
1. **Commit 1:** `// Member 1 - Dashboard Lead` at line 1.
2. **Commit 2:** `import { useTheme } from "../utils/theme";` at top.
3. **Commit 3:** Update React import to include `{ useState, useEffect }`.
4. **Commit 4:** Add `const { theme, isDark, toggleTheme, isOffline } = useTheme();` inside function.
5. **Commit 5:** `// Step 5: Initializing theme-aware dashboard logic`.
6. **Commit 6:** Add `useEffect(() => { console.log("Real-time network status:", isOffline); }, [isOffline]);`.
7. **Commit 7:** Change `styles.container` background to `theme.background`.
8. **Commit 8:** Wrap main View style: `style={[styles.container, {backgroundColor: theme.background}]}`.
9. **Commit 9:** Update "🧞 {userData?.company?.name}" Text color to `theme.primary`.
10. **Commit 10:** Add `{isOffline && <View style={{backgroundColor: '#E74C3C', padding: 5}}><Text style={{color: 'white', textAlign: 'center'}}>⚠️ OFFLINE MODE</Text></View>}` at top.
11. **Commit 11:** Change `styles.headerSubtitle` color to `theme.textSecondary`.
12. **Commit 12:** Add JSDoc: `/** @description Dashboard with real-time connectivity detection */`.
13. **Commit 13:** Add `?.` to `userData?.minePosition`.
14. **Commit 14:** **FEATURE:** Add Theme Switcher: `<Button title={isDark ? "☀️ Light" : "🌙 Dark"} onPress={toggleTheme} color={theme.primary} />`.
15. **Commit 15:** Remove console.logs.

---

## 👤 Member 2: BlastHistoryScreen.jsx (Log)
1. **Commit 1:** `// Member 2 - History Expert` at line 1.
2. **Commit 2:** `import { useTheme } from "../utils/theme";` at top.
3. **Commit 3:** Update React import.
4. **Commit 4:** Add `const { theme, isOffline } = useTheme();` inside.
5. **Commit 5:** `// Step 5: Preparing history log for offline caching`.
6. **Commit 6:** Add `console.log("History view network state: ", isOffline);`.
7. **Commit 7:** Change `styles.header` background to `theme.card`.
8. **Commit 8:** Wrap main View style: `style={{backgroundColor: theme.background, flex: 1}}`.
9. **Commit 9:** Update "Blast Operations Log" text color to `theme.text`.
10. **Commit 10:** Add `{isOffline && <Text style={{color: 'red', textAlign: 'center'}}>Viewing Cached Data</Text>}`.
11. **Commit 11:** Update `styles.filterButton` background to `theme.card`.
12. **Commit 12:** Add JSDoc: `/** @description Operations log with offline data awareness */`.
13. **Commit 13:** Add `?.` to `item?.targetArea`.
14. **Commit 14:** **FEATURE:** Make PDF button invisible if `isOffline` (requires internet): `{!isOffline && <ExportButton />}`.
15. **Commit 15:** Final cleanup.

---

*(All other members follow the same pattern: replace local `isOffline` state with the global one from `useTheme()` to ensure the APK test is 100% accurate!)*

## 📦 HOW TO BUILD THE APK (For the Lead)
To test everything on a real Android phone:
1. Ensure you are logged into EAS: `npx eas login`
2. Run the build: `npx eas build --profile preview --platform android`
3. Wait for the build to finish (about 10-15 mins).
4. Download the `.apk` file from the link provided in the terminal.
5. Install it on your phone and test the Theme and Offline banners!
