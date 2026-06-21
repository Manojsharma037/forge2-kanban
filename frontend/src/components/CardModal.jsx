import { useState } from "react";

export default function CardModal({ card, members, tags, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(card.title || "");
  const [description, setDescription] = useState(card.description || "");
  const [dueDate, setDueDate] = useState(card.due_date || "");
  const [assignee, setAssignee] = useState(card.assigned_member_id || "");
  const [tagIds, setTagIds] = useState((card.tags || []).map((t) => t.id));
  const [saving, setSaving] = useState(false);

  const toggleTag = (id) =>
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave(card.id, {
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      assigned_member_id: assignee || null,
      tag_ids: tagIds,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Edit card</h2>

        <div className="field">
          <label>Title</label>
          <input
            type="text"
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea
            value={description}
            placeholder="Add a more detailed description…"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Tags</label>
          <div className="tag-options">
            {tags.length === 0 && (
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                No tags yet — add some from “Manage”.
              </span>
            )}
            {tags.map((tag) => (
              <button
                key={tag.id}
                className={`tag-option ${tagIds.includes(tag.id) ? "selected" : ""}`}
                onClick={() => toggleTag(tag.id)}
                type="button"
              >
                <span className="dot" style={{ background: tag.color }} />
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Assignee</label>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Due date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        <div className="modal-actions">
          <button
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm("Delete this card?")) {
                onDelete(card.id);
                onClose();
              }
            }}
          >
            Delete
          </button>
          <div className="right">
            <button className="btn-subtle" onClick={onClose}>
              Cancel
            </button>
            <button className="btn" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
