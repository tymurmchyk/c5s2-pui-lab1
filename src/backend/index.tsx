import { AuthProvider } from "./auth";
import { DatabaseProvider } from "./db";

export { useAuth } from "./auth";
export { useDatabase } from "./db";
export type { User, EngObject, EngObjectTask, EngObjectEvent, EngObjectPerson, Contact, Extra } from "./model";

export function BackendProvider({ children }: { children: React.ReactNode }) {
	return (
		<AuthProvider>
			<DatabaseProvider>{children}</DatabaseProvider>
		</AuthProvider>
	);
}
