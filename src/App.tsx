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
  
  // Use lazy initialization to load active timers from localStorage
  const [activeTimers, setActiveTimers] = useState<Timer[]>(() => {
    try {
      const storedTimers = localStorage.getItem('activeTimers');
      if (storedTimers) {
        const parsedTimers: Timer[] = JSON.parse(storedTimers);
        // Recalculate elapsed time based on current time
        return parsedTimers.map(timer => ({
          ...timer,
          elapsed: timer.isRunning 
            ? Date.now() - timer.startTS + timer.elapsed 
            : timer.elapsed
        }));
      }
      return [];
    } catch (err) {
      console.error('Error loading active timers from localStorage:', err);
      return [];
    }
  });

  const [timerTag, setTimerTag] = useState<string>('Timer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarFullscreen, setSidebarFullscreen] = useState(false);
  
  // Persist active timers to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('activeTimers', JSON.stringify(activeTimers));
      console.log('Saved active timers to localStorage:', activeTimers);
    } catch (err) {
      console.error('Error saving active timers to localStorage:', err);
    }
  }, [activeTimers]);

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
    const intervalId = setInterval(() => {
      setActiveTimers(prevTimers =>
        prevTimers.map(timer =>
          timer.isRunning
            ? { ...timer, elapsed: Date.now() - timer.startTS + timer.elapsed }
            : timer
        )
      );
    }, 10);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleStart = () => {
    const newTimer: Timer = {
      id: Date.now().toString(),
      startTS: Date.now(),
      elapsed: 0,
      isRunning: true,
      tag: timerTag
    };
    setActiveTimers(prev => [...prev, newTimer]);
    setTimerTag('Timer');
  };

  const handleTagChange = (id: string, newTag: string) => {
    setActiveTimers(prev =>
      prev.map(timer =>
        timer.id === id ? { ...timer, tag: newTag } : timer
      )
    );
  };

  const handleStop = (id: string) => {
    setActiveTimers(prev =>
      prev.map(timer =>
        timer.id === id ? { ...timer, isRunning: false } : timer
      )
    );
  };

  const handleResume = (id: string) => {
    setActiveTimers(prev =>
      prev.map(timer =>
        timer.id === id
          ? { ...timer, startTS: Date.now() - timer.elapsed, isRunning: true }
          : timer
      )
    );
  };

  const handleResumeAndSave = (id: string) => {
    setActiveTimers(prev => {
      const index = prev.findIndex(timer => timer.id === id);
      if (index === -1) return prev;
      const timerToSave = prev[index];
      const savedTimer: SavedTimer = {
        id: timerToSave.id,
        startTS: timerToSave.startTS,
        endTS: Date.now(),
        elapsed: timerToSave.elapsed,
        tag: timerToSave.tag
      };
      setSavedTimers(old => [...old, savedTimer]);
      updateRecentTags(timerToSave.tag);
      const newTimer: Timer = {
        id: Date.now().toString(),
        startTS: Date.now(),
        elapsed: 0,
        isRunning: true,
        tag: timerToSave.tag
      };
      const newActiveTimers = [...prev];
      newActiveTimers[index] = newTimer;
      return newActiveTimers;
    });
  };

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
      
      const updatedTimers = [...savedTimers, savedTimer];
      setSavedTimers(updatedTimers);
      
      updateRecentTags(timerToSave.tag);
      
      setActiveTimers(prev => prev.filter(timer => timer.id !== id));
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
      const savedTagSet = new Set(savedTimers.map(timer => timer.tag));
      const combinedTags = Array.from(new Set([...recentTags, ...Array.from(savedTagSet)]));
      return combinedTags;
    });
  };

  const savedTags = Array.from(new Set(savedTimers.map(timer => timer.tag)));

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

  const tagSuggestions = useMemo(() => {
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
          <h2>New Timer</h2>
          <div className="timer-tag">
            <input 
              type="text" 
              value={timerTag} 
              onChange={(e) => setTimerTag(e.target.value)}
              placeholder="Enter timer tag"
              list="tag-suggestions"
            />
            <button onClick={handleStart}>Start Timer</button>
          </div>
          
          <datalist id="tag-suggestions">
            {tagSuggestions.map((tag, index) => (
              <option key={index} value={tag} />
            ))}
          </datalist>
        </div>

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
                  <>
                    <button onClick={() => handleStop(timer.id)}>Stop</button>
                    <button onClick={() => handleSave(timer.id)}>Stop & Save</button>
                  </>
                ) : (
                  <button onClick={() => handleResumeAndSave(timer.id)}>Resume</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
