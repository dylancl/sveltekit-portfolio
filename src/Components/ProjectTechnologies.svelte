<script>
  import Saos from "saos/src/Saos.svelte";
  import { assets, base } from "$app/paths";
  export let filteredTechnologies;
</script>

<div id="tech" class="my-20 container mx-auto">
  <Saos
    animation={"fade-in-bottom 1s ease-in-out both"}
    css_animation={"height: 100%"}
  >
    <h1 class="text-4xl my-8 font-bold text-white">Used technologies</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-7 place-items-stretch">
      {#each filteredTechnologies as tech}
        <div
          class="card bordered bg-base-200 px-4 flex flex-row justify-between items-center rounded-none text-white shadow-lg transform transition duration-500 hover:scale-105"
        >
          <p class="text-lg font-bold uppercase">{tech.name}</p>
          <img class="w-10 h-16" src={`/${tech.icon}`} alt={tech.name} />
        </div>
      {/each}
    </div>
  </Saos>
</div>

<style>
  :root {
    --color-1: #f72585ff;
    --color-2: #b5179eff;
    --color-3: #7209b7ff;
    --color-4: #560badff;
    --color-5: #480ca8ff;
    --color-6: #3a0ca3ff;
    --color-7: #3f37c9ff;
    --color-8: #4361eeff;
    --color-9: #4895efff;
    --color-10: #4cc9f0ff;
  }

  .card {
    box-shadow: 0 0 var(--color-4);
    transition: 0.5s ease;
  }

  .card:hover {
    box-shadow: -6px 6px var(--color-7);
    transform: translate(6px, -6px);
  }
</style>
