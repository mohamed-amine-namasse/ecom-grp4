import axios from "axios";

const WP_BASE = "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/wp-json";
const axiosInstance = axios.create({
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

export async function getPosts(params = {}) {
  const res = await axiosInstance.get(`${WP_BASE}/posts`, { params });
  return res.data;
}

export function authHeader(username, appPassword) {
  const token = Buffer.from(`${username}:${appPassword}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

export async function createPost(postData, auth) {
  return axiosInstance.post(`${WP_BASE}/posts`, postData, { headers: auth });
}

// Inscription - utilise l'endpoint standard WordPress users
export async function registerUserPublic(userData) {
  const ENDPOINT = `${WP_BASE}/custom/v1/register`;
  try {
    const res = await axiosInstance.post(ENDPOINT, {
      username: userData.username,
      email: userData.email,
      password: userData.password,
    });
    return res.data;
  } catch (err) {
    console.error("Erreur API:", err.response?.data || err.message);
    throw err;
  }
}

export async function loginUser(username, password) {
  const ENDPOINT = `${WP_BASE}/custom/v1/login`;
  try {
    const res = await axiosInstance.post(ENDPOINT, {
      username: username,
      password: password,
    });
    return res.data;
  } catch (err) {
    console.error("Erreur login:", err.response?.data || err.message);
    throw err;
  }
}
