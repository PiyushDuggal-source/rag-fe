import axios from "axios";
import { getToken } from "./jwt";

const api = axios.create({
  baseURL: "http://localhost:3030/api",
  headers: {
    "Content-Type": "application/json",
    authorization: `Bearer ${getToken()}`,
  },
});

export default api;
