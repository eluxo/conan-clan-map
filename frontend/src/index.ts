import { MapController } from "./map";

MapController.create().then((controller: MapController) => {
    const params = new URLSearchParams(window.location.search);
    const mapId = params.get("map") || undefined;

    var mapInfo = controller.getMapById(mapId);
    if (!mapInfo) {
        mapInfo = controller.getMapByIndex(0);
    }
    if (!mapInfo) throw new Error('failed to find valid map instance to load');
    
    const clanMap = controller.createMap(mapInfo);
    clanMap.update();
});

