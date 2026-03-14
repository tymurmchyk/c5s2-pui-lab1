export interface Event {
	descr: string;
	evdnc: Fact[];
}
export type Fact =
	| { kind: "email"; email: string }
	| { kind: "call"; call: string }
	| { kind: "msg"; msg: string };

// == TABLE RECORDS ==

type ObjectId = string;
type ExtraId = string;
type ContactId = string;

export interface Object {
	id: ObjectId;
	name: string;
	client: string;
	notes: string;
	history: Event[];
	links: {
		directory?: string;
	};
}

export interface Extra {
	id: ExtraId;
	notes: string;
	linkToObject?: string; // references Object.id
}

export interface Contact {
	id: ContactId;
	kind?: "client" | "subcontractor";
	sync: {
		origin: "local" | "google";
		isSynced: boolean;
	};
	name: {
		first?: string;
		middle?: string;
		last?: string;
	};
	email: {
		lbl?: string;
		val: string;
	}[];
	phone: {
		lbl?: string;
		val: string;
	}[];
	notes: string;
}
