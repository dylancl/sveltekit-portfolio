<script>
  import Saos from "saos/src/Saos.svelte";
  import tech from "$lib/tech.json";
</script>

<!-- <div id="tech" class="my-20 container mx-auto">
  <Saos
    animation={"fade-in-bottom 1s ease-in-out both"}
    css_animation={"height: 100%"}
  >
    <h1 class="text-4xl my-8 font-bold text-white">Technologies I've used</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-7 place-items-stretch">
      {#each technologies.items as tech}
        <div
          class="card bordered bg-base-200 px-4 flex flex-row justify-between items-center rounded-none text-white shadow-lg transform transition duration-500 hover:scale-105"
        >
          <p class="text-lg font-bold uppercase">{tech.name}</p>
          <img class="w-10 h-16" src={tech.icon} alt="" />
        </div>
      {/each}
    </div>
  </Saos>
</div> -->

<div id="tech" class="container mx-auto my-20">
  <h1 class="text-4xl my-8 font-bold text-white">Technologies I've used</h1>
  {#each tech.categories as category}
    <h1 class="text-2xl text-white capitalize mt-10 mb-5 font-bold">
      {category}
    </h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-7 place-items-stretch">
      {#each tech.items as item}
        {#if item.category === category}
          <Saos
            animation={"fade-in-bottom 1s ease-in-out both"}
            css_animation={"height: 100%"}
            once={true}
          >
            <div
              class="card bordered bg-base-200 px-4 flex flex-row justify-between items-center rounded-none text-white shadow-lg transform transition duration-500 hover:scale-105"
            >
              <p class="text-lg font-bold uppercase">{item.name}</p>
              <img class="w-10 h-16" src={item.icon} alt="" />
            </div>
          </Saos>
        {/if}
      {/each}
    </div>
  {/each}
</div>

<style>
  .card {
    box-shadow: 0 0 var(--color-4);
    transition: 0.5s ease;
  }

  .card:hover {
    box-shadow: -6px 6px var(--color-7);
    transform: translate(6px, -6px);
  }
</style>
