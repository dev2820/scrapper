export type Scrap = {
  message: string;
  date: Date;
  id: string;
  parent?: Scrap["id"];
};
