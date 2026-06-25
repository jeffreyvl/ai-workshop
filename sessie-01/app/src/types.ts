// Datamodel voor de stem-app.

export type Answer = {
  id: string;
  text: string;
  votes: number;
};

export type Question = {
  id: string;
  title: string;
  answers: Answer[];
  createdAt: number;
};
