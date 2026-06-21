import { useState } from "react";
import CardItem from "./CardItem";

export default function Column({
  list,
  onAddCard,
  onCardClick,
  onRenameList,
  onDeleteList,
  onCardDragStart,
  onCardDragEnd,
  onDropCard,
  draggingCardId,
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const submit = () => {
    const t = title.trim();
    if (t) onAddCard(list.id, t);
    setTitle("");
    setAdding(false);
  };

  const rename = () => {
    const name = window.prompt("Rename list", list.name);
    if (name && name.trim() && name !== list.name) onRenameList(list.id, name.trim());
  };

  return (
    <div
      className={`column ${dragOver ? "drag-over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onDropCard(list.id);
      }}
    >
      <div className="column-header">
        <h3>
          {list.name}
          <span className="count">{list.cards.length}</span>
        </h3>
        <div>
          <button className="btn-subtle" title="Rename list" onClick={rename}>
            ✎
          </button>
          <button
            className="btn-subtle"
            title="Delete list"
            onClick={() => onDeleteList(list.id)}
          >
            🗑
          </button>
        </div>
      </div>

      <div className="cards">
        {list.cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            listName={list.name}
            onClick={onCardClick}
            onDragStart={onCardDragStart}
            onDragEnd={onCardDragEnd}
            dragging={draggingCardId === card.id}
          />
        ))}
      </div>

      <div className="column-footer">
        {adding ? (
          <div className="composer">
            <textarea
              autoFocus
              rows={2}
              placeholder="Card title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
                if (e.key === "Escape") setAdding(false);
              }}
            />
            <div className="composer-actions">
              <button className="btn" onClick={submit}>
                Add card
              </button>
              <button className="btn-subtle" onClick={() => setAdding(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button className="add-card-btn" onClick={() => setAdding(true)}>
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
}
