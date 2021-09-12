<script>
  import Saos from "saos/src/Saos.svelte";
  import { onMount } from "svelte";
  const contactInformation = [
    {
      link: "https://github.com/dylancl",
      icon: "icons/github.svg",
      name: "GitHub",
      alt: "GitHub",
    },
    {
      link: "https://www.linkedin.com/in/",
      icon: "icons/linkedin.svg",
      name: "LinkedIn",
      alt: "LinkedIn",
    },
    {
      link: "mailto:dylan",
      icon: "icons/email.svg",
      name: "Email",
      alt: "Email",
    },
  ];

  $: innerWidth = 0;

  import HALO from "vanta/dist/vanta.halo.min.js";
  onMount(() => {
    if (innerWidth > 800) {
      console.log(innerWidth);
      const vanta = HALO({
        el: document.querySelector(".vanta"),
        mouseControls: true,
        touchControls: true,
        gyroControls: true,
        minHeight: 200.0,
        scaleMobile: 0.5,
        yOffsetMobile: -0.8,
        minWidth: 200.0,
        baseColor: 0x155aff,
        amplitudeFactor: 1,
        backgroundColor: 0x0,
        xOffset: 0.6,
        yOffset: -0.31,
        size: 3.0,
      });
    }
  });
</script>

<svelte:window bind:innerWidth />

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Heebo:wght@700;900&display=swap"
    rel="stylesheet"
  />
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js"></script>
</svelte:head>

<div class="hero vanta min-h-screen bg-base-200">
  <div class="backdrop-blur flex justify-center items-center">
    <div class="text-center hero-content w-full">
      <div class="w-full">
        <svg class="h-50 md:h-72 lg:h-96 w-full drop-shadow-2xl">
          <text
            class="text-7xl md:text-9xl xl:text-11xl md:font-extrabold"
            x="0"
            y="0"
            fill="#3f37c9ff"
          >
            <tspan x="0" y="40%">Dylan</tspan>
            <tspan x="0" y="90%">Lastname</tspan>
          </text>
        </svg>
        <p class="text-left text-lg text-white font-bold prose md:ml-4">
          full-stack developer based in Belgium
        </p>
        <div
          class="grid grid-cols-1 md:grid-cols-3 md:ml-4 mt-4 w-full md:w-1/2 lg:w-1/3 gap-7"
        >
          {#each contactInformation as contactInfo}
            <div>
              <Saos
                once={true}
                animation={"fade-in-fwd 1s ease-in-out both"}
                css_animation={"animation-delay: 9s;"}
              >
                <a href={contactInfo.link}>
                  <div
                    class="card bg-base-200 p-0 rounded-none text-white shadow-2xl transform transition duration-500 hover:scale-105"
                  >
                    <div class="card-body p-3">
                      <p class="font-bold uppercase">
                        {contactInfo.name}
                      </p>
                    </div>
                  </div>
                </a>
              </Saos>
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

  .hero {
    background-color: black;
  }

  @media screen and (max-width: 768px) {
    .hero {
      background-color: #000000;
      background-color: #000000;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2000 1500'%3E%3Cdefs%3E%3CradialGradient id='a' gradientUnits='objectBoundingBox'%3E%3Cstop offset='0' stop-color='%23151515'/%3E%3Cstop offset='1' stop-color='%23000000'/%3E%3C/radialGradient%3E%3ClinearGradient id='b' gradientUnits='userSpaceOnUse' x1='0' y1='750' x2='1550' y2='750'%3E%3Cstop offset='0' stop-color='%230b0b0b'/%3E%3Cstop offset='1' stop-color='%23000000'/%3E%3C/linearGradient%3E%3Cpath id='s' fill='url(%23b)' d='M1549.2 51.6c-5.4 99.1-20.2 197.6-44.2 293.6c-24.1 96-57.4 189.4-99.3 278.6c-41.9 89.2-92.4 174.1-150.3 253.3c-58 79.2-123.4 152.6-195.1 219c-71.7 66.4-149.6 125.8-232.2 177.2c-82.7 51.4-170.1 94.7-260.7 129.1c-90.6 34.4-184.4 60-279.5 76.3C192.6 1495 96.1 1502 0 1500c96.1-2.1 191.8-13.3 285.4-33.6c93.6-20.2 185-49.5 272.5-87.2c87.6-37.7 171.3-83.8 249.6-137.3c78.4-53.5 151.5-114.5 217.9-181.7c66.5-67.2 126.4-140.7 178.6-218.9c52.3-78.3 96.9-161.4 133-247.9c36.1-86.5 63.8-176.2 82.6-267.6c18.8-91.4 28.6-184.4 29.6-277.4c0.3-27.6 23.2-48.7 50.8-48.4s49.5 21.8 49.2 49.5c0 0.7 0 1.3-0.1 2L1549.2 51.6z'/%3E%3Cg id='g'%3E%3Cuse href='%23s' transform='scale(0.12) rotate(60)'/%3E%3Cuse href='%23s' transform='scale(0.2) rotate(10)'/%3E%3Cuse href='%23s' transform='scale(0.25) rotate(40)'/%3E%3Cuse href='%23s' transform='scale(0.3) rotate(-20)'/%3E%3Cuse href='%23s' transform='scale(0.4) rotate(-30)'/%3E%3Cuse href='%23s' transform='scale(0.5) rotate(20)'/%3E%3Cuse href='%23s' transform='scale(0.6) rotate(60)'/%3E%3Cuse href='%23s' transform='scale(0.7) rotate(10)'/%3E%3Cuse href='%23s' transform='scale(0.835) rotate(-40)'/%3E%3Cuse href='%23s' transform='scale(0.9) rotate(40)'/%3E%3Cuse href='%23s' transform='scale(1.05) rotate(25)'/%3E%3Cuse href='%23s' transform='scale(1.2) rotate(8)'/%3E%3Cuse href='%23s' transform='scale(1.333) rotate(-60)'/%3E%3Cuse href='%23s' transform='scale(1.45) rotate(-30)'/%3E%3Cuse href='%23s' transform='scale(1.6) rotate(10)'/%3E%3C/g%3E%3C/defs%3E%3Cg transform='translate(1920 0)'%3E%3Cg transform='translate(0 1245)'%3E%3Ccircle fill='url(%23a)' r='3000'/%3E%3Cg opacity='0.5'%3E%3Ccircle fill='url(%23a)' r='2000'/%3E%3Ccircle fill='url(%23a)' r='1800'/%3E%3Ccircle fill='url(%23a)' r='1700'/%3E%3Ccircle fill='url(%23a)' r='1651'/%3E%3Ccircle fill='url(%23a)' r='1450'/%3E%3Ccircle fill='url(%23a)' r='1250'/%3E%3Ccircle fill='url(%23a)' r='1175'/%3E%3Ccircle fill='url(%23a)' r='900'/%3E%3Ccircle fill='url(%23a)' r='750'/%3E%3Ccircle fill='url(%23a)' r='500'/%3E%3Ccircle fill='url(%23a)' r='380'/%3E%3Ccircle fill='url(%23a)' r='250'/%3E%3C/g%3E%3Cg %3E%3Cuse href='%23g' transform='rotate(10)'/%3E%3Cuse href='%23g' transform='rotate(120)'/%3E%3Cuse href='%23g' transform='rotate(240)'/%3E%3C/g%3E%3Ccircle fill-opacity='0.51' fill='url(%23a)' r='3000'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      background-attachment: fixed;
      background-size: cover;
    }
  }

  .backdrop-blur {
    height: 100%;
    width: 100%;
    backdrop-filter: blur(0.1rem);
  }

  .hero-content {
    z-index: 10;
  }

  svg text {
    font-family: "Inter";
    letter-spacing: 10px;
    fill: linear-gradient(to top, #30cfd0 0%, #330867 100%);
    stroke: var(--color-7);
    letter-spacing: 0.1em;
    stroke-width: 4;
    filter: drop-shadow(0px 3px 3px rgba(0, 0, 0, 1));
    animation: textAnimate 10s cubic-bezier(0.86, 0, 0.07, 1) alternate;
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
      fill: var(--color-7);
    }
  }
</style>
