import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import TableList, { type TableListColumnDef } from "@/components/TableList";
import ConfirmDialog from "@/components/ConfirmDialog";
import CreateEventDialog from "@/components/CreateEventDialog";
import EditEventDialog from "@/components/EditEventDialog";
import { formatContactName, formatTimeDigestible, formatTimeFull } from "@/utils/formatters";
import { useDatabase, useAuth } from "@/backend";
import type { Extra, EngObjectEvent } from "@/backend";

// ---------------------------------------------------------------------------
// Helpers

function parseDateTime(s: string): Date {
	return new Date(s);
}

function buildChangeText(old: Extra, draft: Extra): string {
	const lines: string[] = [];
	if (old.name !== draft.name) lines.push(`Назва: "${old.name}" → "${draft.name}"`);
	if (old.pay !== draft.pay) lines.push(`Оплата: "${old.pay ?? "—"}" → "${draft.pay ?? "—"}"`);
	if (old.notes !== draft.notes) lines.push(`Нотатки змінено`);
	const oldIds = old.people.map((p) => p.contactId);
	const newIds = draft.people.map((p) => p.contactId);
	const added = newIds.filter((id) => !oldIds.includes(id));
	const removed = oldIds.filter((id) => !newIds.includes(id));
	if (added.length) lines.push(`Додано: ${added.join(", ")}`);
	if (removed.length) lines.push(`Видалено: ${removed.join(", ")}`);
	return lines.length ? `[Автоматично] Зміни:\n${lines.join("\n")}` : "";
}

// ---------------------------------------------------------------------------
// Badges

const STATUS_LABEL: Record<Extra["status"], string> = {
	ongoing: "Поточне",
	completed: "Завершено",
};
const STATUS_CLASS: Record<Extra["status"], string> = {
	ongoing: "bg-blue-100 text-blue-800",
	completed: "bg-green-100 text-green-800",
};

function StatusBadge({ status, completedDate }: { status: Extra["status"]; completedDate?: string }) {
	const label =
		status === "completed" && completedDate
			? `Завершено: ${completedDate}`
			: STATUS_LABEL[status];
	return (
		<span className={cn("badge-wide", STATUS_CLASS[status])}>
			{label}
		</span>
	);
}

// ---------------------------------------------------------------------------
// ContactCard

function ContactCard({ name, label, onClick }: { name: string; label: string; onClick?: () => void }) {
	return (
		<div
			className={cn(
				"w-44 flex flex-col px-2 py-1.5 rounded border bg-card",
				onClick && "cursor-pointer hover:bg-accent"
			)}
			onClick={onClick}
		>
			<div className="text-sm font-medium truncate">{name}</div>
			<div className="text-xs text-muted-foreground truncate">{label}</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// CreateExtraDialog

function CreateExtraDialog({ onConfirm, onCancel }: {
	onConfirm: (data: { name: string; pay: string; notes: string }) => void;
	onCancel: () => void;
}) {
	const [name, setName] = useState("");
	const [pay, setPay] = useState("");
	const [notes, setNotes] = useState("");
	return (
		<Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
			<DialogContent className="w-80 rounded-none gap-3">
				<DialogHeader>
					<DialogTitle>Нове завдання</DialogTitle>
				</DialogHeader>
				<Input placeholder="Назва *" value={name} onChange={e => setName(e.target.value)} />
				<Input placeholder="Оплата (необов'язково)" value={pay} onChange={e => setPay(e.target.value)} />
				<textarea
					className="form-textarea min-h-16"
					placeholder="Нотатки (необов'язково)"
					value={notes}
					onChange={e => setNotes(e.target.value)}
				/>
				<DialogFooter className="gap-2">
					<Button variant="outline" className="rounded-none" onClick={onCancel}>Скасувати</Button>
					<Button className="rounded-none" onClick={() => onConfirm({ name, pay, notes })} disabled={!name}>Створити</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ---------------------------------------------------------------------------
// HistoryList

function HistoryList({
	history,
	selectedEventId,
	onSelect,
	onEditEvent,
	onDeleteEvent,
	now,
}: {
	history: EngObjectEvent[];
	selectedEventId: string | undefined;
	onSelect: (ev: EngObjectEvent) => void;
	onEditEvent: (id: string) => void;
	onDeleteEvent: (id: string) => void;
	now: Date;
}) {
	const [innerPanel, setInnerPanel] = useState<"list" | "detail">("list");

	useEffect(() => {
		if (!selectedEventId) setInnerPanel("list");
	}, [selectedEventId]);

	const sortedHistory = [...history].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
	const selectedEvent = history.find((ev) => ev.id === selectedEventId);

	const columns: TableListColumnDef<EngObjectEvent>[] = [
		{
			header: "Подія",
			className: "w-32 min-w-20",
			cell: (ev) => (
				<>
					<span className="block text-xs text-muted-foreground">
						{formatTimeDigestible(parseDateTime(ev.timestamp), now)}
					</span>
					<span className="block truncate text-xs">{ev.note.split("\n")[0]}</span>
				</>
			),
		},
		{
			header: "",
			className: "w-12 min-w-8",
			cell: (ev) => {
				const kinds = new Set(ev.facts.map((f) => f.kind));
				return (
					<span className="text-xs">
						{kinds.has("email") ? "📧" : ""}
						{kinds.has("call") ? "📞" : ""}
						{kinds.has("msg") ? "💬" : ""}
					</span>
				);
			},
		},
	];

	return (
		<div className="flex flex-1 overflow-hidden">
			<TableList
				list={sortedHistory}
				resizable="right"
				columns={columns}
				selectedId={selectedEventId}
				className={cn(innerPanel === "detail" && "hidden md:flex")}
				onRecordClick={(ev) => { onSelect(ev); setInnerPanel("detail"); }}
			/>
			<div className={cn(
				"flex-1 overflow-y-auto p-3 text-xs flex flex-col gap-2 border-l",
				innerPanel === "list" && "hidden md:flex"
			)}>
				{selectedEvent ? (
					<>
						<button
							className="md:hidden flex items-center gap-1 text-muted-foreground hover:text-foreground mb-1"
							onClick={() => setInnerPanel("list")}
						>
							← Назад
						</button>
						<div className="text-muted-foreground">
							{formatTimeFull(parseDateTime(selectedEvent.timestamp))}
						</div>
						<p className="whitespace-pre-line">{selectedEvent.note}</p>
						{selectedEvent.facts.length > 0 && (
							<div className="flex flex-col gap-1">
								{selectedEvent.facts.map((f, i) => (
									<div key={i} className="flex items-center gap-1">
										{f.kind === "email" && <><span>📧</span><span>{f.email}</span></>}
										{f.kind === "call" && <><span>📞</span><span>{f.call}</span></>}
										{f.kind === "msg" && <><span>💬</span><span>{f.msg}</span></>}
									</div>
								))}
							</div>
						)}
						<div className="flex gap-2 mt-auto pt-2">
							{!selectedEvent.isAutoEdit && (
								<Button size="sm" variant="outline" className="rounded-none"
									onClick={() => onEditEvent(selectedEvent.id)}>
									Редагувати
								</Button>
							)}
							<Button size="sm" variant="destructive" className="rounded-none"
								onClick={() => onDeleteEvent(selectedEvent.id)}>
								Видалити
							</Button>
						</div>
					</>
				) : (
					<span className="text-muted-foreground italic">Оберіть подію</span>
				)}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Main view

export default function ExtratasksView() {
	const { currentUser } = useAuth();
	if (!currentUser) return <Navigate to="/login" replace />;
	const { tasks, contacts, updateTask, removeTask, addTask } = useDatabase();
	const navigate = useNavigate();
	const location = useLocation();
	const [selectedId, setSelectedId] = useState<string | undefined>(
		location.state?.selectTaskId
	);
	const [mobilePanel, setMobilePanel] = useState<"list" | "detail">(
		location.state?.selectTaskId ? "detail" : "list"
	);
	const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
	const [editingEventId, setEditingEventId] = useState<string | undefined>();
	const [isEditing, setIsEditing] = useState(false);
	const [draft, setDraft] = useState<Extra | null>(null);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [showCreateExtra, setShowCreateExtra] = useState(false);
	const [showCreateEvent, setShowCreateEvent] = useState(false);
	const [newPersonContactId, setNewPersonContactId] = useState("");
	const [newPersonLabel, setNewPersonLabel] = useState("");
	const [newPersonKind, setNewPersonKind] = useState<"client" | "subcontractor" | "">("");

	const now = useMemo(() => new Date(), []);
	const nameMap = useMemo(
		() => Object.fromEntries(contacts.map((c) => [c.id, formatContactName(c.name)])),
		[contacts]
	);
	const selected = tasks.find((t) => t.id === selectedId);

	const handleSelectTask = (rec: Extra) => {
		setSelectedId(rec.id);
		setSelectedEventId(undefined);
		setIsEditing(false);
		setMobilePanel("detail");
	};

	const handleEditToggle = () => {
		if (!selected) return;
		if (!isEditing) {
			setDraft({ ...selected, people: [...selected.people] });
			setIsEditing(true);
		} else {
			if (draft) {
				const changeText = buildChangeText(selected, draft);
				let updated = { ...draft };
				if (changeText) {
					const history = [...updated.history];
					const last = history.at(-1);
					if (last?.isAutoEdit) {
						history[history.length - 1] = {
							...last,
							note: last.note + "\n" + changeText,
						};
					} else {
						history.push({
							id: `ae-${Date.now()}`,
							timestamp: new Date().toISOString().slice(0, 16),
							note: changeText,
							taskRefs: [],
							facts: [],
							isAutoEdit: true,
						});
					}
					updated = { ...updated, history };
				}
				updateTask(draft.id, updated);
			}
			setIsEditing(false);
		}
	};

	const handleDelete = () => {
		if (!selected) return;
		removeTask(selected.id);
		setSelectedId(undefined);
		setConfirmDelete(false);
		setIsEditing(false);
		setMobilePanel("list");
	};

	function handleUpdateEvent(eventId: string, patch: Partial<EngObjectEvent>) {
		if (!selected) return;
		updateTask(selected.id, { history: selected.history.map((e) => e.id === eventId ? { ...e, ...patch } : e) });
		setEditingEventId(undefined);
	}

	function handleDeleteEvent(eventId: string) {
		if (!selected) return;
		updateTask(selected.id, { history: selected.history.filter((e) => e.id !== eventId) });
		if (selectedEventId === eventId) setSelectedEventId(undefined);
	}

	function handleCreateExtra(data: { name: string; pay: string; notes: string }) {
		const newTask: Extra = {
			id: `x-${Date.now()}`, name: data.name, status: "ongoing",
			people: [], pay: data.pay || undefined, notes: data.notes, history: [],
		};
		addTask(newTask);
		setSelectedId(newTask.id);
		setShowCreateExtra(false);
	}

	function handleCreateEvent(data: { timestamp: string; note: string }) {
		if (!selected) return;
		const newEvent: EngObjectEvent = {
			id: `e-${Date.now()}`, timestamp: data.timestamp, note: data.note,
			taskRefs: [], facts: [],
		};
		updateTask(selected.id, { history: [...selected.history, newEvent] });
		setShowCreateEvent(false);
	}

	const handleAddPerson = () => {
		if (!draft || !newPersonContactId) return;
		const person = {
			contactId: newPersonContactId,
			label: newPersonLabel || nameMap[newPersonContactId] || newPersonContactId,
			...(newPersonKind ? { kind: newPersonKind as "client" | "subcontractor" } : {}),
		};
		setDraft({ ...draft, people: [...draft.people, person] });
		setNewPersonContactId("");
		setNewPersonLabel("");
		setNewPersonKind("");
	};

	const availableContacts = draft
		? contacts.filter((c) => !draft.people.some((p) => p.contactId === c.id))
		: contacts;

	const listColumns: TableListColumnDef<Extra>[] = [
		{
			header: "Завдання",
			className: "w-48 min-w-32",
			cell: (rec) => {
				const latestNote = rec.history.at(-1)?.note.split("\n")[0] ?? "";
				return (
					<div>
						<strong
							className={cn(
								"block truncate text-xs",
								rec.status === "completed" && "line-through text-muted-foreground"
							)}
						>
							{rec.name}
						</strong>
						<small className="block truncate text-xs text-muted-foreground">
							{latestNote}
						</small>
					</div>
				);
			},
		},
		{
			header: "Статус",
			className: "w-32 min-w-24",
			cell: (rec) => <StatusBadge status={rec.status} completedDate={rec.completedDate} />,
		},
	];

	return (
		<div className="view-layout">
			{/* Left pane */}
			<div className={cn("pane-left", mobilePanel === "detail" && "hidden sm:flex")}>
				<div className="list-toolbar">
					<Button size="sm" variant="ghost" className="rounded-none h-7 text-xs"
						onClick={() => setShowCreateExtra(true)}>
						+ Нове завдання
					</Button>
				</div>
				<TableList
					list={tasks}
					resizable="right"
					columns={listColumns}
					selectedId={selectedId}
					onRecordClick={handleSelectTask}
				/>
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
						<div className="shrink-0 px-4 py-3 flex flex-col gap-2">
							<div className="flex items-start justify-between gap-4">
								<div className="flex items-center gap-2 flex-wrap min-w-0">
									{isEditing && draft ? (
										<Input
											className="text-2xl font-bold h-auto py-0.5"
											value={draft.name}
											onChange={(e) => setDraft({ ...draft, name: e.target.value })}
										/>
									) : (
										<h1 className="text-2xl font-bold leading-tight">{selected.name}</h1>
									)}
									<StatusBadge status={selected.status} completedDate={selected.completedDate} />
								</div>
								<div className="flex gap-2 shrink-0 pt-1">
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

							{/* Pay */}
							{isEditing && draft ? (
								<div className="flex items-center gap-2">
									<span className="text-sm font-semibold shrink-0">Оплата:</span>
									<Input
										value={draft.pay ?? ""}
										onChange={(e) => setDraft({ ...draft, pay: e.target.value })}
									/>
								</div>
							) : (
								selected.pay && (
									<div className="text-base font-semibold">Оплата: {selected.pay}</div>
								)
							)}

							{/* People */}
							<div>
								<div className="section-label mb-1.5">
									Залучені контакти
								</div>
								{isEditing && draft ? (
									<div className="flex flex-col gap-2">
										<div className="flex flex-col flex-wrap gap-2" style={{ maxHeight: "9rem" }}>
											{draft.people.map((p) => (
												<div key={p.contactId} className="flex items-center gap-1">
													<ContactCard
														name={nameMap[p.contactId] ?? p.contactId}
														label={p.label}
													/>
													<Button
														size="sm"
														variant="ghost"
														className="rounded-none px-2 h-auto"
														onClick={() =>
															setDraft({
																...draft,
																people: draft.people.filter((pp) => pp.contactId !== p.contactId),
															})
														}
													>
														×
													</Button>
												</div>
											))}
										</div>
										<div className="flex gap-2 flex-wrap items-end">
											<select
												className="form-select"
												value={newPersonContactId}
												onChange={(e) => setNewPersonContactId(e.target.value)}
											>
												<option value="">— контакт —</option>
												{availableContacts.map((c) => (
													<option key={c.id} value={c.id}>
														{formatContactName(c.name)}
													</option>
												))}
											</select>
											<Input
												placeholder="Роль (Замовник…)"
												value={newPersonLabel}
												onChange={(e) => setNewPersonLabel(e.target.value)}
												className="w-36"
											/>
											<select
												className="form-select"
												value={newPersonKind}
												onChange={(e) => setNewPersonKind(e.target.value as "client" | "subcontractor" | "")}
											>
												<option value="">— тип —</option>
												<option value="client">Замовник</option>
												<option value="subcontractor">Субпідрядник</option>
											</select>
											<Button
												size="sm"
												variant="outline"
												className="rounded-none"
												onClick={handleAddPerson}
												disabled={!newPersonContactId}
											>
												Додати
											</Button>
										</div>
									</div>
								) : (
									<div className="flex flex-col flex-wrap gap-2" style={{ maxHeight: "9rem" }}>
										{selected.people.map((p) => (
											<ContactCard
												key={p.contactId}
												name={nameMap[p.contactId] ?? p.contactId}
												label={p.label}
												onClick={
													contacts.find((c) => c.id === p.contactId)
														? () => navigate("/contacts", { state: { selectContactId: p.contactId } })
														: undefined
												}
											/>
										))}
									</div>
								)}
							</div>

							{/* Notes */}
							{isEditing && draft ? (
								<div>
									<div className="section-label mb-1">Нотатки</div>
									<textarea
										className="notes-textarea"
										value={draft.notes}
										onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
									/>
								</div>
							) : (
								selected.notes && (
									<div>
										<div className="section-label mb-1">Нотатки</div>
										<div className="text-sm border rounded p-2 bg-muted/20 whitespace-pre-line">
											{selected.notes}
										</div>
									</div>
								)
							)}
						</div>

						{/* History */}
						<div className="flex-1 flex flex-col overflow-hidden gap-2 py-2 px-4">
							<div className="flex-1 flex flex-col overflow-hidden gap-0.5">
								<div className="flex items-center justify-between px-1 shrink-0">
									<span className="section-label">Події</span>
									<Button size="sm" variant="ghost" className="rounded-none h-6 text-xs px-2"
										onClick={() => setShowCreateEvent(true)}>+ Подія</Button>
								</div>
								<div className="flex-1 flex flex-col overflow-hidden border rounded-md">
									<HistoryList
										history={selected.history}
										selectedEventId={selectedEventId}
										onSelect={(ev) => setSelectedEventId(ev.id)}
										onEditEvent={setEditingEventId}
										onDeleteEvent={handleDeleteEvent}
										now={now}
									/>
								</div>
							</div>
						</div>
					</>
				) : (
					<div className="flex-1 flex items-center justify-center text-muted-foreground italic text-sm">
						Оберіть завдання
					</div>
				)}
			</div>

			{confirmDelete && (
				<ConfirmDialog
					message={`Видалити завдання "${selected?.name}"? Цю дію неможливо скасувати.`}
					onConfirm={handleDelete}
					onCancel={() => setConfirmDelete(false)}
				/>
			)}

			{showCreateExtra && (
				<CreateExtraDialog
					onConfirm={handleCreateExtra}
					onCancel={() => setShowCreateExtra(false)}
				/>
			)}

			{showCreateEvent && (
				<CreateEventDialog
					onConfirm={handleCreateEvent}
					onCancel={() => setShowCreateEvent(false)}
				/>
			)}

			{editingEventId && selected && (() => {
				const ev = selected.history.find((e) => e.id === editingEventId)!;
				return (
					<EditEventDialog
						event={ev}
						onConfirm={(p) => handleUpdateEvent(editingEventId, p)}
						onCancel={() => setEditingEventId(undefined)}
					/>
				);
			})()}
		</div>
	);
}
