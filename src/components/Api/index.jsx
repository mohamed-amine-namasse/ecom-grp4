const WP_BASE = "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/wp-json";


function defaultOptions() {
  return {
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
  };
}

export async function getPosts(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${WP_BASE}/posts${queryString ? "?" + queryString : ""}`;

  const res = await fetch(url, {
    ...defaultOptions(),
    method: "GET",
  });

  if (!res.ok) throw new Error(`Erreur GET posts: ${res.status}`);
  return res.json();
}

export function authHeader(username, appPassword) {
  const token = btoa(`${username}:${appPassword}`);
  return { Authorization: `Basic ${token}` };
}

export async function createPost(postData, auth) {
  const res = await fetch(`${WP_BASE}/posts`, {
    ...defaultOptions(),
    method: "POST",
    headers: {
      ...defaultOptions().headers,
      ...auth,
    },
    body: JSON.stringify(postData),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erreur création post: ${error}`);
  }

  return res.json();
}

export async function validateToken(token) {
  const ENDPOINT = `${WP_BASE}/jwt-auth/v1/token/validate`;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json(); // {code: "jwt_auth_valid_token", data: ...}
}

export async function registerUserPublic(userData) {
  const ENDPOINT = `${WP_BASE}/custom/v1/register`;

  try {
    const res = await fetch(ENDPOINT, {
      ...defaultOptions(),
      method: "POST",
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } catch (err) {
    console.error("Erreur API:", err.message);
    throw err;
  }
}

export async function loginUser(username, password) {
  const ENDPOINT = `${WP_BASE}/jwt-auth/v1/token`;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({username, password}),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Erreur connexion JWT");
    }

    localStorage.setItem("JWT Token:", JSON.stringify (data));

  } catch (err) {
    console.error("Erreur login JWT:", err.message);
    throw err;
  }
}
export async function validateStoredToken() {
  const ENDPOINT = `${WP_BASE}/jwt-auth/v1/token/validate`;
  const storedData = localStorage.getItem("JWT Token:");
  if (!storedData) {
    throw new Error("No token found in localStorage");
  }
  const { token } = JSON.parse(storedData);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Erreur validation JWT");
    }
    return data;
  } catch (err) {
    console.error("Erreur validation JWT:", err.message);
    throw err;
  }
}







