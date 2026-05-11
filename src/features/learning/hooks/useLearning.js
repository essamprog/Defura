import { useState, useEffect, useCallback } from "react";
import learningService from "../services/learningService";

const useLearning = (courseId) => {
  const [curriculum,  setCurriculum]  = useState([]);
  const [progress,    setProgress]    = useState({});
  const [currentLesson, setCurrent]   = useState(null);
  const [isLoading,   setIsLoading]   = useState(true);

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      setIsLoading(true);
      try {
        // const { data } = await learningService.getProgress(courseId);
        // setCurriculum(data.curriculum); setProgress(data.progress);
        await new Promise(r => setTimeout(r, 400));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [courseId]);

  const markComplete = useCallback(async (lessonId) => {
    try {
      await learningService.completeLesson(courseId, lessonId);
      setProgress(p => ({ ...p, [lessonId]: true }));
    } catch (_) {}
  }, [courseId]);

  const completedCount = Object.values(progress).filter(Boolean).length;
  const totalLessons   = curriculum.flatMap(s => s.lessons ?? []).length;
  const pct            = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  return {
    curriculum, progress, currentLesson, setCurrent,
    isLoading, markComplete, completedCount, totalLessons, pct,
  };
};

export default useLearning;