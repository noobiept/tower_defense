let PRELOAD: createjs.LoadQueue;

const BASE_URL = "";
const MANIFEST = [
    { id: "easy", src: BASE_URL + "maps/easy.json" },
    { id: "medium", src: BASE_URL + "maps/medium.json" },
    { id: "hard", src: BASE_URL + "maps/hard.json" },
    { id: "creep", src: BASE_URL + "images/creep.png" },
    { id: "creep_slow", src: BASE_URL + "images/creep_slow.png" },
    { id: "creep_group", src: BASE_URL + "images/creep_group.png" },
    { id: "creep_fast", src: BASE_URL + "images/creep_fast.png" },
    { id: "creep_fast_slow", src: BASE_URL + "images/creep_fast_slow.png" },
    { id: "creep_fly", src: BASE_URL + "images/creep_fly.png" },
    { id: "creep_fly_slow", src: BASE_URL + "images/creep_fly_slow.png" },
    { id: "creep_spawn", src: BASE_URL + "images/creep_spawn.png" },
    {
        id: "creep_spawn_slow",
        src: BASE_URL + "images/creep_spawn_slow.png",
    },
    { id: "creep_spawned", src: BASE_URL + "images/creep_spawned.png" },
    {
        id: "creep_spawned_slow",
        src: BASE_URL + "images/creep_spawned_slow.png",
    },
    { id: "creep_immune", src: BASE_URL + "images/creep_immune.png" },
    { id: "tower_base0", src: BASE_URL + "images/tower_base0.png" },
    { id: "tower_base1", src: BASE_URL + "images/tower_base1.png" },
    { id: "tower_base2", src: BASE_URL + "images/tower_base2.png" },
    { id: "tower_basic", src: BASE_URL + "images/tower_basic.png" },
    { id: "tower_fast", src: BASE_URL + "images/tower_fast.png" },
    { id: "tower_rocket", src: BASE_URL + "images/tower_rocket.png" },
    { id: "tower_frost", src: BASE_URL + "images/tower_frost.png" },
    { id: "tower_anti_air", src: BASE_URL + "images/tower_anti_air.png" },
    { id: "tower_bash", src: BASE_URL + "images/tower_bash.png" },
    {
        id: "tower_bash_attack",
        src: BASE_URL + "images/tower_bash_attack.png",
    },
    { id: "bullet", src: BASE_URL + "images/bullet.png" },
    { id: "highlight", src: BASE_URL + "images/highlight.png" },
    {
        id: "highlight_not_available",
        src: BASE_URL + "images/highlight_not_available.png",
    },
];

interface PreloadAssetsArgs {
    onProgress: (progress: number) => void;
    onComplete: () => void;
}

export function preloadAssets(args: PreloadAssetsArgs) {
    PRELOAD = new createjs.LoadQueue();

    PRELOAD.addEventListener("progress", (event) => {
        args.onProgress(((event as createjs.ProgressEvent).progress * 100) | 0);
    });
    PRELOAD.addEventListener("complete", args.onComplete);
    PRELOAD.loadManifest(MANIFEST, true);
}

export function getAsset(id: string) {
    return PRELOAD.getResult(id);
}
