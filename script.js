window.onload = startRoutine;
const days = new Map();
days.set(0, 'Sunday');
days.set(1, 'Monday');
days.set(2, 'Tuesday');
days.set(3, 'Wednesday');
days.set(4, 'Thursday');
days.set(5, 'Friday');
days.set(6, 'Saturday');

const months = new Map();
months.set(0, 'January');
months.set(1, 'February');
months.set(2, 'March');
months.set(3, 'April');
months.set(4, 'May');
months.set(5, 'June');
months.set(6, 'July');
months.set(7, 'August');
months.set(8, 'September');
months.set(9, 'October');
months.set(10, 'November');
months.set(11, 'December');

let latestPos;
let currentPositionMap;
let distanceMap;

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function startRoutine(){
    updateTime();
    updatePosition();
}

function updateTime(){
    let currentTime = new Date();
    let date = currentTime.getDate();
    let day = currentTime.getDay();
    let month = currentTime.getMonth();
    let completeDay = days.get(day) + " " + date + ", " + months.get(month);

    let completeTime = currentTime.toTimeString().substring(0,8);

    document.getElementById("date").innerHTML = completeDay;
    document.getElementById("time").innerHTML = completeTime;

    setTimeout('updateTime()', 1000);
}

function updatePosition(){
    navigator.geolocation.getCurrentPosition(GcpSuccess);
}

function GcpSuccess(pos){
    const position = pos.coords;

    document.getElementById("latitude").innerHTML = "Latitude: " + position.latitude;
    document.getElementById("longitude").innerHTML = "Longitude: " + position.longitude;
    document.getElementById("accuracy").innerHTML = "Accuracy: ±" + Math.round(position.accuracy) + " meters.";

    let timestamp = new Date(pos.timestamp);
    document.getElementById("posTimestamp").innerHTML = ' at ' + timestamp.toString();

    latestPos = pos.coords;
    updateMap(pos.coords);
}

function updateMap(pos){
    if(currentPositionMap != undefined){
        currentPositionMap.remove();
    }

    currentPositionMap = L.map('map').setView([pos.latitude, pos.longitude], 14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(currentPositionMap);
    L.marker([pos.latitude, pos.longitude]).addTo(currentPositionMap);
}

function calculateDistance(){
    let lat1 = latestPos.latitude;
    let lon1 = latestPos.longitude;
    
    let lat2 = Number(document.getElementById("latitudeInput").value);
    let lon2 = Number(document.getElementById("longitudeInput").value);

    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres

    const λ1 = lon1 * Math.PI/180;
    const λ2 = lon2 * Math.PI/180;

    const y = Math.sin(λ2-λ1) * Math.cos(φ2); // start of bearing calculation
    const x = Math.cos(φ1)*Math.sin(φ2) -
            Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1);
    const θ = Math.atan2(y, x);
    const bearing = (θ*180/Math.PI + 360) % 360; // in degrees

    let distancePar;
    let bearingPar;

    if(document.getElementById("distancetoWP") == null){
        distancePar = document.createElement("p");
        distancePar.setAttribute('class', 'container my-3');
        distancePar.setAttribute('id', 'distancetoWP');
    }
    else{
        distancePar = document.getElementById("distancetoWP");
    }

    if(document.getElementById("bearingtoWP") == null){
        bearingPar = document.createElement("p");
        bearingPar.setAttribute('class', 'container my-3');
        bearingPar.setAttribute('id', 'bearingtoWP');
    }
    else{
        bearingPar = document.getElementById("bearingtoWP");
    }

    distancePar.textContent = "Distance to Point: " + numberWithCommas(Math.round(d)) + " meters.";
    bearingPar.textContent = "Initial heading: " + String(Math.round(bearing)) + "°";

    let parentDiv = document.getElementById("distanceCalculator");
    parentDiv.appendChild(distancePar);
    parentDiv.appendChild(bearingPar);

    if(document.getElementById("distanceMap") == null){
        let distanceMapParent = document.createElement("div");
        distanceMapParent.setAttribute("class", "container my-3 d-flex justify-content-center");

        parentDiv.appendChild(distanceMapParent);
        
        let distanceMapDiv = document.createElement("div");
        distanceMapDiv.setAttribute("id", "distanceMap");
        distanceMapDiv.setAttribute("style", "height: 300px; width: 90%;");

        distanceMapParent.appendChild(distanceMapDiv);
    }

    const lat3 = (lat2 + lat1)/2;
    const lon3 = (lon2 + lon1)/2;

    if(distanceMap != null){
        distanceMap.remove();
    }

    let zoomLevel = 14 - Math.ceil(Math.log2(Math.round(d)/1000));
    if(zoomLevel <= 0) zoomLevel = 1;
    console.log(zoomLevel);

    distanceMap = L.map('distanceMap').setView([lat3, lon3], zoomLevel);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 14,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(distanceMap);
    L.marker([lat1, lon1]).addTo(distanceMap);
    L.marker([lat2, lon2]).addTo(distanceMap);
}


