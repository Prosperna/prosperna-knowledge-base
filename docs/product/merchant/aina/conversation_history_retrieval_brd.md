---
id: chat-history
title: Chat History PRD (Max AI Only)
sidebar_label: Chat History
sidebar_position: 5
---

## 1. Introduction

### 1.1 Document Purpose

This PRD defines the functional requirements and QA acceptance criteria for MaxAI ChatHistory.

Scope is intentionally focused on ChatHistory user experience only:

- where ChatHistory is located
- how users open it
- how conversation history is displayed
- how QA can validate behavior end to end

### 1.2 Feature Vision

ChatHistory should be easy to discover and reliable to use.

Users should be able to return to previous conversations without confusion, data mixing, or timeline issues.

### 1.3 Success Criteria

User Experience:

- ChatHistory is discoverable from the Welcome Card top area.
- Users can open an existing thread in one click.
- Conversation timeline remains clear and stable.

Quality and Reliability:

- No cross-conversation message mixing in normal flow.
- No missing or duplicate messages after reload.
- Loading, empty, and error states are understandable.

---

## 2. Background and Context

### 2.1 Problem Statement

Users need to continue previous conversations quickly.

Without clear history access and stable rendering:

- users cannot easily continue prior work
- users lose trust if message order changes
- users get confused if conversations appear mixed

### 2.2 Current State

ChatHistory behavior is available in MaxAI, but QA needs a clear requirement set and predictable test path centered on welcome-state entry.

### 2.3 Desired State

- ChatHistory entry is visible on the Welcome Card at the top.
- Clicking ChatHistory opens prior conversation threads.
- Opening a thread shows correct messages in correct order.
- UI states are clear when loading/empty/error occurs.

### 2.4 Target Users

| User Segment  | Description             | Primary Use Case                                        |
| ------------- | ----------------------- | ------------------------------------------------------- |
| Merchant User | MaxAI user in dashboard | Re-open and continue previous AI conversations          |
| QA Tester     | Internal test user      | Validate discoverability and correctness of ChatHistory |

### 2.5 Constraints and Assumptions

Constraints:

- This PRD covers ChatHistory UI behavior only.
- Retrieval quality, LLM memory quality, and ranking are out of scope.

Assumptions:

- QA has at least one account with existing conversation threads.
- Welcome Card is available in initial/new chat state.

---

## 3. Access Location for QA

### 3.1 Where ChatHistory Is Located

ChatHistory entry is on the MaxAI Welcome Card, at the top section.

### 3.2 How QA Can Access It

1. Log in to QA environment.
2. Open MaxAI chat page.
3. Confirm welcome state is visible.
4. Locate ChatHistory at the top of Welcome Card.
5. Click ChatHistory and select a thread.

---

## 4. Functional Requirements and BDD Scenarios

### Feature F-01: ChatHistory Entry Placement on Welcome Card

#### 4.1.1 Feature Context

ChatHistory should be immediately discoverable from welcome state.

#### 4.1.2 Business Rules

- BR-01: ChatHistory entry is shown on Welcome Card.
- BR-02: ChatHistory entry is placed at the top area of Welcome Card.
- BR-03: Entry is visible in standard desktop and mobile layouts.

#### 4.1.3 Scenario

```gherkin
Given I open MaxAI on welcome state
When Welcome Card is shown
Then ChatHistory should be visible at the top of Welcome Card
And I can click it to open conversation history
```

---

### Feature F-02: Conversation History Loads Correctly

#### 4.2.1 Feature Context

Opening a thread should show prior conversation messages accurately.

#### 4.2.2 Business Rules

- BR-04: Selecting a thread loads that thread history.
- BR-05: Both user and assistant messages are shown.
- BR-06: No missing or duplicate turns in normal flow.

#### 4.2.3 Scenario

```gherkin
Given I have an existing conversation in ChatHistory
When I open that conversation
Then I should see previous user and assistant messages
And displayed messages should match prior sent chat
```

---

### Feature F-03: Message Order Is Stable

#### 4.3.1 Feature Context

Timeline order must remain consistent so users can follow context.

#### 4.3.2 Business Rules

- BR-07: Message order remains chronological and stable.
- BR-08: Reloading does not shuffle the timeline.

#### 4.3.3 Scenario

```gherkin
Given I have a conversation with multiple turns
When I reload and re-open the same conversation
Then messages should appear in the same correct order
```

---

### Feature F-04: Correct History Per Conversation

#### 4.4.1 Feature Context

Each thread should only show its own messages.

#### 4.4.2 Business Rules

- BR-09: Opening conversation A must not show messages from B.
- BR-10: Fast switching still renders correct thread history.

#### 4.4.3 Scenario

```gherkin
Given I have conversation A and conversation B
When I open conversation A then conversation B
Then each conversation should show only its own chat history
```

---

### Feature F-05: UI States (Loading, Empty, Error)

#### 4.5.1 Feature Context

Users need clear feedback during non-happy paths.

#### 4.5.2 Business Rules

- BR-11: Loading indicator appears while history is being fetched.
- BR-12: Empty state appears for no-message thread.
- BR-13: Friendly error is shown when fetch fails.
- BR-14: Retry action works when available.

#### 4.5.3 Scenario

```gherkin
Given I open ChatHistory under loading, empty, and failed conditions
When each state is triggered
Then I should see clear loading, empty, and error states
```

---

## 5. Priority Tests

| Test ID | Test Name                                 | Priority |
| ------- | ----------------------------------------- | -------- |
| CH-000  | ChatHistory placement on Welcome Card top | P0       |
| CH-001  | Open existing conversation history        | P0       |
| CH-002  | History order remains stable after reload | P0       |
| CH-003  | No cross-conversation message mixing      | P0       |
| CH-004  | Loading state visibility                  | P1       |
| CH-005  | Empty state visibility                    | P1       |
| CH-006  | Error state and retry flow                | P1       |

---

## 6. QA Sign-off Criteria

QA marks ChatHistory ready when all are true:

1. ChatHistory entry is visible at top of Welcome Card.
2. All P0 tests pass.
3. No conversation-mixing issue is found.
4. Loading, empty, and error states are clear and usable.

---

## Approval and Sign-off

| Stakeholder       | Role | Status      | Date Signed       |
| ----------------- | ---- | ----------- | ----------------- |
| Dennis Velasco    | CEO  | ☐ Pending   | ---               |
| Ruel Nopal        | HoE  | ☐ Pending   | ---               |
| Aira Pilor        | QA   | ☐ Pending   | ---               |
| Michael Santos    | BE   | ☐ Completed | March 19, 2026     |
| Brian Millonte    | FE   | ☐ Completed | March 19, 2026     |
