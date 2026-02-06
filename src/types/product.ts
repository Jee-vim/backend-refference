export interface ICreateProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface IQueryProduct {
  search?: string;
  sort?: string;
  limit: number;
  offset: number;
}
