<script context="module">
  export async function load({ page, fetch }) {
    const res = await fetch(`/projects.json`);
    const projects = await res.json();
    return {
      props: {
        projectName: page.params.slug,
        projects: projects,
      },
    };
  }
</script>

<script>
  import ProjectHero from "$lib/components/ProjectHero.svelte";
  export let projects;
  import technologies from "$lib/tech.json";
  import ProjectTechnologies from "$lib/components/ProjectTechnologies.svelte";
  export let projectName;
  let foundProject;
  let projectImages;
  let filteredTechnologies;

  const getProject = (projectName) => {
    const project =
      projects && projects.find((project) => project.name == projectName);
    foundProject = project;

    filteredTechnologies = technologies.items.filter((tag) => {
      let projectTags = project.tags.map((tag) => tag.toLowerCase());
      return projectTags.includes(tag.name);
    });
    projectImages = foundProject && project.images;
  };

  projectName && getProject(projectName);
</script>

<ProjectHero {projectName} {projectImages} />

<div class="max-w-4xl mx-auto">
  <h1 class="text-5xl font-bold text-blue-500 mb-3">
    {foundProject.title}
  </h1>
  {#if foundProject.gh_link}
    <a
      class="mt-10 text-white font-bold"
      target="_blank"
      href={foundProject.gh_link}>View on GitHub</a
    >
  {:else}
    <a
      class="mt-10 text-white font-bold"
      target="_blank"
      href={foundProject.link}>Visit website</a
    >
  {/if}
  <p class="text-white mt-10">{@html foundProject.long_text}</p>
</div>

<div class="max-w-4xl mx-auto">
  <ProjectTechnologies {filteredTechnologies} />
</div>
