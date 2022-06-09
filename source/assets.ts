import { Preload } from "@drk4/utilities";

const PRELOAD = new Preload();

const BASE_URL = "";
const MANIFEST = [
    { id: "easy", path: BASE_URL + "maps/easy.json" },
    { id: "medium", path: BASE_URL + "maps/medium.json" },
    { id: "hard", path: BASE_URL + "maps/hard.json" },
    { id: "creep", path: BASE_URL + "images/creep.png" },
    { id: "creep_slow", path: BASE_URL + "images/creep_slow.png" },
    { id: "creep_group", path: BASE_URL + "images/creep_group.png" },
    { id: "creep_fast", path: BASE_URL + "images/creep_fast.png" },
    { id: "creep_fast_slow", path: BASE_URL + "images/creep_fast_slow.png" },
    { id: "creep_fly", path: BASE_URL + "images/creep_fly.png" },
    { id: "creep_fly_slow", path: BASE_URL + "images/creep_fly_slow.png" },
    { id: "creep_spawn", path: BASE_URL + "images/creep_spawn.png" },
    {
        id: "creep_spawn_slow",
        path: BASE_URL + "images/creep_spawn_slow.png",
    },
    { id: "creep_spawned", path: BASE_URL + "images/creep_spawned.png" },
    {
        id: "creep_spawned_slow",
        path: BASE_URL + "images/creep_spawned_slow.png",
    },
    { id: "creep_immune", path: BASE_URL + "images/creep_immune.png" },
    { id: "tower_base0", path: BASE_URL + "images/tower_base0.png" },
    { id: "tower_base1", path: BASE_URL + "images/tower_base1.png" },
    { id: "tower_base2", path: BASE_URL + "images/tower_base2.png" },
    { id: "tower_basic", path: BASE_URL + "images/tower_basic.png" },
    { id: "tower_fast", path: BASE_URL + "images/tower_fast.png" },
    { id: "tower_rocket", path: BASE_URL + "images/tower_rocket.png" },
    { id: "tower_frost", path: BASE_URL + "images/tower_frost.png" },
    { id: "tower_anti_air", path: BASE_URL + "images/tower_anti_air.png" },
    { id: "tower_bash", path: BASE_URL + "images/tower_bash.png" },
    {
        id: "tower_bash_attack",
        path: BASE_URL + "images/tower_bash_attack.png",
    },
    { id: "bullet", path: BASE_URL + "images/bullet.png" },
    { id: "highlight", path: BASE_URL + "images/highlight.png" },
    {
        id: "highlight_not_available",
        path: BASE_URL + "images/highlight_not_available.png",
    },
];

interface PreloadAssetsArgs {
    onProgress: (progress: number) => void;
    onComplete: () => void;
}

export function preloadAssets(args: PreloadAssetsArgs) {
    PRELOAD.addEventListener("progress", args.onProgress);
    PRELOAD.addEventListener("complete", args.onComplete);
    PRELOAD.loadManifest(MANIFEST);
}

export function getAsset(id: string) {
    return PRELOAD.get(id);
}
