export function formatContactName(name: {
	first?: string;
	middle?: string;
	last?: string;
}): string {
	const parts = [name.first, name.middle, name.last].filter(Boolean);
	return parts.length > 0 ? parts.join(" ") : "Без імені";
}

export function formatDisplayValue(value: unknown): string {
	if (value === null || value === undefined) return "—";
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean"
	)
		return String(value);
	if (typeof value === "object") {
		if ("first" in value || "last" in value) {
			return formatContactName(
				value as { first?: string; middle?: string; last?: string },
			);
		}
		return String(value);
	}
	return "—";
}

export function formatNounNumber(
	num: number | string,
	singular: string,
	plural: string,
): string {
	let str: string;
	if (typeof num === "number") {
		str = Math.trunc(num).toString();
	} else {
		str = num;
	}
	if (str.includes(".")) return plural;
	const lastChar = str[str.length - 1];
	if (lastChar === "1") return singular;
	return plural;
}

function pad(n: number): string {
	return String(n).padStart(2, "0");
}

function hhmm(d: Date): string {
	return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function yyyymmdd(d: Date): string {
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatTimeDigestible(subj: Date, obj: Date): string {
	const diffSeconds = (obj.getTime() - subj.getTime()) / 1000;
	const absDiff = Math.abs(diffSeconds);
	const isPast = diffSeconds > 0;

	const relative = (n: number, singular: string, plural: string): string => {
		const noun = formatNounNumber(n, singular, plural);
		return isPast ? `${n} ${noun} тому` : `лишилось ${n} ${noun}`;
	};

	if (absDiff < 60) {
		return relative(Math.trunc(absDiff), "секунда", "секунд");
	}
	if (absDiff < 3_600) {
		return relative(Math.trunc(absDiff / 60), "хвилина", "хвилин");
	}
	if (absDiff < 12 * 3_600) {
		return relative(Math.trunc(absDiff / 3_600), "година", "годин");
	}
	if (absDiff < 24 * 3_600) {
		return hhmm(subj);
	}
	return `${yyyymmdd(subj)} ${hhmm(subj)}`;
}

export function formatTimeFull(d: Date): string {
	return `${yyyymmdd(d)} ${hhmm(d)}`;
}
