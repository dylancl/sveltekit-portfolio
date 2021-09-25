<script>
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { createEventDispatcher } from "svelte";

  export let header = "";
  export let tags = "";
  export let projectLink;
  export let isOpen = false;

  let popupRef;
  let footerRef = null;
  let headerRef = null;
  let overflowState = "";
  const dispatch = createEventDispatcher();
  const close = () => {
    dispatch("close", "");
  };

  const handleKeyDown = (event) => {
    if (event.keyCode === 27) close();
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
    document.body.appendChild(popupRef);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.removeChild(popupRef);
    };
  });
  $: {
    if (typeof window !== "undefined") {
      if (isOpen) {
        overflowState = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = overflowState;
      }
    }
  }
</script>

<div>
  <div bind:this={popupRef}>
    {#if isOpen}
      <div
        class={`overlay ${$$props.class || ""}`}
        transition:fade|local
        on:click={close}
      >
        <div
          class="aa-popup px-8 pt-4 bg-base-200 max-w-screen-xl"
          transition:fade|local={{
            duration: 300,
            y: -500,
            opacity: 0.9,
          }}
          on:click={(e) => e.stopPropagation()}
        >
          <div class="flex flex-wrap justify-between items-center -mx-2">
            <div>
              {#if tags}
                {@html tags}
              {/if}
            </div>
            <button class="btn btn-primary btn-sm">Test</button>
            <!-- <a target="_blank" href={projectLink}><img class="h-8" src={projectLink.includes('https://github.com') ? '/icons/github.svg' : '/icons/website.svg'} alt="GitHub icon"></a> -->
          </div>
          <div class="mb-3" class:header={header || !Boolean(headerRef)}>
            {#if header}
              <h1 class="text-2xl text-gray-300 font-bold">{header}</h1>
            {:else}
              <slot name="header">
                <div bind:this={headerRef} />
              </slot>
            {/if}
          </div>

          <div class="content mb-3 overflow-y-hidden">
            <p class="text-gray-300">
              <slot />
            </p>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);

    z-index: 99;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .aa-popup {
    box-shadow: 3px 3px 17px 0 rgba(0, 0, 0, 0.17);
    min-width: 200px;
    animation-fill-mode: forwards;
    max-height: calc(100% - 10px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .footer {
    margin: 0 24px 24px 24px;
    display: flex;
    justify-content: flex-end;
  }
  @media (max-width: 480px) {
    .popup {
      height: calc(100% - 32px);
      width: calc(100% - 32px);
    }
  }
</style>
