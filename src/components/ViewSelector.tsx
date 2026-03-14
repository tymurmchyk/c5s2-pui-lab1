import type React from "react";

type ViewType = "objects" | "customers" | "extra-tasks";

interface Props {
	currentView: ViewType;
	setCurrentView: React.Dispatch<React.SetStateAction<ViewType>>;
}

export default function ViewSelector({ currentView, setCurrentView }: Props) {
	return (
		<div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
			<div className="max-w-7xl mx-auto">
				<h1 className="text-2xl font-bold text-gray-900 mb-4">Work Database</h1>
				<div className="flex gap-2">
					<button
						onClick={() => setCurrentView("customers")}
						className={`px-4 py-2 rounded transition-colors ${
							currentView === "customers"
								? "bg-blue-500 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						Замовники
					</button>
					<button
						onClick={() => setCurrentView("objects")}
						className={`px-4 py-2 rounded transition-colors ${
							currentView === "objects"
								? "bg-blue-500 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						Об'єкти
					</button>
					<button
						onClick={() => setCurrentView("extra-tasks")}
						className={`px-4 py-2 rounded transition-colors text-sm ${
							currentView === "extra-tasks"
								? "bg-blue-500 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
						title="Додаткові задачі"
					>
						Дод. задачі
					</button>
				</div>
			</div>
		</div>
	);
}
