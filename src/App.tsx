import { Navigate, Route, Routes } from "react-router-dom";
import Navigation from "./components/Navigation";
import { DatabaseProvider } from "./database/provider";
import view from "./pages";

export default function App() {
	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			<DatabaseProvider>
				<Navigation />
				<Routes>
					<Route path="/about" element={view.About()} />
					<Route path="/register" element={view.Register()} />
					<Route path="/login" element={view.Login()} />
					<Route path="/objects" element={view.Objects()} />
					<Route path="/contacts" element={view.Contacts()} />
					<Route path="/tasks" element={view.Tasks()} />
					<Route path="/" element={<Navigate to="/about" replace />} />{" "}
					{/* TODO: use /objects when authed, /about otherwise */}
				</Routes>
			</DatabaseProvider>
		</div>
	);
}
