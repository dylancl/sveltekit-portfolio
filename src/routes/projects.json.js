import projects from '$lib/projects.json';

export async function get({ query, locals }) {
    return {
        status: 200,
        body: projects
    }
}