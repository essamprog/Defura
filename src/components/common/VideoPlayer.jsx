import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react";

// Lightweight custom video player using native HTML5 video
// Swap out for react-player if needed: import ReactPlayer from 'react-player'

const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const VideoPlayer = ({
  src,
  poster,
  title,
  autoPlay   = false,
  className  = "",
  onProgress,
  onEnded,
}) => {
  const videoRef   = useRef(null);
  const [playing,  setPlaying]  = useState(false);
  const [muted,    setMuted]    = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current,  setCurrent]  = useState(0);
  const [showCtrl, setShowCtrl] = useState(true);
  const timerRef   = useRef(null);

  const hideControls = () => {
    timerRef.current = setTimeout(() => { if (playing) setShowCtrl(false); }, 3000);
  };
  const revealControls = () => {
    clearTimeout(timerRef.current);
    setShowCtrl(true);
    if (playing) hideControls();
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); hideControls(); }
    else          { v.pause(); setPlaying(false); setShowCtrl(true); }
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    const pct = (v.currentTime / v.duration) * 100;
    setProgress(pct);
    setCurrent(v.currentTime);
    onProgress?.({ played: pct / 100, playedSeconds: v.currentTime });
  };

  const handleSeek = (e) => {
    const v   = videoRef.current;
    if (!v)   return;
    const pct = Number(e.target.value);
    v.currentTime = (pct / 100) * v.duration;
    setProgress(pct);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const fullscreen = () => {
    const v = videoRef.current;
    if (v?.requestFullscreen) v.requestFullscreen();
  };

  const replay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play();
    setPlaying(true);
  };

  return (
    <div
      className={["relative bg-black rounded-2xl overflow-hidden group select-none", className].join(" ")}
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowCtrl(false)}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        className="w-full aspect-video"
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => { setPlaying(false); setShowCtrl(true); onEnded?.(); }}
        onClick={togglePlay}
      />

      {/* Play/pause overlay */}
      {!src && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <p className="text-gray-500 text-sm">No video source provided</p>
        </div>
      )}

      {/* Controls bar */}
      <div className={[
        "absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent",
        "transition-opacity duration-300",
        showCtrl ? "opacity-100" : "opacity-0 pointer-events-none",
      ].join(" ")}>
        {/* Title */}
        {title && <p className="text-white text-xs font-medium mb-2 truncate">{title}</p>}

        {/* Progress */}
        <input
          type="range" min={0} max={100} step={0.1}
          value={progress}
          onChange={handleSeek}
          className="w-full h-1 mb-3 cursor-pointer accent-blue-500 bg-white/20 rounded-full appearance-none"
        />

        {/* Bottom row */}
        <div className="flex items-center gap-3">
          {/* Play / Pause */}
          <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
            {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          </button>

          {/* Replay */}
          <button onClick={replay} className="text-white/60 hover:text-white transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Mute */}
          <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Time */}
          <span className="text-white/70 text-xs font-mono ml-1">
            {formatTime(current)} / {formatTime(duration)}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Fullscreen */}
          <button onClick={fullscreen} className="text-white/60 hover:text-white transition-colors">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Centre play button when paused */}
      {!playing && src && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-white fill-white ml-1" />
          </div>
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;