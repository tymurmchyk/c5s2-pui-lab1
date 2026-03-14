import type { Contact, Extra, Object } from "./database/model";

// Sample data
export const placeholderObjects: Object[] = [
	// {
	//     id: '1',
	//     name: 'Гуртожиток',
	//     client: 'ТОВ "Будсервіс"',
	//     notes: 'Проект гуртожитку для студентів',
	//     history: [
	//         { descr: 'Початок проекту', evdnc: [{ kind: 'msg', msg: 'Обговорено умови' }] }
	//     ],
	//     links: { directory: '/projects/dormitory' }
	// },
	// {
	//     id: '2',
	//     name: 'Бойлерна Польова 2-А',
	//     client: 'ПП "Конструктор"',
	//     notes: 'Модернізація бойлерної',
	//     history: [],
	//     links: {}
	// },
	// {
	//     id: '3',
	//     name: 'Офісний центр',
	//     client: 'ФОП Коваленко В.В.',
	//     notes: 'Будівництво офісного центру',
	//     history: [],
	//     links: {}
	// },
	// {
	//     id: '4',
	//     name: 'Індустріальний парк',
	//     client: 'МУП "Строй-комплекс"',
	//     notes: 'Розвиток індустріальної зони',
	//     history: [],
	//     links: {}
	// },
	// {
	//     id: '5',
	//     name: 'Розважальний комплекс',
	//     client: 'Петренко Іван Сергійович',
	//     notes: 'Будівництво розважального центру',
	//     history: [],
	//     links: {}
	// },
	// {
	//     id: '6',
	//     name: 'Медичне закладання',
	//     client: 'ТОВ "Будсервіс"',
	//     notes: 'Будівництво лікарні',
	//     history: [],
	//     links: {}
	// },
	// {
	//     id: '7',
	//     name: 'Торгово-розважальний центр',
	//     client: 'ПП "Конструктор"',
	//     notes: 'Великий ТРЦ',
	//     history: [],
	//     links: {}
	// },
	// {
	//     id: '8',
	//     name: 'Житловий комплекс',
	//     client: 'ФОП Коваленко В.В.',
	//     notes: 'Житловий район',
	//     history: [],
	//     links: {}
	// },
];

export const placeholderContacts: Contact[] = [
	// {
	//     id: '1',
	//     kind: 'client',
	//     sync: { origin: 'local', isSynced: false },
	//     name: { first: 'Будсервіс', last: 'ТОВ' },
	//     email: [{ val: 'info@budservis.ua' }],
	//     phone: [{ val: '+38-050-123-4567' }],
	//     notes: 'Основний клієнт'
	// },
	// {
	//     id: '2',
	//     kind: 'subcontractor',
	//     sync: { origin: 'google', isSynced: true },
	//     name: { first: 'Конструктор', last: 'ПП' },
	//     email: [{ val: 'contact@constructor.ua' }],
	//     phone: [{ val: '+38-067-234-5678' }],
	//     notes: 'Підрядник'
	// },
	// {
	//     id: '3',
	//     kind: 'client',
	//     sync: { origin: 'local', isSynced: false },
	//     name: { first: 'Володимир', middle: 'Володимирович', last: 'Коваленко' },
	//     email: [{ val: 'kov@example.com' }],
	//     phone: [{ val: '+38-095-345-6789' }],
	//     notes: 'ФОП клієнт'
	// },
	// {
	//     id: '4',
	//     kind: 'client',
	//     sync: { origin: 'local', isSynced: false },
	//     name: { first: 'Строй-комплекс', last: 'МУП' },
	//     email: [],
	//     phone: [],
	//     notes: 'Муніципальний клієнт'
	// },
	// {
	//     id: '5',
	//     kind: 'client',
	//     sync: { origin: 'google', isSynced: true },
	//     name: { first: 'Іван', middle: 'Сергійович', last: 'Петренко' },
	//     email: [{ val: 'petrenko@example.com' }],
	//     phone: [{ val: '+38-066-456-7890' }],
	//     notes: 'Приватний клієнт'
	// },
];

export const placeholderExtraTasks: Extra[] = [
	// {
	//     id: '1',
	//     notes: 'Узгодити кошторис з клієнтом',
	//     linkToObject: '1'
	// },
	// {
	//     id: '2',
	//     notes: 'Замовити матеріали',
	//     linkToObject: '2'
	// },
	// {
	//     id: '3',
	//     notes: 'Провести інспекцію об\'єкту',
	//     linkToObject: '3'
	// },
	// {
	//     id: '4',
	//     notes: 'Підготувати звіт про прогрес',
	//     linkToObject: '4'
	// },
	// {
	//     id: '5',
	//     notes: 'Узгодити кошторис розслідування',
	//     linkToObject: '5'
	// },
];
