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
  import technologies from "$lib/tech.json";
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

<svelte:head>
  <title>Dylan Cathelijn - portfolio</title>
</svelte:head>

<div class="my-20">
  <h1 class="text-4xl my-8 font-bold text-white">Projects</h1>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-7 place-items-stretch">
    {#each projects as project}
      <Saos
        animation={"fade-in-bottom 1s ease-in-out both"}
        css_animation={"height: 100%"}
      >
        <button
          on:click={open}
          data-id={project.name}
          class="card text-left bordered bg-base-200 rounded-none text-white shadow-lg"
        >
          <div class="card-body" data-id={project.name}>
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

<div class="my-20">
  <h1 class="text-4xl my-8 font-bold text-white">
    Technologies I &#10084;&#65039;
  </h1>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-7 place-items-stretch">
    {#each technologies as tech}
      <Saos
        animation={"fade-in-bottom 1s ease-in-out both"}
        css_animation={"height: 100%"}
      >
        <div
          class="card bordered bg-base-200 px-4 flex flex-row justify-between items-center rounded-none text-white shadow-lg transform transition duration-500 hover:scale-105"
        >
          <p class="text-lg font-bold uppercase">{tech.name}</p>
          <img class="w-10 h-16" src={tech.icon} alt="" />
        </div>
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
    box-shadow: 0 0 var(--color-4);
    transition: 0.5s ease;
  }

  .card:hover {
    box-shadow: -6px 6px var(--color-7);
    transform: translate(6px, -6px);
  }

  /**
 * ----------------------------------------
 * animation fade-in-fwd
 * ----------------------------------------
 */
  @-webkit-keyframes -global-fade-in-fwd {
    0% {
      -webkit-transform: translateZ(-80px);
      transform: translateZ(-80px);
      opacity: 0;
    }
    100% {
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      opacity: 1;
    }
  }
  @keyframes -global-fade-in-fwd {
    0% {
      -webkit-transform: translateZ(-80px);
      transform: translateZ(-80px);
      opacity: 0;
    }
    100% {
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      opacity: 1;
    }
  }

  @-webkit-keyframes -global-fade-in-bottom {
    0% {
      -webkit-transform: translateY(50px);
      transform: translateY(50px);
      opacity: 0;
    }
    100% {
      -webkit-transform: translateY(0);
      transform: translateY(0);
      opacity: 1;
    }
  }
  @keyframes -global-fade-in-bottom {
    0% {
      -webkit-transform: translateY(50px);
      transform: translateY(50px);
      opacity: 0;
    }
    100% {
      -webkit-transform: translateY(0);
      transform: translateY(0);
      opacity: 1;
    }
  }

  .card {
    height: 100%;
    min-height: 100%;
  }

  /* .carouselImg {
    min-width: 100% !important;
    min-height: 100% !important;
  } */
</style>
