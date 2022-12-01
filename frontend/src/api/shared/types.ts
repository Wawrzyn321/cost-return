type DateString = string;

export type PublicEntry = {
  comment: string;
  amount: number;
  created: DateString;
};

export type PublicCollection = {
  name: string;
  startingAmount: number;
  entries: PublicEntry[];
};
