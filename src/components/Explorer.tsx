import type { Object } from "../database/model";

export type ViewType = "objects" | "customers" | "extra-tasks";

interface Props {
	currentView: ViewType;
	objects: Object[];
	customers: Customer[];
	tasks: ExtraTask[];
	selectedObjectId: string;
	setSelectedObjectId: React.Dispatch<React.SetStateAction<string>>;
	selectedCustomerId: string;
	setSelectedCustomerId: React.Dispatch<React.SetStateAction<string>>;
	selectedTaskId: string;
	setSelectedTaskId: React.Dispatch<React.SetStateAction<string>>;
}

export default function Explorer({
	currentView,
	objects,
	customers,
	tasks,
	selectedObjectId,
	setSelectedObjectId,
	selectedCustomerId,
	setSelectedCustomerId,
	selectedTaskId,
	setSelectedTaskId,
}: Props) {
	return (
		<div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
			<div className="p-4 border-b border-gray-200">
				<h2 className="text-lg font-semibold text-gray-900">
					{currentView === "objects" && "Об'єкти"}
					{currentView === "customers" && "Замовники"}
					{currentView === "extra-tasks" && "Додаткові задачі"}
				</h2>
			</div>

			{/* Items List */}
			<div className="flex-1 overflow-y-auto">
				<div className="divide-y divide-gray-200">
					{/* Column Headers */}
					<div className="sticky top-0 bg-gray-100 grid grid-cols-3 gap-2 px-3 py-2 text-xs font-semibold text-gray-700 border-b border-gray-200">
						<div className="col-span-2">Назва</div>
						<div>Інформація</div>
					</div>

					{/* Objects View */}
					{currentView === "objects" &&
						objects.map((obj) => (
							<div
								key={obj.id}
								onClick={() => setSelectedObjectId(obj.id)}
								className={`grid grid-cols-3 gap-2 px-3 py-3 cursor-pointer transition-colors ${
									selectedObjectId === obj.id
										? "bg-blue-50 border-l-4 border-blue-500"
										: "hover:bg-gray-50"
								}`}
							>
								<div className="col-span-2 text-sm font-medium text-gray-900 truncate">
									{obj.name}
								</div>
								<div className="text-xs text-gray-500 truncate">
									{obj.deadline || "—"}
								</div>
							</div>
						))}

					{/* Customers View */}
					{currentView === "customers" &&
						customers.map((cust) => (
							<div
								key={cust.id}
								onClick={() => setSelectedCustomerId(cust.id)}
								className={`grid grid-cols-3 gap-2 px-3 py-3 cursor-pointer transition-colors ${
									selectedCustomerId === cust.id
										? "bg-blue-50 border-l-4 border-blue-500"
										: "hover:bg-gray-50"
								}`}
							>
								<div className="col-span-2 text-sm font-medium text-gray-900 truncate">
									{cust.name}
								</div>
								<div className="text-xs text-gray-500 truncate">
									{cust.phone || "—"}
								</div>
							</div>
						))}

					{/* Extra Tasks View */}
					{currentView === "extra-tasks" &&
						tasks.map((task) => (
							<div
								key={task.id}
								onClick={() => setSelectedTaskId(task.id)}
								className={`grid grid-cols-3 gap-2 px-3 py-3 cursor-pointer transition-colors ${
									selectedTaskId === task.id
										? "bg-blue-50 border-l-4 border-blue-500"
										: "hover:bg-gray-50"
								}`}
							>
								<div className="col-span-2 text-sm font-medium text-gray-900 truncate">
									{task.title}
								</div>
								<div className="text-xs text-gray-500 truncate">
									{task.status || "—"}
								</div>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}
