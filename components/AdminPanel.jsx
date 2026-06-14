"use client";

import { useEffect, useMemo, useState } from "react";
import { seedPortfolioContent } from "@/lib/seed-data";

const emptyTrack = {
  title: "New Track",
  description: "",
  file: "",
  category: "combat",
  tags: ["Combat"],
};

const emptyProject = {
  status: "GAME PROJECT - IN PROGRESS",
  title: "New Project",
  description: "",
  note: "",
  links: [],
};

const emptyFanart = {
  title: "New Artwork",
  description: "",
  image: "",
  artist: "",
  credit: "",
  artistLinks: [],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function Field({ label, value, onChange, textarea = false, type = "text" }) {
  return (
    <div className="admin-field">
      <label>{label}</label>
      {textarea ? (
        <textarea value={value || ""} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} />
      )}
    </div>
  );
}

function UploadButton({ type, onUploaded }) {
  const [status, setStatus] = useState("");

  async function upload(file) {
    if (!file) return;

    setStatus("Uploading...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (!response.ok) {
      setStatus(result.error || "Upload failed.");
      return;
    }

    onUploaded(result.url);
    setStatus("Uploaded.");
  }

  return (
    <div>
      <label className="admin-upload-btn">
        Upload {type === "image" ? "image" : "audio"}
        <input
          className="admin-file"
          type="file"
          accept={type === "image" ? "image/*" : "audio/*"}
          onChange={(event) => upload(event.target.files?.[0])}
        />
      </label>
      {status ? <div className="admin-muted">{status}</div> : null}
    </div>
  );
}

function TrackEditor({ title, tracks, onChange, personal = false }) {
  function update(index, patch) {
    onChange(tracks.map((track, itemIndex) => (itemIndex === index ? { ...track, ...patch } : track)));
  }

  function remove(index) {
    onChange(tracks.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <section className="admin-editor">
      <h2>{title}</h2>
      <p className="admin-muted">Neue Songs erscheinen nach dem Speichern automatisch auf der Website.</p>
      <div className="admin-list">
        {tracks.map((track, index) => (
          <div className="admin-item" key={`${track.title}-${index}`}>
            <div className="admin-row">
              <Field label="Titel" value={track.title} onChange={(value) => update(index, { title: value })} />
              <Field
                label="Kategorie"
                value={track.category}
                onChange={(value) =>
                  update(index, {
                    category: value,
                    tags: personal ? track.tags : [value.charAt(0).toUpperCase() + value.slice(1)],
                  })
                }
              />
            </div>
            <Field
              label="Beschreibung"
              value={track.description}
              textarea
              onChange={(value) => update(index, { description: value })}
            />
            <div className="admin-row">
              <Field label="Audiodatei / URL" value={track.file} onChange={(value) => update(index, { file: value })} />
              <Field label="Badge" value={track.badge || ""} onChange={(value) => update(index, { badge: value })} />
            </div>
            <Field
              label="Tags, mit Komma getrennt"
              value={joinList(track.tags)}
              onChange={(value) => update(index, { tags: splitList(value) })}
            />
            <div className="admin-actions">
              <UploadButton type="audio" onUploaded={(url) => update(index, { file: url })} />
              <button className="admin-danger" type="button" onClick={() => remove(index)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-actions">
        <button
          className="admin-small-btn"
          type="button"
          onClick={() => onChange([...tracks, { ...emptyTrack, category: personal ? "personal" : "combat" }])}
        >
          Add track
        </button>
      </div>
    </section>
  );
}

function ProjectEditor({ projects, onChange }) {
  function update(index, patch) {
    onChange(projects.map((project, itemIndex) => (itemIndex === index ? { ...project, ...patch } : project)));
  }

  return (
    <section className="admin-editor">
      <h2>Projects</h2>
      <div className="admin-list">
        {projects.map((project, index) => (
          <div className="admin-item" key={`${project.title}-${index}`}>
            <div className="admin-row">
              <Field label="Status" value={project.status} onChange={(value) => update(index, { status: value })} />
              <Field label="Titel" value={project.title} onChange={(value) => update(index, { title: value })} />
            </div>
            <Field
              label="Beschreibung"
              value={project.description}
              textarea
              onChange={(value) => update(index, { description: value })}
            />
            <Field label="Notiz" value={project.note || ""} onChange={(value) => update(index, { note: value })} />
            <Field
              label="Links als label|url, mehrere mit Komma"
              value={(project.links || []).map((link) => `${link.label}|${link.href}`).join(", ")}
              onChange={(value) =>
                update(index, {
                  links: splitList(value).map((item) => {
                    const [label, href] = item.split("|");
                    return { label: label?.trim() || "Link", href: href?.trim() || "#" };
                  }),
                })
              }
            />
            <div className="admin-actions">
              <button
                className="admin-danger"
                type="button"
                onClick={() => onChange(projects.filter((_, itemIndex) => itemIndex !== index))}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-actions">
        <button className="admin-small-btn" type="button" onClick={() => onChange([...projects, clone(emptyProject)])}>
          Add project
        </button>
      </div>
    </section>
  );
}

function FanartEditor({ fanart, onChange }) {
  function update(index, patch) {
    onChange(fanart.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  return (
    <section className="admin-editor">
      <h2>Fanart</h2>
      <div className="admin-list">
        {fanart.map((item, index) => (
          <div className="admin-item" key={`${item.title}-${index}`}>
            <div className="admin-row">
              <Field label="Titel" value={item.title} onChange={(value) => update(index, { title: value })} />
              <Field label="Artist" value={item.artist} onChange={(value) => update(index, { artist: value })} />
            </div>
            <Field
              label="Beschreibung"
              value={item.description}
              textarea
              onChange={(value) => update(index, { description: value })}
            />
            <Field label="Bild / URL" value={item.image} onChange={(value) => update(index, { image: value })} />
            <Field label="Extra Credit" value={item.credit || ""} onChange={(value) => update(index, { credit: value })} />
            <Field
              label="Artist Links als label|url, mehrere mit Komma"
              value={(item.artistLinks || []).map((link) => `${link.label}|${link.href}`).join(", ")}
              onChange={(value) =>
                update(index, {
                  artistLinks: splitList(value).map((entry) => {
                    const [label, href] = entry.split("|");
                    return { label: label?.trim() || "Artist", href: href?.trim() || "#" };
                  }),
                })
              }
            />
            <Field
              label="Weitere Versionen, URLs mit Komma"
              value={joinList(item.versions)}
              onChange={(value) => update(index, { versions: splitList(value) })}
            />
            <div className="admin-actions">
              <UploadButton type="image" onUploaded={(url) => update(index, { image: url })} />
              <button
                className="admin-danger"
                type="button"
                onClick={() => onChange(fanart.filter((_, itemIndex) => itemIndex !== index))}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-actions">
        <button className="admin-small-btn" type="button" onClick={() => onChange([...fanart, clone(emptyFanart)])}>
          Add fanart
        </button>
      </div>
    </section>
  );
}

function FeaturedEditor({ track, onChange }) {
  return (
    <section className="admin-editor">
      <h2>Featured Track</h2>
      <div className="admin-row">
        <Field label="Kicker" value={track.kicker} onChange={(value) => onChange({ ...track, kicker: value })} />
        <Field label="Titel" value={track.title} onChange={(value) => onChange({ ...track, title: value })} />
      </div>
      <Field
        label="Beschreibung"
        value={track.description}
        textarea
        onChange={(value) => onChange({ ...track, description: value })}
      />
      <Field label="Audiodatei / URL" value={track.file} onChange={(value) => onChange({ ...track, file: value })} />
      <UploadButton type="audio" onUploaded={(url) => onChange({ ...track, file: url })} />
    </section>
  );
}

function ContactEditor({ links, onChange }) {
  return (
    <section className="admin-editor">
      <h2>Contact Links</h2>
      <div className="admin-list">
        {links.map((link, index) => (
          <div className="admin-item" key={`${link.label}-${index}`}>
            <div className="admin-row">
              <Field
                label="Label"
                value={link.label}
                onChange={(value) =>
                  onChange(links.map((item, itemIndex) => (itemIndex === index ? { ...item, label: value } : item)))
                }
              />
              <Field
                label="URL"
                value={link.href}
                onChange={(value) =>
                  onChange(links.map((item, itemIndex) => (itemIndex === index ? { ...item, href: value } : item)))
                }
              />
            </div>
          </div>
        ))}
      </div>
      <div className="admin-actions">
        <button className="admin-small-btn" type="button" onClick={() => onChange([...links, { label: "New Link", href: "" }])}>
          Add link
        </button>
      </div>
    </section>
  );
}

export function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState(clone(seedPortfolioContent));
  const [tab, setTab] = useState("tracks");
  const [status, setStatus] = useState("");

  const tabs = useMemo(
    () => [
      ["tracks", "Game Tracks"],
      ["personal", "Personal Tracks"],
      ["featured", "Featured"],
      ["projects", "Projects"],
      ["fanart", "Fanart"],
      ["contact", "Contact"],
    ],
    [],
  );

  async function loadContent() {
    const response = await fetch("/api/admin/content");
    const result = await response.json();
    if (response.ok) {
      setContent(result.content);
      setLoggedIn(true);
    }
  }

  useEffect(() => {
    loadContent();
  }, []);

  async function login(event) {
    event.preventDefault();
    setStatus("Logging in...");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const result = await response.json();
    if (!response.ok) {
      setStatus(result.error || "Login failed.");
      return;
    }
    setLoggedIn(true);
    setStatus("");
    await loadContent();
  }

  async function save() {
    setStatus("Saving...");
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const result = await response.json();
    if (!response.ok) {
      setStatus(result.error || "Saving failed.");
      return;
    }
    setContent(result.content);
    setStatus("Saved. Public page updates within about a minute.");
  }

  if (!loggedIn) {
    return (
      <>
        <div className="sky" />
        <form className="admin-login" onSubmit={login}>
          <div className="section-kicker">Private Area</div>
          <h1>Admin Login</h1>
          <p className="admin-muted">Only you can upload or edit portfolio content here.</p>
          <Field label="Password" type="password" value={password} onChange={setPassword} />
          <div className="admin-actions">
            <button className="main-btn" type="submit">
              Login
            </button>
            <a className="fanart-btn" href="/">
              Back to site
            </a>
          </div>
          <div className="admin-status">{status}</div>
        </form>
      </>
    );
  }

  return (
    <div className="admin-shell">
      <div className="admin-header">
        <div>
          <div className="section-kicker">Portfolio CMS</div>
          <h1>Edit Content</h1>
          <p className="admin-muted">Upload songs, update descriptions, and keep your public portfolio fresh.</p>
        </div>
        <div className="admin-actions">
          <a className="fanart-btn" href="/">
            View site
          </a>
          <button className="main-btn" type="button" onClick={save}>
            Save changes
          </button>
        </div>
      </div>

      <div className="admin-grid">
        <nav className="admin-tabs">
          {tabs.map(([value, label]) => (
            <button
              className={`admin-tab ${tab === value ? "active" : ""}`}
              type="button"
              key={value}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
          <div className="admin-status">{status}</div>
        </nav>

        {tab === "tracks" ? (
          <TrackEditor
            title="Game Tracks"
            tracks={content.gameTracks}
            onChange={(gameTracks) => setContent({ ...content, gameTracks })}
          />
        ) : null}
        {tab === "personal" ? (
          <TrackEditor
            title="Personal Tracks"
            tracks={content.personalTracks}
            personal
            onChange={(personalTracks) => setContent({ ...content, personalTracks })}
          />
        ) : null}
        {tab === "featured" ? (
          <FeaturedEditor
            track={content.featuredTrack}
            onChange={(featuredTrack) => setContent({ ...content, featuredTrack })}
          />
        ) : null}
        {tab === "projects" ? (
          <ProjectEditor projects={content.projects} onChange={(projects) => setContent({ ...content, projects })} />
        ) : null}
        {tab === "fanart" ? (
          <FanartEditor fanart={content.fanart} onChange={(fanart) => setContent({ ...content, fanart })} />
        ) : null}
        {tab === "contact" ? (
          <ContactEditor links={content.contactLinks} onChange={(contactLinks) => setContent({ ...content, contactLinks })} />
        ) : null}
      </div>
    </div>
  );
}
