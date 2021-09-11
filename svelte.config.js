import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: [
        preprocess({
            postcss: true
        })
    ],
    kit: {
        // adapter: adapter({
        //     out: 'build',
        //     preprocess: true,
        //     env: {
        //         host: '0.0.0.0',
        //         port: '3010'
        //     }
        // }),
        adapter: adapter(),
        // hydrate the <div id="svelte"> element in src/app.html
        target: '#svelte'
    }
};

export default config;