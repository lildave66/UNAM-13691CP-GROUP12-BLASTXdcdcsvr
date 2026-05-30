# 📖 BlastXApp: 15-Commit Individual Workplans

> **HOW TO USE THIS GUIDE:**
> 1. Find your assigned **Member Number** and **File**.
> 2. Complete **Task 1**, save your file, and commit with the message provided.
> 3. Repeat for all 15 tasks. **DO NOT skip steps.**

---

## 👤 Member 1: DashboardScreen.jsx (Main Hub)
1. **Commit 1:** Add `// Member 1: Dashboard Theme Init` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";` at top.
3. **Commit 3:** Change `import React from 'react';` to `import React, { useState, useEffect } from 'react';`.
4. **Commit 4:** Add `const { theme, isDark, toggleTheme } = useTheme();` inside the component.
5. **Commit 5:** Add `const [isOffline, setIsOffline] = useState(false);` below theme hook.
6. **Commit 6:** Add `useEffect(() => { console.log("Dashboard active"); }, []);`.
7. **Commit 7:** In `styles`, change `container` background to `theme.background`.
8. **Commit 8:** In JSX, add `style={{backgroundColor: theme.background}}` to first View.
9. **Commit 9:** In JSX, find Header title and add `style={{color: theme.text}}`.
10. **Commit 10:** Add `{isOffline && <Text>Offline Mode</Text>}` under header.
11. **Commit 11:** Add `const themeName = isDark ? "Dark" : "Light";` before return.
12. **Commit 12:** Add JSDoc: `/** @description Main dashboard with theme support */`.
13. **Commit 13:** Add `?.` to `userData?.company?.name`.
14. **Commit 14:** Add the **Toggle Button**: `<Button title="Switch Theme" onPress={toggleTheme} color={theme.primary} />`.
15. **Commit 15:** Remove console.log from Step 6.

---

## 👤 Member 2: BlastHistoryScreen.jsx (History)
1. **Commit 1:** Add `// Member 2: History Theme Support` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";` at top.
3. **Commit 3:** Add `import { useState, useEffect } from 'react';`.
4. **Commit 4:** Add `const { theme, isDark } = useTheme();` inside.
5. **Commit 5:** Add `const [isOffline, setIsOffline] = useState(false);`.
6. **Commit 6:** Add `useEffect(() => { console.log("History loaded"); }, []);`.
7. **Commit 7:** Change `styles.header` background to `theme.card`.
8. **Commit 8:** In JSX, add `style={{backgroundColor: theme.background}}` to main View.
9. **Commit 9:** Change "Blast Operations Log" text color to `theme.text`.
10. **Commit 10:** Add `{isOffline && <View style={{height: 2, backgroundColor: 'red'}} />}`.
11. **Commit 11:** Change `styles.filterButton` background to `theme.card`.
12. **Commit 12:** Add JSDoc: `/** @description List of past operations with PDF export */`.
13. **Commit 13:** Add `?.` to `item?.title`.
14. **Commit 14:** **Feature:** Add a theme indicator text: `<Text style={{color: theme.textSecondary}}>Mode: {isDark ? "Dark" : "Light"}</Text>`.
15. **Commit 15:** Final format check and remove logs.

---

## 👤 Member 3: PlanEventScreen.jsx (Scheduler)
1. **Commit 1:** Add `// Member 3: Scheduler Offline Safety` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";`.
3. **Commit 3:** Add `import { useState, useEffect } from 'react';`.
4. **Commit 4:** Add `const { theme } = useTheme();` inside.
5. **Commit 5:** Add `const [isOffline, setIsOffline] = useState(false);`.
6. **Commit 6:** Add `useEffect(() => { console.log("Plan screen ready"); }, []);`.
7. **Commit 7:** Change `styles.container` background to `theme.background`.
8. **Commit 8:** In JSX, add `style={{backgroundColor: theme.background}}` to main View.
9. **Commit 9:** Change "Plan New Blast" text color to `theme.text`.
10. **Commit 10:** Add `{isOffline && <Alert>Caution: Offline</Alert>}`.
11. **Commit 11:** Change label colors in `styles` to `theme.textSecondary`.
12. **Commit 12:** Add JSDoc: `/** @description Blast planning and scheduling form */`.
13. **Commit 13:** Add `?.` to `formData?.targetArea`.
14. **Commit 14:** **Feature:** Block saving if offline: `if(isOffline) { return Alert.alert("Offline!"); }` inside save function.
15. **Commit 15:** Final code cleanup.

---

## 👤 Member 4: RecordBlastResultsScreen.jsx (Data Entry)
1. **Commit 1:** Add `// Member 4: Results Theme Logic` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";`.
3. **Commit 3:** Add `import { useState, useEffect } from 'react';`.
4. **Commit 4:** Add `const { theme } = useTheme();` inside.
5. **Commit 5:** Add `const [isOffline, setIsOffline] = useState(false);`.
6. **Commit 6:** Add `useEffect(() => { console.log("Record screen active"); }, []);`.
7. **Commit 7:** Change card backgrounds to `theme.card`.
8. **Commit 8:** In JSX, add `style={{backgroundColor: theme.background}}` to container.
9. **Commit 9:** Change "Blast Results" header color to `theme.text`.
10. **Commit 10:** Add an offline status badge.
11. **Commit 11:** Change border colors in `styles` to `theme.border`.
12. **Commit 12:** Add JSDoc: `/** @description Data entry for blast metrics */`.
13. **Commit 13:** Add `?.` to `blast?.id`.
14. **Commit 14:** **Feature:** Highlight inputs with `theme.primary` when focused.
15. **Commit 15:** Remove console.logs.

---

## 👤 Member 5: ProfileScreen.jsx (User Settings)
1. **Commit 1:** Add `// Member 5: Profile Theme Toggle` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";`.
3. **Commit 3:** Add `import { useState, useEffect } from 'react';`.
4. **Commit 4:** Add `const { theme, toggleTheme, isDark } = useTheme();` inside.
5. **Commit 5:** Add `const [isOffline, setIsOffline] = useState(false);`.
6. **Commit 6:** Add `useEffect(() => { console.log("Profile loaded"); }, []);`.
7. **Commit 7:** Change `styles.profileCard` background to `theme.card`.
8. **Commit 8:** In JSX, add `style={{backgroundColor: theme.background}}` to container.
9. **Commit 9:** Change user name color to `theme.text`.
10. **Commit 10:** Add `{isOffline ? "Status: Offline" : "Status: Online"}` under name.
11. **Commit 11:** Change secondary text colors to `theme.textSecondary`.
12. **Commit 12:** Add JSDoc: `/** @description User profile and app settings screen */`.
13. **Commit 13:** Add `?.` to `userData?.email`.
14. **Commit 14:** **Feature:** Add a switch for Theme: `<Switch value={isDark} onValueChange={toggleTheme} />`.
15. **Commit 15:** Final format check.

---

## 👤 Member 6: AdminSettingsScreen.jsx (Admin)
1. **Commit 1:** Add `// Member 6: Admin Theme Config` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";`.
3. **Commit 3:** Add `import { useState, useEffect } from 'react';`.
4. **Commit 4:** Add `const { theme } = useTheme();` inside.
5. **Commit 5:** Add `const [isOffline, setIsOffline] = useState(false);`.
6. **Commit 6:** Add `useEffect(() => { console.log("Admin active"); }, []);`.
7. **Commit 7:** Change setting list item backgrounds to `theme.card`.
8. **Commit 8:** In JSX, add `style={{backgroundColor: theme.background}}` to view.
9. **Commit 9:** Change "Company Settings" title to `theme.text`.
10. **Commit 10:** Add an "Offline Restricted" warning on admin tasks.
11. **Commit 11:** Change border colors to `theme.border`.
12. **Commit 12:** Add JSDoc: `/** @description Admin configuration and RBAC control */`.
13. **Commit 13:** Add `?.` to `company?.rbacEnabled`.
14. **Commit 14:** **Feature:** Change toggle `thumbColor` to `theme.primary`.
15. **Commit 15:** Clean up logs.

---

## 👤 Member 7: SetupScreen.jsx (Onboarding)
1. **Commit 1:** Add `// Member 7: Setup Theme Styling` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";`.
3. **Commit 3:** Add `import { useState, useEffect } from 'react';`.
4. **Commit 4:** Add `const { theme } = useTheme();` inside.
5. **Commit 5:** Add `const [isOffline, setIsOffline] = useState(false);`.
6. **Commit 6:** Add `useEffect(() => { console.log("Setup started"); }, []);`.
7. **Commit 7:** Change `styles.welcomeCard` background to `theme.card`.
8. **Commit 8:** In JSX, add `style={{backgroundColor: theme.background}}` to container.
9. **Commit 9:** Change "Welcome to BlastX" color to `theme.primary`.
10. **Commit 10:** Add "No internet connection" text if `isOffline`.
11. **Commit 11:** Change button colors to `theme.primary`.
12. **Commit 12:** Add JSDoc: `/** @description Initial company setup and user onboarding */`.
13. **Commit 13:** Add `?.` to `setupData?.step`.
14. **Commit 14:** **Feature:** Theme the step indicator dots with `theme.primary`.
15. **Commit 15:** Final format.

---

## 👤 Member 8: LoginScreen.jsx (Login)
1. **Commit 1:** Add `// Member 8: Login Theme Polish` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";`.
3. **Commit 3:** Add `import { useState, useEffect } from 'react';`.
4. **Commit 4:** Add `const { theme } = useTheme();` inside.
5. **Commit 5:** Add `const [isOffline, setIsOffline] = useState(false);`.
6. **Commit 6:** Add `useEffect(() => { console.log("Login active"); }, []);`.
7. **Commit 7:** Change card background to `theme.card`.
8. **Commit 8:** In JSX, add `style={{backgroundColor: theme.background}}` to container.
9. **Commit 9:** Change "Login" title color to `theme.text`.
10. **Commit 10:** Add "{isOffline ? 'Offline Mode' : ''}" text.
11. **Commit 11:** Change input border colors to `theme.border`.
12. **Commit 12:** Add JSDoc: `/** @description User authentication and sign-in */`.
13. **Commit 13:** Add `?.` to `authError?.message`.
14. **Commit 14:** **Feature:** Add a "Forgot Password" link in `theme.primary` color.
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

## 👤 Member 10: storage.js (Utils)
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

---

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
