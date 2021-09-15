<script context="module">
  export async function load({ fetch }) {
    const res = await fetch(`/projects.json`);
    const projects = await res.json();
    return {
      props: { projects },
    };
  }
</script>

<script>
  import Saos from "saos/src/Saos.svelte";
  import Modal from "$lib/Modal.svelte";
  import { onMount } from "svelte";
  export let projects;

  let Carousel;
  let carousel; // for calling methods of carousel instance
  onMount(async () => {
    const module = await import("svelte-carousel");
    Carousel = module.default;
  });

  let clickedProject;
  let foundProject;
  let projectTags;
  let isOpen = false;
  const close = () => (isOpen = false);
  const open = (e) => {
    clickedProject = e.target.offsetParent.dataset.id;
    getProject(clickedProject);
    isOpen = true;
  };

  const getProject = (clickedProj) => {
    const project = projects.find((project) => project.name == clickedProj);
    projectTags =
      project &&
      project.tags
        .map((tag) => {
          return `
      <span class="tag text-xs uppercase font-semibold mb-1 ml-2 text-blue-500">${tag}</span>`;
        })
        .join("");
    foundProject = project;
  };
</script>

<div class="container mx-auto my-20">
  <h1 class="text-7xl text-white my-10">Projects I've worked on</h1>
  <div class="grid grid-cols-1 gap-10 place-items-stretch">
    {#each projects as project, index}
      <Saos animation={"fade-in-bottom 1s ease-in-out both"}>
        <button
          on:click={open}
          data-id={project.name}
          class="card w-full lg:card-side text-left bordered bg-base-200 rounded-none text-white shadow-lg"
        >
          <div class="lg:w-2/5 min-h-full">
            <img src={project.images[0]} alt="" />
          </div>
          <div
            class="card-body md:w-1/2 {index % 2
              ? 'lg:order-first'
              : 'lg:order-last'}"
            data-id={project.name}
          >
            <div class="flex -mx-1 flex-wrap">
              {#each project.tags as tag}
                <span
                  class="tag text-xs uppercase font-semibold mb-1 px-1 text-blue-500"
                  >{tag}
                </span>
              {/each}
            </div>
            <h2 class="card-title text-2xl font-bold break-all">
              {project.title}
            </h2>
            <p class="text-gray-500">{project.excerpt}</p>
          </div>
        </button>
      </Saos>
    {/each}
  </div>
</div>

<Modal
  {isOpen}
  on:close={close}
  tags={projectTags}
  projectLink={foundProject
    ? foundProject.gh_link
      ? foundProject.gh_link
      : foundProject.link
    : null}
  header={foundProject && foundProject.title}
>
  {#if foundProject}
    <svelte:component
      this={Carousel}
      bind:this={carousel}
      autoplay
      pauseOnFocus
      autoplayProgressVisible
      arrows={false}
    >
      {#each foundProject.images as src}
        <img {src} class="carouselImg min-w-full" alt="nature" />
      {/each}
    </svelte:component>
  {/if}
</Modal>

<style>
  .card {
    box-shadow: 0 0 #560badff;
    transition: 0.5s ease;
  }

  .card:hover {
    box-shadow: -6px 6px #3f37c9ff;
    transform: translate(6px, -6px);
  }
</style>
