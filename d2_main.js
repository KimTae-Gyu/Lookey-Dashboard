const fitstValue = [50,60,70,80,90,100,110,120]; //ALL영역에서 차단 IP개수를 넣기
const firstLabel = [7,8,8,9,9,9,10,11]; //차단된 IP이름을 넣고

const secondValue = [50,60,70,80,90,100,110,120];
const secondLabel = [7,8,8,9,9,9,10,11];

const firstlog = new Chart("firstlog",{
    type: "doughnut",
    data: {
        labels: firstLabel,
          datasets: [{
            label: 'My First Dataset',
            data: fitstValue,
            backgroundColor: [
                'rgba(255, 67, 67, 1)',
                'rgba(209, 51, 51, 1)',
                'rgba(0, 114, 198, 1)',
                'rgba(0, 182, 228, 1)',
                'rgba(0, 163, 0, 1)',
                'rgba(89, 197, 164, 1)',
                'rgba(218, 247, 235, 1)',
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)'
            ],
            hoverOffset: 4
          }]
        },
    options :{
      plugins: {
        legend:{
        position : 'right'
          }
        }
      }
    }
);

const secondlog = new Chart("secondlog",{
  type: "doughnut",
  data: {
      labels: firstLabel,
        datasets: [{
          label: 'My First Dataset',
          data: fitstValue,
          backgroundColor: [
              'rgba(255, 67, 67, 1)',
              'rgba(209, 51, 51, 1)',
              'rgba(0, 114, 198, 1)',
              'rgba(0, 182, 228, 1)',
              'rgba(0, 163, 0, 1)',
              'rgba(89, 197, 164, 1)',
              'rgba(218, 247, 235, 1)',
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)'
          ],
          hoverOffset: 4
        }]
      },
  overrides: {
    doughnut:{
      plugins: {
        legend:{
        position : 'right',
        fullWidth : false
                    }
                  }
              }
          }
  }
);

function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 2,
    center: { lat: 37, lng: 150 },
    minZoom: 2,
    restriction: {
      latLngBounds: {
        north: 90,
        south: -90,
        east: 240,
        west: 40,
      },
    },
  });
  const infoWindow = new google.maps.InfoWindow({
    content: "",
    disableAutoPan: true,
  });
  // Create an array of alphabetical characters used to label the markers.
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  // Add some markers to the map.
  const markers = locations.map((position, i) => {
    const label = labels[i % labels.length];
    const marker = new google.maps.Marker({
      position,
      label,
    });

    // markers can only be keyboard focusable when they have click listeners
    // open info window when marker is clicked
    marker.addListener("click", () => {
      infoWindow.setContent(label);
      infoWindow.open(map, marker);
    });
    return marker;
  });

  // Add a marker clusterer to manage the markers.
  new markerClusterer.MarkerClusterer({ map, markers });
  
}

const locations = [
  // Marker positions (json파일로 받아올 것)
  { lat: -31.56391, lng: 147.154312 },
  { lat: -33.718234, lng: 150.363181 },
  { lat: -33.727111, lng: 150.371124 },
  { lat: -33.848588, lng: 151.209834 },
  { lat: -33.851702, lng: 151.216968 },
  { lat: -34.671264, lng: 150.863657 },
  { lat: -35.304724, lng: 148.662905 },
  { lat: -36.817685, lng: 175.699196 },
  { lat: -36.828611, lng: 175.790222 },
  { lat: -37.75, lng: 145.116667 },
  { lat: -37.759859, lng: 145.128708 },
  { lat: -37.765015, lng: 145.133858 },
  { lat: -37.770104, lng: 145.143299 },
  { lat: -37.7737, lng: 145.145187 },
  { lat: -37.774785, lng: 145.137978 },
  { lat: -37.819616, lng: 144.968119 },
  { lat: -38.330766, lng: 144.695692 },
  { lat: -39.927193, lng: 175.053218 },
  { lat: -41.330162, lng: 174.865694 },
  { lat: -42.734358, lng: 147.439506 },
  { lat: -42.734358, lng: 147.501315 },
  { lat: -42.735258, lng: 147.438 },
  { lat: -43.999792, lng: 170.463352 },
];

initMap();


// 아이피 주소를 위,경도로 변환
// function getLocation() {
//     const url = `/location`;
  
//     // API 요청 보내기
//     fetch(url)
//       .then(response => {
//         if (response.ok) {
//           //console.log(response.json())
//           return response.json();
//         } else {
//           throw new Error('Request failed. Status:', response.status);
//         }
//       })
//       .then(data => {
//         const latitude = data.location.latitude;
//         const longitude = data.location.longitude;
//         //console.log(latitude); // 위도 조회
//         //console.log(longitude); // 경도 조회
//         addMarker(latitude, longitude); // 위도와 경도를 사용하여 마커 추가
//         // TODO: 위도, 경도를 사용하여 리프레 맵에 마커를 찍는 등의 작업을 수행할 수 있습니다.
//       })
//       .catch(error => {
//         console.error('Request failed:', error.message);
//       });
//   }
  
// getLocation();

  