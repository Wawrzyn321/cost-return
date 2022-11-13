export type ResponseContent<T> = T[];

export type GetAllResponse<T> = ResponseContent<T> | Error;

export type CreateOneResponse<T> = T | Error;

export type DeleteOneResponse = void | Error;
