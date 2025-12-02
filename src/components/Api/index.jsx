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

  return res.json(); 
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
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Erreur connexion JWT");
    }

    localStorage.setItem("🔑 JWT Token:", data.token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("email", data.email);


    return data;
  } catch (err) {
    console.error("Erreur login JWT:", err.message);
    throw err;
  }

}

export async function getUser() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    // 1. Vérification du token
    const check = await fetch(`${WP_BASE}/jwt-auth/v1/token/validate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const checkData = await check.json();

    if (!check.ok || !checkData?.data?.user_id) {
      return null;
    }

    const userId = checkData.data.user_id;

    // 2. Récupération des données utilisateur
    const userRes = await fetch(`${WP_BASE}/wp/v2/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!userRes.ok) return null;

    const user = await userRes.json();
    return user;

  } catch (err) {
    console.error("Erreur getUser()", err);
    return null;
  }
}




