// 차트 렌더링 함수
function renderChart() {
  // 차트에서 사용될 색깔 정의
  const backColor = [
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
  ];
  // 1번째 차트 => NFW => IP ** NFW 그룹 바이한 결과를 서버에 요청해서 받는 코드 작성해야함.
  // 서버에 NFW 그룹 바이한 결과를 요청해서 받아오는 코드
  const firstValue = [50,60,70,80,90,100,110,120]; //ALL영역에서 차단 IP개수를 넣기 -> group by
  const firstLabel = [7,8,8,9,9,9,10,11]; //차단된 IP이름을 넣고
  const firstLogChart = document.getElementById('firstLogChart');

  new Chart(firstLogChart, {
    type: 'doughnut',
    data:{
      labels : firstLabel,
      datasets:[
        {
          label : 'IP',
          data : firstValue.sort(),
          backgroundColor : backColor,
          hoverOffset : 4
          }]
        },
        options :{
          legend : {
            display : true,
            position : 'right',
            align :'start',
            fullWidth : false,
          },
          responsive : false
        }
    });
  // fetch('http://localhost:3000/log/nfwChart')
  //   .then(data => {
      
  //   })
  //   .catch(error => {
  //     console.error('MainPage NFW Chart Error: ', error);
  //   });

  // 서버에 WAF 그룹 바이한 결과를 요청해서 받아오는 코드
  fetch('http://localhost:3000/log/waf/chart')
    .then(response => response.json())
    .then(data => {
      const secondValue = [];
      const secondLabel = [];
      console.log(data.body);
      data.forEach(wafRuleSet => {
        secondValue.push(wafRuleSet.count);
        secondLabel.push(wafRuleSet._id);
      });
      // // 2번째 차트 => WAF => Rule Set
      // const secondValue = [50,60,70,80,90,100,110,120]; // 룰셋 별 막은 횟수 -> group by 해야될듯?
      // const secondLabel = [7,8,8,9,9,9,10,11]; // 차단 룰셋 이름      
      const secondLogChart = document.getElementById('secondLogChart');

      new Chart(secondLogChart, {
      type: 'doughnut',
      data:{
        labels : secondLabel,
        datasets:[
          {
            label : 'RuleSet',
            data : secondValue,
            backgroundColor :backColor,
            hoverOffset : 4
            }]
          },
          options :{
            legend : {
              display : true,
              position : 'right',
              align :'start',
              fullWidth : false,
            },
            responsive : false
          }
          });
    })
    .catch(error => {
      console.error('MainPage WAF Chart Error: ', error);
    });
}
renderChart();

// GuardDuty    
const high = document.getElementById('high');
const mid = document.getElementById('mid');
const low = document.getElementById('low');

var dataGd = {
  test1 : 1,
  test2 : 2,
  severity : 3
}

function severityData(dataGd){
  var highGradeNum, midGradeNum, lowGradeNum = 0;
  var gradeData = { 'high' : highGradeNum, 'mid':midGradeNum, 'low':lowGradeNum};
  if (dataGd.severity > 6.9 && dataGd.severity < 9.0){
    highGradeNum = highGradeNum + 1;
    return gradeData['high'];
  }
  else if (dataGd.severity > 3.9 && dataGd.severity < 7.0){
    midGradeNum = midGradeNum + 1;
    return gradeData['mid'];
  }
  else if (dataGd.severity> 0.9 && dataGd.severity < 4.0){
    lowGradeNum = lowGradeNum +1;
    return gradeData['low'];
  }

  high.innerHTML = gradeData['high'];
  mid.innerHTML = gradeData['mid'];
  low.innerHTML = gradeData['low'];
}

severityData(dataGd);

function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 2,
    center: { lat: 37, lng: 150 },
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

window.renderChart = renderChart;

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

  