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
  import Hero from "$lib/components/Hero.svelte";
  import About from "$lib/components/About.svelte";
  import Technologies from "$lib/components/Technologies.svelte";
  export let projects;
</script>

<svelte:head>
  <title>Dylan Cathelijn - portfolio</title>
</svelte:head>

<Hero />
<About />

<div id="proj" class="my-20 container mx-auto">
  <Saos
    animation={"fade-in-bottom 1s ease-in-out both"}
    css_animation={"height: 100%"}
    once={true}
  >
    <a class="projectLink flex items-center" href="/projects">
      <h1 class="text-4xl my-8 font-bold text-white">Projects</h1>
      <img class="h-5 mt-3 ml-2" src="/icons/link.svg" alt="link icon" />
    </a>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-7 place-items-stretch">
      {#each projects as project}
        <a
          href={`/projects/${project.name}`}
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
        </a>
      {/each}
    </div>
  </Saos>
</div>

<Technologies />

<!-- <Modal
  {isOpen}
  on:close={close}
  tags={projectTags}
  projectLink={foundProject
    ? foundProject.gh_link
      ? foundProject.gh_link
      : foundProject.link
    : null}
  header={foundProject && foundProject.title}
/> -->
<style>
  .projectLink h1::after {
    content: "";
    display: block;
    width: 0;
    height: 4px;
    margin-top: -0.3rem;
    background: var(--color-7);
    transition: width ease-in-out 0.5s;
  }

  .projectLink h1:hover::after {
    width: 100%;
  }

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
