import type { Object } from "../database/model";
import type { ViewType } from "./Explorer";

interface Props {
	currentView: ViewType;
	selectedObject?: Object;
	selectedCustomer?: Customer;
	selectedTask?: ExtraTask;
}

export default function Details({
	currentView,
	selectedObject,
	selectedCustomer,
	selectedTask,
}: Props) {
	return (
		<div className="flex-1 p-6 overflow-y-auto">
			{/* Objects Details */}
			{currentView === "objects" && selectedObject && (
				<div className="max-w-4xl">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">
						{selectedObject.name}
					</h1>
					<p className="text-gray-600 mb-6">
						{selectedObject.deadline
							? `Дедлайн: ${selectedObject.deadline}`
							: "Дедлайн не встановлений"}
					</p>

					<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
						<div className="text-gray-500">
							Деталі об'єкту будуть відображатися тут...
						</div>
					</div>
				</div>
			)}

			{/* Customers Details */}
			{currentView === "customers" && selectedCustomer && (
				<div className="max-w-4xl">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">
						{selectedCustomer.name}
					</h1>
					<p className="text-gray-600 mb-6">
						{selectedCustomer.phone || "Телефон не вказано"}
					</p>

					<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
						<div className="text-gray-500">
							Деталі замовника будуть відображатися тут...
						</div>
					</div>
				</div>
			)}

			{/* Extra Tasks Details */}
			{currentView === "extra-tasks" && selectedTask && (
				<div className="max-w-4xl">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">
						{selectedTask.title}
					</h1>
					<p className="text-gray-600 mb-6">
						Статус: {selectedTask.status || "Не встановлений"}
					</p>

					<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
						<div className="text-gray-500">
							Деталі задачі будуть відображатися тут...
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
