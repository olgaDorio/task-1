import { initMap } from "./map.js";

ymaps.ready(() => {
  initMap(ymaps, "map");
  console.log("inited");
});
