import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

// Define types for our timer
type Timer = {
  id: string;
  startTS: number;
  elapsed: number;
  isRunning: boolean;
  tag: string;
};

type SavedTimer = {
  id: string;
  startTS: number;
  endTS: number;
  elapsed: number;
  tag: string;
};

function formatTime(ms: number): string {
  const centiseconds = Math.floor((ms % 1000) / 10);
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000);
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTimer, setActiveTimer] = useState<Timer | null>(null);
  const [timerTag, setTimerTag] = useState<string>('Untitled');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarFullscreen, setSidebarFullscreen] = useState(false);
  
  // Use lazy initialization to load saved timers from localStorage once on mount
  const [savedTimers, setSavedTimers] = useState<SavedTimer[]>(() => {
    try {
      const storedTimers = localStorage.getItem('savedTimers');
      return storedTimers ? JSON.parse(storedTimers) : [];
    } catch (err) {
      console.error('Error loading timers from localStorage:', err);
      return [];
    }
  });
  
  // Persist saved timers to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('savedTimers', JSON.stringify(savedTimers));
      console.log('Saved timers to localStorage:', savedTimers);
    } catch (err) {
      console.error('Error saving timers to localStorage:', err);
    }
  }, [savedTimers]);

  // Clock timer effect
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(clockTimer);
    };
  }, []);
  
  // Stopwatch effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (activeTimer && activeTimer.isRunning) {
      timer = setInterval(() => {
        setActiveTimer(prev => 
          prev ? { ...prev, elapsed: Date.now() - prev.startTS } : null
        );
      }, 10);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTimer, activeTimer?.isRunning]);

  const handleStart = () => {
    if (!activeTimer) {
      setActiveTimer({
        id: Date.now().toString(),
        startTS: Date.now(),
        elapsed: 0,
        isRunning: true,
        tag: timerTag
      });
    }
  };

  const handleStop = () => {
    if (activeTimer && activeTimer.isRunning) {
      setActiveTimer({ ...activeTimer, isRunning: false });
    }
  };

  const handleResume = () => {
    if (activeTimer && !activeTimer.isRunning) {
      setActiveTimer({
        ...activeTimer,
        startTS: Date.now() - activeTimer.elapsed,
        isRunning: true
      });
    }
  };

  const handleSave = () => {
    if (activeTimer) {
      const savedTimer: SavedTimer = {
        id: activeTimer.id,
        startTS: activeTimer.startTS,
        endTS: Date.now(),
        elapsed: activeTimer.elapsed,
        tag: activeTimer.tag
      };
      
      const updatedTimers = [...savedTimers, savedTimer];
      setSavedTimers(updatedTimers);
      
      // Update recent tags with the saved timer's tag
      updateRecentTags(activeTimer.tag);
      
      setActiveTimer(null);
      setTimerTag('Untitled'); // Reset tag for next timer
    }
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTag = e.target.value;
    setTimerTag(newTag);
    
    // If there's an active timer, update its tag as well
    if (activeTimer) {
      setActiveTimer({ ...activeTimer, tag: newTag });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarFullscreen = () => {
    setSidebarFullscreen(!isSidebarFullscreen);
  };

  const [recentTags, setRecentTags] = useState<string[]>(() => {
    try {
      const storedTags = localStorage.getItem('recentTags');
      return storedTags ? JSON.parse(storedTags) : [];
    } catch (err) {
      console.error('Error loading recent tags:', err);
      return [];
    }
  });

  const updateRecentTags = (tag: string) => {
    setRecentTags(prevTags => {
      // Remove existing instance of the tag and add to the front
      const filteredTags = prevTags.filter(t => t !== tag);
      const updatedTags = [tag, ...filteredTags].slice(0, 10); // Limit to 10 recent tags
      
      try {
        localStorage.setItem('recentTags', JSON.stringify(updatedTags));
      } catch (err) {
        console.error('Error saving recent tags:', err);
      }
      
      return updatedTags;
    });
  };

  // Compute unique saved tags from savedTimers for the dropdown suggestions
  const savedTags = Array.from(new Set(savedTimers.map(timer => timer.tag)));

  // Group saved timers by tag
  const groupedTimers: Record<string, SavedTimer[]> = {};
  savedTimers.forEach(timer => {
    if (!groupedTimers[timer.tag]) {
      groupedTimers[timer.tag] = [];
    }
    groupedTimers[timer.tag].push(timer);
  });
  Object.keys(groupedTimers).forEach(tag => {
    groupedTimers[tag].sort((a, b) => a.endTS - b.endTS);
  });

  // Memoized list of recent tags for performance
  const tagSuggestions = useMemo(() => {
    // Combine recent tags with unique tags from saved timers
    const savedTagSet = new Set(savedTimers.map(timer => timer.tag));
    const combinedTags = Array.from(new Set([...recentTags, ...Array.from(savedTagSet)]));
    return combinedTags;
  }, [recentTags, savedTimers]);

  return (
    <div className="App">
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''} ${isSidebarFullscreen ? 'fullscreen' : ''}`}>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? '→' : '←'}
        </button>
        <button className="sidebar-fullscreen-toggle" onClick={toggleSidebarFullscreen}>
          {isSidebarFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        {Object.keys(groupedTimers).length > 0 && (
          <div className="saved-timers">
            <h2>Saved Intervals</h2>
            {Object.entries(groupedTimers).map(([tag, timers]) => (
              <div key={tag} className="timer-group">
                <h3>{tag}</h3>
                <ul>
                  {timers.map((timer) => (
                    <li key={timer.id} className="saved-timer-item">
                      <div className="saved-timer-time">{formatTime(timer.elapsed)}</div>
                      <div className="saved-timer-info">
                        Started: {formatDate(timer.startTS)}
                      </div>
                      <div className="saved-timer-info">
                        Ended: {formatDate(timer.endTS)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="clock">
          <h2>Current Time</h2>
          <div className="time-display">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
        
        <div className="divider"></div>
        
        <div className="stopwatch">
          <h2>Stopwatch</h2>
          
          {activeTimer ? (
            <>
              <div className="timer-tag">
                <input 
                  type="text" 
                  value={activeTimer.tag} 
                  onChange={handleTagChange}
                  placeholder="Enter timer tag"
                  list="tag-suggestions"
                />
              </div>
              <h1>{formatTime(activeTimer.elapsed)}</h1>
              <div className="timer-info">
                Started: {formatDate(activeTimer.startTS)}
              </div>
              <div className="controls">
                {activeTimer.isRunning ? (
                  <button onClick={handleStop}>Stop</button>
                ) : (
                  <>
                    <button onClick={handleResume}>Resume</button>
                    <button onClick={handleSave}>Save</button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="timer-tag">
                <input 
                  type="text" 
                  value={timerTag} 
                  onChange={handleTagChange}
                  placeholder="Enter timer tag"
                  list="tag-suggestions"
                />
              </div>
              <div className="controls">
                <button onClick={handleStart}>Start Timer</button>
              </div>
            </>
          )}
          
          <datalist id="tag-suggestions">
            {tagSuggestions.map((tag, index) => (
              <option key={index} value={tag} />
            ))}
          </datalist>
        </div>
      </div>
    </div>
  );
}

export default App;
