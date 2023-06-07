let modalFlag = false;

function showModal(alarmData) {
	if (modalFlag === false) {
	// 모달 요소 가져오기
		const modalContainer = document.getElementById('modalContainer');
		const modalMessage = document.getElementById('modalMessage');
		const modalCloseButton = document.getElementById('modalCloseButton');
		const modalActionButton = document.getElementById('modalActionButton');
		
		modalFlag = true;
		// // 모달 내용 설정
		modalMessage.textContent = alarmData.message;

		// 모달 보이기
		modalContainer.style.display = 'block';
		

		// 대응 버튼 클릭 이벤트 핸들러
		modalActionButton.addEventListener('click', () => {		
		// 모달 숨기기
		modalContainer.style.display = 'none';
			modalFlag = false;
			window.location.href = `http://52.6.101.20:3000/control/nfw?id=${alarmData.alarmId}`;
		});

		// 닫기 버튼 클릭 이벤트 핸들러
		modalCloseButton.addEventListener('click', () => {
			modalFlag = false;
			// 모달 숨기기
			modalContainer.style.display = 'none';
		});
	}
}

// -----------------------------------------------------------------------------

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

// NFW Chart Data List
const firstValue = []; //ALL영역에서 차단 IP개수를 넣기 -> group by
const firstLabel = []; //차단된 IP이름을 넣고

// IP 리스트, 위도 경도 리스트
const ipList = [];
const locations = [];
const timestamps = [];

// NFW Render에 사용될 데이터를 할당하는 Promise 반환
function getNewNfwData() {
	return fetch('http://52.6.101.20:3000/log/nfw/groupBy')
		.then(response => response.json())
		.then(data => {
			firstValue.splice(0, firstValue.length);
			firstLabel.splice(0, firstLabel.length);
			ipList.splice(0, ipList.length);
			locations.splice(0, locations.length);
			timestamps.splice(0, timestamps.length);

			data.forEach(nfwLog => {
				firstValue.push(nfwLog.count);
				firstLabel.push(nfwLog._id);
				ipList.push(nfwLog._id);				
				timestamps.push(nfwLog.timestamps[0]);
			});
		})
		.catch(error => {
			console.error('getNewNFW Error: ', error.message);
		});
}

function renderNfwChart() {
	// 차트 1 => NFW	
	// 서버에 NFW 그룹 바이한 결과를 요청해서 받아오는 코드
	const firstLogChart = document.getElementById('firstLogChart');

	new Chart(firstLogChart, {
		type: 'doughnut',
		data: {
			labels: firstLabel,
			datasets: [
				{
					label: 'IP',
					data: firstValue,
					backgroundColor: backColor,
					hoverOffset: 4
				}]
		},
		options: {
			legend: {
				display: true,
				position: 'right',
				align: 'start',
				fullWidth: false,
			},
			responsive: false
		}
	});
}

// 지도 마커 찍는 부분 (위도 경도)
function initMap() {
	const map = new google.maps.Map(document.getElementById("map"), {
		zoom: 2,
		center: { lat: 37, lng: 150 },
		minZoom: 2
	});
	const infoWindow = new google.maps.InfoWindow({
		content: "",
		disableAutoPan: true,
	});
	// Create an array of alphabetical characters used to label the markers.
	const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	// Add some markers to the map.  
	const markers = locations.map((position, i) => {
		console.log('position: ', position);
		console.log('i: ', i);
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

// IP를 위도 경도로 바꾸는 함수
function getLocation(ip) {
	const apiUrl = `http://52.6.101.20:3000/geoip?ip=${ip}`; // 서버의 API 엔드포인트

	return fetch(apiUrl)
		.then(response => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error('Request failed. Status:', response.status);
			}
		})
		.then(data => {
			locations.push(data);
		})
		.catch(error => {
			console.error('Request failed:', error.message);
			throw error;
		});
}

function addTableMap() {
	const table = document.getElementById("map-table");
	const tbody = table.querySelector("tbody");
	const rowCount = tbody.rows.length;
	
	if (rowCount > 0) {		
		for(let i=0; i<rowCount; i++){
			table.deleteRow();
		}
	}

	for(let i=0; i<10; i++) {
		const newRow = tbody.insertRow(); // 새로운 행 생성
		const timeCell = newRow.insertCell();
		timeCell.textContent = timestamps[i];
		const countryCell = newRow.insertCell();
		countryCell.textContent = locations[i].country;
		const ipCell = newRow.insertCell();
		ipCell.textContent = ipList[i];
	}
}

async function renderNfwChartAndMap() {
	await getNewNfwData();
	renderNfwChart();
	await Promise.all(ipList.map(ip => getLocation(ip)));
	initMap();
	addTableMap();
}

//----------------------------------------------------------------------------------

// WAF 차트 렌더링 함수
async function renderWafChart() {
	// 차트 2 => WAF
	// 서버에 WAF 그룹 바이한 결과를 요청해서 받아오는 코드
	fetch('http://52.6.101.20:3000/log/waf/groupBy')
		.then(response => response.json())
		.then(data => {
			let secondValue = [];
			let secondLabel = [];
			let groupByList = []; // 룰셋 이름 (ex: CoreRuleSet)및 카운트를 가진 객체 배열
			let ruleSet;

			// split한 룰셋 이름 ex: coreRuleSet
			data.forEach(wafRuleSet => {
				ruleSet = wafRuleSet._id.name.split(':'); // CoreRuleSet:.... 이렇게 들어오고 있음. 따라서 룰셋 별로 가공해줘야함.
				const label = ruleSet[ruleSet.length - 2];
				// 룰셋별로 groupByList에 저장. 기존에 없으면 새로 추가 있으면 검출된 카운트 더해줌.
				foundRuleSet = groupByList.find(obj => obj.label === label);
				if (foundRuleSet) {
					foundRuleSet.count += wafRuleSet.count;
				} else {
					groupByList.push({ label: label, count: wafRuleSet.count });
				}
			});

			groupByList.forEach(wafRuleSet => {
				secondValue.push(wafRuleSet.count);
				secondLabel.push(wafRuleSet.label);
			});

			// // 2번째 차트 => WAF => Rule Set
			const secondLogChart = document.getElementById('secondLogChart');

			new Chart(secondLogChart, {
				type: 'doughnut',
				data: {
					labels: secondLabel,
					datasets: [
						{
							label: 'RuleSet',
							data: secondValue,
							backgroundColor: backColor,
							hoverOffset: 4
						}]
				},
				options: {
					legend: {
						display: true,
						position: 'right',
						align: 'start',
						fullWidth: false,
					},
					responsive: false
				}
			});
		})
		.catch(error => {
			console.error('MainPage WAF Chart Error: ', error);
		});
}

renderNfwChartAndMap();
renderWafChart();

// -----------------------------------------------------------------------------

// GuardDuty    
const high = document.getElementById('high');
const mid = document.getElementById('mid');
const low = document.getElementById('low');

var dataGd = {
	test1: 1,
	test2: 2,
	severity: 3
}

function severityData(dataGd) {
	var highGradeNum, midGradeNum, lowGradeNum = 0;
	var gradeData = { 'high': highGradeNum, 'mid': midGradeNum, 'low': lowGradeNum };
	if (dataGd.severity > 6.9 && dataGd.severity < 9.0) {
		highGradeNum = highGradeNum + 1;
		return gradeData['high'];
	}
	else if (dataGd.severity > 3.9 && dataGd.severity < 7.0) {
		midGradeNum = midGradeNum + 1;
		return gradeData['mid'];
	}
	else if (dataGd.severity > 0.9 && dataGd.severity < 4.0) {
		lowGradeNum = lowGradeNum + 1;
		return gradeData['low'];
	}

	high.innerHTML = gradeData['high'];
	mid.innerHTML = gradeData['mid'];
	low.innerHTML = gradeData['low'];
}

const fourthColor = [
	'rgba(255, 67, 67, 1)',
	'rgba(255, 150, 54, 1)',
	'rgba(0, 182, 228, 1)',
];

function testchart() {
	// 차트 1 => NFW	
	// 서버에 NFW 그룹 바이한 결과를 요청해서 받아오는 코드
	const fourthLogChart = document.getElementById('fourthLogChart');
	var fourthLabel =['high', 'mid', 'low'];
	var fourthValue = [10, 15, 20];

	new Chart(fourthLogChart, {
		type: 'horizontalBar',
		data: {
			labels: fourthLabel,
			datasets: [
				{
					label: '개수',
					data: fourthValue,
					backgroundColor: fourthColor,
					hoverOffset: 4
				}]
		},
		options: {
			legend: {
				display: true,
				position: 'bottom',
				align: 'start',
				fullWidth: false,
			},
			responsive: false,
			scales : {
				xAxes: [
					{
						ticks: {
							beginAtZero: true
						}
					}
				]
			}
		}
	});
}

testchart();
severityData(dataGd);

// -------------------------------------------------------------------------

window.renderNfwChartAndMap = renderNfwChartAndMap;
window.renderWafChart = renderWafChart;
window.showModal = showModal;

// -------------------------------------------------------------------------
