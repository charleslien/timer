import React, { useState, useEffect } from 'react';
import './App.css';

function formatTime(ms: number): string {
  const centiseconds = Math.floor((ms % 1000) / 10);
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000);
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

function App() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
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
    if (isRunning) {
      const startTime = Date.now() - elapsed;
      timer = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 10);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, elapsed]);

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  const handleStop = () => {
    if (isRunning) {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsed(0);
  };

  return (
    <div className="App">
      <div className="clock">
        <h2>Current Time</h2>
        <div className="time-display">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>
      
      <div className="divider"></div>
      
      <div className="stopwatch">
        <h2>Stopwatch</h2>
        <h1>{formatTime(elapsed)}</h1>
        <div className="controls">
          <button onClick={handleStart}>Start</button>
          <button onClick={handleStop}>Stop</button>
          <button onClick={handleReset}>Reset</button>
        </div>
      </div>
    </div>
  );
}

export default App;
