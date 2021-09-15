<script>
  import { page } from "$app/stores";
  console.log($page);
</script>

<div>
  <nav
    class="navbar bg-transparent fixed top-0 z-50 bg-base-100 text-white w-full"
  >
    <div class="navbar-start" />
    <div class="px-2 mx-2 navbar-center lg:flex">
      <div class="flex items-stretch">
        <a
          class="btn btn-ghost btn-sm rounded-none"
          href={$page.path === "/projects" ? "/" : "#hero"}
        >
          Home
        </a>
        <a
          class="btn btn-ghost btn-sm rounded-none"
          class:text-blue-400={$page.path === "/projects"}
          href={$page.path === "/projects" ? "#" : "#proj"}
        >
          Projects
        </a>
        <a class="btn btn-ghost btn-sm rounded-none" href="/#about"> About </a>
        <a class="btn btn-ghost btn-sm rounded-none" href="/#tech"> Tech </a>
      </div>
    </div>
    <div class="navbar-end" />
  </nav>
</div>
