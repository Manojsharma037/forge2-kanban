import { useState } from "react";
import { initials, avatarColor } from "../utils";

const SWATCHES = ["#ef4444", "#f59e0b", "#10b981", "#6366f1", "#ec4899", "#0ea5e9"];

export default function ManageModal({ members, tags, onAddMember, onAddTag, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tagName, setTagName] = useState("");
  const [color, setColor] = useState(SWATCHES[3]);
  const [error, setError] = useState("");

  const addMember = async () => {
    if (!name.trim() || !email.trim()) return;
    const err = await onAddMember(name.trim(), email.trim());
    if (err) {
      setError(err);
    } else {
      setName("");
      setEmail("");
      setError("");
    }
  };

  const addTag = async () => {
    if (!tagName.trim()) return;
    await onAddTag(tagName.trim(), color);
    setTagName("");
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Manage board</h2>

        <div className="field">
          <label>Members</label>
          {members.map((m) => (
            <div className="member-row" key={m.id}>
              <span className="avatar" style={{ background: avatarColor(m.name) }}>
                {initials(m.name)}
              </span>
              <div>
                <div>{m.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.email}</div>
              </div>
            </div>
          ))}
          <div className="inline-add">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn" onClick={addMember}>
              Add
            </button>
          </div>
          {error && (
            <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 6 }}>{error}</div>
          )}
        </div>

        <div className="field">
          <label>Tags</label>
          <div className="tag-options" style={{ marginBottom: 10 }}>
            {tags.map((t) => (
              <span key={t.id} className="tag-pill" style={{ background: t.color }}>
                {t.name}
              </span>
            ))}
          </div>
          <div className="inline-add">
            <input
              type="text"
              placeholder="Tag name"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
            />
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  title={c}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: c,
                    border: color === c ? "3px solid #0f172a" : "2px solid #fff",
                    boxShadow: "0 0 0 1px var(--border)",
                  }}
                />
              ))}
            </div>
            <button className="btn" onClick={addTag}>
              Add
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <span />
          <div className="right">
            <button className="btn" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
