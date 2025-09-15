import api from "./utils/api";
import { getToken } from "./utils/jwt";

export async function askQuestion(
  query: string,
): Promise<{ answer: string; context: any[] }> {
  try {
    const response = await api.post("/ask", { query });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Ask failed" };
  }
}

export async function uploadDocument(
  file: File,
): Promise<{ sucess: true; message: string }> {
  const formData = new FormData();
  formData.append("file.txt", file);
  try {
    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Upload failed" };
  }
}
