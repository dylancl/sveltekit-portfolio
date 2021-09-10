<script context="module">
  import { base } from "$app/paths";

  export async function load({ fetch }) {
    const posts = await fetch(`${base}/index.json`).then((r) => r.json());
    return {
      props: { posts },
    };
  }
</script>

<script>
  import Saos from "saos/src/Saos.svelte";
  import technologies from '$lib/tech.json';
  export let posts;
</script>

<svelte:head>
  <title>Dylan Cathelijn - portfolio</title>
</svelte:head>

<div class="my-20">
  <h1 class="text-4xl my-8 font-bold text-white">Projects</h1>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-7 place-items-stretch">
    {#each posts as post}
      <Saos
        animation={"fade-in-bottom 1s ease-in-out both"}
        css_animation={"height: 100%"}
      >
        <a href={`${base}/${post.slug}`}>
          <div
            class="card bordered bg-base-200 rounded-none text-white shadow-lg transform transition duration-500 hover:scale-105"
          >
            <!-- <div>
            <img src={post.metadata.image} alt="" />
          </div> -->
            <div class="card-body">
              <div class="flex -mx-1 flex-wrap">
                {#each post.metadata.tags as tag}
                  <span
                    class="tag text-xs uppercase font-semibold mb-1 px-1 text-blue-500"
                    >{tag}</span
                  >
                {/each}
              </div>
              <h2 class="card-title text-2xl font-bold break-all">
                {post.metadata.title}
              </h2>
              <p class="text-gray-500">{post.metadata.excerpt}</p>
            </div>
          </div>
        </a>
      </Saos>
    {/each}
  </div>
</div>

<div class="my-20">
  <h1 class="text-4xl my-8 font-bold text-white">Technologies</h1>
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
          <img class="w-10 h-16" src={tech.icon} alt="">

          </div>
      </Saos>
    {/each}
  </div>
</div>

<style>
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
</style>
