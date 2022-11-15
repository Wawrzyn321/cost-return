type DateString = string;

export type Collection = {
  id: string;
  gUserId: string;
  name: string;
  startingAmount: number;
  created: DateString;
  entries: string[];
};

export type CollectionEntry = {
  id: string;
  collectionId: string;
  amount: number;
  comment: string;
  created: DateString;
};

export type AsyncStatus = "none" | "pending" | Error;
