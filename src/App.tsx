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

// Modify the SavedTimer type to include the gap between intervals
type SavedTimer = {
  id: string;
  startTS: number;
  endTS: number;
  tag: string;
  prevEndTS?: number; // Track the end timestamp of the previous interval
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

function sendActualNotification() {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification('Timer App', {
          body: 'This is a test notification from the Timer App!',
          icon: '/favicon.ico'
        });
        
        // Focus the window when notification is clicked
        notification.onclick = function() {
          window.focus();
        };
      } catch (error) {
        console.error('Error sending notification:', error);
        alert('Failed to send notification: ' + (error instanceof Error ? error.message : String(error)));
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          try {
            const notification = new Notification('Timer App', {
              body: 'This is a test notification from the Timer App!',
              icon: '/favicon.ico'
            });
            
            // Focus the window when notification is clicked
            notification.onclick = function() {
              window.focus();
            };
            console.log('Notification sent successfully after permission granted');
          } catch (error) {
            console.error('Error sending notification after permission granted:', error);
            alert('Failed to send notification: ' + (error instanceof Error ? error.message : String(error)));
          }
        } else {
          console.warn('Notification permission denied');
          alert('Notification permission denied by user');
        }
      }).catch(error => {
        console.error('Error requesting notification permission:', error);
        alert('Failed to request notification permission: ' + (error instanceof Error ? error.message : String(error)));
      });
    } else {
      console.warn('Notification permission previously denied');
      alert('Notifications are blocked. Please enable them in your browser settings.');
    }
  } else {
    console.error('Notifications not supported in this browser');
    alert('Desktop notifications are not supported in this browser.');
  }
}

function sendTaskReminderNotification(tag: string) {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification('Timer Reminder', {
          body: `Your timer for "${tag}" is running longer than previous records. Are you still doing the task?`,
          icon: '/favicon.ico'
        });
        
        // Focus the window when notification is clicked
        notification.onclick = function() {
          window.focus();
        };
      } catch (error) {
        console.error('Error sending task reminder notification:', error);
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          try {
            const notification = new Notification('Timer Reminder', {
              body: `Your timer for "${tag}" is running longer than previous records. Are you still doing the task?`,
              icon: '/favicon.ico'
            });
            
            // Focus the window when notification is clicked
            notification.onclick = function() {
              window.focus();
            };
            console.log(`Task reminder notification sent for tag: ${tag} after permission granted`);
          } catch (error) {
            console.error('Error sending task reminder notification after permission granted:', error);
          }
        } else {
          console.warn('Notification permission denied for task reminder');
        }
      }).catch(error => {
        console.error('Error requesting notification permission for task reminder:', error);
      });
    } else {
      console.warn('Notification permission previously denied for task reminder');
    }
  } else {
    console.error('Notifications not supported in this browser for task reminder');
  }
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
  const [isNotificationPending, setIsNotificationPending] = useState(false);
  const [notificationCountdown, setNotificationCountdown] = useState(0);
  
  // Track which timers have been notified and when
  const [notificationHistory, setNotificationHistory] = useState<Record<string, number[]>>({});
  
  // Persist active timers to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('activeTimers', JSON.stringify(activeTimers));
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
            ? { ...timer, elapsed: timer.elapsed + 10 }
            : timer
        )
      );
    }, 10);
    
    return () => clearInterval(intervalId);
  }, []);

  // Check for timers exceeding their historical longest duration
  useEffect(() => {
    const now = Date.now();
    
    activeTimers.forEach(timer => {
      if (timer.isRunning) {
        const savedForTag = savedTimers.filter(st => st.tag === timer.tag);
        
        if (savedForTag.length > 0) {
          const longestElapsed = Math.max(...savedForTag.map(st => st.endTS - st.startTS));
          const longestGap = savedForTag.reduce((maxGap, current, index, arr) => {
            if (index > 0) {
              const gap = current.startTS - arr[index - 1].endTS;
              return Math.max(maxGap, gap);
            }
            return maxGap;
          }, 0);
          
          const currentElapsed = timer.elapsed;
          const currentGap = savedForTag[savedForTag.length - 1].prevEndTS 
            ? now - savedForTag[savedForTag.length - 1].prevEndTS! 
            : 0;
          
          const timerNotifications = notificationHistory[timer.id] || [];
          
          const shouldNotifyDuration = currentElapsed > longestElapsed && 
            (timerNotifications.length === 0 || 
              (now - timerNotifications[timerNotifications.length - 1] > 
                calculateNextNotificationDelay(timerNotifications, longestElapsed)));
          
          const shouldNotifyGap = currentGap > longestGap && 
            (timerNotifications.length === 0 || 
              (now - timerNotifications[timerNotifications.length - 1] > 
                calculateNextNotificationDelay(timerNotifications, longestGap)));
          
          if (shouldNotifyDuration || shouldNotifyGap) {
            sendTaskReminderNotification(timer.tag);
            
            // Update notification history
            setNotificationHistory(prev => ({
              ...prev,
              [timer.id]: [...(prev[timer.id] || []), now]
            }));
          }
        } else {
          console.log(`No saved timers found for tag: ${timer.tag}`);
        }
      }
    });
  }, [activeTimers, savedTimers, notificationHistory]);

  // Calculate the next notification delay using exponential backoff with factor 2
  const calculateNextNotificationDelay = (notificationTimes: number[], longestInterval: number): number => {
    if (notificationTimes.length <= 1) {
      // First notification after exceeding record: use the longest interval
      return Math.max(longestInterval, 3600000); // Minimum 1 hour
    }
    
    // Calculate the delay based on the number of previous notifications
    // Each subsequent notification doubles the delay from the longest interval
    // Ensure the delay is at least 1 hour
    return Math.max(
      Math.pow(2, notificationTimes.length - 1) * longestInterval, 
      3600000
    );
  };

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
    
    // Clear notification history for this timer when stopped
    setNotificationHistory(prev => {
      const newHistory = {...prev};
      delete newHistory[id];
      return newHistory;
    });
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
      
      // Find the most recent saved timer for this tag to get its endTS
      const savedTimersForTag = savedTimers.filter(st => st.tag === timerToSave.tag);
      const mostRecentSavedTimer = savedTimersForTag.length > 0 
        ? savedTimersForTag[savedTimersForTag.length - 1] 
        : undefined;

      const savedTimer: SavedTimer = {
        id: timerToSave.id,
        startTS: timerToSave.startTS,
        endTS: Date.now(),
        tag: timerToSave.tag,
        prevEndTS: mostRecentSavedTimer?.endTS
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
      
      // Clear notification history for the old timer
      setNotificationHistory(prev => {
        const newHistory = {...prev};
        delete newHistory[timerToSave.id];
        return newHistory;
      });
      
      return newActiveTimers;
    });
  };

  const handleSave = (id: string) => {
    const timerToSave = activeTimers.find(timer => timer.id === id);
    if (timerToSave) {
      // Find the most recent saved timer for this tag to get its endTS
      const savedTimersForTag = savedTimers.filter(st => st.tag === timerToSave.tag);
      const mostRecentSavedTimer = savedTimersForTag.length > 0 
        ? savedTimersForTag[savedTimersForTag.length - 1] 
        : undefined;

      const savedTimer: SavedTimer = {
        id: timerToSave.id,
        startTS: timerToSave.startTS,
        endTS: Date.now(),
        tag: timerToSave.tag,
        prevEndTS: mostRecentSavedTimer?.endTS
      };
      
      // Use a callback form to ensure we're working with the latest state
      setSavedTimers(prevSavedTimers => {
        // Check if this timer is already saved to prevent duplicates
        const isDuplicate = prevSavedTimers.some(timer => timer.id === savedTimer.id);
        if (isDuplicate) {
          console.log('Timer already saved, skipping duplicate save');
          return prevSavedTimers;
        }
        return [...prevSavedTimers, savedTimer];
      });
      
      updateRecentTags(timerToSave.tag);
      
      setActiveTimers(prev => prev.filter(timer => timer.id !== id));
      
      // Clear notification history for this timer when saved
      setNotificationHistory(prev => {
        const newHistory = {...prev};
        delete newHistory[id];
        return newHistory;
      });
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
      // Ensure we don't add duplicate tags
      if (prevTags.includes(tag)) {
        return prevTags;
      }
      const savedTagSet = new Set(savedTimers.map(timer => timer.tag));
      const combinedTags = Array.from(new Set([...prevTags, tag, ...Array.from(savedTagSet)]));
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
                      <div className="saved-timer-time">
                        {formatTime(timer.endTS - timer.startTS)}
                      </div>
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
              <option key={`tag-${index}`} value={tag} />
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
                  <>
                    <button onClick={() => handleResumeAndSave(timer.id)}>Save & Start</button>
                    <button onClick={() => handleSave(timer.id)}>Save</button>
                  </>
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
