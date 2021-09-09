<script>
  import "../styles/tailwind-output.css";
  import Nav from "$lib/Nav.svelte";
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.1/styles/github.min.css"
  />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div>
  <Nav />
  <div class="container mx-auto font-sans">
    <slot />
  </div>
</div>
