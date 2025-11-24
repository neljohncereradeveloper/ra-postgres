# Cast Vote Module Documentation

## Overview

The `cast-vote` module implements the voting process for delegates in a React (Next.js) application. It handles delegate verification, candidate selection, vote confirmation, and submission, with clear UI feedback for loading and error states.

---

## Main Orchestrator

### `cast-vote-orchestrator.tsx`

**Component:** `CastVoteOrchestrator`

- **Purpose:**  
  Orchestrates the entire voting process, managing state and rendering the appropriate step (delegate verification, voting form, confirmation, etc.).
- **Key State:**
  - `castVoteCandidates`: List of positions and their candidates.
  - `delegate`, `delegateVerified`: Delegate info and verification status.
  - `showConfirmation`, `submitting`, `loading`, `error`: UI state.
- **Key Functions:**
  - `fetchCastVoteCandidates`: Fetches candidates for voting after delegate verification.
  - `handlePositionChange`: Updates form state for candidate selection.
  - `onSubmit`: Handles vote confirmation and submission, resets all state on success.
  - `handleDelegateVerified`: Sets delegate info after successful verification.
- **UI Flow:**
  1. Renders `DelegateVerification` if not verified.
  2. Shows `CastVoteLoading` or `CastVoteError` as needed.
  3. Renders `VoteConfirmation` for review, or `CastVoteForm` for voting.

---

## Delegate Verification

### `delegate-validation/delegate-verification.tsx`

**Component:** `DelegateVerification`

- **Purpose:**  
  Handles delegate identity verification using a control number.
- **Key Features:**
  - Uses `react-hook-form` and Zod for validation.
  - Fetches delegate info from API.
  - Prevents voting if `hasVoted` is true, showing an error.
  - On success, allows the user to confirm their identity and proceed.
- **Props:**
  - `onVerified`: Callback to pass the verified delegate to the orchestrator.

---

## Voting Form

### `vote-casting/cast-vote-form.tsx`

**Component:** `CastVoteForm`

- **Purpose:**  
  Renders the voting form, displaying all positions and their candidates.
- **Props:**
  - `castVoteCandidates`: List of positions and candidates.
  - `control`, `errors`: Form control and validation.
  - `getPositionValues`: Helper to get selected candidate IDs for a position.
  - `onSubmit`: Form submission handler.
  - `onPositionChange`: Handler for candidate selection changes.
- **UI:**  
  Renders a `PositionDesktop` for each position and a single submit button.

---

### `vote-casting/position-desktop.tsx`

**Component:** `PositionDesktop`

- **Purpose:**  
  Renders candidate selection UI for a single position.
- **Features:**
  - Uses `Controller` from `react-hook-form` for form state.
  - Enforces max candidate selection per position.
  - Shows validation errors if present.
  - Notifies parent on selection change.
- **Props:**
  - `position`: Position and its candidates.
  - `control`, `errors`, `getPositionValues`, `onPositionChange`.

---

### `vote-casting/candidate-card.tsx`

**Component:** `CandidateCard`

- **Purpose:**  
  Displays a single candidate with a checkbox for selection.
- **Props:**
  - `candidate`: Candidate info.
  - `isChecked`: Whether the candidate is selected.
  - `onChange`: Handler for selection change.

---

## Vote Confirmation

### `vote-casting/vote-confirmation.tsx`

**Component:** `VoteConfirmation`

- **Purpose:**  
  Shows a summary of the user's selections for review before final submission.
- **Props:**
  - `castVoteCandidates`: List of positions and candidates.
  - `getPositionValues`: Helper to get selected candidate IDs.
  - `onBack`: Handler to return to the form.
  - `onConfirm`: Handler to submit the vote.
  - `submitting`: Loading state for submission.

---

## UI Feedback Components

### `ui/cast-vote-loading.tsx`

**Component:** `CastVoteLoading`

- **Purpose:**  
  Displays a loading spinner and message while candidates are being fetched.

---

### `ui/cast-vote-error.tsx`

**Component:** `CastVoteError`

- **Purpose:**  
  Shows an error message and a retry button if candidate fetching fails.
- **Props:**
  - `error`: Error message to display.
  - `onRetry`: Handler to retry fetching.

---

## File Structure

```
cast-vote/
  cast-vote-orchestrator.tsx
  index.ts
  delegate-validation/
    delegate-verification.tsx
    index.ts
  vote-casting/
    cast-vote-form.tsx
    position-desktop.tsx
    candidate-card.tsx
    vote-confirmation.tsx
    index.ts
  ui/
    cast-vote-loading.tsx
    cast-vote-error.tsx
    index.ts
```

---

## Process Flow

1. **Delegate Verification:**  
   User enters control number. If valid and not already voted, proceeds.

2. **Candidate Fetching:**  
   Candidates for each position are fetched from the API.

3. **Voting:**  
   User selects candidates for each position and submits the form.

4. **Confirmation:**  
   User reviews selections and confirms the vote.

5. **Submission:**  
   Vote is submitted to the backend. On success, all state is reset.

6. **Error/Loading Handling:**  
   Loading and error states are handled with dedicated UI components.

---

## Extensibility

- **Validation:**  
  Add more rules in `PositionDesktop` or `delegate-verification.tsx` as needed.
- **UI:**  
  Customize card components or add more feedback as desired.
- **API:**  
  All API calls are abstracted, making backend changes easy to integrate.

---

**This documentation should help any developer understand and extend the cast-vote module. If you want a more technical or user-facing version, let me know!**
