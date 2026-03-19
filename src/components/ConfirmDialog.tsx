import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
} from "@/components/ui/dialog";

export default function ConfirmDialog({ message, onConfirm, onCancel }: {
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	return (
		<Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
			<DialogContent className="max-w-sm rounded-none gap-6">
				<p className="text-sm">{message}</p>
				<DialogFooter className="gap-2">
					<Button variant="outline" className="rounded-none" onClick={onCancel}>Скасувати</Button>
					<Button variant="destructive" className="rounded-none" onClick={onConfirm}>Видалити</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
