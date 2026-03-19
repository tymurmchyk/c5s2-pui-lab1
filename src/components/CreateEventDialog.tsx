import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export default function CreateEventDialog({ onConfirm, onCancel }: {
	onConfirm: (data: { timestamp: string; note: string }) => void;
	onCancel: () => void;
}) {
	const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));
	const [note, setNote] = useState("");

	return (
		<Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
			<DialogContent className="w-80 rounded-none gap-3">
				<DialogHeader>
					<DialogTitle>Нова подія</DialogTitle>
				</DialogHeader>
				<div>
					<label className="text-xs text-muted-foreground block mb-1">Час</label>
					<Input type="datetime-local" value={timestamp} onChange={e => setTimestamp(e.target.value)} />
				</div>
				<textarea
					className="form-textarea min-h-20"
					placeholder="Опис події *"
					value={note}
					onChange={e => setNote(e.target.value)}
				/>
				<DialogFooter className="gap-2">
					<Button variant="outline" className="rounded-none" onClick={onCancel}>Скасувати</Button>
					<Button className="rounded-none" onClick={() => onConfirm({ timestamp, note })} disabled={!note}>Створити</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
