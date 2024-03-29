import {
  GetAllResponse,
  CreateOneResponse,
  UpdateOneResponse,
  DeleteOneResponse,
} from './responseTypes';
import { AuthData } from '../auth/AuthDataContext';

export type ResourceApi<T> = {
  getAll: () => Promise<GetAllResponse<T>>;
  createOne: (body: any) => Promise<CreateOneResponse<T>>;
  updateOne: (body: any) => Promise<UpdateOneResponse<T>>;
  deleteOne: (id: string) => Promise<DeleteOneResponse>;
};

type FetchProps = {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  transformFn?: (any: any) => any;
};

export function createApi<T>(
  collectionType: string,
  { auth0Token, pocketbaseToken }: AuthData,
): ResourceApi<T> {
  const baseUrl = `${
    import.meta.env.VITE_BACKEND_URL
  }/api/collections/${collectionType}/records`;

  const doFetch = async ({
    url = '',
    method = 'GET',
    body,
    transformFn = (d: any) => d,
  }: FetchProps = {}) => {
    const headers: any = {
      Authorization: auth0Token,
      'X-Cost-Return-PB-Token': pocketbaseToken,
      ...(typeof body === 'object'
        ? { 'Content-Type': 'application/json' }
        : {}),
    };
    try {
      const response = await fetch(baseUrl + url, {
        method,
        headers,
        body: typeof body === 'object' ? JSON.stringify(body) : body,
      });
      if (!response.ok) {
        throw Error();
      }

      const isJson = response.headers
        .get('Content-Type')!
        .includes('application/json');
      if (isJson) {
        return transformFn(await response.json());
      } else {
        return transformFn(await response.text());
      }
    } catch (e) {
      if (e instanceof Error) {
        return e;
      } else {
        console.warn(e);
        return new Error('unknown error ' + e);
      }
    }
  };

  return {
    getAll: async () =>
      await doFetch({
        url: '?sort=-created&perPage=200',
        transformFn: data => {
          const { items, totalPages } = data;
          if (totalPages > 1) {
            alert('not complete :(');
          }
          return items;
        },
      }),
    createOne: async (body: any) =>
      await doFetch({
        method: 'POST',
        body,
      }),
    updateOne: async (body: any) =>
      await doFetch({ url: '/' + body.id, method: 'PATCH', body }),
    deleteOne: async (id: string) =>
      await doFetch({ method: 'DELETE', url: '/' + id }),
  };
}
