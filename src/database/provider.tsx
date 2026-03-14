// import type { Object, Contact, Extra } from './model'
import { DatabaseContext } from "./context";
// import { useReducer } from 'react';

// interface DatabaseRequestHeader {
//     type: "create" | "read" | "update" | "delete"
//     table: "objects" | "extratasks" | "contacts"
// }

// Handlers for different database requests.
// These aren't actually doing any intercomm with the DB and are simply placeholders.

// function createContact({ }: Contact) {

// }

// function databaseReducer(db: DatabaseContextType, req: DatabaseRequestType) {
//     switch (req.type) {
//         case "create":
//             return {
//             }
//     }
// }

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
	// const [db, request] = useReducer(databaseReducer, {
	//     objects: [],
	//     contacts: [],
	//     tasks: []
	// } as DatabaseContextType)

	// const [objects, setObjects] = useState<Object[]>(initialData?.objects || []);
	// const [contacts, setContacts] = useState<Contact[]>(initialData?.contacts || []);
	// const [tasks, setTasks] = useState<Extra[]>(initialData?.tasks || []);

	// // The actual update logic that interacts with the service and then updates local state
	// const updateObject = async (id: string, updates: Partial<Object>) => {
	//     const updated = await rawDataService.objects.update(id, updates);
	//     if (updated) {
	//         setObjects(prev => prev.map(obj => obj.id === id ? { ...obj, ...updates } : obj));
	//     }
	// };

	// const updateContact = async (id: string, updates: Partial<Contact>) => {
	//     const updated = await rawDataService.contacts.update(id, updates);
	//     if (updated) {
	//         setContacts(prev => prev.map(contact => contact.id === id ? { ...contact, ...updates } : contact));
	//     }
	// };

	// const updateTask = async (id: string, updates: Partial<Extra>) => {
	//     const updated = await rawDataService.tasks.update(id, updates);
	//     if (updated) {
	//         setTasks(prev => prev.map(task => task.id === id ? { ...task, ...updates } : task));
	//     }
	// };

	// // Memoize the context value to prevent unnecessary re-renders
	// const contextValue = useMemo(() => ({
	//     objects,
	//     contacts,
	//     tasks,
	//     dataService: { // Wrap the service methods to also update local state
	//         objects: {
	//             update: updateObject,
	//             // Add other wrapped operations here, e.g., create: async (newObj) => { const created = await rawDataService.objects.create(newObj); setObjects(prev => [...prev, created]); return created; }
	//         },
	//         contacts: {
	//             update: updateContact,
	//         },
	//         tasks: {
	//             update: updateTask,
	//         },
	//     },
	// }), [objects, contacts, tasks, rawDataService]); // rawDataService is a dependency because its methods are used in the wrapped functions

	return (
		<DatabaseContext value={undefined /*contextValue*/}>
			{children}
		</DatabaseContext>
	);
}
