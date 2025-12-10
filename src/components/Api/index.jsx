const WP_BASE =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/wp-json";

function defaultOptions() {
  return {
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
  };
}

// --- FONCTIONS GENERALES WORDPRESS ---

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

// --- FONCTIONS JWT & AUTHENTIFICATION ---

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

/**
 * Récupère l'ID utilisateur WordPress pour l'utilisateur authentifié (via le token).
 * Cet ID est utilisé comme customerId (ID Client) pour les requêtes WooCommerce.
 * @param {string} token - Le jeton JWT de l'utilisateur connecté.
 * @returns {number|null} L'ID utilisateur WordPress.
 */
export async function fetchWordPressUserId(token) {
  // Endpoint pour récupérer les données de l'utilisateur CURRENT (authentifié par le token)
  const ENDPOINT = `${WP_BASE}/wp/v2/users/me`;

  try {
    const res = await fetch(ENDPOINT, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      // L'utilisateur authentifié n'a pas la permission de lire ses propres données via /users/me
      throw new Error(
        data.message ||
          "Erreur de récupération de l'ID utilisateur WP via /users/me."
      );
    }

    return data.id; // L'ID utilisateur WordPress
  } catch (err) {
    console.error("Erreur API fetchWordPressUserId:", err.message);
    throw err;
  }
}

export async function loginUser(username, password) {
  const ENDPOINT = `${WP_BASE}/jwt-auth/v1/token`;

  try {
    // 1. Connexion JWT (pour obtenir le token)
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

    // 2. Récupération de l'ID utilisateur WP (utilisé comme ID Client)
    const customerId = await fetchWordPressUserId(data.token);

    if (!customerId) {
      throw new Error(
        "ID Utilisateur WP (CustomerID) non trouvé après connexion."
      );
    }

    // 3. Stockage des données complètes
    const storedData = {
      ...data,
      customerId: customerId,
    };

    localStorage.setItem("JWT Token:", JSON.stringify(storedData));
    return storedData;
  } catch (err) {
    console.error("Erreur login JWT:", err.message);
    throw err;
  }
}

// --- FONCTION ENREGISTREMENT ---

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