# 📜 BlastXApp: 15-Commit Beginner-Friendly Workplans (PRODUCTION)

> **OVERVIEW:** We are moving from Mock data to **Real Firebase**. 
> Follow these steps EXACTLY. If a line number is slightly off, look for the code nearby.

---

## 👤 Member 1: DashboardScreen.jsx (Main Hub)
1. **Commit 1:** Place `// Member 1 - Dashboard Lead` at line 1.
2. **Commit 2:** Place `import { storage, RBAC } from "../utils/storage";` at line 24.
3. **Commit 3:** Inside `loadDashboardData` (line 104), change `storage.getBlasts(10)` to `storage.getBlasts(data?.companyCode, 10)`.
4. **Commit 4:** After `setUserData(data);` (line 108), add `setLoading(true);`.
5. **Commit 5:** Place `// Step 5: Syncing company name from real-time Firestore` at line 110.
6. **Commit 6:** Add `const [canEdit, setCanEdit] = useState(true);` at line 53.
7. **Commit 7:** Inside `loadDashboardData`, after `setUserData(data);`, add `setCanEdit(RBAC.canEditBlasts(data?.minePosition));`.
8. **Commit 8:** Update `handleExport` (line 134) to pass `userData?.company` as the second argument.
9. **Commit 9:** At line 178, change `userData?.company?.name` to `userData?.company?.name || "Loading..."`.
10. **Commit 10:** After line 177, add `{loading && <ActivityIndicator size="small" color="#FF9900" style={{marginLeft: 10}} />}`.
11. **Commit 11:** In `styles.headerSubtitle` (line 353), change `color: "#FFF"` to `color: "#95A5A6"`.
12. **Commit 12:** Place `/** @description Dashboard with real Firebase data integration */` at line 37.
13. **Commit 13:** At line 77, change `nextBlast.launchDate` to `nextBlast?.launchDate`.
14. **Commit 14:** **FEATURE:** At line 188, add a `<Pressable onPress={loadDashboardData}><Text>🔄</Text></Pressable>` for refresh.
15. **Commit 15:** Delete lines 58-65 (any remaining Mock data logic).

---

## 👤 Member 2: BlastHistoryScreen.jsx (History Log)
1. **Commit 1:** Place `// Member 2: History Lead` at line 1.
2. **Commit 2:** At line 38, inside `useFocusEffect`, ensure `loadBlastHistory();` is called.
3. **Commit 3:** Inside `loadBlastHistory` (line 45), add `const user = await storage.getUserData();`.
4. **Commit 4:** At line 48, change `storage.getBlasts(100)` to `storage.getBlasts(user?.companyCode, 100)`.
5. **Commit 5:** At line 83, add `if (filterStatus !== "All") blasts = blasts.filter(b => b.status === filterStatus);`.
6. **Commit 6:** Place `// Step 6: Implementing historical data pagination` at line 85.
7. **Commit 7:** In `styles.container` (line 218), change `backgroundColor: "#F8F9FA"` to `backgroundColor: "#F0F3F4"`.
8. **Commit 8:** Wrap the return at line 180 in `<ScreenWrapper>` (import it first).
9. **Commit 9:** Inside the `FlatList` (line 204), add `ListEmptyComponent={<EmptyState title="No history found" />}`.
10. **Commit 10:** At line 171, ensure `loading` displays the `ActivityIndicator`.
11. **Commit 11:** In `formatDate` (line 117), use `date.toLocaleDateString()` for better formatting.
12. **Commit 12:** Place `/** @description Historical record of all mine blasts */` at line 32.
13. **Commit 13:** Inside `loadBlastHistory` catch block (line 51), add `Alert.alert("Sync Error", "Could not reach database");`.
14. **Commit 14:** **FEATURE:** At line 185, add `<Text style={{fontSize: 12}}>Total Records: {blasts.length}</Text>`.
15. **Commit 15:** Remove `console.log` from line 50.

---

## 👤 Member 3: BlastsListScreen.jsx (Management)
1. **Commit 1:** Place `// Member 3: List Management` at line 1.
2. **Commit 2:** Add `import { storage } from "../utils/storage";` at line 18.
3. **Commit 3:** Replace `SAMPLE_BLASTS` (line 21) with `const [blasts, setBlasts] = useState([]);`.
4. **Commit 4:** Add `useEffect(() => { loadBlasts(); }, []);` at line 34.
5. **Commit 5:** Create `const loadBlasts = async () => { const data = await storage.getUserData(); const list = await storage.getBlasts(data.companyCode); setBlasts(list); };`.
6. **Commit 6:** Place `// Step 6: Optimizing list performance with FlatList` at line 40.
7. **Commit 7:** Change the `FlatList` renderItem (line 62) to use `<BlastItem blast={item} />`.
8. **Commit 8:** Update `onPress` (line 66) to pass the full `item` object.
9. **Commit 9:** Add `const [refreshing, setRefreshing] = useState(false);` at line 35.
10. **Commit 10:** Add `onRefresh={loadBlasts} refreshing={refreshing}` to `FlatList`.
11. **Commit 11:** Wrap `loadBlasts` content in `try { ... } catch (e) { Alert.alert("Error", e.message); }`.
12. **Commit 12:** Place `/** @description Active and upcoming blast operation list */` at line 30.
13. **Commit 13:** At line 43, change `b.toLowerCase()` to `b.title?.toLowerCase()`.
14. **Commit 14:** **FEATURE:** Add `<Text style={styles.badge}>Active</Text>` inside the item render.
15. **Commit 15:** Remove line 21 to 29 (the old SAMPLE_BLASTS).

---

## 👤 Member 4: PlanEventScreen.jsx (Planning)
1. **Commit 1:** Place `// Member 4: Blast Planning Lead` at line 1.
2. **Commit 2:** Add `import { auth } from "../utils/firebase";` at line 24.
3. **Commit 3:** At line 48, ensure `blastData` starts with empty strings: `title: "", targetArea: ""`.
4. **Commit 4:** Inside `handleSchedule` (line 197), add `if (!blastData.title) return Alert.alert("Error", "Title is required");`.
5. **Commit 5:** Inside `loadUserData` (line 137), add `const user = await storage.getUserData(); setUserData(user);`.
6. **Commit 6:** Place `// Step 6: Persisting new blast to Firestore` at line 210.
7. **Commit 7:** At line 214, change `storage.saveBlast(newBlast)` to `storage.saveBlast({ ...newBlast, companyCode: userData.companyCode })`.
8. **Commit 8:** At line 209, add `setLoading(true);` and at line 218 add `setLoading(false);`.
9. **Commit 9:** Place `/** @description Form for scheduling new blast events */` at line 35.
10. **Commit 10:** After `Alert.alert("Success"...)` (line 228), add `navigation.navigate("Dashboard");`.
11. **Commit 11:** At line 147, change the Alert message to "Position Restricted".
12. **Commit 12:** Inside `handleSchedule`, add `newBlast.createdByName = userData.name;`.
13. **Commit 13:** At line 211, add `newBlast.launchDate = new Date(blastData.launchDate).toISOString();`.
14. **Commit 14:** **FEATURE:** Add an Input for `holes` count at line 265.
15. **Commit 15:** Clear `blastData` state by adding `setBlastData({});` at line 238.

---

## 👤 Member 5: ProfileScreen.jsx (User Profile)
1. **Commit 1:** Place `// Member 5: Profile Lead` at line 1.
2. **Commit 2:** Add `import { authHelpers } from "../utils/firebase";` at line 23.
3. **Commit 3:** Inside `loadProfileData` (line 38), change `storage.getUserData()` to `storage.getUserData(true)`.
4. **Commit 4:** At line 133, change `userData?.email` to `userData?.email || "No email found"`.
5. **Commit 5:** At line 136, change `userData?.minePosition` to `userData?.minePosition || "Guest"`.
6. **Commit 6:** Place `// Step 6: Implementing production logout` at line 105.
7. **Commit 7:** At line 116, replace `storage.clearAll()` with `await authHelpers.signOutUser();`.
8. **Commit 8:** At line 108, add `Alert.alert("Confirm", "Logout?", ... )`.
9. **Commit 9:** In `styles.userName` (line 267), change `color: "#2C3E50"` to `theme.text`.
10. **Commit 10:** After line 203, add `<Text style={styles.version}>v2.0.0 Prod</Text>`.
11. **Commit 11:** At line 155, add `?.` to `userData?.company?.name`.
12. **Commit 12:** Place `/** @description User profile and account management */` at line 26.
13. **Commit 13:** Add a `<Button label="Update Position" />` at line 195.
14. **Commit 14:** **FEATURE:** Display `Company Code: {userData?.companyCode}` at line 157.
15. **Commit 15:** Remove line 33 (any leftover mock teammate data).

---

## 👤 Member 6: AdminSettingsScreen.jsx (Admin)
1. **Commit 1:** Place `// Member 6: Admin Lead` at line 1.
2. **Commit 2:** Add `import { RBAC, storage } from "../utils/storage";` at line 17.
3. **Commit 3:** Inside `useEffect` (line 37), call `checkAdmin();`.
4. **Commit 4:** Create `const checkAdmin = () => { if (!RBAC.isCompanyAdmin(userData?.uid, userData?.company)) navigation.goBack(); };`.
5. **Commit 6:** Place `// Step 6: Handling company profile updates` at line 75.
6. **Commit 7:** At line 82, ensure `storage.updateCompanyInfo` uses `companyDetails` state.
7. **Commit 8:** After line 85, add `Alert.alert("Updated", "Profile Saved");`.
8. **Commit 9:** At line 53, ensure `storage.getTeammates(userData.companyCode)` is called.
9. **Commit 10:** At line 202, display `RBAC Status: {userData?.company?.rbacEnabled ? "ON" : "OFF"}`.
10. **Commit 11:** In `styles.activeTab` (line 344), change `borderBottomColor` to `"#FF9900"`.
11. **Commit 12:** Place `/** @description Company-wide configuration and permissions */` at line 19.
12. **Commit 13:** At line 214, change `company?.rbacEnabled` to `userData?.company?.rbacEnabled`.
14. **Commit 14:** **FEATURE:** Add an "Invite" button at line 190.
15. **Commit 15:** Delete lines 25-30 (any mock company data).

---

## 👤 Member 7: SetupScreen.jsx (Setup)
1. **Commit 1:** Place `// Member 7: Setup Lead` at line 1.
2. **Commit 2:** Add `import { storage } from "../utils/storage";` at line 21.
3. **Commit 3:** At line 133, add an Input for "Location".
4. **Commit 4:** Inside `handleFinish` (line 89), call `storage.updateCompanyInfo(uData.companyCode, setupData)`.
5. **Commit 5:** At line 125, add `const newCode = Math.random().toString(36).toUpperCase();`.
6. **Commit 6:** Place `// Step 6: Finalizing user profile in Firestore` at line 105.
7. **Commit 7:** At line 100, ensure the user's `companyCode` is saved.
8. **Commit 8:** At line 95, add `setLoading(true);`.
9. **Commit 9:** At line 112, add `navigation.navigate("Dashboard");`.
10. **Commit 10:** Add `if (setupData.companyName.length < 3) return Alert.alert("Too short");` at line 85.
11. **Commit 12:** Place `/** @description One-time company initialization flow */` at line 29.
13. **Commit 13:** At line 55, change `data.uid` to `auth.currentUser.uid`.
14. **Commit 14:** **FEATURE:** Add a Picker for "Mine Type" at line 145.
15. **Commit 15:** Format line 40 to 60 for better indentation.

---

## 👤 Member 8: LoginScreen.jsx (Login)
1. **Commit 1:** Place `// Member 8: Auth Login Lead` at line 1.
2. **Commit 2:** Add `import { authHelpers } from "../utils/firebase";` at line 26.
3. **Commit 3:** At line 40, ensure `email` and `password` use `useState("")`.
4. **Commit 4:** Replace `signInWithEmailAndPassword` (line 55) with `authHelpers.signIn(email, password)`.
5. **Commit 5:** Add `catch (e) { if (e.code === 'auth/invalid-email') Alert.alert("Bad Email"); }`.
6. **Commit 6:** Place `// Step 6: Handling login persistence` at line 70.
7. **Commit 7:** At line 53, add `setLoading(true);`.
8. **Commit 8:** At line 66, add `navigation.navigate("Dashboard");`.
9. **Commit 9:** At line 78, add `setPassword("");` to clear input.
10. **Commit 10:** At line 115, ensure the "Sign Up" link points to `navigation.navigate("Signup")`.
11. **Commit 11:** In `styles.input` (line 182), set `backgroundColor` to `"#FFF"`.
12. **Commit 12:** Place `/** @description Firebase authentication login screen */` at line 34.
13. **Commit 13:** At line 84, change `error.message` to `error?.message`.
14. **Commit 14:** **FEATURE:** Add a `<Pressable><Text>👁️</Text></Pressable>` for password visibility at line 105.
15. **Commit 15:** Remove line 15 (unused import).

---

## 👤 Member 9: SignupScreen.jsx (Signup)
1. **Commit 1:** Place `// Member 9: Auth Signup Lead` at line 1.
2. **Commit 2:** Add `import { authHelpers } from "../utils/firebase";` at line 27.
3. **Commit 3:** Add `const [role, setRole] = useState("Engineer");` at line 45.
4. **Commit 5:** Inside `handleSignup` (line 65), add `if (password.length < 6) return Alert.alert("Password too short");`.
5. **Commit 6:** Place `// Step 6: Initializing user document in Firestore` at line 115.
6. **Commit 7:** Inside `handleSignup`, call `authHelpers.signUp(email, password, name, role)`.
7. **Commit 8:** At line 63, add `setLoading(true);`.
8. **Commit 9:** At line 133, navigate to `navigation.navigate("Setup")`.
9. **Commit 10:** Add a link "Login" at line 208.
10. **Commit 11:** In `styles.signupButton` (line 377), set `backgroundColor` to `"#FF9900"`.
11. **Commit 12:** Place `/** @description Firebase registration and profile creation */` at line 38.
12. **Commit 13:** At line 141, change `error.message` to `error?.message`.
13. **Commit 14:** **FEATURE:** Add a "I agree to Terms" checkbox at line 185.
14. **Commit 15:** Remove unused `generateCode` function (lines 53-56).

---

## 👤 Member 10: RecordBlastResultsScreen.jsx (Recording)
1. **Commit 1:** Place `// Member 10: Results Recording Lead` at line 1.
2. **Commit 2:** Add `import { storage } from "../utils/storage";` at line 12.
3. **Commit 3:** At line 18, add `const { blast } = route.params;`.
4. **Commit 4:** Add `const [rocks, setRocks] = useState("");` at line 25.
5. **Commit 5:** Create `const handleSave = async () => { await storage.recordBlastResults(blast.companyCode, blast.id, { rocks }); };`.
6. **Commit 6:** Place `// Step 6: Updating blast status to 'Completed'` at line 75.
7. **Commit 7:** Ensure `blast.companyCode` is used in the `storage` call.
8. **Commit 8:** Add `Alert.confirm("Save results?", handleSave);` at line 72.
9. **Commit 9:** At line 80, add `navigation.goBack();`.
10. **Commit 10:** Place `/** @description Post-blast data entry and status update */` at line 15.
11. **Commit 11:** Add `if (isNaN(rocks)) return Alert.alert("Numbers only");` at line 68.
12. **Commit 13:** Add `?.` to `blast?.id` at line 125.
13. **Commit 14:** **FEATURE:** Add an Input for "Photo URL" at line 150.
14. **Commit 15:** Remove the `... (existing handleSave)` comment at line 74.

---

## 👤 Member 11: export.js (PDF Utility)
1. **Commit 1:** Place `// Member 11: Export Utility Lead` at line 1.
2. **Commit 2:** At line 14, change the function to `generateBlastReport: async (blasts, company) => {`.
3. **Commit 3:** At line 16, replace `"Mine Blast Operations"` with `company?.name`.
4. **Commit 4:** At line 143, use `blasts.map(...)` to generate the HTML table rows.
5. **Commit 5:** Place `/** @description Business intelligence PDF generation */` at line 6.
6. **Commit 6:** Place `// Step 6: Formatting PDF table for production` at line 140.
7. **Commit 7:** In the HTML styles (line 30), set the `header` background to `"#FF9900"`.
8. **Commit 8:** At line 165, add `Date Generated: ${new Date().toLocaleString()}` to the footer.
9. **Commit 9:** At line 153, add `?.` to `blast.targetArea`.
10. **Commit 10:** Wrap `Sharing.shareAsync` (line 178) in `try { ... } catch (e) { ... }`.
11. **Commit 11:** Inside catch (line 186), add `Alert.alert("Export Error", "File could not be saved");`.
12. **Commit 13:** Delete the old HTML template on line 20.
13. **Commit 14:** **FEATURE:** Add a CSS style for `table-striped` at line 50.
14. **Commit 15:** Clean up indentation for the `htmlContent` variable.

---

## 👤 Member 12: notifications.js (Push)
1. **Commit 1:** Place `// Member 12: Notification Lead` at line 1.
2. **Commit 2:** At line 1, add `import * as Notifications from 'expo-notifications';`.
3. **Commit 3:** Create `export const scheduleBlast = (title) => { Notifications.scheduleNotificationAsync({ content: { title } }); };`.
4. **Commit 4:** Place `/** @description System-wide alerts and push notifications */` at line 8.
5. **Commit 5:** Place `// Step 5: Handling notification permissions` at line 50.
6. **Commit 6:** At line 55, call `Notifications.getPermissionsAsync()`.
7. **Commit 7:** Add `if (status !== 'granted') Alert.alert("Enable Notifications");`.
8. **Commit 8:** Add `?.` to `Constants?.expoConfig` at line 65.
9. **Commit 9:** At line 80, add `console.log("Notif Scheduled: " + title);`.
10. **Commit 10:** Add `export const cancelAll = () => Notifications.cancelAllScheduledNotificationsAsync();`.
11. **Commit 11:** At line 20, set `importance` to `AndroidImportance.MAX`.
12. **Commit 13:** Add a `finally` block at line 90 to clear logs.
13. **Commit 14:** **FEATURE:** Create `export const toggleNotifs = (val) => { ... };` as a placeholder.
14. **Commit 15:** Remove `console.log` from line 102.

---

## 👤 Member 13: BlastItem.jsx (Component)
1. **Commit 1:** Place `// Member 13: BlastItem Lead` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";` at line 7.
3. **Commit 3:** Inside `styles.container` (line 31), change `backgroundColor` to `theme.colors.card`.
4. **Commit 4:** At line 90, display `{blast.title}` and `{blast.status}`.
5. **Commit 5:** Place `// Step 5: Formatting production timestamps` at line 18.
6. **Commit 6:** At line 100, use `new Date(blast.createdAt).toLocaleDateString()`.
7. **Commit 7:** At line 15, change `statusColor` based on `blast.status`.
8. **Commit 8:** At line 105, add `?.` to `blast?.blastSize`.
9. **Commit 9:** In `styles.title` (line 52), set `color` to `theme.colors.text`.
10. **Commit 10:** At line 24, add a function `getIcon()` that returns "🔥" for scheduled.
11. **Commit 11:** Wrap the component in `<Pressable onPress={onPress}>` at line 86.
12. **Commit 12:** Place `/** @description Standardized card for displaying blast data */` at line 2.
13. **Commit 13:** Add JSDoc for `onPress` prop at line 5.
14. **Commit 14:** **FEATURE:** At line 108, show a "NEW" badge if `isNew` is true.
15. **Commit 15:** Remove unused `Badge` import at line 12.

---

## 👤 Member 14: Card.jsx (Component)
1. **Commit 1:** Place `// Member 14: UI Card Lead` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";` at line 2.
3. **Commit 3:** At line 5, use `theme.colors.card` for the background.
4. **Commit 4:** Place `/** @description Primary container for UI sections */` at line 3.
5. **Commit 5:** Place `// Step 5: implementing shadow effects for production` at line 10.
6. **Commit 6:** In `styles.card` (line 15), set `borderColor` to `"#ECF0F1"`.
7. **Commit 7:** At line 18, set `shadowOpacity` to `0.05`.
8. **Commit 8:** At line 20, set `elevation` to `2`.
9. **Commit 9:** Inside the `View` (line 5), add `overflow: 'hidden'`.
10. **Commit 10:** Add a prop `noShadow` and use it to hide shadows.
11. **Commit 11:** Add a comment explaining the `children` prop.
12. **Commit 12:** Update `padding` to `16` at line 14.
13. **Commit 13:** Set `borderRadius` to `12` at line 13.
14. **Commit 14:** **FEATURE:** Add a `primary` prop to make the background `"#FF9900"`.
15. **Commit 15:** Format the file for consistency.

---

## 👤 Member 15: Input.jsx (Component)
1. **Commit 1:** Place `// Member 15: UI Input Lead` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";` at line 2.
3. **Commit 3:** At line 20, set `backgroundColor` to `theme.colors.surface`.
4. **Commit 4:** At line 27, set `placeholderTextColor` to `theme.colors.textSecondary`.
5. **Commit 5:** Place `// Step 5: Adding validation UI indicators` at line 15.
6. **Commit 6:** Add an `error` prop and use it to set `borderColor: 'red'`.
7. **Commit 7:** Add JSDoc for `onChangeText` and `value` at line 5.
8. **Commit 8:** In `styles.input` (line 45), set `borderColor` to `theme.colors.border`.
9. **Commit 9:** At line 22, add `?.` to `props?.label`.
10. **Commit 10:** Add `selectionColor={theme.colors.primary}` to the `TextInput`.
11. **Commit 11:** Place `/** @description Theme-aware text input with validation */` at line 3.
12. **Commit 12:** Add a `showPassword` prop for `secureTextEntry`.
13. **Commit 13:** In `styles.input`, set `height` to `50`.
14. **Commit 14:** **FEATURE:** Add a red `*` next to the label if `required` prop is true.
15. **Commit 15:** Remove unused styles at line 60.
