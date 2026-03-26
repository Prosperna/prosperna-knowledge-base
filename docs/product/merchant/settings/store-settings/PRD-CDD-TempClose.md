---
id: cdd-temporarily-close-integration
title: PRD. CDD × Temporarily Close Integration
sidebar_label: CDD × Temporarily Close Integration
sidebar_position: 3
---

## Document Control
- Version: 1.0
- Owner: Business Analyst Agent
- Date: 2026-03-26
- Status: Draft

---

## Summary

This feature closes the integration gap between the **Custom Delivery Date (CDD)** picker and the **Temporarily Close** schedule on the Prosperna customer-facing Online Store (`p1-customer`). All changes are frontend-only and confined to the cart page and the `CustomDeliveryDatePicker` component. No backend or API changes are required.

The fix introduces closure-aware logic at two levels:
1. **Calendar level** — blocks calendar dates where all delivery time slots overlap with one or more closure ranges.
2. **Time slot level** — filters individual time slots that overlap with closure ranges before presenting the time picker.

A tooltip is rendered on blocked calendar dates to explain why the date is unavailable.

---

## User Journey

### Happy Path

**Preconditions:**
- CDD is active for the store location (`customDeliveryDateSetupIsActivate = true`)
- Temporarily Close is enabled (`isTemporaryCloseEnabled = true`)
- At least one closure range exists in `temporaryCloseDetails.dates[]`
- The closure range covers some but not all delivery slots on a given day

**Steps:**
1. Customer adds items to cart; cart is tagged with a product tag matching an active CDD setup.
2. Customer clicks "Checkout".
3. `Main.tsx` evaluates `storeClosedStatus` — if the store is currently open, proceeds normally.
4. `Main.tsx` renders `<CustomDeliveryDatePicker>` and passes `temporaryCloseDetails` and `isTemporaryCloseEnabled` as new props.
5. The CDD calendar opens. `isWeekday()` runs for each date:
   - For `per_day` mode: a date is selectable only if at least one time slot on that day survives the closure filter.
   - For `date_range` mode: a date is selectable only if it does not fall within any closure range (date-level comparison).
6. Dates where all slots are covered by closures are grayed out in the calendar. On hover, a tooltip reads: `"Store is closed on this date."`
7. Customer selects a valid date. `handleChange()` fires:
   - Loads time slots for the selected day.
   - Applies the same-day past-cutoff filter (existing behavior).
   - Applies the new closure overlap filter — removes any slot where `slot.start < closure.closeTo AND slot.end > closure.closeFrom`.
   - Only valid, non-overlapping slots are presented in the time picker.
8. Customer selects a valid time slot and confirms.
9. `POST /v1/orders/cart/{cart_id}/custom-delivery-date` saves the selected delivery date.
10. `handleCheckoutClick()` proceeds to checkout.

---

### Alternate and Failure Paths

**Alt-1: All time slots on a date are covered by closures**
- `isWeekday()` → `hasValidSlot` returns `false` → date blocked in calendar.
- Customer cannot select the date; tooltip explains the date is unavailable.

**Alt-2: `date_range` mode — selected date falls within a closure**
- `isWeekday()` closure branch for `date_range` → `isClosed = true` → date blocked.
- No time picker is shown (date_range mode has no time picker regardless).

**Alt-3: `isTemporaryCloseEnabled = false`**
- All new closure-filtering code is guarded by `isTemporaryCloseEnabled &&` checks.
- No change to existing behavior; all dates and slots shown as before.

**Alt-4: `temporaryCloseDetails` is null, undefined, or fetch failed (fail-open)**
- All new logic guards on `temporaryCloseDetails?.dates?.length` — evaluates falsy for null/undefined/empty.
- Picker falls back to current behavior; no dates or slots are blocked.
- No error state is shown to the customer.

**Alt-5: Exact boundary — slot ends exactly when closure starts**
- Overlap formula: `slotStart.isBefore(closureTo) AND slotEnd.isAfter(closureFrom)`.
- `slotEnd.isAfter(closureFrom)` is `false` when `slotEnd === closureFrom` (strict comparison).
- Slot is **not** blocked; it remains available in the time picker.

**Alt-6: Multiple closure ranges on the same date**
- Each time slot is checked against all closure ranges using `.some()`.
- A slot is removed if it overlaps **any** range; a slot is kept only if it does not overlap **any** range.

---

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | `Main.tsx` must pass `temporaryCloseDetails` and `isTemporaryCloseEnabled` as props to `<CustomDeliveryDatePicker>`. Both values are already in scope; no new API calls are required. |
| FR-2 | The `ICustomDeliveryDatePicker` interface must declare `temporaryCloseDetails` (type: `TemporaryCloseDetails \| null \| undefined`) and `isTemporaryCloseEnabled` (type: `boolean \| undefined`) as optional props. |
| FR-3 | A pure utility function `timeslotOverlapsClosure(slotStart, slotEnd, closeFrom, closeTo, date)` must be implemented using the half-open interval formula: `slotStartDt.isBefore(closureTo) && slotEndDt.isAfter(closureFrom)`. |
| FR-4 | In `per_day` mode, a calendar date must be blocked (non-selectable) if and only if **all** time slots configured for that day overlap with one or more closure ranges. If at least one valid slot exists, the date remains selectable. |
| FR-5 | In `date_range` mode, a calendar date must be blocked if it falls on or within any closure range (date-level comparison using `isSameOrAfter` / `isSameOrBefore` at day granularity). |
| FR-6 | All new closure-checking logic in `isWeekday()` must be gated on `isTemporaryCloseEnabled && temporaryCloseDetails?.dates?.length`. When this guard is falsy, `isWeekday()` must behave exactly as it does today. |
| FR-7 | In `handleChange()`, after the existing deduplication and same-day cutoff filters, a closure overlap filter must be applied that removes any time slot where `timeslotOverlapsClosure()` returns `true` against any closure range. |
| FR-8 | All new time-slot filtering in `handleChange()` must be gated on `isTemporaryCloseEnabled && temporaryCloseDetails?.dates?.length`. When this guard is falsy, `handleChange()` must behave exactly as it does today. |
| FR-9 | Blocked calendar dates must display a tooltip with the text `"Store is closed on this date."` via `ReactDatePicker`'s `renderDayContents` prop. |
| FR-10 | If `temporaryCloseDetails` is null, undefined, or empty (fetch failure or feature disabled), the date picker must fail-open: show all dates and slots as if no closure exists. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Performance:** `isWeekday()` runs synchronously per calendar date render. The closure check must not introduce perceptible calendar re-render lag. The closure dates array is expected to be small (typically < 30 entries per location); no memoization is required unless profiling indicates otherwise. |
| NFR-2 | **Backward compatibility:** The two new props on `ICustomDeliveryDatePicker` must be optional. All existing call sites that do not pass these props must continue to function without modification. |
| NFR-3 | **Correctness under timezone variance:** All datetime comparisons in `timeslotOverlapsClosure()` must use a consistent local timezone basis. The function must not produce incorrect results due to UTC vs. local offset mismatches. |
| NFR-4 | **No new network calls:** This change must not introduce any new API requests. All required data is already fetched by `Main.tsx`. |
| NFR-5 | **Mobile tooltip:** The native `title` attribute used for blocked-date tooltips does not fire on touch. If mobile UX is a priority, the tooltip must be replaced with a `react-bootstrap` `OverlayTrigger` + `Tooltip` component. This is deferred but must be tracked as a follow-on. |
| NFR-6 | **Test coverage:** The `timeslotOverlapsClosure()` utility function must be covered by unit tests for all 6 edge cases defined in this document. |

---

## UX Notes

- Closure-blocked dates are visually grayed out by `ReactDatePicker` natively when `filterDate` returns `false`. The tooltip (Change 6) adds explanatory context but does not change the functional visual state.
- The tooltip text `"Store is closed on this date."` is display-only; no localization requirement is specified for this release.
- No new loading state or error state UI is required — fail-open means the picker renders exactly as it does today on any data-fetch failure.
- The time picker modal already shows only valid slots after filtering; no empty-state handling is needed in the time picker since a date with zero valid slots is blocked at the calendar level before the customer can reach the time picker.

---

## Data Model Notes

No data model changes are required. The existing `TemporaryCloseDetails` interface in `p1-customer/utils/storeClosureUtils.ts` is used as the prop type:

```typescript
export interface TemporaryCloseDetails {
  storeId: string;
  storeLocationId: string;
  bannerStripDescription: string;
  createdAt: string;
  dates?: Array<{
    closeFrom: string;  // ISO datetime string
    closeTo: string;    // ISO datetime string
    _id: string;
  }>;
  updatedAt: string;
  id: string;
}
```

Key notes:
- `closeFrom` and `closeTo` are full ISO datetime strings — partial-day closures are natively supported.
- `dates` is optional in the interface; the guard `temporaryCloseDetails?.dates?.length` handles the undefined case.
- Scoped per `storeLocationId` — a closure on one location does not affect another.

---

## Integrations and APIs

| Integration | Change | Notes |
|---|---|---|
| `StoreAPI.useGetStoreTemporaryCloseDetails()` | None | Already called in `Main.tsx`; result is threaded as a prop |
| `POST /v1/orders/cart/{cart_id}/custom-delivery-date` | None | Submit endpoint unchanged; only valid slots reach this call |
| `ReactDatePicker` | `renderDayContents` prop added | Used for tooltip on blocked dates (Change 6) |
| `moment` | Used in `timeslotOverlapsClosure()` | Existing dependency; no new package installation required |

---

## Error Handling

| Scenario | Behavior |
|---|---|
| `temporaryCloseDetails` fetch returns error | Picker renders fail-open; no closure filtering applied; no error shown to customer |
| `temporaryCloseDetails` is `null` or `undefined` | Picker renders fail-open; all guards evaluate falsy and skip closure logic |
| `temporaryCloseDetails.dates` is empty array or undefined | Picker renders fail-open; `dates?.length` evaluates falsy and skips closure logic |
| `handleChange()` closure filter removes all remaining slots | This case cannot occur — `isWeekday()` already blocked the date at calendar level, preventing `handleChange()` from firing for that date |

---

## Telemetry and Analytics

No analytics instrumentation is required for this change. This is a correctness fix, not a new feature being measured for adoption.

---

## Rollout Plan

- Released directly with no additional feature flag.
- The change piggybacks on the existing `isTemporaryCloseEnabled` flag on `currentStoreLocation`. Merchants who do not use Temporarily Close are unaffected.
- No phased rollout, A/B test, or canary deployment is required.

---

## Open Questions

None. All questions resolved during the BA interview session on 2026-03-26.

---

# Gherkin User Stories

## Feature: CDD × Temporarily Close Integration

---

### FR-1, FR-2 — Prop Threading

```gherkin
Feature: CDD × Temporarily Close Integration

  Scenario: Closure data is passed to the date picker when both features are active
    Given a store location with isTemporaryCloseEnabled set to true
    And temporaryCloseDetails contains at least one closure range
    And the customer cart page renders CustomDeliveryDatePicker
    When Main.tsx renders the component
    Then temporaryCloseDetails is passed as a prop to CustomDeliveryDatePicker
    And isTemporaryCloseEnabled is passed as a prop to CustomDeliveryDatePicker

  Scenario: Date picker renders without error when closure props are omitted
    Given a call site that renders CustomDeliveryDatePicker without temporaryCloseDetails
    And without isTemporaryCloseEnabled
    When the component renders
    Then it renders successfully with no runtime errors
    And all existing date picker behavior is preserved
```

---

### FR-3 — Overlap Utility

```gherkin
  Scenario: Slot overlaps with closure range — slot is blocked
    Given a time slot from 13:00 to 17:00 on April 3
    And a closure range from April 3 12:00 to April 3 17:00
    When timeslotOverlapsClosure is called
    Then it returns true

  Scenario: Slot ends exactly when closure starts — slot is not blocked
    Given a time slot from 08:00 to 12:00 on April 3
    And a closure range starting at April 3 12:00
    When timeslotOverlapsClosure is called
    Then it returns false
    # Strict isBefore/isAfter — exact boundary is not an overlap

  Scenario: Slot is entirely before closure — slot is not blocked
    Given a time slot from 08:00 to 10:00 on April 3
    And a closure range from April 3 14:00 to April 3 18:00
    When timeslotOverlapsClosure is called
    Then it returns false

  Scenario: Slot is entirely after closure — slot is not blocked
    Given a time slot from 19:00 to 21:00 on April 3
    And a closure range from April 3 12:00 to April 3 17:00
    When timeslotOverlapsClosure is called
    Then it returns false

  Scenario: Slot is entirely within closure — slot is blocked
    Given a time slot from 13:00 to 16:00 on April 3
    And a closure range from April 3 12:00 to April 3 17:00
    When timeslotOverlapsClosure is called
    Then it returns true

  Scenario: Slot spans across the entire closure window — slot is blocked
    Given a time slot from 10:00 to 20:00 on April 3
    And a closure range from April 3 12:00 to April 3 17:00
    When timeslotOverlapsClosure is called
    Then it returns true
```

---

### FR-4 — Calendar Blocking (per_day mode)

```gherkin
  Scenario: Date is blocked when all slots overlap with a closure
    Given per_day CDD mode
    And April 5 has three time slots: 08:00–12:00, 13:00–17:00, 19:00–23:00
    And a closure range from April 5 07:00 to April 5 23:59
    When the customer views the calendar
    Then April 5 is not selectable
    And a tooltip "Store is closed on this date." is shown on hover

  Scenario: Date remains selectable when at least one slot survives closure filter
    Given per_day CDD mode
    And April 3 has three time slots: 08:00–12:00, 13:00–17:00, 19:00–23:00
    And a closure range from April 3 12:00 to April 3 18:00
    When the customer views the calendar
    Then April 3 is selectable
    # Slots 08:00–12:00 and 19:00–23:00 are valid

  Scenario: Date is not affected by closure filtering when isTemporaryCloseEnabled is false
    Given isTemporaryCloseEnabled is false
    And a closure range exists in temporaryCloseDetails
    When the customer views the calendar
    Then all normally-available dates remain selectable
    And no closure filtering is applied
```

---

### FR-5 — Calendar Blocking (date_range mode)

```gherkin
  Scenario: Date within a closure range is blocked in date_range mode
    Given date_range CDD mode
    And a closure range from April 5 00:00 to April 5 23:59
    When the customer views the calendar
    Then April 5 is not selectable

  Scenario: Date outside any closure range remains selectable in date_range mode
    Given date_range CDD mode
    And a closure range from April 5 00:00 to April 5 23:59
    When the customer views the calendar for April 6
    Then April 6 is selectable
```

---

### FR-6, FR-8 — Fail-Open Guard

```gherkin
  Scenario: Date picker fails open when temporaryCloseDetails is null
    Given isTemporaryCloseEnabled is true
    And temporaryCloseDetails is null due to a failed API fetch
    When the customer opens the date picker
    Then all dates and slots are shown as if no closure exists
    And no error message is displayed to the customer

  Scenario: Date picker fails open when temporaryCloseDetails.dates is empty
    Given isTemporaryCloseEnabled is true
    And temporaryCloseDetails.dates is an empty array
    When the customer opens the date picker
    Then all dates and slots are shown as if no closure exists
```

---

### FR-7 — Time Slot Filtering

```gherkin
  Scenario: Overlapping time slots are removed before showing the time picker
    Given per_day CDD mode
    And the customer selects April 3
    And April 3 has three time slots: 08:00–12:00, 13:00–17:00, 19:00–23:00
    And a closure range from April 3 12:00 to April 3 18:00
    When handleChange fires for April 3
    Then the time picker is shown with only: 08:00–12:00 and 19:00–23:00
    And 13:00–17:00 is not shown

  Scenario: Multiple closure ranges filter multiple slots on the same date
    Given per_day CDD mode
    And the customer selects April 3
    And April 3 has three time slots: 08:00–12:00, 13:00–17:00, 19:00–23:00
    And closure A is from April 3 08:00 to April 3 12:00
    And closure B is from April 3 13:00 to April 3 18:00
    When handleChange fires for April 3
    Then the time picker is shown with only: 19:00–23:00
    And 08:00–12:00 is not shown
    And 13:00–17:00 is not shown
```

---

### FR-9 — Tooltip

```gherkin
  Scenario: Tooltip shown on a closure-blocked calendar date
    Given a calendar date that is blocked because all slots overlap with a closure
    When the customer hovers over that date
    Then a tooltip reading "Store is closed on this date." is displayed

  Scenario: No tooltip on a selectable date
    Given a calendar date that is selectable
    When the customer hovers over that date
    Then no closure tooltip is displayed
```

---

### FR-10 — Fail-Open

```gherkin
  Scenario: Date picker behaves normally when isTemporaryCloseEnabled is false
    Given isTemporaryCloseEnabled is false
    When the customer opens the date picker
    Then no closure data is evaluated
    And the date picker behaves identically to the current pre-fix behavior
```

---

# Traceability Map

| FR | Gherkin Scenario(s) |
|---|---|
| FR-1 | "Closure data is passed to the date picker when both features are active" |
| FR-2 | "Date picker renders without error when closure props are omitted" |
| FR-3 | "Slot overlaps with closure range — slot is blocked"; "Slot ends exactly when closure starts — slot is not blocked"; "Slot is entirely before closure"; "Slot is entirely after closure"; "Slot is entirely within closure"; "Slot spans across the entire closure window" |
| FR-4 | "Date is blocked when all slots overlap with a closure"; "Date remains selectable when at least one slot survives"; "Date is not affected when isTemporaryCloseEnabled is false" |
| FR-5 | "Date within a closure range is blocked in date_range mode"; "Date outside any closure range remains selectable in date_range mode" |
| FR-6 | "Date is not affected by closure filtering when isTemporaryCloseEnabled is false" |
| FR-7 | "Overlapping time slots are removed before showing the time picker"; "Multiple closure ranges filter multiple slots on the same date" |
| FR-8 | "Date picker fails open when temporaryCloseDetails is null"; "Date picker fails open when temporaryCloseDetails.dates is empty" |
| FR-9 | "Tooltip shown on a closure-blocked calendar date"; "No tooltip on a selectable date" |
| FR-10 | "Date picker behaves normally when isTemporaryCloseEnabled is false"; "Date picker fails open when temporaryCloseDetails is null" |
