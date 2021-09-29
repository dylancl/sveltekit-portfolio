<script>
  import { onMount } from "svelte";
  const contactInformation = [
    {
      link: "https://github.com/dylancl",
      name: "GitHub",
    },
    {
      link: "https://www.linkedin.com/in/dylan-cathelijn-00551214b/",
      name: "LinkedIn",
    },
    {
      link: "mailto:dylan_cathelyn@hotmail.be",
      name: "Email",
    },
    {
      link: "tel:+32470053869",
      name: "Phone",
    },
    {
      link: "/resume.pdf",
      name: "Resume",
    },
  ];

  $: innerWidth = 0;

  import HALO from "vanta/dist/vanta.halo.min.js";
  onMount(() => {
    if (innerWidth > 800) {
      const vanta = HALO({
        el: document.querySelector(".vanta"),
        mouseControls: true,
        touchControls: true,
        gyroControls: true,
        minHeight: 200.0,
        scaleMobile: 0.5,
        yOffsetMobile: -0.8,
        ringFactor: 0.1,
        minWidth: 200.0,
        speed: 0.1,
        baseColor: 0x155aff,
        amplitudeFactor: 0.3,
        backgroundColor: 0x0,
        xOffset: 0,
        yOffset: -4.2,
        size: 20.0,
      });
    }
  });
</script>

<svelte:window bind:innerWidth />

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@700;900&display=swap"
    rel="stylesheet"
  />
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js"></script>
</svelte:head>

<div id="hero" class="hero vanta min-h-screen bg-base-200">
  <div class="backdrop-blur flex justify-center items-center">
    <div class="text-center hero-content container w-full">
      <div class="w-full">
        <svg class="h-50 sm:h-64 md:h-72 lg:h-100 w-full drop-shadow-2xl">
          <text
            class="text-7xl sm:text-8xl md:text-9xl xl:text-11xl md:font-extrabold"
            x="0"
            y="0"
            fill="white"
          >
            <tspan x="0" y="40%">Dylan</tspan>
            <tspan x="0" y="90%">Cathelijn</tspan>
          </text>
        </svg>
        <p class="text-left text-lg text-white font-bold prose md:ml-4">
          full-stack developer based in Belgium
        </p>
        <div
          class="grid grid-cols-1 md:grid-cols-5 md:ml-4 mt-4 w-full md:w-1/2 lg:w-7/12 gap-7"
        >
          {#each contactInformation as contactInfo}
            <div>
              <a target="_blank" href={contactInfo.link}>
                <div
                  class="card bg-base-200 p-0 rounded-none text-white shadow-2xl"
                >
                  <div class="card-body p-3">
                    <p class="font-bold uppercase">
                      {contactInfo.name}
                    </p>
                  </div>
                </div>
              </a>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
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

  .hero {
    background-color: black;
  }

  @media screen and (max-width: 768px) {
    .hero {
      background-color: #000000;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2000 1500'%3E%3Cdefs%3E%3Crect fill='none' stroke-width='100' id='a' x='-400' y='-300' width='800' height='600'/%3E%3C/defs%3E%3Cg style='transform-origin:center'%3E%3Cg transform='' style='transform-origin:center'%3E%3Cg transform='rotate(-160 0 0)' style='transform-origin:center'%3E%3Cg transform='translate(1000 750)'%3E%3Cuse stroke='%23000' href='%23a' transform='rotate(10 0 0) scale(1.1)'/%3E%3Cuse stroke='%23020202' href='%23a' transform='rotate(20 0 0) scale(1.2)'/%3E%3Cuse stroke='%23040404' href='%23a' transform='rotate(30 0 0) scale(1.3)'/%3E%3Cuse stroke='%23060606' href='%23a' transform='rotate(40 0 0) scale(1.4)'/%3E%3Cuse stroke='%23070707' href='%23a' transform='rotate(50 0 0) scale(1.5)'/%3E%3Cuse stroke='%23090909' href='%23a' transform='rotate(60 0 0) scale(1.6)'/%3E%3Cuse stroke='%230b0b0b' href='%23a' transform='rotate(70 0 0) scale(1.7)'/%3E%3Cuse stroke='%230d0d0d' href='%23a' transform='rotate(80 0 0) scale(1.8)'/%3E%3Cuse stroke='%230f0f0f' href='%23a' transform='rotate(90 0 0) scale(1.9)'/%3E%3Cuse stroke='%23111111' href='%23a' transform='rotate(100 0 0) scale(2)'/%3E%3Cuse stroke='%23131313' href='%23a' transform='rotate(110 0 0) scale(2.1)'/%3E%3Cuse stroke='%23151515' href='%23a' transform='rotate(120 0 0) scale(2.2)'/%3E%3Cuse stroke='%23161616' href='%23a' transform='rotate(130 0 0) scale(2.3)'/%3E%3Cuse stroke='%23181818' href='%23a' transform='rotate(140 0 0) scale(2.4)'/%3E%3Cuse stroke='%231a1a1a' href='%23a' transform='rotate(150 0 0) scale(2.5)'/%3E%3Cuse stroke='%231C1C1C' href='%23a' transform='rotate(160 0 0) scale(2.6)'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      background-attachment: fixed;
      background-size: cover;
    }
  }

  .backdrop-blur {
    height: 100%;
    width: 100%;
    backdrop-filter: blur(5rem);
  }

  .hero-content {
    z-index: 10;
  }

  svg text {
    font-family: "Ubuntu";
    letter-spacing: 10px;
    font-weight: 800;
    fill: white;
    stroke: white;
    /* letter-spacing: 0.1em; */
    stroke-width: 4;
    filter: drop-shadow(0px 3px 3px rgba(0, 0, 0, 1));
    animation: textAnimate 5s linear;
  }

  @keyframes textAnimate {
    0% {
      stroke-dasharray: 0 50%;
      stroke-dashoffset: 20%;
      fill: var(--color-1);
    }

    10% {
      fill: var(--color-2);
    }

    20% {
      fill: var(--color-3);
    }

    30% {
      fill: var(--color-4);
    }

    40% {
      fill: var(--color-5);
    }

    50% {
      fill: var(--color-6);
    }

    60% {
      fill: var(--color-7);
    }

    100% {
      stroke-dasharray: 50% 0;
      stroke-dashoffstet: -20%;
      fill: white;
    }
  }
</style>
