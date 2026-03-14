import { formatDisplayValue } from "../utils/formatters";

interface Column<T> {
	key: keyof T;
	label: string;
}

interface ListTableProps<T> {
	list: T[];
	columns: Column<T>[];
	selectedId: string;
	onSelect: (id: string) => void;
}

export default function ListTable<T extends { id: string }>({
	list,
	columns,
	selectedId,
	onSelect,
}: ListTableProps<T>) {
	return (
		<div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
			<table className="w-full border-collapse overflow-y-auto">
				<thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
					<tr>
						{columns.map((col) => (
							<th
								key={String(col.key)}
								className="px-3 py-2 text-xs font-semibold text-gray-700 text-left border-b border-gray-200"
							>
								{col.label}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-200 overflow-y-auto">
					{list.map((row) => (
						<tr
							key={row.id}
							onClick={() => onSelect(row.id)}
							className={`cursor-pointer transition-colors ${
								selectedId === row.id
									? "bg-blue-50 border-l-4 border-l-blue-500"
									: "hover:bg-gray-50"
							}`}
						>
							{columns.map((col) => (
								<td
									key={String(col.key)}
									className="px-3 py-3 text-sm text-gray-900 truncate"
								>
									{formatDisplayValue(row[col.key])}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
