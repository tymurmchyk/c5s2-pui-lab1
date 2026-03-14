import { type ReactElement, useEffect, useRef, useState } from "react";

export default function TableList<T>({
	list,
	columns,
}: {
	list: T[];
	columns: {
		header: string;
		cell: (rec: T) => ReactElement | string;
	}[];
}) {
	const [width, setWidth] = useState(320);
	const isResizing = useRef(false);
	const startX = useRef(0);
	const startWidth = useRef(0);

	useEffect(() => {
		const onMouseMove = (e: MouseEvent) => {
			if (!isResizing.current) return;
			setWidth(Math.max(120, startWidth.current + e.clientX - startX.current));
		};
		const onMouseUp = () => {
			isResizing.current = false;
		};
		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
		return () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		};
	}, []);

	const onHandleMouseDown = (e: React.MouseEvent) => {
		isResizing.current = true;
		startX.current = e.clientX;
		startWidth.current = width;
		e.preventDefault();
	};

	return (
		<div
			style={{ width }}
			className="relative bg-white border-r border-gray-200 overflow-y-scroll flex flex-col shrink-0"
		>
			<table className="w-full border-collapse table-fixed">
				<thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
					<tr className="divide-x divide-dashed divide-gray-200">
						{columns.map((c) => (
							<th
								key={c.header}
								className="px-3 py-2 text-xs font-semibold text-gray-700 text-left border-b border-gray-200"
							>
								{c.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-200">
					{list.map((li, i) => (
						<tr key={i} className="divide-x divide-dashed divide-gray-200">
							{columns.map((c) => (
								<td
									key={c.header}
									className="px-3 py-3 text-sm text-gray-900 truncate"
								>
									{c.cell(li)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex-1 flex divide-x divide-dashed divide-gray-200">
				{columns.map((c) => (
					<div key={c.header} className="flex-1" />
				))}
			</div>
			<button
				type="button"
				aria-label="Resize panel"
				onMouseDown={onHandleMouseDown}
				className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 active:bg-blue-500"
			/>
		</div>
	);
}
