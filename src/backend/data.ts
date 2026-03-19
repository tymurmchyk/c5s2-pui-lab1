import type { Contact, EngObject, Extra } from "./model";
import type { User } from "./model";

export const INITIAL_OBJECTS: EngObject[] = [
	{
		id: "1",
		name: "Бойлерна вул. Карпенка",
		status: "ongoing",
		people: [
			{ kind: "client", label: "Замовник", contactId: "c1" },
			{ kind: "subcontractor", label: "Субпідрядник", contactId: "c3" },
		],
		pay: "85 000 грн",
		notes: "ВК, електрика\n4 поверхи + цоколь\nТермін здачі — квітень 2026",
		tasks: [
			{
				id: "t1",
				note: "Розрахувати параметри котла\nПеревірити потужність відповідно до ТЗ",
				status: "in-progress",
				deadline: "2026-03-28",
				eventRefs: ["e1", "e2"],
			},
			{
				id: "t2",
				note: "Погодити схему з замовником",
				status: "pending",
				deadline: "2026-04-05",
				eventRefs: [],
			},
		],
		history: [
			{
				id: "e1",
				timestamp: "2026-02-15T10:30",
				note: "Отримано ТЗ від замовника\nДоданий кресленик планування 1-го поверху",
				taskRefs: ["t1"],
				facts: [{ kind: "email", email: "kotl@example.com" }],
			},
			{
				id: "e2",
				timestamp: "2026-03-01T14:00",
				note: "Повернули ОВ на виправлення\nПотрібно уточнити перетин труб у підвалі",
				taskRefs: ["t1"],
				facts: [{ kind: "call", call: "+380501234567" }],
			},
		],
		links: {},
	},
	{
		id: "2",
		name: "Реконструкція пр. Перемоги",
		status: "ongoing",
		people: [
			{ kind: "client", label: "Замовник", contactId: "c2" },
		],
		pay: "договірна",
		notes: "Перепланування 3-го поверху офісного центру",
		tasks: [
			{
				id: "t3",
				note: "Проект вентиляції\nРозробити схему приточно-витяжної вентиляції",
				status: "pending",
				deadline: "2026-04-20",
				eventRefs: ["e3"],
			},
		],
		history: [
			{
				id: "e3",
				timestamp: "2026-02-20T09:00",
				note: "Перший огляд об'єкту\nОбговорено обсяг робіт з замовником",
				taskRefs: ["t3"],
				facts: [{ kind: "msg", msg: "Telegram" }],
			},
			{
				id: "e4",
				timestamp: "2026-03-05T11:30",
				note: "Погоджено технічне завдання\nЗамовник надав доступ до документації",
				taskRefs: ["t3"],
				facts: [],
			},
		],
		links: {},
	},
	{
		id: "3",
		name: "Гуртожиток КПІ 2025",
		status: "ongoing",
		people: [
			{ kind: "client", label: "Замовник", contactId: "c1" },
			{ kind: "subcontractor", label: "Субпідрядник", contactId: "c4" },
		],
		pay: "120 000 грн",
		notes: "ВК, електрика\n8 поверхів, 160 кімнат\nПроект виконується в 2 черги",
		tasks: [
			{
				id: "t4",
				note: "Здати розділ ОВ\nВиправити зауваження перевірки по 3-му поверху",
				status: "in-progress",
				deadline: "2026-03-21",
				eventRefs: ["e5", "e6"],
			},
			{
				id: "t5",
				note: "Розробити схему ВК",
				status: "pending",
				deadline: "2026-04-15",
				eventRefs: [],
			},
		],
		history: [
			{
				id: "e5",
				timestamp: "2026-02-24T09:00",
				note: "Здано попередній варіант ОВ\nОчікуємо зауваження від перевірки",
				taskRefs: ["t4"],
				facts: [],
			},
			{
				id: "e6",
				timestamp: "2026-03-01T16:00",
				note: "Повернули ОВ на виправлення\nПотрібно виправити схему на 3-му поверсі",
				taskRefs: ["t4"],
				facts: [{ kind: "email", email: "kpi@example.com" }],
			},
		],
		links: {},
	},
	{
		id: "4",
		name: "ЖК Гливки",
		status: "completed",
		completedDate: "2026-01-13",
		people: [
			{ kind: "client", label: "Замовник", contactId: "c2" },
		],
		pay: "95 000 грн",
		notes: "Житловий комплекс, 5 секцій\nПроект повністю зданий та прийнятий",
		tasks: [
			{
				id: "t6",
				note: "Фінальний звіт\nПідготувати повний пакет документації для здачі",
				status: "done",
				deadline: "2026-01-10",
				eventRefs: ["e7"],
			},
		],
		history: [
			{
				id: "e7",
				timestamp: "2026-01-10T12:00",
				note: "Здано фінальний пакет документів\nПроект прийнято без зауважень",
				taskRefs: ["t6"],
				facts: [{ kind: "email", email: "glyv@example.com" }],
			},
			{
				id: "e8",
				timestamp: "2026-01-13T10:00",
				note: "Підписано акт прийомки\nОплату отримано в повному обсязі",
				taskRefs: ["t6"],
				facts: [{ kind: "call", call: "+380671234567" }],
			},
		],
		links: {},
	},
];

export const INITIAL_CONTACTS: Contact[] = [
	{
		id: "c1",
		kind: "client",
		sync: { origin: "local", isSynced: false },
		name: { first: "Котляревський", middle: "К.", last: "А." },
		email: [{ lbl: "Основний", val: "kotl@example.com" }],
		phone: [{ lbl: "Мобільний", val: "+380501234567" }],
		notes: "Замовник об'єктів Бойлерна та Гуртожиток КПІ",
	},
	{
		id: "c2",
		kind: "client",
		sync: { origin: "local", isSynced: false },
		name: { first: "Марченко", middle: "І.", last: "В." },
		email: [{ lbl: "Основний", val: "march@example.com" }],
		phone: [{ lbl: "Мобільний", val: "+380671234567" }],
		notes: "Замовник об'єктів Реконструкція та ЖК Гливки",
	},
	{
		id: "c3",
		kind: "subcontractor",
		sync: { origin: "local", isSynced: false },
		name: { first: "Петренко", middle: "О.", last: "М." },
		email: [],
		phone: [{ lbl: "Мобільний", val: "+380931234567" }],
		notes: "Субпідрядник на об'єкті Бойлерна",
	},
	{
		id: "c4",
		kind: "subcontractor",
		sync: { origin: "local", isSynced: false },
		name: { first: "Сидоренко", middle: "В.", last: "І." },
		email: [{ lbl: "Робочий", val: "syd@example.com" }],
		phone: [],
		notes: "Субпідрядник на об'єкті Гуртожиток КПІ",
	},
];

export const INITIAL_TASKS: Extra[] = [
	{
		id: "x1",
		name: "Кошторис для котельні",
		status: "ongoing",
		people: [{ kind: "client", label: "Замовник", contactId: "c1" }],
		pay: "15 000 грн",
		notes: "Скласти детальний кошторис матеріалів та робіт для об'єкту Бойлерна",
		history: [
			{
				id: "xe1",
				timestamp: "2026-02-20T09:00",
				note: "Розпочато збір даних\nОтримано ТЗ від замовника",
				taskRefs: [], facts: [{ kind: "email", email: "kotl@example.com" }],
			},
		],
		linkToObject: "1",
	},
	{
		id: "x2",
		name: "Технічна документація КПІ",
		status: "ongoing",
		people: [
			{ kind: "client", label: "Відповідальний", contactId: "c2" },
			{ kind: "subcontractor", label: "Виконавець", contactId: "c4" },
		],
		notes: "Підготовка пакету технічної документації для здачі",
		history: [
			{
				id: "xe2",
				timestamp: "2026-03-10T14:30",
				note: "Зустріч з виконавцем\nУзгоджено обсяг та терміни",
				taskRefs: [], facts: [{ kind: "msg", msg: "Telegram" }],
			},
			{
				id: "xe3",
				timestamp: "2026-03-15T10:00",
				note: "Перший варіант документації готовий\nВідправлено на перевірку",
				taskRefs: [], facts: [],
			},
		],
	},
	{
		id: "x3",
		name: "Консультація щодо ЖК Гливки",
		status: "completed",
		completedDate: "2026-02-01",
		people: [{ kind: "client", label: "Замовник", contactId: "c2" }],
		notes: "Консультація по завершеному проекту",
		history: [
			{
				id: "xe4",
				timestamp: "2026-01-25T11:00",
				note: "Консультація проведена\nВсі питання вирішено",
				taskRefs: [], facts: [{ kind: "call", call: "+380671234567" }],
			},
		],
		linkToObject: "4",
	},
];

export const DEMO_USER: User = {
	id: "u1",
	email: "demo@example.com",
	passwordHash: "demo",
	name: { first: "Демо", last: "Користувач" },
	gender: "unknown",
	birthDate: "1990-01-01",
};
