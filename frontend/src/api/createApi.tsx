import { GetAllResponse } from "./responseTypes";

type ApiProps = {
  token: string;
  userId: string;
  resourceName: string;
};

type FetchProps = {
  url?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
};

export type Api<T> = {
  getAll: () => Promise<GetAllResponse<T>>;
};

export function createApi<T>({
  token,
  userId,
  resourceName,
}: ApiProps): Api<T> {
  const baseUrl = `${
    import.meta.env.VITE_BACKEND_URL
  }/collections/${resourceName}/records/`; // todo

  const doFetch = async ({
    url = "",
    method = "GET",
    body,
  }: FetchProps = {}) => {
    const headers: any = {
      Authorization: token,
    };
    if (body) {
      headers.body = typeof body === "object" ? JSON.stringify(body) : body;
    }
    try {
      const response = await fetch(baseUrl + url, { method, headers });
      if (!response.ok) {
        throw Error();
      }
      return await response.json();
    } catch (e) {
      if (e instanceof Error) {
        return { error: e };
      } else {
        console.warn(e);
        return { error: new Error("unknown error " + e) };
      }
    }
  };

  return {
    getAll: async (): Promise<GetAllResponse<T>> => await doFetch({}),
  };
}
