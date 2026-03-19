import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TableList, { type TableListColumnDef } from "@/components/TableList";
import ConfirmDialog from "@/components/ConfirmDialog";
import { formatContactName } from "@/utils/formatters";
import { useDatabase, useAuth } from "@/backend";
import type { Contact, EngObject } from "@/backend";

// ---------------------------------------------------------------------------
// Badges

const KIND_LABEL: Record<NonNullable<Contact["kind"]>, string> = {
  client: "Замовник",
  subcontractor: "Субпідрядник",
};
const KIND_CLASS: Record<NonNullable<Contact["kind"]>, string> = {
  client: "bg-blue-100 text-blue-800",
  subcontractor: "bg-orange-100 text-orange-800",
};

function KindBadge({ kind }: { kind?: Contact["kind"] }) {
  if (!kind) return null;
  return (
    <span className={cn("badge", KIND_CLASS[kind])}>
      {KIND_LABEL[kind]}
    </span>
  );
}

const OBJ_STATUS_LABEL: Record<EngObject["status"], string> = {
  ongoing: "Поточний",
  completed: "Завершено",
};
const OBJ_STATUS_CLASS: Record<EngObject["status"], string> = {
  ongoing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

function ObjStatusBadge({ status, completedDate }: { status: EngObject["status"]; completedDate?: string }) {
  const label =
    status === "completed" && completedDate
      ? `Завершено: ${completedDate}`
      : OBJ_STATUS_LABEL[status];
  return (
    <span className={cn("badge-wide", OBJ_STATUS_CLASS[status])}>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// RelatedItem type

type RelatedItem = {
  id: string;
  kind: "object" | "task";
  name: string;
  status: "ongoing" | "completed";
  completedDate?: string;
  role: string;
};

// ---------------------------------------------------------------------------
// CreateContactDialog

function CreateContactDialog({ onConfirm, onCancel }: {
  onConfirm: (data: { first: string; middle: string; last: string; kind: string }) => void;
  onCancel: () => void;
}) {
  const [first, setFirst] = useState("");
  const [middle, setMiddle] = useState("");
  const [last, setLast] = useState("");
  const [kind, setKind] = useState("");
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="w-80 rounded-none gap-3">
        <DialogHeader>
          <DialogTitle>Новий контакт</DialogTitle>
        </DialogHeader>
        <Input placeholder="Прізвище" value={first} onChange={e => setFirst(e.target.value)} />
        <Input placeholder="Ім'я" value={middle} onChange={e => setMiddle(e.target.value)} />
        <Input placeholder="По батькові" value={last} onChange={e => setLast(e.target.value)} />
        <select className="form-select" value={kind} onChange={e => setKind(e.target.value)}>
          <option value="">— тип —</option>
          <option value="client">Замовник</option>
          <option value="subcontractor">Субпідрядник</option>
        </select>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="rounded-none" onClick={onCancel}>Скасувати</Button>
          <Button className="rounded-none" onClick={() => onConfirm({ first, middle, last, kind })}
            disabled={!first && !middle && !last}>Створити</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main view

export default function ContactsView() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  const { contacts, objects, tasks, updateContact, removeContact, addContact } = useDatabase();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | undefined>(
    location.state?.selectContactId ?? contacts[0]?.id
  );
  const [mobilePanel, setMobilePanel] = useState<"list" | "detail">(
    location.state?.selectContactId ? "detail" : "list"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Contact | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const selected = contacts.find((c) => c.id === selectedId);

  const relatedItems: RelatedItem[] = selected ? [
    ...objects
      .filter(obj => obj.people.some(p => p.contactId === selected.id))
      .map(obj => ({
        id: obj.id, kind: "object" as const,
        name: obj.name, status: obj.status, completedDate: obj.completedDate,
        role: obj.people.find(p => p.contactId === selected.id)?.label ?? "—",
      })),
    ...tasks
      .filter(t => t.people.some(p => p.contactId === selected.id))
      .map(t => ({
        id: t.id, kind: "task" as const,
        name: t.name, status: t.status, completedDate: t.completedDate,
        role: t.people.find(p => p.contactId === selected.id)?.label ?? "—",
      })),
  ] : [];

  function handleEditToggle() {
    if (!selected) return;
    if (!isEditing) {
      setDraft({
        ...selected,
        email: selected.email.map((e) => ({ ...e })),
        phone: selected.phone.map((p) => ({ ...p })),
      });
      setIsEditing(true);
    } else {
      if (draft) updateContact(draft.id, draft);
      setIsEditing(false);
    }
  }

  function handleDelete() {
    if (!selected) return;
    const nextId = contacts.find((c) => c.id !== selected.id)?.id;
    removeContact(selected.id);
    setSelectedId(nextId);
    setConfirmDelete(false);
    setIsEditing(false);
    setMobilePanel("list");
  }

  function handleCreate(data: { first: string; middle: string; last: string; kind: string }) {
    const newContact: Contact = {
      id: `c-${Date.now()}`,
      kind: (data.kind as Contact["kind"]) || undefined,
      sync: { origin: "local", isSynced: false },
      name: { first: data.first || undefined, middle: data.middle || undefined, last: data.last || undefined },
      email: [], phone: [], notes: "",
    };
    addContact(newContact);
    setSelectedId(newContact.id);
    setShowCreate(false);
  }

  const contactColumns: TableListColumnDef<Contact>[] = [
    {
      header: "Ім'я",
      className: "w-48 min-w-32",
      cell: (c) => <span className="text-xs">{formatContactName(c.name)}</span>,
    },
    {
      header: "Тип",
      className: "w-32 min-w-24",
      cell: (c) => <KindBadge kind={c.kind} />,
    },
  ];

  const relatedColumns: TableListColumnDef<RelatedItem>[] = [
    {
      header: "Назва",
      className: "w-52 min-w-36",
      cell: (item) => (
        <div>
          <span className="block truncate text-xs font-medium">{item.name}</span>
          <span className="text-xs text-muted-foreground">{item.kind === "object" ? "Об'єкт" : "Доп. завдання"}</span>
        </div>
      ),
    },
    {
      header: "Статус",
      className: "w-44 min-w-36",
      cell: (item) => <ObjStatusBadge status={item.status} completedDate={item.completedDate} />,
    },
    {
      header: "Роль",
      className: "w-32 min-w-24",
      cell: (item) => <span className="text-xs text-muted-foreground">{item.role}</span>,
    },
  ];

  return (
    <div className="view-layout">
      {/* Left pane */}
      <div className={cn("pane-left", mobilePanel === "detail" && "hidden sm:flex")}>
        <div className="list-toolbar">
          <Button size="sm" variant="ghost" className="rounded-none h-7 text-xs"
            onClick={() => setShowCreate(true)}>
            + Новий контакт
          </Button>
        </div>
        <TableList list={contacts} columns={contactColumns}
          selectedId={selectedId} onRecordClick={(c) => { setSelectedId(c.id); setIsEditing(false); setMobilePanel("detail"); }} />
      </div>

      {/* Right pane */}
      <div className={cn("pane-right", mobilePanel === "list" && "hidden sm:flex")}>
        {selected ? (
          <>
            <button
              className="sm:hidden flex items-center gap-1 text-xs text-muted-foreground px-4 pt-2 hover:text-foreground"
              onClick={() => setMobilePanel("list")}
            >
              ← Назад
            </button>
            {/* Header */}
            <div className="shrink-0 px-4 py-3 flex items-center gap-2 border-b flex-wrap">
              <h2 className="text-xl font-bold">{formatContactName(selected.name)}</h2>
              <KindBadge kind={selected.kind} />
              <div className="flex gap-2 ml-auto shrink-0">
                <Button
                  size="sm"
                  variant={isEditing ? "default" : "outline"}
                  className={isEditing ? "rounded-none bg-blue-600 hover:bg-blue-700" : "rounded-none"}
                  onClick={handleEditToggle}
                >
                  {isEditing ? "Зберегти" : "Редагувати"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-none"
                  onClick={() => setConfirmDelete(true)}
                >
                  Видалити
                </Button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-3 text-sm">
              {isEditing && draft ? (
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Left col: name, kind, emails, phones */}
                  <div className="flex flex-col gap-4 sm:flex-1 min-w-0">
                    <div>
                      <div className="section-label mb-1">Ім&apos;я</div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Прізвище"
                          value={draft.name.first ?? ""}
                          onChange={(e) => setDraft({ ...draft, name: { ...draft.name, first: e.target.value } })}
                        />
                        <Input
                          placeholder="Ім'я"
                          value={draft.name.middle ?? ""}
                          onChange={(e) => setDraft({ ...draft, name: { ...draft.name, middle: e.target.value } })}
                        />
                        <Input
                          placeholder="По батькові"
                          value={draft.name.last ?? ""}
                          onChange={(e) => setDraft({ ...draft, name: { ...draft.name, last: e.target.value } })}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="section-label mb-1">Тип</div>
                      <select
                        className="form-select"
                        value={draft.kind ?? ""}
                        onChange={(e) => setDraft({ ...draft, kind: (e.target.value as Contact["kind"]) || undefined })}
                      >
                        <option value="">— тип —</option>
                        <option value="client">Замовник</option>
                        <option value="subcontractor">Субпідрядник</option>
                      </select>
                    </div>

                    <div>
                      <div className="section-label mb-1">E-mail</div>
                      <div className="flex flex-col gap-1">
                        {draft.email.map((e, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <Input
                              placeholder="Мітка"
                              value={e.lbl ?? ""}
                              onChange={(ev) => {
                                const email = [...draft.email];
                                email[i] = { ...email[i], lbl: ev.target.value };
                                setDraft({ ...draft, email });
                              }}
                              className="w-28"
                            />
                            <Input
                              placeholder="Email"
                              value={e.val}
                              onChange={(ev) => {
                                const email = [...draft.email];
                                email[i] = { ...email[i], val: ev.target.value };
                                setDraft({ ...draft, email });
                              }}
                            />
                            <Button size="sm" variant="ghost" className="rounded-none px-2"
                              onClick={() => setDraft({ ...draft, email: draft.email.filter((_, j) => j !== i) })}>
                              ×
                            </Button>
                          </div>
                        ))}
                        <Button size="sm" variant="outline" className="rounded-none self-start"
                          onClick={() => setDraft({ ...draft, email: [...draft.email, { lbl: "", val: "" }] })}>
                          + Додати e-mail
                        </Button>
                      </div>
                    </div>

                    <div>
                      <div className="section-label mb-1">Телефон</div>
                      <div className="flex flex-col gap-1">
                        {draft.phone.map((p, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <Input
                              placeholder="Мітка"
                              value={p.lbl ?? ""}
                              onChange={(ev) => {
                                const phone = [...draft.phone];
                                phone[i] = { ...phone[i], lbl: ev.target.value };
                                setDraft({ ...draft, phone });
                              }}
                              className="w-28"
                            />
                            <Input
                              placeholder="Телефон"
                              value={p.val}
                              onChange={(ev) => {
                                const phone = [...draft.phone];
                                phone[i] = { ...phone[i], val: ev.target.value };
                                setDraft({ ...draft, phone });
                              }}
                            />
                            <Button size="sm" variant="ghost" className="rounded-none px-2"
                              onClick={() => setDraft({ ...draft, phone: draft.phone.filter((_, j) => j !== i) })}>
                              ×
                            </Button>
                          </div>
                        ))}
                        <Button size="sm" variant="outline" className="rounded-none self-start"
                          onClick={() => setDraft({ ...draft, phone: [...draft.phone, { lbl: "", val: "" }] })}>
                          + Додати телефон
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Right col: notes */}
                  <div className="flex flex-col gap-2 sm:flex-1 min-w-0">
                    <div className="section-label mb-1">Нотатки</div>
                    <textarea
                      className="notes-textarea flex-1 min-h-48"
                      value={draft.notes}
                      onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Left column: emails + phones + (notes on mobile) + related items */}
                  <div className="flex flex-col gap-4 sm:flex-1 min-w-0">
                    {selected.email.length > 0 && (
                      <div>
                        <div className="section-label mb-1">E-mail</div>
                        <div className="flex flex-col gap-1">
                          {selected.email.map((e, i) => (
                            <div key={i} className="flex gap-2">
                              {e.lbl && <span className="text-muted-foreground text-xs">{e.lbl}:</span>}
                              <span>{e.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selected.phone.length > 0 && (
                      <div>
                        <div className="section-label mb-1">Телефон</div>
                        <div className="flex flex-col gap-1">
                          {selected.phone.map((p, i) => (
                            <div key={i} className="flex gap-2">
                              {p.lbl && <span className="text-muted-foreground text-xs">{p.lbl}:</span>}
                              <span>{p.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes — visible on mobile only, between phones and related */}
                    <div className="sm:hidden flex flex-col gap-2">
                      <div className="section-label">Нотатки</div>
                      {selected.notes ? (
                        <div className="border rounded p-2 bg-muted/20 whitespace-pre-line text-sm">
                          {selected.notes}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Немає нотаток</span>
                      )}
                    </div>

                    <div>
                      <div className="section-label mb-1">Пов&apos;язані записи</div>
                      {relatedItems.length > 0 ? (
                        <div className="border rounded overflow-x-auto max-w-full">
                          <TableList
                            list={relatedItems}
                            columns={relatedColumns}
                            onRecordClick={(item) => {
                              if (item.kind === "object") navigate("/objects", { state: { selectObjectId: item.id } });
                              else navigate("/tasks", { state: { selectTaskId: item.id } });
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Немає пов&apos;язаних записів</span>
                      )}
                    </div>
                  </div>

                  {/* Right column: notes — desktop only */}
                  <div className="hidden sm:flex flex-col gap-2 sm:flex-1 min-w-0">
                    <div className="section-label">Нотатки</div>
                    {selected.notes ? (
                      <div className="flex-1 border rounded p-2 bg-muted/20 whitespace-pre-line text-sm min-h-32">
                        {selected.notes}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Немає нотаток</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground italic text-sm">
            Оберіть контакт
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          message="Видалити контакт? Об'єкти та завдання, що посилаються на нього, збережуть свій поточний вигляд."
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {showCreate && (
        <CreateContactDialog
          onConfirm={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
