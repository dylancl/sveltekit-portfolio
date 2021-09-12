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
            link: "https://www.linkedin.com/in/dylan-cathelijn-00551214b/",
            icon: "icons/linkedin.svg",
            name: "LinkedIn",
            alt: "LinkedIn",
        },
        {
            link: "mailto:dylan_cathelyn@hotmail.be",
            icon: "icons/email.svg",
            name: "Email",
            alt: "Email",
        },
    ];

    import HALO from "vanta/dist/vanta.halo.min.js";
    onMount(() => {
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
            backgroundColor: 0x0,
            xOffset: 0.6,
            yOffset: -0.31,
            size: 3.0,
        });
    });
</script>

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
    <div class="test flex justify-center items-center">
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
                        <tspan x="0" y="90%">Cathelijn</tspan>
                    </text>
                </svg>
                <p
                    class="text-left text-lg uppercase text-white font-bold prose md:ml-4"
                >
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

    .test {
        height: 100%;
        width: 100%;
        backdrop-filter: blur(1rem);
    }

    .vanta {
        z-index: -10;
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
        animation: textAnimate 10s ease-in-out alternate;
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
