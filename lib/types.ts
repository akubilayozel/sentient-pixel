export type CellId = string; // "row-col" -> "5-12" gibi

export interface CellDoc {
  id: CellId;
  url: string;
  occupiedBy: string;   // uid
  createdAt: any;
}

export interface NoteDoc {
  id?: string;
  username: string;
  text: string;
  uid: string;
  createdAt: any;
}
