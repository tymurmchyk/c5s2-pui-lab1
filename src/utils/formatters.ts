// Format a contact name object as a string
export function formatContactName(name: {
	first?: string;
	middle?: string;
	last?: string;
}): string {
	const parts = [name.first, name.middle, name.last].filter(Boolean);
	return parts.length > 0 ? parts.join(" ") : "Без імені";
}

// Format a value for display (handles objects, arrays, primitives)
export function formatDisplayValue(value: unknown): string {
	if (value === null || value === undefined) return "—";
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean"
	)
		return String(value);
	if (typeof value === "object") {
		// Handle contact name object
		if ("first" in value || "last" in value) {
			return formatContactName(
				value as { first?: string; middle?: string; last?: string },
			);
		}
		// Handle other objects by converting to string
		return String(value);
	}
	return "—";
}
