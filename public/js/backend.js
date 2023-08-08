function ClanMapBackend() {
    this.getMapList = async function() {
        const request = new Request('api/maps', {
            method: "GET",
        });
    
        const response = await fetch(request);
        const data = await response.json();
        return data;
    }
    
    this.getClanInfo = async function(mapId) {
        const request = new Request(`api/clans/${mapId}`, {
            method: "GET",
        });
    
        const response = await fetch(request);
        const data = await response.json();
        return data;
    }    
}

