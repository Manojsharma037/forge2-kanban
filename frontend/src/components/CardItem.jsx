import { initials, avatarColor, isOverdue, formatDate } from "../utils";

export default function CardItem({ card, listName, onClick, onDragStart, onDragEnd, dragging }) {
  const overdue = isOverdue(card, listName);
  const member = card.assigned_member;

  return (
    <div
      className={`card ${dragging ? "dragging" : ""}`}
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(card)}
    >
      {card.tags?.length > 0 && (
        <div className="card-tags">
          {card.tags.map((tag) => (
            <span key={tag.id} className="tag-pill" style={{ background: tag.color }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="card-title">{card.title}</div>

      {(card.due_date || member) && (
        <div className="card-footer">
          {card.due_date ? (
            <span className={`due-badge ${overdue ? "overdue" : ""}`}>
              {overdue ? "⚠ " : "📅 "}
              {formatDate(card.due_date)}
            </span>
          ) : (
            <span />
          )}

          {member && (
            <span
              className="avatar"
              title={member.name}
              style={{ background: avatarColor(member.name) }}
            >
              {initials(member.name)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
