import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
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
import type { EngObject, EngObjectTask, EngObjectEvent } from "@/backend";

// ---------------------------------------------------------------------------
// Types

type FilterMode = "all" | "completed" | "ongoing";
type SortDir = "asc" | "desc" | "none";

// ---------------------------------------------------------------------------
// Helpers

function parseDateTime(s: string): Date {
	return new Date(s);
}

function parseLocalDate(s: string): Date {
	const [y, m, d] = s.split("-").map(Number);
	return new Date(y, m - 1, d);
}

function timeValue(rec: EngObject): string {
	if (rec.status === "completed") return rec.completedDate ?? "";
	const deadlines = rec.tasks
		.filter((t) => t.status !== "done" && t.deadline)
		.map((t) => t.deadline!);
	return [...deadlines].sort()[0] ?? "";
}

function buildChangeText(old: EngObject, draft: EngObject): string {
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

const STATUS_LABEL: Record<EngObjectTask["status"], string> = {
	pending: "Очікує",
	"in-progress": "В роботі",
	done: "Завершено",
};
const STATUS_CLASS: Record<EngObjectTask["status"], string> = {
	pending: "bg-yellow-100 text-yellow-800",
	"in-progress": "bg-blue-100 text-blue-800",
	done: "bg-green-100 text-green-800",
};

function StatusBadge({ status }: { status: EngObjectTask["status"] }) {
	return (
		<span className={cn("badge", STATUS_CLASS[status])}>
			{STATUS_LABEL[status]}
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
// CreateObjectDialog

function CreateObjectDialog({ onConfirm, onCancel }: {
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
					<DialogTitle>Новий об'єкт</DialogTitle>
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
// CreateTaskDialog

function CreateTaskDialog({ onConfirm, onCancel }: {
	onConfirm: (data: { note: string; deadline: string }) => void;
	onCancel: () => void;
}) {
	const [note, setNote] = useState("");
	const [deadline, setDeadline] = useState("");
	return (
		<Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
			<DialogContent className="w-80 rounded-none gap-3">
				<DialogHeader>
					<DialogTitle>Нова задача</DialogTitle>
				</DialogHeader>
				<textarea
					className="form-textarea min-h-20"
					placeholder="Опис задачі *"
					value={note}
					onChange={e => setNote(e.target.value)}
				/>
				<div>
					<label className="text-xs text-muted-foreground block mb-1">Дедлайн (необов'язково)</label>
					<Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
				</div>
				<DialogFooter className="gap-2">
					<Button variant="outline" className="rounded-none" onClick={onCancel}>Скасувати</Button>
					<Button className="rounded-none" onClick={() => onConfirm({ note, deadline })} disabled={!note}>Створити</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ---------------------------------------------------------------------------
// People sorting: clients → subcontractors → others; within group by name

const GROUP_ORDER: Record<string, number> = { client: 0, subcontractor: 1 };

function sortPeople(people: EngObject["people"], nameMap: Record<string, string>): EngObject["people"] {
	return [...people].sort((a, b) => {
		const ga = GROUP_ORDER[a.kind ?? ""] ?? 2;
		const gb = GROUP_ORDER[b.kind ?? ""] ?? 2;
		if (ga !== gb) return ga - gb;
		return (nameMap[a.contactId] ?? "").localeCompare(nameMap[b.contactId] ?? "");
	});
}

// ---------------------------------------------------------------------------
// Sub-components

function ObjectsList({
	list,
	selectedId,
	onSelect,
	filterLabel,
	cycleFilter,
	sortDir,
	cycleSort,
	now,
}: {
	list: EngObject[];
	selectedId: string | undefined;
	onSelect: (rec: EngObject) => void;
	filterLabel: string;
	cycleFilter: () => void;
	sortDir: SortDir;
	cycleSort: () => void;
	now: Date;
}) {
	const columns: TableListColumnDef<EngObject>[] = [
		{
			header: filterLabel || "Усі",
			onHeaderClick: cycleFilter,
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
			header: (
				<span className="flex items-center gap-1">
					Термін
					{sortDir === "asc" && <ArrowUp className="h-3 w-3" />}
					{sortDir === "desc" && <ArrowDown className="h-3 w-3" />}
					{sortDir === "none" && <ArrowUpDown className="h-3 w-3 opacity-40" />}
				</span>
			),
			onHeaderClick: cycleSort,
			className: "w-32 min-w-24",
			cell: (rec) => {
				const tv = timeValue(rec);
				const formatted = tv
					? formatTimeDigestible(
						tv.includes("T") ? parseDateTime(tv) : parseLocalDate(tv),
						now
					)
					: "—";
				return (
					<span className={cn("text-xs", rec.status === "completed" && "text-muted-foreground")}>
						{formatted}
					</span>
				);
			},
		},
	];

	return (
		<TableList
			list={list}
			resizable="right"
			columns={columns}
			selectedId={selectedId}
			onRecordClick={onSelect}
		/>
	);
}

function EditTaskDialog({ task, history, onConfirm, onCancel }: {
	task: EngObjectTask;
	history: EngObjectEvent[];
	onConfirm: (patch: Partial<EngObjectTask>) => void;
	onCancel: () => void;
}) {
	const [note, setNote] = useState(task.note);
	const [deadline, setDeadline] = useState(task.deadline ?? "");
	const [status, setStatus] = useState(task.status);
	const [eventRefs, setEventRefs] = useState<string[]>([...task.eventRefs]);

	return (
		<Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
			<DialogContent className="w-96 rounded-none gap-3">
				<DialogHeader><DialogTitle>Редагувати задачу</DialogTitle></DialogHeader>
				<textarea
					className="form-textarea min-h-20 w-full"
					value={note}
					onChange={(e) => setNote(e.target.value)}
				/>
				<div>
					<label className="text-xs text-muted-foreground block mb-1">Дедлайн</label>
					<Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
				</div>
				<select
					className="form-select"
					value={status}
					onChange={(e) => setStatus(e.target.value as EngObjectTask["status"])}
				>
					<option value="pending">Очікує</option>
					<option value="in-progress">В роботі</option>
					<option value="done">Завершено</option>
				</select>
				{history.length > 0 && (
					<div>
						<div className="section-label mb-1">Пов&apos;язані події</div>
						{history.map((ev) => (
							<label key={ev.id} className="flex items-center gap-2 text-xs cursor-pointer">
								<input
									type="checkbox"
									checked={eventRefs.includes(ev.id)}
									onChange={(e) =>
										setEventRefs(
											e.target.checked
												? [...eventRefs, ev.id]
												: eventRefs.filter((id) => id !== ev.id)
										)
									}
								/>
								{ev.timestamp} — {ev.note.split("\n")[0]}
							</label>
						))}
					</div>
				)}
				<DialogFooter className="gap-2">
					<Button variant="outline" className="rounded-none" onClick={onCancel}>Скасувати</Button>
					<Button
						className="rounded-none"
						onClick={() => onConfirm({ note, deadline: deadline || undefined, status, eventRefs })}
						disabled={!note}
					>
						Зберегти
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function TasksList({
	tasks,
	selectedTaskId,
	onSelect,
	onEditTask,
	onDeleteTask,
	history,
	now,
}: {
	tasks: EngObjectTask[];
	selectedTaskId: string | undefined;
	onSelect: (task: EngObjectTask) => void;
	onEditTask: (id: string) => void;
	onDeleteTask: (id: string) => void;
	history: EngObjectEvent[];
	now: Date;
}) {
	const [innerPanel, setInnerPanel] = useState<"list" | "detail">("list");

	useEffect(() => {
		if (!selectedTaskId) setInnerPanel("list");
	}, [selectedTaskId]);

	// Incomplete tasks first, then done; within each group reverse insertion order
	const sortedTasks = [...tasks].sort((a, b) => {
		const da = a.status === "done" ? 1 : 0;
		const db = b.status === "done" ? 1 : 0;
		if (da !== db) return da - db;
		return tasks.indexOf(b) - tasks.indexOf(a);
	});

	const selectedTask = tasks.find((t) => t.id === selectedTaskId);
	const linkedEvents = selectedTask
		? history.filter((ev) => ev.taskRefs.includes(selectedTask.id))
		: [];

	const columns: TableListColumnDef<EngObjectTask>[] = [
		{
			header: "Задачі",
			className: "w-52 min-w-36",
			cell: (task) => (
				<div>
					<strong className="block truncate text-xs">
						{task.note.split("\n")[0]}
					</strong>
					<div className="mt-0.5">
						<StatusBadge status={task.status} />
					</div>
				</div>
			),
		},
		{
			header: "Дедлайн",
			className: "w-36 min-w-28",
			cell: (task) => (
				<span className="text-xs">
					{task.deadline ? formatTimeDigestible(parseLocalDate(task.deadline), now) : "—"}
				</span>
			),
		},
	];

	return (
		<div className="flex flex-1 overflow-hidden">
			<TableList
				list={sortedTasks}
				resizable="right"
				columns={columns}
				selectedId={selectedTaskId}
				className={cn(innerPanel === "detail" && "hidden md:flex")}
				onRecordClick={(t) => { onSelect(t); setInnerPanel("detail"); }}
			/>
			<div className={cn(
				"flex-1 overflow-hidden p-3 text-xs flex flex-col gap-2 border-l",
				innerPanel === "list" && "hidden md:flex"
			)}>
				{selectedTask ? (
					<>
						<button
							className="md:hidden flex items-center gap-1 text-muted-foreground hover:text-foreground mb-1"
							onClick={() => setInnerPanel("list")}
						>
							← Назад
						</button>
						<div className="flex items-center gap-2 flex-wrap">
							<strong className="text-sm">{selectedTask.note.split("\n")[0]}</strong>
							<StatusBadge status={selectedTask.status} />
						</div>
						<div className="text-muted-foreground">
							Дедлайн: {selectedTask.deadline ?? "—"}
						</div>
						{selectedTask.note.includes("\n") && (
							<p className="whitespace-pre-line text-muted-foreground">
								{selectedTask.note.split("\n").slice(1).join("\n")}
							</p>
						)}
						{linkedEvents.length > 0 && (
							<div>
								<div className="font-semibold mb-1">Пов&apos;язані події</div>
								{linkedEvents.map((ev) => (
									<div key={ev.id} className="text-muted-foreground">
										{formatTimeFull(parseDateTime(ev.timestamp))} — {ev.note.split("\n")[0]}
									</div>
								))}
							</div>
						)}
						<div className="flex gap-2 mt-auto pt-2">
							<Button size="sm" variant="outline" className="rounded-none"
								onClick={() => onEditTask(selectedTask.id)}>
								Редагувати
							</Button>
							<Button size="sm" variant="destructive" className="rounded-none"
								onClick={() => onDeleteTask(selectedTask.id)}>
								Видалити
							</Button>
						</div>
					</>
				) : (
					<span className="text-muted-foreground italic">Оберіть задачу</span>
				)}
			</div>
		</div>
	);
}

function HistoryList({
	history,
	selectedEventId,
	onSelect,
	onEditEvent,
	onDeleteEvent,
	tasks,
	now,
}: {
	history: EngObjectEvent[];
	selectedEventId: string | undefined;
	onSelect: (ev: EngObjectEvent) => void;
	onEditEvent: (id: string) => void;
	onDeleteEvent: (id: string) => void;
	tasks: EngObjectTask[];
	now: Date;
}) {
	const [innerPanel, setInnerPanel] = useState<"list" | "detail">("list");

	useEffect(() => {
		if (!selectedEventId) setInnerPanel("list");
	}, [selectedEventId]);

	// Newest event first (history array is oldest-first)
	const sortedHistory = [...history].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

	const selectedEvent = history.find((ev) => ev.id === selectedEventId);
	const linkedTasks = selectedEvent
		? tasks.filter((t) => t.eventRefs.includes(selectedEvent.id))
		: [];

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
						{linkedTasks.length > 0 && (
							<div>
								<div className="font-semibold mb-1">Пов&apos;язані задачі</div>
								{linkedTasks.map((t) => (
									<div key={t.id} className="flex items-center gap-1.5">
										<span>{t.note.split("\n")[0]}</span>
										<StatusBadge status={t.status} />
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

export default function EngObjectsView() {
	const { currentUser } = useAuth();
	if (!currentUser) return <Navigate to="/login" replace />;
	const { objects, contacts, updateObject, removeObject, addObject } = useDatabase();
	const navigate = useNavigate();
	const location = useLocation();
	const [selectedId, setSelectedId] = useState<string | undefined>(
		location.state?.selectObjectId
	);
	const [mobilePanel, setMobilePanel] = useState<"list" | "detail">(
		location.state?.selectObjectId ? "detail" : "list"
	);
	const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
	const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
	const [editingTaskId, setEditingTaskId] = useState<string | undefined>();
	const [editingEventId, setEditingEventId] = useState<string | undefined>();
	const [filterMode, setFilterMode] = useState<FilterMode>("all");
	const [sortDir, setSortDir] = useState<SortDir>("none");
	const [isEditing, setIsEditing] = useState(false);
	const [draft, setDraft] = useState<EngObject | null>(null);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [showCreateObject, setShowCreateObject] = useState(false);
	const [showCreateTask, setShowCreateTask] = useState(false);
	const [showCreateEvent, setShowCreateEvent] = useState(false);
	// Add-person picker state
	const [newPersonContactId, setNewPersonContactId] = useState("");
	const [newPersonLabel, setNewPersonLabel] = useState("");
	const [newPersonKind, setNewPersonKind] = useState<"client" | "subcontractor" | "">("");

	const now = useMemo(() => new Date(), []);
	const nameMap = useMemo(
		() => Object.fromEntries(contacts.map((c) => [c.id, formatContactName(c.name)])),
		[contacts]
	);
	const selected = objects.find((o) => o.id === selectedId);

	const cycleFilter = () =>
		setFilterMode((m) =>
			m === "all" ? "completed" : m === "completed" ? "ongoing" : "all"
		);

	const filterLabel =
		filterMode === "all" ? "" : filterMode === "completed" ? "Завершені" : "Поточні";

	const cycleSort = () =>
		setSortDir((d) => (d === "none" ? "asc" : d === "asc" ? "desc" : "none"));

	const filtered = useMemo(
		() =>
			filterMode === "all"
				? objects
				: objects.filter(
					(o) => o.status === (filterMode === "completed" ? "completed" : "ongoing")
				),
		[filterMode, objects]
	);

	const displayList = useMemo(
		() =>
			[...filtered].sort(
				(a, b) => (a.status === "completed" ? 1 : 0) - (b.status === "completed" ? 1 : 0)
			),
		[filtered]
	);

	const sortedList = useMemo(() => {
		if (sortDir === "none") return displayList;
		return [...displayList].sort((a, b) => {
			const ga = a.status === "completed" ? 1 : 0;
			const gb = b.status === "completed" ? 1 : 0;
			if (ga !== gb) return ga - gb;
			const va = timeValue(a), vb = timeValue(b);
			return (sortDir === "asc" ? 1 : -1) * (va < vb ? -1 : va > vb ? 1 : 0);
		});
	}, [displayList, sortDir]);

	const handleSelectObject = (rec: EngObject) => {
		setSelectedId(rec.id);
		setSelectedTaskId(undefined);
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
				updateObject(draft.id, updated);
			}
			setIsEditing(false);
		}
	};

	const handleDelete = () => {
		if (!selected) return;
		removeObject(selected.id);
		setSelectedId(undefined);
		setConfirmDelete(false);
		setIsEditing(false);
		setMobilePanel("list");
	};

	function handleUpdateTask(taskId: string, patch: Partial<EngObjectTask>) {
		if (!selected) return;
		updateObject(selected.id, { tasks: selected.tasks.map((t) => t.id === taskId ? { ...t, ...patch } : t) });
		setEditingTaskId(undefined);
	}

	function handleDeleteTask(taskId: string) {
		if (!selected) return;
		updateObject(selected.id, { tasks: selected.tasks.filter((t) => t.id !== taskId) });
		if (selectedTaskId === taskId) setSelectedTaskId(undefined);
	}

	function handleUpdateEvent(eventId: string, patch: Partial<EngObjectEvent>) {
		if (!selected) return;
		updateObject(selected.id, { history: selected.history.map((e) => e.id === eventId ? { ...e, ...patch } : e) });
		setEditingEventId(undefined);
	}

	function handleDeleteEvent(eventId: string) {
		if (!selected) return;
		updateObject(selected.id, { history: selected.history.filter((e) => e.id !== eventId) });
		if (selectedEventId === eventId) setSelectedEventId(undefined);
	}

	function handleCreateObject(data: { name: string; pay: string; notes: string }) {
		const newObj: EngObject = {
			id: `obj-${Date.now()}`, name: data.name, status: "ongoing",
			people: [], pay: data.pay || undefined, notes: data.notes,
			tasks: [], history: [], links: {},
		};
		addObject(newObj);
		setSelectedId(newObj.id);
		setShowCreateObject(false);
	}

	function handleCreateTask(data: { note: string; deadline: string }) {
		if (!selected) return;
		const newTask: EngObjectTask = {
			id: `t-${Date.now()}`, note: data.note, status: "pending",
			eventRefs: [], ...(data.deadline ? { deadline: data.deadline } : {}),
		};
		updateObject(selected.id, { tasks: [...selected.tasks, newTask] });
		setShowCreateTask(false);
	}

	function handleCreateEvent(data: { timestamp: string; note: string }) {
		if (!selected) return;
		const newEvent: EngObjectEvent = {
			id: `e-${Date.now()}`, timestamp: data.timestamp, note: data.note,
			taskRefs: [], facts: [],
		};
		updateObject(selected.id, { history: [...selected.history, newEvent] });
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

	const sortedPeople = selected ? sortPeople(selected.people, nameMap) : [];
	const draftSortedPeople = draft ? sortPeople(draft.people, nameMap) : [];

	// Contacts not already in draft people
	const availableContacts = draft
		? contacts.filter((c) => !draft.people.some((p) => p.contactId === c.id))
		: contacts;

	return (
		<div className="view-layout">
			<div className={cn("pane-left", mobilePanel === "detail" && "hidden sm:flex")}>
				<div className="list-toolbar">
					<Button size="sm" variant="ghost" className="rounded-none h-7 text-xs"
						onClick={() => setShowCreateObject(true)}>
						+ Новий об'єкт
					</Button>
				</div>
				<ObjectsList
					list={sortedList}
					selectedId={selectedId}
					onSelect={handleSelectObject}
					filterLabel={filterLabel}
					cycleFilter={cycleFilter}
					sortDir={sortDir}
					cycleSort={cycleSort}
					now={now}
				/>
			</div>
			<div className={cn("pane-right", mobilePanel === "list" && "hidden sm:flex")}>
				{selected && (
					<>
						<button
							className="sm:hidden flex items-center gap-1 text-xs text-muted-foreground px-4 pt-2 hover:text-foreground"
							onClick={() => setMobilePanel("list")}
						>
							← Назад
						</button>
						{/* Header */}
						<div className="shrink-0 px-4 py-3 flex flex-col gap-2">
							{/* Title row */}
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
									<ObjStatusBadge status={selected.status} completedDate={selected.completedDate} />
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
											{draftSortedPeople.map((p) => (
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
										{/* Add person row */}
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
										{sortedPeople.map((p) => (
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
										<div className="section-label mb-1">
											Нотатки
										</div>
										<div className="text-sm border rounded p-2 bg-muted/20 whitespace-pre-line">
											{selected.notes}
										</div>
									</div>
								)
							)}
						</div>

						{/* Tasks + History boxes */}
						<div className="flex-1 flex flex-col overflow-hidden gap-2 py-2 px-4">
							<div className="flex-1 flex flex-col overflow-hidden gap-0.5">
								<div className="flex items-center justify-between px-1 shrink-0">
									<span className="section-label">Задачі</span>
									<Button size="sm" variant="ghost" className="rounded-none h-6 text-xs px-2"
										onClick={() => setShowCreateTask(true)}>+ Задача</Button>
								</div>
								<div className="flex-1 flex flex-col overflow-hidden border rounded-md">
									<TasksList
										tasks={selected.tasks}
										selectedTaskId={selectedTaskId}
										onSelect={(t) => setSelectedTaskId(t.id)}
										onEditTask={setEditingTaskId}
										onDeleteTask={handleDeleteTask}
										history={selected.history}
										now={now}
									/>
								</div>
							</div>
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
										tasks={selected.tasks}
										now={now}
									/>
								</div>
							</div>
						</div>
					</>
				)}
			</div>

			{confirmDelete && (
				<ConfirmDialog
					message={`Видалити об'єкт "${selected?.name}"? Цю дію неможливо скасувати.`}
					onConfirm={handleDelete}
					onCancel={() => setConfirmDelete(false)}
				/>
			)}

			{showCreateObject && (
				<CreateObjectDialog
					onConfirm={handleCreateObject}
					onCancel={() => setShowCreateObject(false)}
				/>
			)}

			{showCreateTask && (
				<CreateTaskDialog
					onConfirm={handleCreateTask}
					onCancel={() => setShowCreateTask(false)}
				/>
			)}

			{showCreateEvent && (
				<CreateEventDialog
					onConfirm={handleCreateEvent}
					onCancel={() => setShowCreateEvent(false)}
				/>
			)}

			{editingTaskId && selected && (() => {
				const t = selected.tasks.find((task) => task.id === editingTaskId)!;
				return (
					<EditTaskDialog
						task={t}
						history={selected.history}
						onConfirm={(p) => handleUpdateTask(editingTaskId, p)}
						onCancel={() => setEditingTaskId(undefined)}
					/>
				);
			})()}

			{editingEventId && selected && (() => {
				const ev = selected.history.find((e) => e.id === editingEventId)!;
				return (
					<EditEventDialog
						event={ev}
						tasks={selected.tasks}
						onConfirm={(p) => handleUpdateEvent(editingEventId, p)}
						onCancel={() => setEditingEventId(undefined)}
					/>
				);
			})()}
		</div>
	);
}
