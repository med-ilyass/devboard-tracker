import { apiRequest } from "./client.js";
// get tasks (token , projectID ) -> GET /api/tasks?projectsId=...
export async function getTasks(token, projectId) {
    const qs = projectId ? `?projectId=${projectId}` : "";
    return await apiRequest(`/api/tasks${qs}`, { token })
}
//create task (token, payload) POST /api/tasks
export async function createTask(token, { project_id, title, description, priority, due_date, assigned_to }) {
    return await apiRequest(`/api/tasks`, {
        method: "POST",
        token,
        body: {
            project_id,
            title,
            description,
            priority,
            due_date,
            assigned_to,
        }
    })
}
//update tasks (token, taskId, payload) -> PATCH /api/tasks/:taskId
export async function updateTask(token, taskId, updates) {
    return await apiRequest(`/api/tasks/${taskId}`, {
        method: "PATCH",
        token,
        body: updates,
    })
}
//delete task (token , taskId) -> DELETE /api/tasks/:taskId
export async function deleteTask(token, taskId) {
    return await apiRequest(`/api/tasks/${taskId}`, {
        method: "DELETE",
        token,
    })
}
