// ─── useDebounce ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from "react";

export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

// ─── useLocalStorage ──────────────────────────────────────────────────────────
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.warn(`useLocalStorage error for key "${key}":`, err);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch {}
  };

  return [storedValue, setValue, removeValue];
};

// ─── useClickOutside ──────────────────────────────────────────────────────────
export const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler(e);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

// ─── useWindowSize ────────────────────────────────────────────────────────────
export const useWindowSize = () => {
  const [size, setSize] = useState({
    width:  typeof window !== "undefined" ? window.innerWidth  : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return {
    ...size,
    isMobile:  size.width < 640,
    isTablet:  size.width >= 640 && size.width < 1024,
    isDesktop: size.width >= 1024,
  };
};

// ─── useScrollToTop ───────────────────────────────────────────────────────────
export const useScrollToTop = (trigger) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [trigger]);
};

// ─── usePagination ────────────────────────────────────────────────────────────
export const usePagination = ({ totalItems, itemsPerPage = 10, initialPage = 1 }) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goToPage  = useCallback((page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);

  const nextPage  = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
  const prevPage  = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);
  const firstPage = useCallback(() => goToPage(1),          [goToPage]);
  const lastPage  = useCallback(() => goToPage(totalPages), [goToPage, totalPages]);

  const offset = (currentPage - 1) * itemsPerPage;

  return {
    currentPage, totalPages, itemsPerPage, offset,
    goToPage, nextPage, prevPage, firstPage, lastPage,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
    reset:   () => setCurrentPage(1),
  };
};

// ─── useIntersectionObserver ──────────────────────────────────────────────────
export const useIntersectionObserver = (options = {}) => {
  const ref        = useRef(null);
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([ent]) => setEntry(ent),
      { threshold: 0.1, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.root, options.rootMargin]);

  return { ref, entry, isVisible: entry?.isIntersecting ?? false };
};