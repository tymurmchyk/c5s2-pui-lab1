import { type ReactElement, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export interface TableListColumnDef<T> {
	header: ReactElement | string;
	onHeaderClick?: () => void;
	cell: (rec: T) => ReactElement | string;
	className?: string;
}

function parseTwWidth(className?: string): number {
	const m = className?.match(/\bw-(\d+)\b/);
	return m ? parseInt(m[1]) * 4 : 120;
}

function parseTwMinWidth(className?: string): number {
	const m = className?.match(/\bmin-w-(\d+)\b/);
	return m ? parseInt(m[1]) * 4 : 60;
}

function withoutW(className?: string): string | undefined {
	return className?.replace(/\bw-\d+\b\s*/g, "").trim() || undefined;
}

export default function TableList<T extends { id?: string }>({
	list,
	rowClassName,
	onRecordClick,
	columns,
	resizable,
	selectedId,
	className,
}: {
	list: T[];
	rowClassName?: (rec: T) => string;
	onRecordClick?: (rec: T) => void;
	columns: TableListColumnDef<T>[];
	resizable?: "right" | "left";
	selectedId?: string;
	className?: string;
}) {
	const [widths, setWidths] = useState<number[]>(() =>
		columns.map((col) => parseTwWidth(col.className))
	);

	const draggingCol = useRef<number | null>(null);
	const startX = useRef(0);
	const startColW = useRef(0);

	useEffect(() => {
		if (!resizable) return;

		const onMouseMove = (e: MouseEvent) => {
			if (draggingCol.current === null) return;
			const delta = e.clientX - startX.current;
			const minW = parseTwMinWidth(columns[draggingCol.current].className);
			const next = Math.max(minW, startColW.current + delta);
			setWidths((prev) => prev.map((w, i) => (i === draggingCol.current ? next : w)));
		};

		const onMouseUp = () => { draggingCol.current = null; };

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
		return () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		};
	}, [resizable, columns]);

	const startResize = (colIndex: number, e: React.MouseEvent) => {
		draggingCol.current = colIndex;
		startX.current = e.clientX;
		startColW.current = widths[colIndex];
		e.preventDefault();
		e.stopPropagation();
	};

	const totalWidth = widths.reduce((s, w) => s + w, 0);

	// Right edge of each column — handle sits exactly on the column boundary
	const handlePositions = widths.map((_, i) =>
		widths.slice(0, i + 1).reduce((s, w) => s + w, 0)
	);

	// Shared colgroup so both the header table and body table have identical column widths.
	const colgroup = (
		<colgroup>
			{widths.map((w, i) => <col key={i} style={{ width: w }} />)}
		</colgroup>
	);

	return (
		<div className={cn("flex flex-col min-h-0 shrink-0 relative", className)}>
			{/* Header — lives outside the scroll container so the separator is a plain sibling div */}
			<Table
				className="table-fixed caption-bottom text-sm shrink-0"
				style={{ width: totalWidth }}
			>
				{colgroup}
				<TableHeader className="bg-muted/80 backdrop-blur-sm">
					<TableRow className="hover:bg-transparent border-b-0">
						{columns.map((col, i) => (
							<TableHead
								key={i}
								className={cn(withoutW(col.className), col.onHeaderClick && "cursor-pointer select-none")}
								onClick={col.onHeaderClick}
							>
								{col.header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
			</Table>

			{/* Separator — a plain div, always full-width, always visible */}
			<div className="h-px bg-border shrink-0" />

			{/* Body — scrollable */}
			<div className="flex-1 flex flex-col min-h-0 overflow-hidden">
				<Table
					className="table-fixed caption-bottom text-sm"
					style={{ width: totalWidth }}
				>
					{colgroup}
					<TableBody>
						{list.map((rec, i) => (
							<TableRow
								key={rec.id ?? i}
								className={cn(
									"cursor-pointer",
									rec.id === selectedId && "bg-accent",
									rowClassName?.(rec)
								)}
								onClick={() => onRecordClick?.(rec)}
							>
								{columns.map((col, j) => (
									<TableCell key={j} className={withoutW(col.className)}>
										{col.cell(rec)}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
				<div className="flex-1 bg-muted/20" />
			</div>

			{/* Full-height column dividers / resize handles */}
			{resizable && handlePositions.map((pos, i) => {
				const isLast = i === handlePositions.length - 1;
				return (
					<span
						key={i}
						onMouseDown={(e) => startResize(i, e)}
						style={{ [resizable === "right" ? "left" : "right"]: pos - 2 }}
						className="absolute top-0 bottom-0 w-[5px] cursor-col-resize z-20 select-none flex items-stretch justify-center group"
					>
						<span className={cn(
							"w-0 flex-none transition-colors duration-100",
							isLast
								? "border-l-0 group-hover:border-l group-hover:border-solid group-hover:border-blue-400"
								: "border-l border-dashed border-gray-300 group-hover:border-solid group-hover:border-blue-400",
						)} />
					</span>
				);
			})}
		</div>
	);
}
