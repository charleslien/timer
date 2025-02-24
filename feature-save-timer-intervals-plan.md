# Feature: Save Timer Intervals & Resume/Save Functionality

## Overview
This feature will allow users to record (save) individual timer intervals whenever they stop the active timer. When the user starts a timer, a new timer row is created at the bottom that increments. When the timer is stopped, the UI will offer two options:
- **Resume:** Continue timing from the paused value.
- **Save:** Finalize the interval by saving its elapsed time into a list of saved intervals and clear the active timer.

## Code Changes

### In src/App.tsx
1. **State Updates:**
   - Define a type for the timer:
     - Example:  
       `type Timer = { startTS: number; elapsed: number; isRunning: boolean };`
   - Replace the existing stopwatch state (`elapsed` and `isRunning`) with:
     - `activeTimer: Timer | null` to track the currently running/paused timer.
     - `savedTimers: number[]` to keep an array of saved interval elapsed times (alternatively, an array of Timer objects if more info is needed).

2. **Timer Update Effect:**
   - Implement a `useEffect` that checks if there is an active timer and if it’s running. If so, set up a `setInterval` (with an interval of 10ms) to update the active timer’s `elapsed` value based on:
     ```
     setActiveTimer(prev => prev ? { ...prev, elapsed: Date.now() - prev.startTS } : null);
     ```
   - Clean up the interval on unmount or when the timer is paused.

3. **Event Handlers:**
   - **handleStart:** If no active timer exists, start a new timer by setting `activeTimer` to:
     ```
     { startTS: Date.now(), elapsed: 0, isRunning: true }
     ```
   - **handleStop:** When stopping, update `activeTimer` by marking it as not running (keep the elapsed value).
   - **handleResume:** When resuming a stopped timer, update `activeTimer` so that:
     ```
     startTS = Date.now() - elapsed,
     isRunning = true
     ```
   - **handleSave:** On save, add the `elapsed` value of `activeTimer` to `savedTimers` and clear the active timer (set it to null).

4. **Rendering:**
   - In the stopwatch section:
     - If `activeTimer` exists:
       - Display the current timer value using `formatTime(activeTimer.elapsed)`.
       - Show a **Stop** button if the timer is running.
       - If the timer is stopped (i.e. `isRunning` is false), show **Resume** and **Save** buttons.
     - If no active timer exists, display a **Start Timer** button.
   - Below the stopwatch, render a **Saved Intervals** section that lists all saved elapsed times formatted via `formatTime`.

### In src/App.css
- Add styling for the new saved timer list:
  - For example, add styles for a `.saved-timers` class with appropriate margins and text alignment.
  - Ensure the list has a clear, legible font-size with no list styling (e.g., remove bullet points).

## Example Pseudocode Snippets

**State Definition:**
```
type Timer = {
  startTS: number;
  elapsed: number;
  isRunning: boolean;
};

const [activeTimer, setActiveTimer] = useState<Timer | null>(null);
const [savedTimers, setSavedTimers] = useState<number[]>([]);
```

**useEffect for Timer Update:**
```
useEffect(() => {
  let timerId: NodeJS.Timeout;
  if (activeTimer && activeTimer.isRunning) {
    timerId = setInterval(() => {
      setActiveTimer(prev => prev ? { ...prev, elapsed: Date.now() - prev.startTS } : null);
    }, 10);
  }
  return () => clearInterval(timerId);
}, [activeTimer, activeTimer?.isRunning]);
```

**Handler Examples:**
```
const handleStart = () => { 
  if (!activeTimer) {
    setActiveTimer({ startTS: Date.now(), elapsed: 0, isRunning: true });
  }
};

const handleStop = () => {
  if (activeTimer && activeTimer.isRunning) {
    setActiveTimer({ ...activeTimer, isRunning: false });
  }
};

const handleResume = () => {
  if (activeTimer && !activeTimer.isRunning) {
    setActiveTimer({ startTS: Date.now() - activeTimer.elapsed, elapsed: activeTimer.elapsed, isRunning: true });
  }
};

const handleSave = () => {
  if (activeTimer) {
    setSavedTimers(prev => [...prev, activeTimer.elapsed]);
    setActiveTimer(null);
  }
};
```

**JSX Rendering Example (Stopwatch Section):**
```
<div className="stopwatch">
  <h2>Stopwatch</h2>
  {activeTimer ? (
    activeTimer.isRunning ? (
      <>
        <h1>{formatTime(activeTimer.elapsed)}</h1>
        <div className="controls">
          <button onClick={handleStop}>Stop</button>
        </div>
      </>
    ) : (
      <>
        <h1>{formatTime(activeTimer.elapsed)}</h1>
        <div className="controls">
          <button onClick={handleResume}>Resume</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </>
    )
  ) : (
    <div className="controls">
      <button onClick={handleStart}>Start Timer</button>
    </div>
  )}
</div>
```

**Rendering the Saved Intervals:**
```
{savedTimers.length > 0 && (
  <div className="saved-timers">
    <h2>Saved Intervals</h2>
    <ul>
      {savedTimers.map((t, index) => (
        <li key={index}>{formatTime(t)}</li>
      ))}
    </ul>
  </div>
)}
```

## Clarifying Questions
1. Should only one active timer be allowed at a time, or would you prefer to support multiple concurrently running timers?
2. When the user clicks "Save", should the active timer be cleared immediately so they can start a new one, or should it remain visible in the saved intervals list for further actions (like editing or deletion)?
3. Are there any specific UI/styling requirements for the saved intervals list beyond basic formatting?

