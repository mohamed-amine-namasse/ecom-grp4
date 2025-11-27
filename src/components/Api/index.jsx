const WP_BASE =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/wp-json";

// Génère les options fetch par défaut
function defaultOptions() {
  return {
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
  };
}

// -------------------------------
// GET POSTS
// -------------------------------
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

// -------------------------------
// BASIC AUTH HEADER
// -------------------------------
export function authHeader(username, appPassword) {
  const token = btoa(`${username}:${appPassword}`);
  return { Authorization: `Basic ${token}` };
}

// -------------------------------
// CREATE POST (avec auth)
// -------------------------------
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

// -------------------------------
// REGISTER USER (public API)
// -------------------------------
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

// -------------------------------
// LOGIN USER
// -------------------------------
export async function loginUser(username, password) {
  const ENDPOINT = `${WP_BASE}/custom/v1/login`;

  try {
    const res = await fetch(ENDPOINT, {
      ...defaultOptions(),
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } catch (err) {
    console.error("Erreur login:", err.message);
    throw err;
  }
}
