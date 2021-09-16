<script>
  import Saos from "saos/src/Saos.svelte";
</script>

<div id="about" class="container mx-auto">
  <div class="my-20">
    <Saos
      once={true}
      animation={"fade-in-bottom 1s ease-in-out both"}
      css_animation={"height: 100%"}
    >
      <h1 class="text-4xl my-8 font-bold text-white">About me</h1>
      <p
        class=" text-lg bg-base-200 p-5 rounded-none leading-normal text-white "
      >
        Hi 👋, I'm Dylan Cathelijn. I’m a 22 yr old aspiring fullstack web
        developer living in Belgium. Since the age of 10 I've been obsessed with
        anything relating to computers, and eventually found my passion to be
        making websites. I'm currently enrolled at Arteveldehogeschool in the
        Programming course where I'm sharpening my skills and learning to work
        with modern webtechnologies. I'm fortunate enough to live in an age
        where I'm able to find a ton of information online and use that
        information to teach myself new things. I'm passionate about learning
        new technologies, and I'm always looking for new ways to improve myself.
      </p>
    </Saos>
  </div>
</div>
