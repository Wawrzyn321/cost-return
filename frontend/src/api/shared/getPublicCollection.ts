import { PublicCollection } from './types';

type PublicCollectionResponse = PublicCollection | { code: number };

export async function getPublicCollection(
  collectionId: string,
): Promise<PublicCollectionResponse> {
  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const url = baseUrl + '/shared/' + collectionId;
  const response = await fetch(url);
  if (response.status !== 200) {
    throw Error(response.status.toString());
  }
  return await response.json();
}
