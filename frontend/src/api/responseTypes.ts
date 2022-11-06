export type ResponseContent<T> = {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

export type GetAllResponse<T> = ResponseContent<T> | Error;

export type CreateOneResponse<T> = T | Error;

export type DeleteOneResponse = void | Error;
