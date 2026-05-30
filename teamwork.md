# 📜 BlastXApp: 15-Commit Individual Workplans (PRODUCTION READY)

> **OVERVIEW:** We are migrating from Mock Data to **Production Firebase**.
> Each member is responsible for updating their assigned file to handle real database calls, passing `companyCode`, and improving error handling.

---

## 👤 Member 1: DashboardScreen.jsx (Main Hub)
1. **Commit 1:** `// Member 1 - Dashboard Lead` at line 1.
2. **Commit 2:** Add `import { storage, RBAC } from "../utils/storage";` if missing.
3. **Commit 3:** Update `loadDashboardData` to fetch `userData` first.
4. **Commit 4:** Pass `userData.companyCode` to `storage.getBlasts()`.
5. **Commit 5:** `// Step 5: Syncing company name from real-time Firestore`.
6. **Commit 6:** Add `const [canEdit, setCanEdit] = useState(true);` state.
7. **Commit 7:** Use `RBAC.canEditBlasts(data.minePosition)` to set `canEdit`.
8. **Commit 8:** Update `handleExport` to pass `userData?.company`.
9. **Commit 9:** Update "🧞 {userData?.company?.name}" to handle loading states.
10. **Commit 10:** Add `{loading && <ActivityIndicator color="#FF9900" />}` in header.
11. **Commit 11:** Change `styles.headerSubtitle` color to `theme.textSecondary`.
12. **Commit 12:** Add JSDoc: `/** @description Dashboard with real Firebase data integration */`.
13. **Commit 13:** Add `?.` safety to `nextBlast?.launchDate`.
14. **Commit 14:** **FEATURE:** Add a refresh button to trigger `loadDashboardData`.
15. **Commit 15:** Remove any remaining `MOCK_` references.

---

## 👤 Member 2: BlastHistoryScreen.jsx (History)
1. **Commit 1:** `// Member 2: History Lead` at line 1.
2. **Commit 2:** Update `useEffect` to load data on focus.
3. **Commit 3:** Fetch `userData` to obtain `companyCode`.
4. **Commit 4:** Call `storage.getBlasts(userData.companyCode, 50)`.
5. **Commit 5:** Add search filter logic for blast titles.
6. **Commit 6:** `// Step 6: Implementing historical data pagination`.
7. **Commit 7:** Change list background to `theme.background`.
8. **Commit 8:** Wrap main View in `ScreenWrapper`.
9. **Commit 9:** Add empty state if no history exists.
10. **Commit 10:** Add loading indicator during fetch.
11. **Commit 11:** Format dates using `toLocaleDateString`.
12. **Commit 12:** Add JSDoc: `/** @description Historical record of all mine blasts */`.
13. **Commit 13:** Add error alert if Firestore fetch fails.
14. **Commit 14:** **FEATURE:** Add "Filter by Date" dropdown placeholder.
15. **Commit 15:** Final formatting.

---

## 👤 Member 3: BlastsListScreen.jsx (Management)
1. **Commit 1:** `// Member 3: List Management` at line 1.
2. **Commit 2:** Add `import { storage } from "../utils/storage";`.
3. **Commit 3:** Ensure `companyCode` is passed to `getRecents`.
4. **Commit 4:** Implement "Pull to Refresh" functionality.
5. **Commit 5:** Filter list by `status` (Scheduled vs Completed).
6. **Commit 6:** `// Step 6: Optimizing list performance with FlatList`.
7. **Commit 7:** Use `BlastItem` for rendering records.
8. **Commit 8:** Pass `blast` object to navigation params.
9. **Commit 9:** Add "Total Blasts: {count}" badge.
10. **Commit 10:** Update header title to "Blast Operations".
11. **Commit 11:** Add `try/catch` around data loading.
12. **Commit 12:** Add JSDoc: `/** @description Active and upcoming blast operation list */`.
13. **Commit 13:** Add `?.` to `item?.targetArea`.
14. **Commit 14:** **FEATURE:** Add "Sort by Size" toggle.
15. **Commit 15:** Remove console.logs.

---

## 👤 Member 4: PlanEventScreen.jsx (Creation)
1. **Commit 1:** `// Member 4: Blast Planning Lead` at line 1.
2. **Commit 2:** Import `storage` and `auth`.
3. **Commit 3:** Initialize form state with empty values.
4. **Commit 4:** Add validation check for required fields.
5. **Commit 5:** Fetch `userData` to get `companyCode` and `name`.
6. **Commit 6:** `// Step 6: Persisting new blast to Firestore`.
7. **Commit 7:** Call `storage.saveBlast()` with `companyCode`.
8. **Commit 8:** Show `ActivityIndicator` on "Save" button press.
9. **Commit 9:** Add JSDoc: `/** @description Form for scheduling new blast events */`.
10. **Commit 10:** Redirect to Dashboard on success.
11. **Commit 11:** Add `Alert.alert` for validation errors.
12. **Commit 12:** Set `createdByName` field in blast data.
13. **Commit 13:** Ensure `launchDate` is in ISO format.
14. **Commit 14:** **FEATURE:** Add "Add Holes Count" numeric input.
15. **Commit 15:** Clean up state on unmount.

---

## 👤 Member 5: ProfileScreen.jsx (User Settings)
1. **Commit 1:** Add `// Member 5: Profile Lead` at line 1.
2. **Commit 2:** Add `import { authHelpers } from "../utils/firebase";`.
3. **Commit 3:** Fetch real user data from `storage.getUserData()`.
4. **Commit 4:** Display user `email` and `minePosition`.
5. **Commit 5:** Display `company.name` and `company.location`.
6. **Commit 6:** `// Step 6: Implementing production logout`.
7. **Commit 7:** Call `authHelpers.signOutUser()` on logout.
8. **Commit 8:** Use `Alert.confirm` before signing out.
9. **Commit 9:** Change text colors to use `theme.text`.
10. **Commit 10:** Add "App Version: 2.0.0 (Production)" at bottom.
11. **Commit 11:** Add `?.` to `userData?.company?.name`.
12. **Commit 12:** Add JSDoc: `/** @description User profile and account management */`.
13. **Commit 13:** Add a "Change Position" button (UI only).
14. **Commit 14:** **FEATURE:** Display Company Code with "Copy" button.
15. **Commit 15:** Final cleanup.

---

## 👤 Member 6: AdminSettingsScreen.jsx (Admin)
1. **Commit 1:** Add `// Member 6: Admin Lead` at line 1.
2. **Commit 2:** Import `RBAC` and `storage`.
3. **Commit 3:** Check `RBAC.isCompanyAdmin` on mount.
4. **Commit 4:** Implement `storage.toggleRBAC` call.
5. **Commit 5:** Fetch real company settings from Firestore.
6. **Commit 6:** `// Step 6: Handling company profile updates`.
7. **Commit 7:** Implement `storage.updateCompanyInfo` call.
8. **Commit 8:** Show success toast/alert after saving.
9. **Commit 9:** List team members using `storage.getTeammates`.
10. **Commit 10:** Add "RBAC Status" indicator.
11. **Commit 11:** Update `Switch` colors to `theme.primary`.
12. **Commit 12:** Add JSDoc: `/** @description Company-wide configuration and permissions */`.
13. **Commit 13:** Add `?.` to `company?.rbacEnabled`.
14. **Commit 14:** **FEATURE:** Add "Invite Teammate" button placeholder.
15. **Commit 15:** Clean up logs.

---

## 👤 Member 7: SetupScreen.jsx (Onboarding)
1. **Commit 1:** Add `// Member 7: Setup Lead` at line 1.
2. **Commit 2:** Import `storage` and `auth`.
3. **Commit 3:** Add form for "Company Name" and "Location".
4. **Commit 4:** Implement `storage.updateCompanyInfo` for new companies.
5. **Commit 5:** Generate unique `companyCode` (or use UID).
6. **Commit 6:** `// Step 6: Finalizing user profile in Firestore`.
7. **Commit 7:** Link user to company via `companyCode`.
8. **Commit 8:** Use `ActivityIndicator` during setup.
9. **Commit 9:** Navigate to "MainApp" after setup.
10. **Commit 10:** Add validation: "Company name must be > 3 chars".
11. **Commit 12:** Add JSDoc: `/** @description One-time company initialization flow */`.
13. **Commit 13:** Add `?.` to `auth.currentUser?.uid`.
14. **Commit 14:** **FEATURE:** Add "Mine Type" picker (Surface/Underground).
15. **Commit 15:** Final format.

---

## 👤 Member 8: LoginScreen.jsx (Login)
1. **Commit 1:** Add `// Member 8: Auth Login Lead` at line 1.
2. **Commit 2:** Import `authHelpers` from `../utils/firebase`.
3. **Commit 3:** Add `email` and `password` states.
4. **Commit 4:** Call `authHelpers.signIn()` on press.
5. **Commit 5:** Implement error mapping (e.g., 'auth/user-not-found').
6. **Commit 6:** `// Step 6: Handling login persistence`.
7. **Commit 7:** Show loading state on button.
8. **Commit 8:** Navigate to Dashboard on success.
9. **Commit 9:** Clear password field on error.
10. **Commit 10:** Add "Don't have an account? Signup" link.
11. **Commit 11:** Style inputs with `theme.surface`.
12. **Commit 12:** Add JSDoc: `/** @description Firebase authentication login screen */`.
13. **Commit 13:** Add `?.` to `error?.message`.
14. **Commit 14:** **FEATURE:** Add "Show Password" toggle icon.
15. **Commit 15:** Final cleanup.

---

## 👤 Member 9: SignupScreen.jsx (Signup)
1. **Commit 1:** Add `// Member 9: Auth Signup Lead` at line 1.
2. **Commit 2:** Import `authHelpers` from `../utils/firebase`.
3. **Commit 3:** Add `fullName`, `email`, and `password` states.
4. **Commit 4:** Call `authHelpers.signUp()` on press.
5. **Commit 5:** Validate password length (> 6 chars).
6. **Commit 6:** `// Step 6: Initializing user document in Firestore`.
7. **Commit 7:** Pass name and role to signup helper.
8. **Commit 8:** Show `ActivityIndicator` during account creation.
9. **Commit 9:** Navigate to "Setup" after signup.
10. **Commit 10:** Add "Already have an account? Login" link.
11. **Commit 11:** Update button color to `theme.primary`.
12. **Commit 12:** Add JSDoc: `/** @description Firebase registration and profile creation */`.
13. **Commit 13:** Add `?.` to `val?.errorMessage`.
14. **Commit 14:** **FEATURE:** Add "Terms of Service" checkbox.
15. **Commit 15:** Final cleanup.

---

## 👤 Member 10: RecordBlastResultsScreen.jsx (Recording)
1. **Commit 1:** Add `// Member 10: Results Recording Lead` at line 1.
2. **Commit 2:** Import `storage` and `Alert`.
3. **Commit 3:** Get `blast` from navigation route params.
4. **Commit 4:** Add states for `rocksFragmented` and `productivityRating`.
5. **Commit 5:** Implement `storage.recordBlastResults` call.
6. **Commit 6:** `// Step 6: Updating blast status to 'Completed'`.
7. **Commit 7:** Pass `companyCode` from blast object.
8. **Commit 8:** Show confirmation alert before saving.
9. **Commit 9:** Navigate back to Dashboard after save.
10. **Commit 10:** Add JSDoc explaining the recording process.
11. **Commit 11:** Add numeric validation for productivity.
12. **Commit 12:** Add JSDoc: `/** @description Post-blast data entry and status update */`.
13. **Commit 13:** Add `?.` to `blast?.id`.
14. **Commit 14:** **FEATURE:** Add "Fragmentation Photo" placeholder.
15. **Commit 15:** Final cleanup.

---

## 👤 Member 11: export.js (Utils)
1. **Commit 1:** Add `// Member 11: Export Utility Lead` at line 1.
2. **Commit 2:** Update `generateBlastReport` signature to accept `company`.
3. **Commit 3:** Replace mock header with `company.name`.
4. **Commit 4:** Map `blasts` array to HTML table rows.
5. **Commit 5:** Add JSDoc for `htmlContent` generator.
6. **Commit 6:** `// Step 6: Formatting PDF table for production`.
7. **Commit 7:** Use `theme.primary` for table headers.
8. **Commit 8:** Add "Generated on: {timestamp}" footer.
9. **Commit 9:** Add `?.` to `blast.targetArea`.
10. **Commit 10:** Wrap PDF sharing in `try/catch`.
11. **Commit 11:** Add `Alert.alert` if `Print.printToFileAsync` fails.
12. **Commit 12:** Add JSDoc: `/** @description Business intelligence PDF generation */`.
13. **Commit 13:** Clean up unused mock HTML templates.
14. **Commit 14:** **FEATURE:** Add Company Logo placeholder in HTML.
15. **Commit 15:** Final code cleanup.

---

## 👤 Member 12: notifications.js (Utils)
1. **Commit 1:** Add `// Member 12: Notification Lead` at line 1.
2. **Commit 2:** Add `import * as Notifications from 'expo-notifications';`.
3. **Commit 3:** Implement `scheduleBlastReminder` function.
4. **Commit 4:** Add JSDoc for notification triggers.
5. **Commit 5:** `// Step 5: Handling notification permissions`.
6. **Commit 6:** Check `Notifications.getPermissionsAsync()`.
7. **Commit 7:** Add `Alert` if permissions are denied.
8. **Commit 8:** Add `?.` to `notif?.content`.
9. **Commit 9:** Log success of scheduled notification.
10. **Commit 10:** Add "Cancel All" utility function.
11. **Commit 11:** Change priority to `HIGH`.
12. **Commit 12:** Add JSDoc: `/** @description System-wide alerts and push notifications */`.
13. **Commit 13:** Add `finally` block to clear any local logs.
14. **Commit 14:** **FEATURE:** Add "Mute Notifications" setting placeholder.
15. **Commit 15:** Remove logs.

---

## 👤 Member 13: BlastItem.jsx (Component)
1. **Commit 1:** Add `// Member 13: BlastItem Lead` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";`.
3. **Commit 3:** Use `theme.card` for background.
4. **Commit 4:** Display `blast.title` and `blast.status`.
5. **Commit 5:** `// Step 5: Formatting production timestamps`.
6. **Commit 6:** Use `formatDate` helper for `createdAt`.
7. **Commit 7:** Change status badge color based on status (Scheduled/Completed).
8. **Commit 8:** Add `?.` to `blast?.blastSize`.
9. **Commit 9:** Update text colors to `theme.text`.
10. **Commit 10:** Add icon based on blast type.
11. **Commit 11:** Use `Pressable` for item selection.
12. **Commit 12:** Add JSDoc: `/** @description Standardized card for displaying blast data */`.
13. **Commit 13:** Add JSDoc for `onPress` prop.
14. **Commit 14:** **FEATURE:** Add "New" badge for blasts < 24h old.
15. **Commit 15:** Clean up styles.

---

## 👤 Member 14: Card.jsx (Component)
1. **Commit 1:** Add `// Member 14: UI Card Lead` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";`.
3. **Commit 3:** Apply `theme.card` background.
4. **Commit 4:** Add JSDoc for `children` and `style` props.
5. **Commit 5:** `// Step 5: implementing shadow effects for production`.
6. **Commit 6:** Use `theme.border` for 1px outline.
7. **Commit 7:** Set `shadowOpacity: 0.1` for Light Mode.
8. **Commit 8:** Add `elevation: 2` for Android.
9. **Commit 9:** Wrap in `View` with `overflow: 'hidden'`.
10. **Commit 10:** Add a "no-shadow" prop.
11. **Commit 11:** Add JSDoc: `/** @description Primary container for UI sections */`.
12. **Commit 12:** Update default padding to `16`.
13. **Commit 13:** Add `borderRadius: 12`.
14. **Commit 14:** **FEATURE:** Add "pressed" state opacity change.
15. **Commit 15:** Final format.

---

## 👤 Member 15: Input.jsx (Component)
1. **Commit 1:** Add `// Member 15: UI Input Lead` at line 1.
2. **Commit 2:** Add `import { useTheme } from "../utils/theme";`.
3. **Commit 3:** Use `theme.surface` for background.
4. **Commit 4:** Set `placeholderTextColor` to `theme.textSecondary`.
5. **Commit 5:** `// Step 5: Adding validation UI indicators`.
6. **Commit 6:** Add `error` prop and display red border if true.
7. **Commit 7:** Add JSDoc for `onChangeText` and `value`.
8. **Commit 8:** Use `theme.primary` for focus border.
9. **Commit 9:** Add `?.` to `props?.label`.
10. **Commit 10:** Add `selectionColor` from `theme.primary`.
11. **Commit 11:** Add JSDoc: `/** @description Theme-aware text input with validation */`.
12. **Commit 12:** Add `secureTextEntry` toggle support.
13. **Commit 13:** Set `height: 50` for touch targets.
14. **Commit 14:** **FEATURE:** Add "Required *" label indicator.
15. **Commit 15:** Final cleanup.
