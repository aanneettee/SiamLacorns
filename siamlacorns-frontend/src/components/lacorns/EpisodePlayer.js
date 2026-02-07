import React, { useRef, useState, useEffect } from 'react';
import { lacornService } from '../../services/lacorns';
import { useAuth } from '../../context/AuthContext';
import './EpisodePlayer.css';

const EpisodePlayer = ({ episode, lacorn, onBack }) => {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(episode.currentTime || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useAuth();

  // Сохранение прогресса каждые 10 секунд
  useEffect(() => {
    const interval = setInterval(saveProgress, 10000);
    return () => clearInterval(interval);
  }, [currentTime]);

  const saveProgress = async () => {
    if (!user) return;

    try {
      const isCompleted = currentTime >= (episode.duration * 60 * 0.9); // 90% просмотрено
      await lacornService.updateWatchProgress({
        episodeId: episode.id,
        currentTime: Math.floor(currentTime),
        completed: isCompleted
      });
    } catch (error) {
      console.error('Ошибка сохранения прогресса:', error);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className="episode-player">
      <button className="back-button" onClick={onBack}>
        ← Назад к сериалу
      </button>

      <div className="player-container">
        <div className="video-container">
          <video
            ref={videoRef}
            src={episode.videoUrl}
            controls
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="video-player"
          />
        </div>

        <div className="episode-info">
          <h2>{lacorn.title} - {episode.title}</h2>
          <p>S{episode.seasonNumber}E{episode.episodeNumber}</p>
          <p>{episode.description}</p>
        </div>

        <div className="player-controls">
          <div className="progress-bar">
            <input
              type="range"
              min="0"
              max={episode.duration * 60}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="progress-slider"
            />
            <div className="time-display">
              {formatTime(currentTime)} / {formatTime(episode.duration * 60)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default EpisodePlayer;