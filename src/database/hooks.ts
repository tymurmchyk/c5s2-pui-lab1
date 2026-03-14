import { useContext } from "react";
import { DatabaseContext } from "./context";

// Custom hook for easier consumption
export const useDatabase = () => {
	const context = useContext(DatabaseContext);
	if (context === undefined) {
		throw new Error("useDatabase must be used within a DatabaseProvider");
	}
	return context;
};
