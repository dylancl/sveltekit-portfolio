<div class="hero min-h-screen bg-base-200">
    <div class="text-center hero-content w-full">
        <div class="w-full">
            <svg>
                <text x="0" y="0" fill="#3f37c9ff">
                    <tspan x="0" y="40%">Dylan</tspan>
                    <tspan x="0" y="90%">Cathelijn</tspan>
                </text>
            </svg>
            <p class="text-left text-lg uppercase text-white font-bold prose ml-4">
                full-stack developer based in Belgium
            </p>
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
        background-color: #080808;
        opacity: 1;
        background-image: repeating-radial-gradient(
                circle at 0 0,
                transparent 0,
                #080808 40px
            ),
            repeating-linear-gradient(#11111155, #111111);
    }

    svg {
        width: 100%;
        height: 25rem;
    }

    svg text {
        font-family: 'Inter';
        letter-spacing: 10px;
        fill: linear-gradient(to top, #30cfd0 0%, #330867 100%);
        stroke: var(--color-7);
        font-size: 10vw;
        font-weight: 700;
        stroke-width: 4;
        box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
        animation: textAnimate 10s ease-in-out;
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
