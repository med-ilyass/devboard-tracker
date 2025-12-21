import { apiRequest } from "./client";

export async function getProjects(token) {
    return await apiRequest("/api/projects", { token })
}
export async function createProject(token, { name, description }) {
    return await apiRequest("/api/projects", {
        method: "POST",
        token,
        body: { name, description }
    });
}
export async function deleteProject(token, projectId) {
    return await apiRequest(`/api/projects/${projectId}`, {
        method: "DELETE",
        token
    });
}