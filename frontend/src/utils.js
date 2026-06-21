// Shared presentation helpers.

export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Deterministic pleasant color from a string (for member avatars).
export function avatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// A card is overdue when its due date is before today and it is not in a "Done" list.
export function isOverdue(card, listName = "") {
  if (!card.due_date) return false;
  if (listName.toLowerCase() === "done") return false;
  const due = new Date(card.due_date + "T00:00:00");
  return due < startOfToday();
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
