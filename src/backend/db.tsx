import { createContext, useContext, useEffect, useState } from "react";
import type { Contact, EngObject, Extra } from "./model";
import { INITIAL_OBJECTS, INITIAL_CONTACTS, INITIAL_TASKS } from "./data";
import { useAuth } from "./auth";

interface DatabaseContextType {
	objects: EngObject[];
	contacts: Contact[];
	tasks: Extra[];
	addObject(obj: EngObject): void;
	updateObject(id: string, updates: Partial<EngObject>): void;
	removeObject(id: string): void;
	addContact(c: Contact): void;
	updateContact(id: string, updates: Partial<Contact>): void;
	removeContact(id: string): void;
	addTask(t: Extra): void;
	updateTask(id: string, updates: Partial<Extra>): void;
	removeTask(id: string): void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function useDatabase() {
	const ctx = useContext(DatabaseContext);
	if (!ctx) throw new Error("useDatabase must be used within DatabaseProvider");
	return ctx;
}

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
	const { currentUser } = useAuth();
	const [objects, setObjects] = useState<EngObject[]>([]);
	const [contacts, setContacts] = useState<Contact[]>([]);
	const [tasks, setTasks] = useState<Extra[]>([]);

	useEffect(() => {
		if (currentUser?.id === "u1") {
			setObjects(INITIAL_OBJECTS);
			setContacts(INITIAL_CONTACTS);
			setTasks(INITIAL_TASKS);
		} else {
			setObjects([]);
			setContacts([]);
			setTasks([]);
		}
	}, [currentUser?.id]);

	return (
		<DatabaseContext value={{
			objects, contacts, tasks,
			addObject: (obj) => setObjects((prev) => [...prev, obj]),
			updateObject: (id, updates) => setObjects((prev) => prev.map((o) => o.id === id ? { ...o, ...updates } : o)),
			removeObject: (id) => setObjects((prev) => prev.filter((o) => o.id !== id)),
			addContact: (c) => setContacts((prev) => [...prev, c]),
			updateContact: (id, updates) => setContacts((prev) => prev.map((c) => c.id === id ? { ...c, ...updates } : c)),
			removeContact: (id) => setContacts((prev) => prev.filter((c) => c.id !== id)),
			addTask: (t) => setTasks((prev) => [...prev, t]),
			updateTask: (id, updates) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t)),
			removeTask: (id) => setTasks((prev) => prev.filter((t) => t.id !== id)),
		}}>
			{children}
		</DatabaseContext>
	);
}
