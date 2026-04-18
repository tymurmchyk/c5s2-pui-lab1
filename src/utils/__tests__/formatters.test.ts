import {
  formatContactName,
  formatDisplayValue,
  formatNounNumber,
  formatTimeDigestible,
  formatTimeFull,
} from "../formatters";

describe("formatContactName", () => {
  it("returns 'Без імені' for empty object", () => {
    expect(formatContactName({})).toBe("Без імені");
  });

  it("returns first name only", () => {
    expect(formatContactName({ first: "Іван" })).toBe("Іван");
  });

  it("joins all parts", () => {
    expect(
      formatContactName({ first: "Іван", middle: "П.", last: "Сидоренко" })
    ).toBe("Іван П. Сидоренко");
  });

  it("skips undefined parts", () => {
    expect(formatContactName({ first: "Іван", last: "К." })).toBe("Іван К.");
  });
});

describe("formatDisplayValue", () => {
  it("returns dash for null", () => {
    expect(formatDisplayValue(null)).toBe("—");
  });

  it("returns dash for undefined", () => {
    expect(formatDisplayValue(undefined)).toBe("—");
  });

  it("returns string as-is", () => {
    expect(formatDisplayValue("hello")).toBe("hello");
  });

  it("converts number to string", () => {
    expect(formatDisplayValue(42)).toBe("42");
  });

  it("converts boolean to string", () => {
    expect(formatDisplayValue(true)).toBe("true");
  });

  it("delegates object with first/last to formatContactName", () => {
    expect(formatDisplayValue({ first: "Іван", last: "К." })).toBe("Іван К.");
  });

  it("converts other objects to string", () => {
    expect(formatDisplayValue({ foo: "bar" })).toBe("[object Object]");
  });
});

describe("formatNounNumber", () => {
  it("returns singular for 1", () => {
    expect(formatNounNumber(1, "день", "днів")).toBe("день");
  });

  it("returns plural for 2", () => {
    expect(formatNounNumber(2, "день", "днів")).toBe("днів");
  });

  it("returns singular for 21", () => {
    expect(formatNounNumber(21, "день", "днів")).toBe("день");
  });

  it("returns plural for decimal", () => {
    expect(formatNounNumber(1.5, "день", "днів")).toBe("день");
  });

  it("handles string input ending in 1", () => {
    expect(formatNounNumber("11", "день", "днів")).toBe("день");
  });

  it("handles string with decimal point", () => {
    expect(formatNounNumber("1.5", "день", "днів")).toBe("днів");
  });
});

describe("formatTimeDigestible", () => {
  const base = new Date("2026-03-15T12:00:00");

  it("shows seconds for < 60s difference", () => {
    const subj = new Date("2026-03-15T11:59:30");
    expect(formatTimeDigestible(subj, base)).toBe("30 секунд тому");
  });

  it("shows minutes for < 1 hour", () => {
    const subj = new Date("2026-03-15T11:30:00");
    expect(formatTimeDigestible(subj, base)).toBe("30 хвилин тому");
  });

  it("shows hours for < 12 hours", () => {
    const subj = new Date("2026-03-15T09:00:00");
    expect(formatTimeDigestible(subj, base)).toBe("3 годин тому");
  });

  it("shows HH:mm for 12-24 hours", () => {
    const subj = new Date("2026-03-14T18:00:00");
    const result = formatTimeDigestible(subj, base);
    expect(result).toBe("18:00");
  });

  it("shows full date for > 24 hours", () => {
    const subj = new Date("2026-03-10T09:30:00");
    expect(formatTimeDigestible(subj, base)).toBe("2026-03-10 09:30");
  });

  it("shows 'лишилось' for future dates", () => {
    const subj = new Date("2026-03-15T12:05:00");
    expect(formatTimeDigestible(subj, base)).toContain("лишилось");
  });
});

describe("formatTimeFull", () => {
  it("formats date as YYYY-MM-DD HH:mm", () => {
    const d = new Date("2026-03-15T09:05:00");
    expect(formatTimeFull(d)).toBe("2026-03-15 09:05");
  });

  it("pads single digits", () => {
    const d = new Date("2026-01-05T03:07:00");
    expect(formatTimeFull(d)).toBe("2026-01-05 03:07");
  });
});
