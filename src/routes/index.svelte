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
  export let posts;
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    {#each posts as post}
      <a href={`${base}/${post.slug}`}>
        <div class="card bordered bg-base-300 shadow-lg transform transition duration-500 hover:scale-105">
          <div class="relative">
            <img src={post.metadata.image} alt="" />
            <!-- <div class="badge shadow-lg border-0 upper text-white {post.metadata.finished ? 'bg-green-600' : 'bg-red-600'} absolute bottom-0 -mb-2 right-1">{post.metadata.finished ? 'finished' : 'in progress'}</div>  -->
          </div>
          <div class="card-body">
            <div class="flex -mx-2">
              {#each post.metadata.tags as tag}
                <span class="tag text-sm leading-tight uppercase font-bold px-2 text-white">{tag}</span>
              {/each}
            </div>
            <h2 class="card-title text-2xl font-bold">{post.metadata.title}</h2>
            <p>{post.metadata.excerpt}</p>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>
