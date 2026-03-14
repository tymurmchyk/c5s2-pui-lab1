import { useContext, useState } from "react";
import TableList from "./components/TableList";
// import type { type ReactElement } from "react"
// import ListTable from './components/ListTable'
// import { formatContactName } from './utils/formatters'
import { DatabaseContext } from "./database/context";
import { placeholderObjects } from "./placeholders";

export default {
	Objects() {
		const udb = useContext(DatabaseContext);

		const objects = udb?.objects;
		const [selectedObjectId /*, setSelectedObjectId*/] = useState<string>("1");
		const selectedObject = objects?.find((obj) => obj.id === selectedObjectId);

		// const cols = [
		//     { key: 'name' as const, label: 'Назва' },
		//     { key: 'client' as const, label: 'Клієнт' },
		// ]

		// if (!udb) {
		//     return (<div>DatabaseContext isn't available</div>)
		// }

		// const db = udb as DatabaseContextType
		const db = {
			objects: [
				{
					name: "Бойлерна_2026-03-21",
					notes: "Доробити ВК та здати на перевірку.",
				},
				{ name: "Гуртожиток", notes: "Lol" },
			],
		};

		return (
			<div className="flex-1 flex overflow-hidden">
				<TableList
					list={db.objects}
					columns={[
						{
							header: "",
							cell: (rec) => (
								<>
									<strong className="block truncate">{rec.name}</strong>
									<small className="block truncate text-gray-500">
										{rec.notes}
									</small>
								</>
							),
						},
						{ header: "Дедлайн", cell: () => "2026-03-03" },
					]}
				/>
				{/* <ListTable
                    list={objects}
                    columns={cols}
                    selectedId={selectedObjectId}
                    onSelect={setSelectedObjectId}
                /> */}
				<div className="flex-1 p-6 overflow-y-auto">
					{selectedObject && (
						<div className="max-w-4xl">
							<h1 className="text-4xl font-bold text-gray-900 mb-2">
								{selectedObject.name}
							</h1>
							<p className="text-gray-600 mb-6">
								Клієнт: {selectedObject.client}
							</p>
							<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
								<div className="text-gray-500">
									Деталі об'єкту будуть відображатися тут...
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	},

	Contacts() {
		return <div>Nothing here yet</div>;
		// const db = useContext(DatabaseContext)

		// const contacts = db?.contacts
		// const [selectedContactId, setSelectedContactId] = useState<string>('1')
		// const selectedContact = contacts?.find(contact => contact.id === selectedContactId)

		// const columns = [
		//     { key: 'name' as const, label: 'Ім\'я' },
		//     { key: 'kind' as const, label: 'Тип' },
		// ]

		// return (
		//     <div className="flex-1 flex overflow-hidden">
		//         <ListTable
		//             list={contacts}
		//             columns={columns}
		//             selectedId={selectedContactId}
		//             onSelect={setSelectedContactId}
		//         />
		//         <div className="flex-1 p-6 overflow-y-auto">
		//             {selectedContact && (
		//                 <div className="max-w-4xl">
		//                     <h1 className="text-4xl font-bold text-gray-900 mb-2">
		//                         {formatContactName(selectedContact.name)}
		//                     </h1>
		//                     <p className="text-gray-600 mb-6">
		//                         Тип: {selectedContact.kind}
		//                     </p>
		//                     <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
		//                         <div className="text-gray-500">
		//                             Деталі контакту будуть відображатися тут...
		//                         </div>
		//                     </div>
		//                 </div>
		//             )}
		//         </div>
		//     </div>
		// )
	},

	Tasks() {
		return <div>Nothing here yet</div>;
		// const db = useContext(DatabaseContext)
		// const tasks = db?.tasks
		// const [selectedTaskId, setSelectedTaskId] = useState<string>('1')
		// const selectedTask = tasks?.find(t => t.id === selectedTaskId)

		// const columns = [
		//     { key: 'notes' as const, label: 'Нотатки' },
		//     { key: 'linkToObject' as const, label: 'Об\'єкт' },
		// ]

		// return (
		//     <div className="flex-1 flex overflow-hidden">
		//         <ListTable
		//             list={tasks}
		//             columns={columns}
		//             selectedId={selectedTaskId}
		//             onSelect={setSelectedTaskId}
		//         />
		//         <div className="flex-1 p-6 overflow-y-auto">
		//             {selectedTask && (
		//                 <div className="max-w-4xl">
		//                     <h1 className="text-4xl font-bold text-gray-900 mb-2">
		//                         Задача {selectedTask.id}
		//                     </h1>
		//                     <p className="text-gray-600 mb-6">
		//                         Об'єкт: {selectedTask.linkToObject}
		//                     </p>
		//                     <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
		//                         <div className="text-gray-500">
		//                             Деталі задачі будуть відображатися тут...
		//                         </div>
		//                     </div>
		//                 </div>
		//             )}
		//         </div>
		//     </div>
		// )
	},

	About() {
		return (
			<div className="flex-1 p-6 overflow-y-auto">
				<div className="max-w-4xl">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">Про додаток</h1>
					<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
						<p className="text-gray-700 mb-4">
							<span className="italic">Localize&Conquer</span> — це застосунок
							для управління проектами, замовниками та завданнями.
						</p>
						<p className="text-gray-700">
							Детальна інформація про додаток буде додана пізніше.
						</p>
					</div>
				</div>
			</div>
		);
	},

	Login() {
		return (
			<div className="flex-1 p-6 overflow-y-auto">
				<div className="max-w-md mx-auto mt-12">
					<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
						<h1 className="text-3xl font-bold text-gray-900 mb-6">Вхід</h1>

						<form className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									E-mail
								</label>
								<input
									type="email"
									placeholder="example@example.com"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Пароль
								</label>
								<input
									type="password"
									placeholder="••••••••"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<button
								type="submit"
								className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
							>
								Увійти
							</button>
						</form>

						<p className="text-center text-sm text-gray-600 mt-4">
							Немає облікового запису?{" "}
							<a href="/register" className="text-blue-500 hover:underline">
								Зареєструватися
							</a>
						</p>
					</div>
				</div>
			</div>
		);
	},

	Register() {
		return (
			<div className="flex-1 p-6 overflow-y-auto">
				<div className="max-w-md mx-auto mt-8">
					<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
						<h1 className="text-3xl font-bold text-gray-900 mb-6">
							Реєстрація
						</h1>

						<form className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									E-mail
								</label>
								<input
									type="email"
									placeholder="example@example.com"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Ім'я
								</label>
								<input
									type="text"
									placeholder="John Doe"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Пароль
								</label>
								<input
									type="password"
									placeholder="••••••••"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Дата народження
								</label>
								<input
									type="date"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<button
								type="submit"
								className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
							>
								Зареєструватися
							</button>
						</form>

						<p className="text-center text-sm text-gray-600 mt-4">
							Вже маєте обліковий запис?{" "}
							<a href="/login" className="text-blue-500 hover:underline">
								Увійти
							</a>
						</p>
					</div>
				</div>
			</div>
		);
	},
};
