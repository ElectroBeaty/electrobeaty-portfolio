"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const SECTION_MARKERS = [
  { id: "home", label: "Home" },
  { id: "label", label: "Label Feature", navLabel: "Label" },
  { id: "music", label: "Game Audio", navLabel: "Tracks" },
  { id: "personal", label: "Personal" },
  { id: "fanart", label: "Fanart" },
  { id: "about", label: "Contact" },
];

function TrackTitle({ track }) {
  return (
    <>
      {track.title}
      {track.badge ? <span className="track-badge">- {track.badge}</span> : null}
    </>
  );
}

function Player({ track, playerId, activePlayback, setActivePlayback }) {
  const audioRef = useRef(null);
  const [time, setTime] = useState("0:00");
  const [progress, setProgress] = useState(0);
  const isPlaying = activePlayback?.playerId === playerId;
  const playLabel = `${isPlaying ? "Pause" : "Play"} ${track.title}`;

  useEffect(() => {
    if (!isPlaying) {
      audioRef.current?.pause();
      setProgress(0);
      setTime("0:00");
    }
  }, [isPlaying]);

  function formatTime(seconds) {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = String(Math.floor(seconds % 60)).padStart(2, "0");
    return `${min}:${sec}`;
  }

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setActivePlayback(null);
      return;
    }

    try {
      setActivePlayback({ src: track.file, playerId });
      await audio.play();
    } catch {
      setActivePlayback(null);
    }
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
        onTimeUpdate={(event) => {
          const audio = event.currentTarget;
          setProgress((audio.currentTime / audio.duration) * 100 || 0);
          setTime(formatTime(audio.currentTime));
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
        <span className="volume-label">VOL</span>
        <input
          className="cyber-volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          defaultValue="1"
          aria-label="Volume"
          onInput={(event) => {
            if (audioRef.current) audioRef.current.volume = Number(event.currentTarget.value);
          }}
        />
      </div>
    </>
  );
}

function TrackCard({ track, playerId, currentSrc, activePlayback, setActivePlayback }) {
  const tags = track.tags || (track.category ? [track.category] : []);

  return (
    <div className={`card ${currentSrc === track.file ? "playing" : ""}`} data-category={track.category || ""}>
      <div className={`track-icon ${track.category || "personal"}`} />
      <h3>
        <TrackTitle track={track} />
      </h3>
      <p>{track.description}</p>
      <Player
        track={track}
        playerId={playerId}
        activePlayback={activePlayback}
        setActivePlayback={setActivePlayback}
      />
      {tags.length ? (
        <div className="chips">
          {tags.map((tag) => (
            <span className="chip" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function externalLinkProps(href) {
  return typeof href === "string" && href.startsWith("http")
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
}

function Background() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const colors = ["", "cyan", "pink"];

    setStars(
      Array.from({ length: 130 }, (_, index) => ({
        id: index,
        color: colors[Math.floor(Math.random() * colors.length)],
        big: Math.random() > 0.86,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${2.5 + Math.random() * 2}s, ${55 + Math.random() * 30}s`,
      })),
    );
  }, []);

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
  const adminClickCountRef = useRef(0);
  const adminClickTimerRef = useRef(null);
  const currentSrc = activePlayback?.src || "";

  useEffect(() => {
    return () => {
      if (adminClickTimerRef.current) {
        window.clearTimeout(adminClickTimerRef.current);
      }
    };
  }, []);

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

  const filteredTracks = content.gameTracks.filter((track) => {
    if (filter === "all") return true;
    return (track.category || "").includes(filter);
  });
  const currentTrackTitle =
    [...content.gameTracks, ...content.personalTracks, content.featuredTrack].find(
      (track) => track.file === currentSrc,
    )?.title || "Track";
  const activeSectionIndex = Math.max(
    0,
    SECTION_MARKERS.findIndex((section) => section.id === activeSection),
  );
  const activeSectionData = SECTION_MARKERS[activeSectionIndex] || SECTION_MARKERS[0];

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

    adminClickTimerRef.current = window.setTimeout(() => {
      adminClickCountRef.current = 0;
    }, 2400);
  }

  return (
    <>
      <Background />

      <header className={`top-header ${headerDocked ? "is-docked" : ""}`}>
        <div className="nav-left">
          <a href="#home">Home</a>
          <a href="#music">Tracks</a>
        </div>
        <a className="top-logo" href="#home" aria-label="ElectroBeaty Home" onClick={handleLogoClick}>
          <img src="/electrobeaty-logo.png" alt="ElectroBeaty Logo" />
        </a>
        <div className="nav-right">
          <a href="#fanart">Fanart</a>
          <a href="#about">Contact</a>
        </div>
      </header>

      <nav className="section-orbit" aria-label="Sections">
        <div className="section-readout" aria-hidden="true">
          <span>Area</span>
          <strong>{activeSectionData.label}</strong>
        </div>
        <div className="section-links">
          {SECTION_MARKERS.map((section, index) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={activeSection === section.id ? "active" : ""}
              aria-current={activeSection === section.id ? "location" : undefined}
              data-step={String(index + 1).padStart(2, "0")}
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
            <div className="avatar-stage">
              <div className="soft-aura" />
              <div className="yin-glow" />
              <div className="avatar">
                <img src="/profilbild.png" alt="electrobeaty mascot" />
              </div>
            </div>
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
              <h2>MOE DANCEFLOOR</h2>
              <p>
                I am happy to be part of SVPACYBERIA's compilation named MOE DANCEFLOOR.
              </p>
              <p className="label-feature-note">
                This sits alongside my own music projects as a new label release milestone.
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

        <div className="home-projects">
          <details>
            <summary>Show Projects & Work</summary>
            <div className="home-project-grid">
              {content.projects.map((project) => (
                <div className="log-entry" key={project.title}>
                  <div className="log-date">{project.status}</div>
                  <strong>{project.title}</strong>
                  <p>{project.description}</p>
                  {project.links?.length ? (
                    <div className="project-actions">
                      {project.links.map((link) => (
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
                  {project.note ? <div className="project-note">{project.note}</div> : null}
                </div>
              ))}
            </div>
          </details>
        </div>

        <section className="content-section" id="music">
          <div className="section-kicker">Portfolio</div>
          <h2>Game Audio Collection</h2>
          <p style={{ opacity: 0.7, marginBottom: 20 }}>
            All game tracks are loop-ready and designed for seamless in-game use.
          </p>
          <div className={`panel featured-track ${currentSrc === content.featuredTrack.file ? "playing" : ""}`}>
            <div className="section-kicker">{content.featuredTrack.kicker || "Featured Track"}</div>
            <h3>
              <TrackTitle track={content.featuredTrack} />
            </h3>
            <p>{content.featuredTrack.description}</p>
            <Player
              track={content.featuredTrack}
              playerId="featured-track"
              activePlayback={activePlayback}
              setActivePlayback={setActivePlayback}
            />
          </div>
          <div className="filters">
            {[
              ["all", "All"],
              ["combat", "Combat"],
              ["ambient", "Atmosphere"],
              ["menu", "Menu"],
              ["story", "Story"],
            ].map(([value, label]) => (
              <button
                className={`filter-btn ${filter === value ? "active" : ""}`}
                data-filter={value}
                type="button"
                key={value}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid">
            {filteredTracks.map((track) => (
              <TrackCard
                key={`${track.title}-${track.file}`}
                track={track}
                playerId={`game-${track.title}-${track.file}`}
                currentSrc={currentSrc}
                activePlayback={activePlayback}
                setActivePlayback={setActivePlayback}
              />
            ))}
          </div>
        </section>

        <section className="content-section" id="personal">
          <div className="section-kicker">Music</div>
          <h2>Personal Tracks</h2>
          <div className="panel">
            <p style={{ opacity: 0.7, marginBottom: 24 }}>
              Tracks outside of game projects - more experimental, emotional or just created for fun.
            </p>
            <div className="grid">
              {content.personalTracks.map((track) => (
                <TrackCard
                  key={`${track.title}-${track.file}`}
                  track={track}
                  playerId={`personal-${track.title}-${track.file}`}
                  currentSrc={currentSrc}
                  activePlayback={activePlayback}
                  setActivePlayback={setActivePlayback}
                />
              ))}
            </div>
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
                    onClick={() => setLightbox({ src: item.image, alt: item.title })}
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
                            onClick={() =>
                              setLightbox({
                                src,
                                alt: `${item.title} version ${index + 1}`,
                              })
                            }
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
              I'm a 24-year-old composer from Austria, working in FL Studio.
            </p>
            <p style={{ marginTop: 14 }}>
              I create music for games with a focus on atmosphere, emotion, and gameplay-driven
              sound.
            </p>
            <p style={{ marginTop: 14 }}>
              From intense combat to quiet menus or story moments, I aim to find the sound that fits
              the experience.
            </p>
            <p style={{ marginTop: 18 }}>
              I also produce standalone tracks across different styles.
            </p>
            <p style={{ marginTop: 14, opacity: 0.6, fontSize: 13, textAlign: "center" }}>
              Feel free to reach out for collaborations or game projects.
            </p>
            <div className="contact-links">
              {content.contactLinks.map((link) => (
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
        </section>
      </main>

      <footer>
        <p style={{ opacity: 0.6, fontSize: 12 }}>
          © 2026 electrobeaty - Music by electrobeaty. Artwork belongs to their respective artists.
        </p>
      </footer>

      {lightbox ? (
        <button
          id="lightbox"
          className="show"
          type="button"
          onClick={() => setLightbox(null)}
          aria-label="Close artwork preview"
        >
          <img id="lightbox-img" src={lightbox.src} alt={lightbox.alt} />
        </button>
      ) : null}

      <div id="nowPlayingBar" className={currentSrc ? "show" : ""}>
        <div className="np-visualizer">
          <span />
          <span />
          <span />
          <span />
        </div>
        <span id="nowPlayingText">
          {currentSrc ? `NOW PLAYING - ${currentTrackTitle}` : "Nothing playing"}
        </span>
      </div>
    </>
  );
}
