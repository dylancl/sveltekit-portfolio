<script>
  import "../styles/tailwind-output.css";
  // import Nav from "$lib/Nav.svelte";
  import Footer from "$lib/Footer.svelte";
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

  <meta property="og:title" content="Dylan Cathelijn" />
  <meta
    property="og:description"
    content="fullstack developer based in Belgium"
  />
  <meta property="og:image" content="/embedImage.png" />
  <meta
    property="og:url"
    content="https://loving-blackwell-b19372.netlify.app/"
  />
</svelte:head>

<div>
  <div class="font-sans">
    <slot />
  </div>
  <Footer />
</div>
