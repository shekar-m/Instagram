import React, { useState, useRef, useEffect } from "react";
import { FaPause, FaMicrophone, FaPlay } from "react-icons/fa";
import "./RecordingBar.css";

const RecordingBar = ({
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  isRecording,
  isPaused,
}) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 100);
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRecording, isPaused]);

  const handlePauseClick = () => {
    if (isPaused) {
      onResumeRecording();
    } else {
      onPauseRecording();
    }
  };

  return (
    <div className="recording-bar-container">
      <div className="recording-bar-background">
        <div
          className="recording-bar-progress"
          style={{ width: `${(recordingTime / 60000) * 100}%` }}
        ></div>
      </div>
      <div className="recording-controls">
        <span className="recording-time">
          {(recordingTime / 1000).toFixed(1)}s
        </span>
        <button className="pause-button" onClick={handlePauseClick}>
          {isPaused ? <FaPlay /> : <FaPause />}
        </button>
        <button className="stop-button" onClick={onStopRecording}>
          <FaMicrophone />
        </button>
      </div>
    </div>
  );
};

export default RecordingBar;
