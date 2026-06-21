import { useEffect, useRef, useState } from "react";
import api from "./api";
import { initials, avatarColor } from "./utils";
import Column from "./components/Column";
import CardModal from "./components/CardModal";
import ManageModal from "./components/ManageModal";

function App() {
  const [boards, setBoards] = useState([]);
  const [boardId, setBoardId] = useState(null);
  const [board, setBoard] = useState(null);
  const [error, setError] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [showManage, setShowManage] = useState(false);
  const [draggingCard, setDraggingCard] = useState(null);
  const dragCardRef = useRef(null);

  const loadBoards = async () => {
    const res = await api.get("/boards");
    setBoards(res.data);
    return res.data;
  };

  const loadBoard = async (id = boardId) => {
    if (!id) return;
    try {
      const res = await api.get(`/boards/${id}`);
      setBoard(res.data);
    } catch (e) {
      setError("Could not load the board. Is the API running on port 8000?");
    }
  };

  // Pick the first available board on first load.
  useEffect(() => {
    (async () => {
      try {
        const list = await loadBoards();
        if (list.length) setBoardId(list[0].id);
        else setError("No boards found. Seed the database with `php artisan migrate:fresh --seed`.");
      } catch (e) {
        setError("Could not reach the API. Is it running on port 8000?");
      }
    })();
  }, []);

  // Reload the board whenever the selected board changes.
  useEffect(() => {
    if (boardId) loadBoard(boardId);
  }, [boardId]);

  // ---------- Board ----------
  const createBoard = async () => {
    const name = window.prompt("New board name");
    if (!name || !name.trim()) return;
    const res = await api.post("/boards", { name: name.trim() });
    const newBoard = res.data;
    // Seed the conventional columns from the brief.
    await Promise.all(
      ["To-Do", "Doing", "Done"].map((n, i) =>
        api.post("/lists", { board_id: newBoard.id, name: n, position: i })
      )
    );
    await loadBoards();
    setBoardId(newBoard.id);
  };

  const editBoard = async () => {
    const name = window.prompt("Board name", board.name);
    if (name === null) return;
    const description = window.prompt("Board description", board.description || "");
    await api.put(`/boards/${board.id}`, { name: name.trim() || board.name, description });
    await loadBoards();
    loadBoard();
  };

  // ---------- Lists ----------
  const addList = async () => {
    const name = window.prompt("New list name");
    if (!name || !name.trim()) return;
    await api.post("/lists", {
      board_id: board.id,
      name: name.trim(),
      position: board.lists.length,
    });
    loadBoard();
  };

  const renameList = async (id, name) => {
    await api.put(`/lists/${id}`, { name });
    loadBoard();
  };

  const deleteList = async (id) => {
    if (!window.confirm("Delete this list and all its cards?")) return;
    await api.delete(`/lists/${id}`);
    loadBoard();
  };

  // ---------- Cards ----------
  const addCard = async (listId, title) => {
    const list = board.lists.find((l) => l.id === listId);
    await api.post("/cards", { list_id: listId, title, position: list.cards.length });
    loadBoard();
  };

  const saveCard = async (id, fields) => {
    await api.put(`/cards/${id}`, fields);
    await loadBoard();
  };

  const deleteCard = async (id) => {
    await api.delete(`/cards/${id}`);
    loadBoard();
  };

  // ---------- Drag and drop ----------
  const onCardDragStart = (e, card) => {
    dragCardRef.current = card;
    setDraggingCard(card.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onCardDragEnd = () => {
    dragCardRef.current = null;
    setDraggingCard(null);
  };

  const onDropCard = async (listId) => {
    const card = dragCardRef.current;
    if (!card || card.list_id === listId) return;

    // Optimistic update so the move feels instant.
    setBoard((prev) => {
      const lists = prev.lists.map((l) => ({ ...l, cards: [...l.cards] }));
      const from = lists.find((l) => l.id === card.list_id);
      const to = lists.find((l) => l.id === listId);
      from.cards = from.cards.filter((c) => c.id !== card.id);
      to.cards.push({ ...card, list_id: listId });
      return { ...prev, lists };
    });

    const target = board.lists.find((l) => l.id === listId);
    await api.put(`/cards/${card.id}`, {
      list_id: listId,
      position: target ? target.cards.length : 0,
    });
    loadBoard();
  };

  // ---------- Members & tags ----------
  const addMember = async (name, email) => {
    try {
      await api.post("/members", { name, email, board_id: board.id });
      await loadBoard();
      return null;
    } catch (e) {
      return e.response?.data?.message || "Could not add member.";
    }
  };

  const addTag = async (name, color) => {
    await api.post("/tags", { board_id: board.id, name, color });
    loadBoard();
  };

  if (error) return <div className="error">{error}</div>;
  if (!board) return <div className="loading">Loading board…</div>;

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
              className="board-select"
              value={boardId || ""}
              onChange={(e) => setBoardId(Number(e.target.value))}
            >
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <button className="btn-subtle topbar-icon" title="Edit board" onClick={editBoard}>
              ✎
            </button>
            <button className="btn-ghost btn" onClick={createBoard}>
              + New board
            </button>
          </div>
          {board.description && <p className="desc">{board.description}</p>}
        </div>
        <div className="topbar-right">
          <div className="avatar-stack">
            {board.members?.map((m) => (
              <span
                key={m.id}
                className="avatar"
                title={m.name}
                style={{ background: avatarColor(m.name) }}
              >
                {initials(m.name)}
              </span>
            ))}
          </div>
          <button className="btn-ghost btn" onClick={() => setShowManage(true)}>
            Manage
          </button>
        </div>
      </header>

      <div className="board">
        {board.lists.map((list) => (
          <Column
            key={list.id}
            list={list}
            onAddCard={addCard}
            onCardClick={setActiveCard}
            onRenameList={renameList}
            onDeleteList={deleteList}
            onCardDragStart={onCardDragStart}
            onCardDragEnd={onCardDragEnd}
            onDropCard={onDropCard}
            draggingCardId={draggingCard}
          />
        ))}

        <div className="add-list">
          <button className="btn-ghost" onClick={addList}>
            + Add a list
          </button>
        </div>
      </div>

      {activeCard && (
        <CardModal
          card={activeCard}
          members={board.members || []}
          tags={board.tags || []}
          onSave={saveCard}
          onDelete={deleteCard}
          onClose={() => setActiveCard(null)}
        />
      )}

      {showManage && (
        <ManageModal
          members={board.members || []}
          tags={board.tags || []}
          onAddMember={addMember}
          onAddTag={addTag}
          onClose={() => setShowManage(false)}
        />
      )}
    </div>
  );
}

export default App;
