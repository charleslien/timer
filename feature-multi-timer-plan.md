# Feature: Multiple Active Timers Support

Implement multiple active timers by updating the state management, event handlers, and UI rendering in App.tsx.

## 1. State Updates
- Replace the single-timer state with an array of timers.
  - Remove:
    // const [activeTimer, setActiveTimer] = useState<Timer | null>(null);
  - Add:
    const [activeTimers, setActiveTimers] = useState<Timer[]>([]);
- Retain the existing `timerTag` state for creating a new timer:
    const [timerTag, setTimerTag] = useState<string>('Untitled');

## 2. Timer Update Effect
- Replace the current useEffect for stopwatch updates with one that updates all running timers:
  
  Pseudocode:
  
    useEffect(() => {
      const intervalId = setInterval(() => {
        setActiveTimers(prevTimers =>
          prevTimers.map(timer =>
            timer.isRunning
              ? { ...timer, elapsed: Date.now() - timer.startTS }
              : timer
          )
        );
      }, 10);
      return () => clearInterval(intervalId);
    }, []);
  
## 3. Event Handlers Adjustments

### handleStart
- Instead of only starting one timer, create a new timer object and append it to the activeTimers array.
  
  Example:
  
    const handleStart = () => {
      const newTimer: Timer = {
        id: Date.now().toString(),
        startTS: Date.now(),
        elapsed: 0,
        isRunning: true,
        tag: timerTag
      };
      setActiveTimers(prev => [...prev, newTimer]);
      setTimerTag('Untitled');
    };

### handleTagChange
- Modify the tag for a specific active timer. This function should accept the timer's id and new tag value.
  
  Example:
  
    const handleTagChange = (id: string, newTag: string) => {
      setActiveTimers(prev =>
        prev.map(timer =>
          timer.id === id ? { ...timer, tag: newTag } : timer
        )
      );
    };

### handleStop
- Stop a specific timer by setting its `isRunning` property to false.
  
  Example:
  
    const handleStop = (id: string) => {
      setActiveTimers(prev =>
        prev.map(timer =>
          timer.id === id ? { ...timer, isRunning: false } : timer
        )
      );
    };

### handleResume
- Resume a paused timer by updating its `startTS` based on its current elapsed time.
  
  Example:
  
    const handleResume = (id: string) => {
      setActiveTimers(prev =>
        prev.map(timer =>
          timer.id === id
            ? { ...timer, startTS: Date.now() - timer.elapsed, isRunning: true }
            : timer
        )
      );
    };

### handleSave
- Convert a timer into a saved record and remove it from the activeTimers array.
  
  Example:
  
    const handleSave = (id: string) => {
      const timerToSave = activeTimers.find(timer => timer.id === id);
      if (timerToSave) {
        const savedTimer: SavedTimer = {
          id: timerToSave.id,
          startTS: timerToSave.startTS,
          endTS: Date.now(),
          elapsed: timerToSave.elapsed,
          tag: timerToSave.tag
        };
        setSavedTimers(prev => [...prev, savedTimer]);
        setActiveTimers(prev =>
          prev.filter(timer => timer.id !== id)
        );
      }
    };

## 4. JSX Rendering Changes
- Provide a dedicated "New Timer" section to create a new timer:
  
    <div className="new-timer">
      <input 
        type="text" 
        value={timerTag} 
        onChange={(e) => setTimerTag(e.target.value)}
        placeholder="Enter timer tag"
        list="tag-suggestions"
      />
      <button onClick={handleStart}>Start Timer</button>
    </div>
  
- Render all active timers as individual timer rows:
  
    <div className="active-timers">
      {activeTimers.map(timer => (
        <div key={timer.id} className="active-timer">
          <div className="timer-tag">
            <input 
              type="text" 
              value={timer.tag}
              onChange={(e) => handleTagChange(timer.id, e.target.value)}
              placeholder="Enter timer tag"
              list="tag-suggestions"
            />
          </div>
          <h1>{formatTime(timer.elapsed)}</h1>
          <div className="timer-info">
            Started: {formatDate(timer.startTS)}
          </div>
          <div className="controls">
            {timer.isRunning ? (
              <button onClick={() => handleStop(timer.id)}>Stop</button>
            ) : (
              <>
                <button onClick={() => handleResume(timer.id)}>Resume</button>
                <button onClick={() => handleSave(timer.id)}>Save</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>

## 5. Summary
- Update App.tsx to use an array-based state (activeTimers) to support multiple concurrently running timers.
- Implement new event handlers that target a timer by its id.
- Adjust the JSX layout to include a new timer creation section and render each active timer with its own controls.
- The existing saved timers functionality (savedTimers state and persistence) remains unchanged.

End of plan.
