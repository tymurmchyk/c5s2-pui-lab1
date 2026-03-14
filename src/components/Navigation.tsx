import { NavLink } from "react-router-dom";

export default function Navigation() {
	return (
		<nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
			<div className="max-w-7xl mx-auto">
				{/* <h1 className="text-2xl font-bold text-gray-900 mb-4">Work Database</h1> */}
				<div className="flex gap-2 items-center justify-between flex-wrap">
					{/* Left side: main navigation */}
					<div className="flex gap-2">
						<NavLink
							to="/contacts"
							className={({ isActive }) =>
								`px-4 py-2 rounded transition-colors text-sm ${
									isActive
										? "bg-blue-500 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`
							}
						>
							Контакти
						</NavLink>

						<NavLink
							to="/objects"
							className={({ isActive }) =>
								`px-4 py-2 rounded transition-colors text-sm ${
									isActive
										? "bg-blue-500 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`
							}
						>
							Об'єкти
						</NavLink>

						<NavLink
							to="/tasks"
							className={({ isActive }) =>
								`px-4 py-2 rounded transition-colors text-sm ${
									isActive
										? "bg-blue-500 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`
							}
							title="Додаткові задачі"
						>
							Дод. задачі
						</NavLink>
					</div>

					{/* Right side: about and auth */}
					<div className="flex gap-2">
						<NavLink
							to="/about"
							className={({ isActive }) =>
								`px-4 py-2 rounded transition-colors text-sm ${
									isActive
										? "bg-blue-500 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`
							}
						>
							Про додаток
						</NavLink>

						<NavLink
							to="/login"
							className={({ isActive }) =>
								`px-4 py-2 rounded transition-colors text-sm ${
									isActive
										? "bg-blue-500 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`
							}
						>
							Вхід
						</NavLink>

						<NavLink
							to="/register"
							className={({ isActive }) =>
								`px-4 py-2 rounded transition-colors text-sm ${
									isActive
										? "bg-blue-500 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`
							}
						>
							Реєстрація
						</NavLink>
					</div>
				</div>
			</div>
		</nav>
	);
}
