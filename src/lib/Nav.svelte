<script>
  import { page } from "$app/stores";
</script>

<div>
  <nav
    class="navbar bg-transparent fixed top-0 z-50 bg-base-100 text-white w-full"
  >
    {#if !$page.path.includes("/projects/")}
      <div class="navbar-start" />
      <div class="px-2 mx-2 navbar-center lg:flex">
        <div class="flex items-stretch">
          <a
            class="btn btn-ghost btn-sm rounded-none hover:bg-base-200"
            href={$page.path === "/projects" ? "/" : "#hero"}
          >
            Home
          </a>
          <a
            class="btn btn-ghost btn-sm rounded-none hover:bg-base-200"
            class:text-blue-400={$page.path === "/projects"}
            href={$page.path === "/projects" ? "#" : "#proj"}
          >
            Projects
          </a>
          <a
            class="btn btn-ghost btn-sm rounded-none hover:bg-base-200"
            href="/#about"
          >
            About
          </a>
          <a
            class="btn btn-ghost btn-sm rounded-none hover:bg-base-200"
            href="/#tech"
          >
            Tech
          </a>
        </div>
      </div>
      <div class="navbar-end" />
    {:else}
      <a href="/projects" class="navbar-start backarrow ml-4">
        <img src="/icons/leftarrow.svg" class="max-h-12" alt="Return" />
        <p class="font-bold uppercase text-xl">Back</p>
      </a>
    {/if}
  </nav>
</div>

<style>
  .backarrow p::after {
    content: "";
    display: block;
    width: 0;
    height: 4px;
    margin-top: -0.3rem;
    background: var(--color-7);
    transition: width ease-in-out 0.5s;
  }

  .backarrow p:hover::after {
    width: 100%;
  }
</style>
