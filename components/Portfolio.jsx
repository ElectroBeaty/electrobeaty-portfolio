"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CyberProfileRing } from "@/components/CyberProfileRing";
import { CategoryIcon } from "@/components/CategoryIcon";
import {
  defaultTrackCategories,
  labelFromCategoryValue,
  normalizeCategoryColor,
  normalizeCategory,
  normalizeCategoryValue,
} from "@/lib/categories";

const SECTION_MARKERS = [
  { id: "home", label: "Home", description: "Intro signal" },
  { id: "label", label: "Label Feature", navLabel: "Label", description: "Pinned release" },
  { id: "news", label: "News", description: "Work log" },
  { id: "music", label: "Game Audio", navLabel: "Tracks", description: "Game-ready demos" },
  { id: "personal", label: "Personal", description: "Platform releases" },
  { id: "fanart", label: "Fanart", description: "Gallery archive" },
  { id: "about", label: "Contact", description: "Links and info" },
];
const DESKTOP_TRACK_PREVIEW_COUNT = 6;
const MOBILE_TRACK_PREVIEW_COUNT = 3;
const SECTION_SCROLL_OFFSET = 48;
const SOCIAL_LINKS = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/@ElectroBeaty",
    icon: "youtube",
  },
  {
    label: "Spotify",
    href: "https://open.spotify.com/intl-de/artist/75g7C74FQ7UaWhFqH0viPC?si=yGFST6KkR7-CHiSPFUJNSA",
    icon: "spotify",
  },
  {
    label: "SoundCloud",
    href: "https://soundcloud.com/electrobeaty",
    icon: "soundcloud",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/erik_hrdl/",
    icon: "instagram",
  },
];

function SocialIcon({ icon }) {
  if (icon === "youtube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="6.5" width="18" height="11" rx="3.2" />
        <path d="m10.4 9.2 4.6 2.8-4.6 2.8V9.2Z" />
      </svg>
    );
  }

  if (icon === "spotify") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="8.6" />
        <path d="M7.8 9.7c3-1 6.3-.8 8.8.6" />
        <path d="M8.4 12.4c2.3-.7 5-.5 7 .5" />
        <path d="M9 15c1.7-.4 3.8-.3 5.2.5" />
      </svg>
    );
  }

  if (icon === "soundcloud") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 15.4h10.9a4.2 4.2 0 1 0-.7-8.3 5.1 5.1 0 0 0-9.8 2.1A3.1 3.1 0 0 0 4 15.4Z" />
        <path d="M7.2 8.8v6.6" />
        <path d="M9.3 7.2v8.2" />
        <path d="M11.4 7.8v7.6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="5" y="5" width="14" height="14" rx="4" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M16.4 7.8h.1" />
    </svg>
  );
}

function TrackTitle({ track }) {
  return (
    <>
      {track.title}
      {track.badge ? <span className="track-badge">- {track.badge}</span> : null}
    </>
  );
}

function Player({ track, playerId, activePlayback, setActivePlayback, playerCommand, volume }) {
  const audioRef = useRef(null);
  const [time, setTime] = useState("0:00");
  const [progress, setProgress] = useState(0);
  const [durationLabel, setDurationLabel] = useState("0:00");
  const isCurrent = activePlayback?.playerId === playerId;
  const isPlaying = isCurrent && activePlayback?.isPlaying;
  const playLabel = `${isPlaying ? "Pause" : "Play"} ${track.title}`;

  useEffect(() => {
    if (!isCurrent) {
      audioRef.current?.pause();
      setProgress(0);
      setTime("0:00");
    }
  }, [isCurrent]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playerCommand || playerCommand.playerId !== playerId) return;

    if (playerCommand.type === "toggle") {
      toggle();
      return;
    }

    if (playerCommand.type === "seek" && audio.duration) {
      audio.currentTime = audio.duration * playerCommand.ratio;
      updateProgress(audio);
    }
  }, [playerCommand]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  function formatTime(seconds) {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = String(Math.floor(seconds % 60)).padStart(2, "0");
    return `${min}:${sec}`;
  }

  function updateProgress(audio) {
    const nextProgress = (audio.currentTime / audio.duration) * 100 || 0;
    const nextTime = formatTime(audio.currentTime);
    const nextDurationLabel = formatTime(audio.duration);

    setProgress(nextProgress);
    setTime(nextTime);
    setDurationLabel(nextDurationLabel);

    setActivePlayback((current) =>
      current?.playerId === playerId
        ? {
            ...current,
            progress: nextProgress,
            time: nextTime,
            duration: nextDurationLabel,
          }
        : current,
    );
  }

  async function play() {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.volume = volume;
      setActivePlayback({
        src: track.file,
        playerId,
        title: track.title,
        progress,
        time,
        duration: durationLabel,
        isPlaying: true,
      });
      await audio.play();
    } catch {
      setActivePlayback(null);
    }
  }

  function pause() {
    audioRef.current?.pause();
    setActivePlayback((current) =>
      current?.playerId === playerId ? { ...current, isPlaying: false } : current,
    );
  }

  function toggle() {
    if (isPlaying) {
      pause();
      return;
    }

    play();
  }

  function seek(event) {
    const audio = audioRef.current;
    if (!audio?.duration) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = ratio * audio.duration;
  }

  return (
    <>
      <audio
        ref={audioRef}
        className="track-audio"
        src={track.file}
        preload="none"
        onLoadedMetadata={(event) => setDurationLabel(formatTime(event.currentTarget.duration))}
        onTimeUpdate={(event) => {
          updateProgress(event.currentTarget);
        }}
        onEnded={() => {
          setProgress(0);
          setTime("0:00");
          setActivePlayback((current) => (current?.playerId === playerId ? null : current));
        }}
      />
      <div className="cyber-player">
        <button
          className="cyber-play"
          type="button"
          onClick={toggle}
          aria-label={playLabel}
          aria-pressed={isPlaying}
        />
        <button
          className="cyber-bar"
          type="button"
          onClick={seek}
          aria-label={`Seek ${track.title}`}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(progress)}
        >
          <span className="cyber-fill" style={{ width: `${progress}%` }} />
        </button>
        <span className="cyber-time">{time}</span>
      </div>
    </>
  );
}

function TrackCard({
  track,
  category,
  playerId,
  currentSrc,
  activePlayback,
  setActivePlayback,
  playerCommand,
  volume,
}) {
  const categoryLabel = category?.label || labelFromCategoryValue(track.category);
  const categoryColor = normalizeCategoryColor(category?.color);
  const tags = track.tags?.length ? track.tags : [categoryLabel];
  const secondaryTags = tags.filter((tag) => tag.toLowerCase() !== categoryLabel.toLowerCase());

  return (
    <div
      className={`card track-card ${currentSrc === track.file ? "playing" : ""}`}
      data-category={track.category || ""}
      data-player-id={playerId}
      style={{ "--track-color": categoryColor }}
    >
      <div className="track-card-head">
        <div
          className="track-icon"
          style={{ "--track-color": categoryColor }}
          aria-label={categoryLabel}
        >
          <CategoryIcon icon={category?.icon} />
        </div>
        <div className="track-card-title">
          <h3>
            <TrackTitle track={track} />
          </h3>
          <span className="track-meta">{categoryLabel}</span>
        </div>
      </div>
      <p>{track.description}</p>
      <Player
        track={track}
        playerId={playerId}
        activePlayback={activePlayback}
        setActivePlayback={setActivePlayback}
        playerCommand={playerCommand}
        volume={volume}
      />
      {secondaryTags.length ? (
        <div className="chips">
          {secondaryTags.map((tag) => (
            <span className="chip" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TrackListRow({
  track,
  category,
  playerId,
  currentSrc,
  activePlayback,
  setActivePlayback,
  playerCommand,
  volume,
}) {
  const categoryLabel = category?.label || labelFromCategoryValue(track.category);
  const categoryColor = normalizeCategoryColor(category?.color);
  const tags = track.tags?.length ? track.tags : [categoryLabel];
  const secondaryTags = tags.filter((tag) => tag.toLowerCase() !== categoryLabel.toLowerCase());

  return (
    <div
      className={`track-list-row ${currentSrc === track.file ? "playing" : ""}`}
      data-category={track.category || ""}
      data-player-id={playerId}
      style={{ "--track-color": categoryColor }}
    >
      <div
        className="track-list-icon"
        style={{ "--track-color": categoryColor }}
        aria-label={categoryLabel}
      >
        <CategoryIcon icon={category?.icon} />
      </div>
      <div className="track-list-copy">
        <div className="track-list-title-row">
          <h3>
            <TrackTitle track={track} />
          </h3>
          <span>{categoryLabel}</span>
        </div>
        <p>{track.description}</p>
        {secondaryTags.length ? (
          <div className="track-list-tags">
            {secondaryTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
      </div>
      <Player
        track={track}
        playerId={playerId}
        activePlayback={activePlayback}
        setActivePlayback={setActivePlayback}
        playerCommand={playerCommand}
        volume={volume}
      />
    </div>
  );
}

function TrackViewToggle({ value, onChange }) {
  return (
    <div className="track-view-toggle" aria-label="Track layout">
      <button
        type="button"
        className={value === "cards" ? "active" : ""}
        onClick={() => onChange("cards")}
        aria-pressed={value === "cards"}
      >
        Cards
      </button>
      <button
        type="button"
        className={value === "compact" ? "active" : ""}
        onClick={() => onChange("compact")}
        aria-pressed={value === "compact"}
      >
        List
      </button>
    </div>
  );
}

function externalLinkProps(href) {
  return typeof href === "string" && href.startsWith("http")
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
}

function getCategory(categories, value) {
  const normalizedValue = normalizeCategoryValue(value);
  const defaultCategory = defaultTrackCategories.find((category) => category.value === normalizedValue);

  return (
    categories.find((category) => category.value === normalizedValue) ||
    defaultCategory || {
      value: normalizedValue,
      label: labelFromCategoryValue(normalizedValue),
      color: "#00e5ff",
      icon: "sparkle",
    }
  );
}

function TrackGrid({
  tracks,
  categories,
  previewLimit,
  showAll,
  onToggleShowAll,
  idPrefix,
  currentSrc,
  activePlayback,
  setActivePlayback,
  playerCommand,
  volume,
  viewMode = "cards",
}) {
  const visibleTracks = showAll ? tracks : tracks.slice(0, previewLimit);
  const hasMore = tracks.length > previewLimit;
  const TrackItem = viewMode === "compact" ? TrackListRow : TrackCard;

  return (
    <>
      <div className={viewMode === "compact" ? "track-list" : "grid track-grid"}>
        {visibleTracks.map((track) => (
          <TrackItem
            key={`${track.title}-${track.file}`}
            track={track}
            category={getCategory(categories, track.category)}
            playerId={`${idPrefix}-${track.title}-${track.file}`}
            currentSrc={currentSrc}
            activePlayback={activePlayback}
            setActivePlayback={setActivePlayback}
            playerCommand={playerCommand}
            volume={volume}
          />
        ))}
      </div>
      {hasMore ? (
        <div className="track-list-actions">
          <button className="view-all-btn" type="button" onClick={onToggleShowAll}>
            {showAll ? "Show less" : `View all ${tracks.length} tracks`}
          </button>
        </div>
      ) : null}
    </>
  );
}

function MiniPlayer({ activePlayback, issuePlayerCommand, volume, setVolume }) {
  if (!activePlayback?.src) return null;

  function seek(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    issuePlayerCommand(activePlayback.playerId, "seek", { ratio });
  }

  function scrollToTrack() {
    const escapedPlayerId =
      typeof CSS !== "undefined" && CSS.escape
        ? CSS.escape(activePlayback.playerId)
        : activePlayback.playerId.replaceAll('"', '\\"');
    const card = document.querySelector(`[data-player-id="${escapedPlayerId}"]`);
    card?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div id="nowPlayingBar" className="show mini-player" aria-label="Current audio player">
      <div className="np-visualizer" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <button
        className="mini-player-toggle"
        type="button"
        onClick={() => issuePlayerCommand(activePlayback.playerId, "toggle")}
        aria-label={`${activePlayback.isPlaying ? "Pause" : "Play"} ${activePlayback.title}`}
        aria-pressed={activePlayback.isPlaying}
      />
      <div className="mini-player-main">
        <button className="mini-player-title" type="button" onClick={scrollToTrack}>
          <span>Now Playing</span>
          <strong>{activePlayback.title}</strong>
        </button>
        <button
          className="mini-player-bar"
          type="button"
          onClick={seek}
          aria-label={`Seek ${activePlayback.title}`}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(activePlayback.progress || 0)}
        >
          <span style={{ width: `${activePlayback.progress || 0}%` }} />
        </button>
      </div>
      <span className="mini-player-time">
        {activePlayback.time || "0:00"} / {activePlayback.duration || "0:00"}
      </span>
      <button
        className="mini-player-locate"
        type="button"
        onClick={scrollToTrack}
        aria-label={`Jump to ${activePlayback.title}`}
      >
        Track
      </button>
      <label className="mini-player-volume">
        <span>VOL</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          aria-label="Volume"
          onChange={(event) => setVolume(Number(event.currentTarget.value))}
        />
      </label>
    </div>
  );
}

function Background() {
  const [stars, setStars] = useState([]);
  const [starCount, setStarCount] = useState(110);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 760px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function updateStarCount() {
      if (reducedMotionQuery.matches) {
        setStarCount(34);
        return;
      }

      setStarCount(mobileQuery.matches ? 64 : 110);
    }

    updateStarCount();
    mobileQuery.addEventListener("change", updateStarCount);
    reducedMotionQuery.addEventListener("change", updateStarCount);

    return () => {
      mobileQuery.removeEventListener("change", updateStarCount);
      reducedMotionQuery.removeEventListener("change", updateStarCount);
    };
  }, []);

  useEffect(() => {
    const colors = ["", "cyan", "pink"];

    setStars(
      Array.from({ length: starCount }, (_, index) => ({
        id: index,
        color: colors[Math.floor(Math.random() * colors.length)],
        big: Math.random() > 0.86,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${2.5 + Math.random() * 2}s, ${55 + Math.random() * 30}s`,
      })),
    );
  }, [starCount]);

  return (
    <>
      <div className="sky" aria-hidden="true">
        {stars.map((star) => (
          <span
            key={star.id}
            className={`star ${star.color} ${star.big ? "big" : ""}`}
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>
      <div className="scanlines" aria-hidden="true" />
    </>
  );
}

export function Portfolio({ content }) {
  const [filter, setFilter] = useState("all");
  const [activePlayback, setActivePlayback] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [headerDocked, setHeaderDocked] = useState(false);
  const [showAllGameTracks, setShowAllGameTracks] = useState(false);
  const [showAllPersonalTracks, setShowAllPersonalTracks] = useState(false);
  const [trackPreviewLimit, setTrackPreviewLimit] = useState(DESKTOP_TRACK_PREVIEW_COUNT);
  const [trackViewMode, setTrackViewMode] = useState("cards");
  const [playerCommand, setPlayerCommand] = useState(null);
  const [volume, setVolume] = useState(1);
  const adminClickCountRef = useRef(0);
  const adminClickTimerRef = useRef(null);
  const lightboxTouchStartRef = useRef(null);
  const currentSrc = activePlayback?.src || "";
  const categories = (content.categories?.length ? content.categories : defaultTrackCategories).map((category) =>
    normalizeCategory(category),
  );
  const gameCategoryValues = new Set(content.gameTracks.map((track) => normalizeCategoryValue(track.category)));
  const gameCategories = categories.filter((category) => gameCategoryValues.has(category.value));
  const fanartLightboxItems = useMemo(
    () =>
      content.fanart.flatMap((item) => [
        {
          src: item.image,
          title: item.title,
          detail: item.artist ? `Art by ${item.artist}` : "Artwork",
        },
        ...(item.versions || []).map((src, index) => ({
          src,
          title: `${item.title} - Version ${index + 1}`,
          detail: item.artist ? `Art by ${item.artist}` : "Artwork version",
        })),
      ]),
    [content.fanart],
  );
  const lightboxItem = lightbox !== null ? fanartLightboxItems[lightbox] : null;
  const visibleContactLinks = useMemo(() => {
    const existingLinks = Array.isArray(content.contactLinks) ? content.contactLinks : [];

    return existingLinks.filter((link) => {
      const href = String(link?.href || "").trim().toLowerCase();
      return !href.startsWith("mailto:") && href !== "contact@electrobeaty.com";
    });
  }, [content.contactLinks]);

  useEffect(() => {
    return () => {
      if (adminClickTimerRef.current) {
        window.clearTimeout(adminClickTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 760px)");

    function updatePreviewLimit() {
      setTrackPreviewLimit(mediaQuery.matches ? MOBILE_TRACK_PREVIEW_COUNT : DESKTOP_TRACK_PREVIEW_COUNT);
    }

    updatePreviewLimit();
    mediaQuery.addEventListener("change", updatePreviewLimit);

    return () => mediaQuery.removeEventListener("change", updatePreviewLimit);
  }, []);

  useEffect(() => {
    setShowAllGameTracks(false);
  }, [filter]);

  useEffect(() => {
    setActivePlayback(null);
  }, [trackViewMode]);

  useEffect(() => {
    const visibility = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibility.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibility.delete(entry.target.id);
          }
        });

        const nextSection = [...visibility.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
        if (nextSection) {
          setActiveSection(nextSection);
        }
      },
      {
        rootMargin: "-30% 0px -48% 0px",
        threshold: [0.01, 0.18, 0.38, 0.62],
      },
    );

    SECTION_MARKERS.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let animationFrame = null;

    function updateHeaderDock() {
      animationFrame = null;
      setHeaderDocked(window.scrollY > 90);
    }

    function handleScroll() {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updateHeaderDock);
      }
    }

    updateHeaderDock();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  useEffect(() => {
    const initialSection = window.location.hash.slice(1);
    if (!initialSection) return undefined;

    const timeout = window.setTimeout(() => {
      scrollToSection(null, initialSection);
    }, 120);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (lightbox === null) return undefined;

    function handleKey(event) {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowLeft") moveLightbox(-1);
      if (event.key === "ArrowRight") moveLightbox(1);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox, fanartLightboxItems.length]);

  const filteredTracks = content.gameTracks.filter((track) => {
    if (filter === "all") return true;
    return normalizeCategoryValue(track.category) === filter;
  });
  function issuePlayerCommand(playerId, type, payload = {}) {
    setPlayerCommand({
      id: Date.now(),
      playerId,
      type,
      ...payload,
    });
  }

  function openLightbox(src) {
    const index = fanartLightboxItems.findIndex((item) => item.src === src);
    setLightbox(index >= 0 ? index : null);
  }

  function moveLightbox(direction) {
    setLightbox((current) => {
      if (current === null || !fanartLightboxItems.length) return current;
      return (current + direction + fanartLightboxItems.length) % fanartLightboxItems.length;
    });
  }

  function handleLightboxTouchStart(event) {
    const touch = event.touches[0];
    lightboxTouchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  function handleLightboxTouchEnd(event) {
    const start = lightboxTouchStartRef.current;
    const touch = event.changedTouches[0];
    lightboxTouchStartRef.current = null;

    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      moveLightbox(deltaX < 0 ? 1 : -1);
    }
  }

  function handleLogoClick(event) {
    if (adminClickTimerRef.current) {
      window.clearTimeout(adminClickTimerRef.current);
    }

    adminClickCountRef.current += 1;

    if (adminClickCountRef.current >= 5) {
      event.preventDefault();
      adminClickCountRef.current = 0;
      window.location.assign("/admin");
      return;
    }

    scrollToSection(event, "home");

    adminClickTimerRef.current = window.setTimeout(() => {
      adminClickCountRef.current = 0;
    }, 2400);
  }

  function scrollToSection(event, id) {
    event?.preventDefault();

    const section = document.getElementById(id);
    if (!section) return;

    const top =
      id === "home"
        ? 0
        : Math.max(section.getBoundingClientRect().top + window.scrollY + SECTION_SCROLL_OFFSET, 0);

    window.history.pushState(null, "", `#${id}`);
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <>
      <Background />

      <header className={`top-header ${headerDocked ? "is-docked" : ""}`}>
        <div className="nav-left">
          <a href="#home" onClick={(event) => scrollToSection(event, "home")}>Home</a>
          <a href="#music" onClick={(event) => scrollToSection(event, "music")}>Tracks</a>
        </div>
        <a className="top-logo" href="#home" aria-label="ElectroBeaty Home" onClick={handleLogoClick}>
          <img src="/electrobeaty-logo.png" alt="ElectroBeaty Logo" />
        </a>
        <div className="nav-right">
          <a href="#fanart" onClick={(event) => scrollToSection(event, "fanart")}>Fanart</a>
          <a href="#about" onClick={(event) => scrollToSection(event, "about")}>Contact</a>
        </div>
      </header>

      <nav className="section-orbit" aria-label="Sections">
        <div className="section-links">
          {SECTION_MARKERS.map((section, index) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={activeSection === section.id ? "active" : ""}
              aria-current={activeSection === section.id ? "location" : undefined}
              data-step={String(index + 1).padStart(2, "0")}
              onClick={(event) => scrollToSection(event, section.id)}
            >
              <span>{section.navLabel || section.label}</span>
            </a>
          ))}
        </div>
      </nav>

      <main>
        <section className="hero-section" id="home">
          <div className="hero">
            <div className="hero-frame" />
            <div className="hero-corners" />
            <div className="avatar-stage cyber-avatar-stage">
              <div className="soft-aura" />
              <CyberProfileRing />
              <div className="avatar">
                <img src="/profilbild.png" alt="electrobeaty mascot" />
              </div>
            </div>
            <h1 className="hero-brand-title">ElectroBeaty</h1>
            <div className="hud-row">
              <span className="hud">Collaboration</span>
              <span className="hud flicker">Status: Online</span>
              <span className="hud">Commissions</span>
            </div>
            <div className="subtitle">Composer | Game Audio | Rhythm Gamer</div>
            <div className="japanese-line">夢は終わらない</div>
            <p>
              Music for games with a focus on emotion, atmosphere, and a touch of anime vibe.
              Sometimes calm and emotional, sometimes energetic - I like exploring different styles
              and finding the sound that fits the world.
            </p>
          </div>
        </section>

        <section className="content-section label-feature-section" id="label">
          <div className="section-kicker">Label Feature</div>
          <div className="label-feature-panel">
            <div className="label-feature-copy">
              <span className="label-feature-eyebrow">Compilation Appearance</span>
              <h2>MOE ★ DANCEFLOOR</h2>
              <p>
                I am so happy to participate in this compilation called{" "}
                <strong>MOE ★ DANCEFLOOR</strong> and therefore being part of the
                SVPACYBERIA Label.
              </p>
              <p className="label-feature-note">
                CDs and T-shirts are also available and can be purchased on the SVPACYBERIA
                website. Please check out the other producers on the compilation too.
              </p>
              <div className="label-feature-actions" aria-label="MOE DANCEFLOOR links">
                <a
                  className="label-feature-btn"
                  href="https://svpacyberia.com/"
                  {...externalLinkProps("https://svpacyberia.com/")}
                >
                  Website
                </a>
                <a
                  className="label-feature-btn"
                  href="https://www.youtube.com/watch?v=6Y6hAbJBZ-0"
                  {...externalLinkProps("https://www.youtube.com/watch?v=6Y6hAbJBZ-0")}
                >
                  Compilation
                </a>
                <a
                  className="label-feature-btn"
                  href="https://www.youtube.com/watch?v=pKTEYVjGaG4"
                  {...externalLinkProps("https://www.youtube.com/watch?v=pKTEYVjGaG4")}
                >
                  My Song
                </a>
              </div>
            </div>
            <div className="label-feature-art">
              <Image
                src="/moe-dancefloor.jpg"
                alt="MOE DANCEFLOOR compilation artwork"
                width={1280}
                height={720}
                sizes="(max-width: 760px) 100vw, 560px"
              />
            </div>
          </div>
        </section>

        <section className="content-section news-section" id="news">
          <div className="section-kicker">News</div>
          <h2>Updates & Releases</h2>
          <p className="news-section-copy">
            Selected project milestones, release notes, and portfolio updates.
          </p>
          <div className="news-projects" aria-label="Project news">
            <div className="news-log-panel">
              <div className="news-log-header">
                <span>Update log</span>
                <strong>Project Timeline</strong>
                <em>{content.projects.length} entries</em>
              </div>
              <div className="news-project-grid">
                {content.projects.map((project, index) => {
                  const previewImage = project.image || project.previewImage;

                  return (
                    <article
                      className={`log-entry ${index === 0 ? "latest" : ""}`}
                      key={`${project.title}-${index}`}
                    >
                      <div className="log-date">
                        <span>{index === 0 ? "Latest" : String(index + 1).padStart(2, "0")}</span>
                        <em>{project.status}</em>
                      </div>
                      <div className="log-entry-body">
                        <div className="log-entry-main">
                          <strong>{project.title}</strong>
                          <p>{project.description}</p>
                          {project.links?.length ? (
                            <div className="project-actions">
                              {project.links.map((link) => (
                                <a
                                  className="fanart-btn"
                                  href={link.href}
                                  key={link.href}
                                  onClick={
                                    link.href?.startsWith("#")
                                      ? (event) => scrollToSection(event, link.href.slice(1))
                                      : undefined
                                  }
                                  {...externalLinkProps(link.href)}
                                >
                                  {link.label}
                                </a>
                              ))}
                            </div>
                          ) : null}
                          {project.note ? <div className="project-note">{project.note}</div> : null}
                        </div>
                        <div className={`log-entry-media ${previewImage ? "" : "is-empty"}`}>
                          {previewImage ? (
                            <img src={previewImage} alt={`${project.title} preview`} loading="lazy" />
                          ) : (
                            <span>Preview pending</span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="content-section" id="music">
          <div className="section-kicker">Portfolio</div>
          <h2>Game Audio Collection</h2>
          <p style={{ opacity: 0.7, marginBottom: 20 }}>
            All game tracks are loop-ready and designed for seamless in-game use.
          </p>
          <div className="track-toolbar">
            <div className="filters">
              {[{ value: "all", label: "All", color: "#00e5ff" }, ...gameCategories].map((category) => (
                <button
                  className={`filter-btn ${filter === category.value ? "active" : ""}`}
                  data-filter={category.value}
                  type="button"
                  key={category.value}
                  style={{ "--track-color": normalizeCategoryColor(category.color) }}
                  onClick={() => setFilter(category.value)}
                >
                  {category.label}
                </button>
              ))}
            </div>
            <TrackViewToggle value={trackViewMode} onChange={setTrackViewMode} />
          </div>
          <TrackGrid
            tracks={filteredTracks}
            categories={categories}
            previewLimit={trackPreviewLimit}
            showAll={showAllGameTracks}
            onToggleShowAll={() => setShowAllGameTracks((value) => !value)}
            idPrefix="game"
            currentSrc={currentSrc}
            activePlayback={activePlayback}
            setActivePlayback={setActivePlayback}
            playerCommand={playerCommand}
            volume={volume}
            viewMode={trackViewMode}
          />
        </section>

        <section className="content-section" id="personal">
          <div className="section-kicker">Music</div>
          <h2>Personal Tracks</h2>
          <div className="panel">
            <p style={{ opacity: 0.7, marginBottom: 24 }}>
              You can listen to the full versions of these personal tracks on all major platforms.
            </p>
            <div className="personal-track-toolbar">
              <span>Release previews</span>
              <TrackViewToggle value={trackViewMode} onChange={setTrackViewMode} />
            </div>
            <TrackGrid
              tracks={content.personalTracks}
              categories={categories}
              previewLimit={trackPreviewLimit}
              showAll={showAllPersonalTracks}
              onToggleShowAll={() => setShowAllPersonalTracks((value) => !value)}
              idPrefix="personal"
              currentSrc={currentSrc}
              activePlayback={activePlayback}
              setActivePlayback={setActivePlayback}
              playerCommand={playerCommand}
              volume={volume}
              viewMode={trackViewMode}
            />
          </div>
        </section>

        <section className="content-section" id="fanart">
          <div className="section-kicker">Community</div>
          <h2>Mascot & Fanart Gallery</h2>
          <div className="panel">
            <p>
              A place for the mascot to evolve through art - featuring sketches, alternate designs,
              and fan creations.
            </p>
            <div className="grid" style={{ marginTop: 26 }}>
              {content.fanart.map((item) => (
                <div className="card" key={item.title}>
                  <button
                    className="thumb large"
                    type="button"
                    onClick={() => openLightbox(item.image)}
                    aria-label={`Open ${item.title}`}
                  >
                    <img src={item.image} alt={item.title} />
                  </button>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <p className="art-credit">
                    Art by {item.artist}
                    {item.credit ? (
                      <>
                        <br />
                        {item.credit}
                      </>
                    ) : null}
                  </p>
                  {item.versions?.length ? (
                    <div className="versions-block">
                      <h3>{item.versionsTitle || "More Versions"}</h3>
                      <div className="sister-gallery">
                        {item.versions.map((src, index) => (
                          <button
                            type="button"
                            key={src}
                            onClick={() => openLightbox(src)}
                            aria-label={`Open ${item.title} version ${index + 1}`}
                          >
                            <img src={src} alt={`More artwork for ${item.title}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {item.note ? <p className="art-note">{item.note}</p> : null}
                  {item.artistLinks?.length ? (
                    <div className="fanart-links">
                      {item.artistLinks.map((link) => (
                        <a
                          className="fanart-btn"
                          href={link.href}
                          key={link.href}
                          {...externalLinkProps(link.href)}
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="note">
              These are some early artworks from people close to me. If you ever feel inspired to
              create your own fanart, it could be featured here in the future.
            </div>
          </div>
        </section>

        <section className="content-section" id="about">
          <div className="section-kicker">About</div>
          <h2>About & Contact</h2>
          <div className="panel">
            <p style={{ fontWeight: 500 }}>
              I am ElectroBeaty, also known as EBeaty or Beaty, an Austrian electronic music
              composer and producer.
            </p>
            <p style={{ marginTop: 14 }}>
              Since 2016, I have been creating original electronic music from ideas, moods, and
              sounds that came to mind.
            </p>
            <p style={{ marginTop: 14 }}>
              My sound is mostly funky, anime-inspired, and J-core-heavy, with energetic electronic
              production, emotional melodies, and playful sound design.
            </p>
            <p style={{ marginTop: 18 }}>
              More recently, I started bringing that style into game music and game audio, creating
              tracks for projects, atmospheres, menus, and character-driven moments.
            </p>
            <p style={{ marginTop: 14, opacity: 0.6, fontSize: 13, textAlign: "center" }}>
              Feel free to reach out for collaborations or game projects.
            </p>
            <div className="contact-links">
              {visibleContactLinks.map((link) => (
                <a
                  className="main-btn"
                  href={link.href}
                  key={link.href}
                  {...externalLinkProps(link.href)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <nav className="footer-social-strip about-social-strip" aria-label="ElectroBeaty social links">
            {SOCIAL_LINKS.map((link) => (
              <a
                className={`footer-social-link ${link.icon}`}
                href={link.href}
                key={link.href}
                aria-label={`ElectroBeaty on ${link.label}`}
                {...externalLinkProps(link.href)}
              >
                <SocialIcon icon={link.icon} />
                <span>{link.label}</span>
              </a>
            ))}
          </nav>
        </section>
      </main>

      <footer>
        <p style={{ opacity: 0.6, fontSize: 12 }}>
          © 2026 electrobeaty - Music by electrobeaty. Artwork belongs to their respective artists.
        </p>
      </footer>

      {lightboxItem ? (
        <div
          id="lightbox"
          className="show"
          role="dialog"
          aria-modal="true"
          aria-label="Artwork preview"
          onClick={() => setLightbox(null)}
          onTouchStart={handleLightboxTouchStart}
          onTouchEnd={handleLightboxTouchEnd}
        >
          <div className="lightbox-panel" onClick={(event) => event.stopPropagation()}>
            <button className="lightbox-close" type="button" onClick={() => setLightbox(null)}>
              Close
            </button>
            {fanartLightboxItems.length > 1 ? (
              <button className="lightbox-nav prev" type="button" onClick={() => moveLightbox(-1)}>
                Prev
              </button>
            ) : null}
            <div className="lightbox-image-stage">
              <img id="lightbox-img" src={lightboxItem.src} alt={lightboxItem.title} />
            </div>
            {fanartLightboxItems.length > 1 ? (
              <button className="lightbox-nav next" type="button" onClick={() => moveLightbox(1)}>
                Next
              </button>
            ) : null}
            <div className="lightbox-caption">
              <strong>{lightboxItem.title}</strong>
              <span>{lightboxItem.detail}</span>
              <em>
                {lightbox + 1} / {fanartLightboxItems.length}
              </em>
            </div>
            {fanartLightboxItems.length > 1 ? (
              <div className="lightbox-strip" aria-label="Artwork thumbnails">
                {fanartLightboxItems.map((item, index) => (
                  <button
                    className={index === lightbox ? "active" : ""}
                    type="button"
                    key={`${item.src}-${index}`}
                    onClick={() => setLightbox(index)}
                    aria-label={`Show ${item.title}`}
                  >
                    <img src={item.src} alt="" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <MiniPlayer
        activePlayback={activePlayback}
        issuePlayerCommand={issuePlayerCommand}
        volume={volume}
        setVolume={setVolume}
      />
    </>
  );
}
