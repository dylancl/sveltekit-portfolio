<script>
  import { onMount } from "svelte";
  export let projectImages;

  let Carousel;
  let carousel; // for calling methods of carousel instance
  onMount(async () => {
    const module = await import("svelte-carousel");
    Carousel = module.default;
  });
</script>

<div class="container mx-auto my-20">
  <div class="my-20">
    <svelte:component
      this={Carousel}
      bind:this={carousel}
      autoplay
      pauseOnFocus
      autoplayProgressVisible
      arrows={false}
    >
      {#each projectImages as src}
        <img {src} class="carouselImg" alt="nature" />
      {/each}
    </svelte:component>
  </div>
  <!-- <div class="flex -mx-1 flex-wrap">
    {#each foundProject.tags as tag}
      <span class="tag text-xs uppercase font-semibold mb-1 px-1 text-blue-500"
        >{tag}
      </span>
    {/each}
  </div> -->
</div>
