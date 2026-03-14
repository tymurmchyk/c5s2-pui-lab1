import { createContext } from "react";
import type { Contact, Extra, Object } from "./model";
// import { type DatabaseService } from './service'

export interface DatabaseContextType {
	objects: Object[];
	contacts: Contact[];
	tasks: Extra[];
	// dataService: DatabaseService;
}

export const DatabaseContext = createContext<DatabaseContextType | undefined>(
	undefined,
);
