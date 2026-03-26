---
id: cdd-temporarily-close-integration
title: BRD. CDD × Temporarily Close Integration
sidebar_label: CDD × Temporarily Close Integration
sidebar_position: 2
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-26
- Status: Draft

---

## Background and Problem

Prosperna's **Custom Delivery Date (CDD)** feature and **Temporarily Close** feature were designed and built independently. When both features are active for the same store location, a gap exists that allows customers to book a delivery date or time slot that falls entirely within a merchant-configured closure window.

**Root cause:** `temporaryCloseDetails` is fetched in `Main.tsx` (the cart page) and used only for a real-time closed-store check (`getStoreClosedStatus`). This data is never passed to the `<CustomDeliveryDatePicker>` component, which means the date picker has no awareness of closure schedules when rendering selectable calendar dates and time slots.

**Impact of the gap:**
- Customers can place orders for delivery periods the merchant will not fulfill.
- Merchants are unaware the gap exists and assume the platform enforces closure blocking end-to-end.
- Prosperna Customer Support must manually reconcile closure schedules with order timestamps to diagnose fulfillment failures — a time-consuming, error-prone process.

---

## Goals

1. Ensure that no customer can select a delivery date or time slot that falls within an active Temporarily Close window.
2. Surface closure-blocked dates visually in the calendar so customers understand why a date is unavailable.
3. Preserve all existing date picker behavior for merchants who do not use the Temporarily Close feature.
4. Deliver the fix with zero backend changes — all changes are confined to the `p1-customer` frontend.

---

## Non-Goals

- Backend-level enforcement of closure dates on order submission (deferred).
- Merchant dashboard warning when CDD and Temporarily Close schedules overlap (separate merchant-facing UX improvement).
- "Store reopens at X" messaging inside the time picker (deferred UX pass).
- Recurring weekly closures (handled separately by the `isWeekday()` activated-days check; this fix addresses only explicit date ranges).
- Audit logging of blocked slot selections.

---

## Stakeholders

| Role | Interest |
|---|---|
| Product Manager | Owns the feature gap closure decision; approves scope and success metrics |
| Frontend Engineer (p1-customer) | Implements the 6 code changes in `CustomDeliveryDatePicker.tsx` and `Main.tsx` |
| QA Engineer | Validates all edge cases listed in the scope document before release |
| Prosperna Customer Support | Primary internal beneficiary — reduction in unfulfilled-order escalations |
| Merchant (external) | Assumes closure blocking is enforced; this fix closes the false assumption gap |
| Customer / End User | Must not be shown delivery slots that will not be fulfilled |

---

## Personas

### Merchant (Primary Configurator)
Operates a food, retail, or service business on Prosperna Online Store. Configures Custom Delivery Date setups for fulfillment logistics and Temporary Close periods for holidays, maintenance, or unexpected closures. Pain point: assumes ordering is automatically blocked for closure windows — unaware of the CDD picker gap.

### Customer (End User)
Shopper on the merchant's Online Store. Selects delivery dates and time slots during checkout. Pain point: should never be shown a delivery slot they cannot actually receive; receiving an unfulfilled order creates a negative post-purchase experience.

### Prosperna Customer Support (Internal)
Receives merchant escalations when orders are placed but not fulfilled. Pain point: without this fix, CS must manually cross-reference closure schedules with order timestamps to diagnose issues.

---

## Business Value

| Dimension | Value |
|---|---|
| **Operational correctness** | Eliminates a class of unfulfillable orders caused by the CDD × Temporarily Close gap |
| **Merchant trust** | Closes the gap between merchant intent (configure a closure) and platform behavior (do not allow orders for that window) |
| **Customer experience** | Customers never encounter a fulfilled delivery slot that is later cancelled due to a closure the platform should have blocked |
| **Support efficiency** | Reduces manual investigation effort for CS on unfulfilled CDD orders during merchant-declared closure periods |
| **Low implementation cost** | All changes are frontend-only, no API changes required, no new data fetching — the data is already in scope in `Main.tsx` |

---

## Scope

### In Scope

| # | Change | File | Type |
|---|---|---|---|
| 1 | Thread `temporaryCloseDetails` and `isTemporaryCloseEnabled` as props to `<CustomDeliveryDatePicker>` | `p1-customer/app/(routes)/[pages]/[store]/cart/_components/Main.tsx` | Integration |
| 2 | Add two optional props to `ICustomDeliveryDatePicker` interface | `p1-customer/components/CustomDeliveryDatePicker/CustomDeliveryDatePicker.tsx` | Interface update |
| 3 | Add `timeslotOverlapsClosure()` pure utility function | `p1-customer/utils/storeClosureUtils.ts` or inline in component | New utility |
| 4 | Extend `isWeekday()` with closure-aware calendar-level date blocking | `p1-customer/components/CustomDeliveryDatePicker/CustomDeliveryDatePicker.tsx` | Logic extension |
| 5 | Filter invalid time slots in `handleChange()` before showing the time picker | `p1-customer/components/CustomDeliveryDatePicker/CustomDeliveryDatePicker.tsx` | Logic extension |
| 6 | Tooltip on blocked calendar dates via `renderDayContents` | `p1-customer/components/CustomDeliveryDatePicker/CustomDeliveryDatePicker.tsx` | UX enhancement |

### Out of Scope

- Any changes to `business-profile-api` or any backend service
- New API endpoints or modifications to existing endpoint contracts
- Merchant Dashboard UI changes
- Admin Control Platform changes
- Changes to the `getStoreClosedStatus()` real-time closed-store check (existing behavior preserved)

---

## Assumptions

| # | Assumption |
|---|---|
| A-1 | `temporaryCloseDetails` is always available in `Main.tsx` scope at the time `<CustomDeliveryDatePicker>` is rendered |
| A-2 | If `useGetStoreTemporaryCloseDetails()` returns an error or `null`, the date picker must fail-open — showing all dates/slots as if no closure exists (current behavior preserved) |
| A-3 | The `isTemporaryCloseEnabled` flag on `currentStoreLocation` is the authoritative gate; when `false`, all new closure-filtering logic is bypassed |
| A-4 | The existing `moment` library is already a project dependency in `p1-customer` and can be used in the new utility function |
| A-5 | No other location in the codebase renders `<CustomDeliveryDatePicker>` in a context where `temporaryCloseDetails` is available — optional prop typing is sufficient for backward compatibility |
| A-6 | The half-open overlap formula (`slot.start < closure.closeTo AND slot.end > closure.closeFrom`) represents the agreed correct business rule for slot-closure intersection |

---

## Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `StoreAPI.useGetStoreTemporaryCloseDetails()` already called in `Main.tsx` | Existing code | No new fetching required; data is already in scope |
| `isTemporaryCloseEnabled` derived from `currentStoreLocation` | Existing code | Already in `Main.tsx` scope |
| `moment` library | Existing dependency | Required for datetime comparison in `timeslotOverlapsClosure()` |
| `ReactDatePicker` `renderDayContents` prop | Existing component API | Required for Change 6 tooltip |
| `TemporaryCloseDetails` TypeScript interface from `p1-customer/utils/storeClosureUtils.ts` | Existing interface | Re-used as prop type in `ICustomDeliveryDatePicker` |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Closure data fetch fails silently — all dates unexpectedly blocked | Low | High | Fail-open design (A-2): when `temporaryCloseDetails` is null/undefined, skip all closure filtering |
| `moment` timezone offset causes incorrect slot-closure comparison | Medium | Medium | Ensure all datetime comparisons use consistent local timezone; document timezone handling expectation in utility function |
| Optional props break other `<CustomDeliveryDatePicker>` call sites | Low | Low | Props are typed optional; existing call sites omit them without breakage |
| Calendar performance regression on re-renders (closure check runs per date in `filterDate`) | Low | Low | `isWeekday()` runs synchronously with no I/O; closure dates array is typically small (< 30 entries per location) |
| Tooltip does not display on mobile (native `title` attribute) | Medium | Low | For mobile, replace with `react-bootstrap` `OverlayTrigger` + `Tooltip`; document this as a follow-on if mobile UX is a priority |

---

## Compliance and Privacy Notes

- No personally identifiable information is introduced or modified by this change.
- `temporaryCloseDetails` contains only merchant-configured schedule data (datetime ranges and a banner description); no customer data is involved.
- No changes to data retention, storage, or transmission policies.

---

## Success Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| **Zero CDD orders placed within an active Temporarily Close window** | 0 orders placed for a closure-overlapping delivery slot after release | Order audit: cross-reference `selected_delivery_date` on cart orders against the `dates[]` array in `TemporaryCloseDetails` for the same `storeLocationId` |
| **No regression in CDD picker behavior** for merchants without Temporarily Close enabled | All existing CDD flows pass QA regression suite | QA test run: CDD-only scenarios with `isTemporaryCloseEnabled = false` |
| **No regression in real-time Temporarily Close enforcement** | `StoreClosedModal` continues to block checkout when `now` is within a closure window | QA test run: existing Temporarily Close scenarios unchanged |
