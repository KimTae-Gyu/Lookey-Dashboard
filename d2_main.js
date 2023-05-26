// 1번째 차트 => NFW => IP
const fitstValue = [50,60,70,80,90,100,110,120]; //ALL영역에서 차단 IP개수를 넣기 -> group by
const firstLabel = [7,8,8,9,9,9,10,11]; //차단된 IP이름을 넣고

// 2번째 차트 => WAF => Rule Set
const secondValue = [50,60,70,80,90,100,110,120]; // 룰셋 별 막은 횟수 -> group by 해야될듯?
const secondLabel = [7,8,8,9,9,9,10,11]; // 차단 룰셋 이름

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
        }
    }
);

const secondlog = new Chart("secondlog",{
    type: "doughnut",
    data: {
        labels: secondLabel,
          datasets: [{
            label: 'My First Dataset',
            data: secondValue,
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
        }
    }
);

function addMarker(latitude, longitude) {
  var map = L.map('map').setView([latitude, longitude], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);

  L.marker([latitude, longitude]).addTo(map);
}

function getLocation() {
    const url = `/location`;
  
    // API 요청 보내기
    fetch(url)
      .then(response => {
        if (response.ok) {
          //console.log(response.json())
          return response.json();
        } else {
          throw new Error('Request failed. Status:', response.status);
        }
      })
      .then(data => {
        const latitude = data.location.latitude;
        const longitude = data.location.longitude;
        //console.log(latitude); // 위도 조회
        //console.log(longitude); // 경도 조회
        addMarker(latitude, longitude); // 위도와 경도를 사용하여 마커 추가
        // TODO: 위도, 경도를 사용하여 리프레 맵에 마커를 찍는 등의 작업을 수행할 수 있습니다.
      })
      .catch(error => {
        console.error('Request failed:', error.message);
      });
  }
  
getLocation();

  