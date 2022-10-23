export type Collection = {
  id: string;
  gUserId: string;
  name: string;
  startingAmount: number;
  startDate: Date;
  created: Date;
};

export type CollectionEntries = {
  id: string;
  collectionId: string;
  amount: number;
  comment: string;
  created: Date;
};
