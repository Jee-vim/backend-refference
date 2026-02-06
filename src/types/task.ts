export interface IQueryTask {
  status?: string;
  search?: string;
  limit: number;
  offset: number;
  page: number;
}

export interface ICreateTask {
  title: string;
  status: string;
}
