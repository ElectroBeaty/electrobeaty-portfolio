"use client";

import { useEffect, useRef, useState } from "react";

function TrackTitle({ track }) {
  return (
    <>
      {track.title}
      {track.badge ? <span className="track-badge">- {track.badge}</span> : null}
    </>
  );
}

function Player({ track, currentSrc, setCurrentSrc }) {
  const audioRef = useRef(null);
  const [time, setTime] = useState("0:00");
  const [progress, setProgress] = useState(0);
  const isPlaying = currentSrc === track.file;

  useEffect(() => {
    if (!isPlaying) audioRef.current?.pause();
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
      setCurrentSrc("");
      return;
    }

    try {
      setCurrentSrc(track.file);
      await audio.play();
    } catch {
      setCurrentSrc("");
    }
  }

  function seek(event) {
    const audio = audioRef.current;
    if (!audio?.duration) return;

    const rect = event.currentTarget.getBoundingClientRect();
    audio.currentTime = ((event.clientX - rect.left) / rect.width) * audio.duration;
  }

  return (
    <>
      <audio
        ref={audioRef}
        className="track-audio"
        src={track.file}
        onTimeUpdate={(event) => {
          const audio = event.currentTarget;
          setProgress((audio.currentTime / audio.duration) * 100 || 0);
          setTime(formatTime(audio.currentTime));
        }}
        onEnded={() => {
          setProgress(0);
          setTime("0:00");
          setCurrentSrc("");
        }}
      />
      <div className="cyber-player">
        <button className="cyber-play" type="button" onClick={toggle}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button className="cyber-bar" type="button" onClick={seek} aria-label="Track position">
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
            if (audioRef.current) audioRef.current.volume = event.currentTarget.value;
          }}
        />
      </div>
    </>
  );
}

function TrackCard({ track, currentSrc, setCurrentSrc }) {
  const tags = track.tags || (track.category ? [track.category] : []);

  return (
    <div className={`card ${currentSrc === track.file ? "playing" : ""}`} data-category={track.category || ""}>
      <div className={`track-icon ${track.category || "personal"}`} />
      <h3>
        <TrackTitle track={track} />
      </h3>
      <p>{track.description}</p>
      <Player track={track} currentSrc={currentSrc} setCurrentSrc={setCurrentSrc} />
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
  const [drops, setDrops] = useState([]);

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

    setDrops(
      Array.from({ length: 48 }, (_, index) => ({
        id: index,
        left: `${Math.random() * 110}%`,
        duration: `${0.85 + Math.random() * 0.7}s`,
        delay: `${Math.random() * 1.4}s`,
        opacity: `${0.35 + Math.random() * 0.6}`,
      })),
    );
  }, []);

  return (
    <>
      <div className="sky">
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
      <div className="rain">
        {drops.map((drop) => (
          <span
            key={drop.id}
            className="drop"
            style={{
              left: drop.left,
              animationDuration: drop.duration,
              animationDelay: drop.delay,
              opacity: drop.opacity,
            }}
          />
        ))}
      </div>
      <div className="scanlines" />
    </>
  );
}

export function Portfolio({ content }) {
  const [filter, setFilter] = useState("all");
  const [currentSrc, setCurrentSrc] = useState("");
  const [lightbox, setLightbox] = useState("");
  const [rain, setRain] = useState(true);

  const filteredTracks = content.gameTracks.filter((track) => {
    if (filter === "all") return true;
    return (track.category || "").includes(filter);
  });

  return (
    <>
      <Background />
      {!rain ? <style>{".rain{display:none}"}</style> : null}

      <header className="top-header">
        <div className="nav-left">
          <a href="#home">Home</a>
          <a href="#music">Tracks</a>
        </div>
        <a className="top-logo" href="#home" aria-label="ElectroBeaty Home">
          <img src="/electrobeaty-logo.png" alt="ElectroBeaty Logo" />
        </a>
        <div className="nav-right">
          <a href="#fanart">Fanart</a>
          <a href="#about">Contact</a>
        </div>
      </header>

      <div className="settings">
        <button className="mini-btn" type="button" onClick={() => setRain((value) => !value)}>
          Rain: {rain ? "ON" : "OFF"}
        </button>
        <a className="mini-btn" href="/admin">
          Admin
        </a>
      </div>

      <main>
        <section className="hero-section" id="home">
          <div className="hero">
            <div className="hero-frame" />
            <div className="hero-corners" />
            <div className="avatar-stage">
              <div className="soft-aura" />
              <div className="avatar-spectrum" aria-hidden="true">
                {Array.from({ length: 28 }).map((_, index) => (
                  <span key={index} />
                ))}
              </div>
              <div className="avatar-shards" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
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
            <div className="japanese-line">Dreams never end</div>
            <p>
              Music for games with a focus on emotion, atmosphere, and a touch of anime vibe.
              Sometimes calm and emotional, sometimes energetic - I like exploring different styles
              and finding the sound that fits the world.
            </p>
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
            <Player track={content.featuredTrack} currentSrc={currentSrc} setCurrentSrc={setCurrentSrc} />
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
                currentSrc={currentSrc}
                setCurrentSrc={setCurrentSrc}
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
                  currentSrc={currentSrc}
                  setCurrentSrc={setCurrentSrc}
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
            <p style={{ opacity: 0.7, marginTop: 10, fontSize: 14 }}>
              Click an artwork to view it larger.
            </p>
            <div className="grid" style={{ marginTop: 26 }}>
              {content.fanart.map((item) => (
                <div className="card" key={item.title}>
                  <button className="thumb large" type="button" onClick={() => setLightbox(item.image)}>
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
                        {item.versions.map((src) => (
                          <button type="button" key={src} onClick={() => setLightbox(src)}>
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
        <button id="lightbox" className="show" type="button" onClick={() => setLightbox("")}>
          <img id="lightbox-img" src={lightbox} alt="" />
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
          {currentSrc
            ? `NOW PLAYING - ${
                [...content.gameTracks, ...content.personalTracks, content.featuredTrack].find(
                  (track) => track.file === currentSrc,
                )?.title || "Track"
              }`
            : "Nothing playing"}
        </span>
      </div>
    </>
  );
}
