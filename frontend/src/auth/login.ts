type LoginResponse = {
  token: string;
  userId: string;
  profileId: string;
};

export async function login(auth0Token: string): Promise<LoginResponse> {
  const url = import.meta.env.VITE_BACKEND_URL + '/login';
  const headers = { Authorization: `Bearer ${auth0Token}` };

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw Error(`Login: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
