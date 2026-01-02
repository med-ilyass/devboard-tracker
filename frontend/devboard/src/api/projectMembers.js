import { apiRequest } from './client.js'

export async function listMembers(token, projectId) {
    return apiRequest(`/api/projects/${projectId}/members`, { token })
}

export async function addMembers(token, projectId, { email, role }) {
    return apiRequest(`/api/projects/${projectId}/members`, {
        method: "POST",
        token,
        body: { email, role }
    })
}
export async function removeMember(token, projectId, userId) {
    return apiRequest(`/api/projects/${projectId}/members/${userId}`, {
        method: "DELETE",
        token,
    })
}