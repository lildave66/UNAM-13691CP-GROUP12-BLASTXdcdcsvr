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

## 👤 Member 9: SignupScreen.jsx (Signup)
1. **Commit 1:** Add `// Member 9: Signup Theme Polish` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";`.
3. **Commit 3:** Add `import { useState, useEffect } from 'react';`.
4. **Commit 4:** Add `const { theme } = useTheme();` inside.
5. **Commit 5:** Add `const [isOffline, setIsOffline] = useState(false);`.
6. **Commit 6:** Add `useEffect(() => { console.log("Signup active"); }, []);`.
7. **Commit 7:** Change card background to `theme.card`.
8. **Commit 8:** In JSX, add `style={{backgroundColor: theme.background}}` to container.
9. **Commit 9:** Change "Create Account" color to `theme.text`.
10. **Commit 10:** Add a warning: "Internet required for signup".
11. **Commit 11:** Change button color to `theme.primary`.
12. **Commit 12:** Add JSDoc: `/** @description New user registration */`.
13. **Commit 13:** Add `?.` to `val?.errorMessage`.
14. **Commit 14:** **Feature:** Theme the "Terms & Conditions" link color to `theme.primary`.
15. **Commit 15:** Final cleanup.

---
<!-- <!--  -->
# 👤 Member 10: storage.js (Utils)
1. **Commit 1:** Add `// Member 10: Storage Theme Data` at line 1.
2. **Commit 2:** Add `import { Colors } from "./theme";` at top.
3. **Commit 3:** Add `import AsyncStorage from '@react-native-async-storage/async-storage';`.
4. **Commit 4:** Add `export const THEME_KEY = 'user-theme';` at top.
5. **Commit 5:** Create function: `export const saveThemePref = (mode) => AsyncStorage.setItem(THEME_KEY, mode);`.
6. **Commit 6:** Add `console.log("Storage utility loaded");`.
7. **Commit 7:** Create function: `export const getThemePref = () => AsyncStorage.getItem(THEME_KEY);`.
8. **Commit 8:** Add a comment about offline data persistence.
9. **Commit 9:** Add `?.` to `response?.data` inside existing storage calls.
10. **Commit 10:** Add a check for network status before syncing.
11. **Commit 11:** Add a constant for `OFFLINE_LIMIT = 50`.
12. **Commit 12:** Add JSDoc: `/** @description Persistent storage and data syncing utility */`.
13. **Commit 13:** Add `try/catch` to all `AsyncStorage` calls.
14. **Commit 14:** **Feature:** Create a `syncOfflineData` helper function (empty placeholder).
15. **Commit 15:** Remove console.logs.

--- -->

## 👤 Member 11: export.js (Utils)
1. **Commit 1:** Add `// Member 11: Export PDF Theme` at line 1.
2. **Commit 2:** Add `import { Colors } from "./theme";`.
3. **Commit 3:** Add `import { useState } from 'react';` (for use in generating).
4. **Commit 4:** Create `const getReportStyles = (isDark) => { ... }` helper.
5. **Commit 5:** Add `console.log("Export utility initialized");`.
6. **Commit 6:** Update `htmlContent` to use dynamic background: `${isDark ? "#1A" : "#F8"}`.
7. **Commit 7:** Update `htmlContent` to use dynamic text color.
8. **Commit 8:** Add a "Generated Offline" stamp to the PDF if no internet.
9. **Commit 9:** Add `?.` to `blast?.blastSize`.
10. **Commit 10:** Update the HTML table border to use `theme.border`.
11. **Commit 11:** Add a timestamp to the file name: `BlastReport_${Date.now()}.pdf`.
12. **Commit 12:** Add JSDoc: `/** @description PDF report generation and sharing utility */`.
13. **Commit 13:** Add error handling to `Sharing.shareAsync`.
14. **Commit 14:** **Feature:** Add a high-contrast mode for the PDF.
15. **Commit 15:** Final code cleanup.

---

## 👤 Member 12: notifications.js (Utils)
1. **Commit 1:** Add `// Member 12: Notification Theme` at line 1.
2. **Commit 2:** Add `import { Colors } from "./theme";`.
3. **Commit 3:** Add `import { Alert } from 'react-native';`.
4. **Commit 4:** Add `const NOTIF_STORAGE = 'offline-notifs';`.
5. **Commit 5:** Add `console.log("Notifications initialized");`.
6. **Commit 6:** Log the current theme when a notification is scheduled.
7. **Commit 7:** Add a function to queue notifications if offline.
8. **Commit 8:** Add JSDoc for notification priority levels.
9. **Commit 9:** Add `?.` to `notif?.request?.content`.
10. **Commit 10:** Update the "No Permission" alert message to be clearer.
11. **Commit 11:** Add a check for `Platform.OS` before running specific tasks.
12. **Commit 12:** Add JSDoc: `/** @description Push notification and alert management utility */`.
13. **Commit 13:** Add a `finally` block to ensure loaders stop.
14. **Commit 14:** **Feature:** Add a custom alert sound setting placeholder.
15. **Commit 15:** Remove logs.

---

## 👤 Member 13: BlastItem.jsx (Component)
1. **Commit 1:** Add `// Member 13: BlastItem Theme` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";`.
3. **Commit 3:** Add `import { useState } from 'react';`.
4. **Commit 4:** Add `const { theme } = useTheme();` inside.
5. **Commit 5:** Add `console.log("BlastItem rendered");`.
6. **Commit 6:** Change main card background to `theme.card`.
7. **Commit 7:** Change title text color to `theme.text`.
8. **Commit 8:** Change description text color to `theme.textSecondary`.
9. **Commit 9:** Update status badge background to `theme.primary`.
10. **Commit 10:** Add an icon for offline status on the item.
11. **Commit 11:** Change border colors to `theme.border`.
12. **Commit 12:** Add JSDoc: `/** @description Reusable card component for blast details */`.
13. **Commit 13:** Add `?.` to `blast?.targetArea`.
14. **Commit 14:** **Feature:** Add a subtle shadow that changes in Dark Mode (`#000` vs `#CCC`).
15. **Commit 15:** Clean up logs.

---

## 👤 Member 14: Card.jsx (Component)
1. **Commit 1:** Add `// Member 14: Card UI Theme` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";`.
3. **Commit 3:** Add `const { theme } = useTheme();` inside.
4. **Commit 4:** Change `styles.card` background to `theme.card`.
5. **Commit 5:** Add `console.log("Card component used");`.
6. **Commit 6:** Change border color to `theme.border`.
7. **Commit 7:** Update shadow color to be lighter in Dark Mode.
8. **Commit 8:** Add `padding: 15` as a default style.
9. **Commit 9:** Add JSDoc explaining the `children` prop.
10. **Commit 10:** Wrap content in a theme-aware View.
11. **Commit 11:** Add a "Theme: Light/Dark" label for debugging.
12. **Commit 12:** Add JSDoc: `/** @description Foundational UI container component */`.
13. **Commit 13:** Add `elevation: 3` for Android support.
14. **Commit 14:** **Feature:** Add a "primary" prop to make the card background `theme.primary`.
15. **Commit 15:** Final format.

---

## 👤 Member 15: Input.jsx (Component)
1. **Commit 1:** Add `// Member 15: Input UI Theme` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";`.
3. **Commit 3:** Add `const { theme } = useTheme();` inside.
4. **Commit 4:** Change `styles.input` background to `theme.surface`.
5. **Commit 5:** Change text color to `theme.text`.
6. **Commit 6:** Change placeholder text color to `theme.textSecondary`.
7. **Commit 7:** Add `console.log("Input field focused");`.
8. **Commit 8:** Change border color to `theme.border`.
9. **Commit 9:** Update focused border color to `theme.primary`.
10. **Commit 10:** Add an offline warning icon inside the input.
11. **Commit 11:** Add `borderRadius: 10` for modern look.
12. **Commit 12:** Add JSDoc: `/** @description Styled text input with validation support */`.
13. **Commit 13:** Add `secureTextEntry` support for passwords.
14. **Commit 14:** **Feature:** Add a "Clear" button icon in `theme.textSecondary`.
15. **Commit 15:** Final format check.
