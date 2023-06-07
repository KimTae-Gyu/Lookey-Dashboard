var alarmData = [{'timestamp':'20230606-101623'},];
const doc = document.getElementById('list-ul');

for(i=0;i<alarmData.length;i++){
  const newList = document.createElement('li');
  newList.setAttribute('class', 'inList');

  const labelInput = document.createElement('label');

  const input = document.createElement('input');
  input.setAttribute('type', 'radio');
  input.setAttribute('name', 'alarmCheck');
  input.setAttribute('value', 'alarmCheck');
  input.setAttribute('aria-label',"download-form");

  var timeLabel = alarmData[i].timestamp;
  var textNode = document.createTextNode(timeLabel);

  labelInput.appendChild(input);
  labelInput.appendChild(textNode);
  newList.appendChild(labelInput);
  
  doc.appendChild(newList);
}

document.getElementById('my-form').addEventListener('submit', function(event){
  event.preventDefault();

  const formData = new FormData(event.target);

  const jsonFormData = {};
  for (const [key, value] of formData.entries()){
    jsonFormData[key] = value;
  }

  console.log("전송할 데이터:", jsonFormData);

// 클라이언트에서 Flask로 데이터 전송 (예: 버튼 클릭 시)
fetch('http://localhost:5000/sendData', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(jsonFormData)
})
.then(response => response.json())
.then(data => {
  console.log(data);
  if (data.success) {
    linkLoc = document.getElementById("thisLink");
          const downloadLink = data.downloadLink;
          console.log('다운로드 링크:', downloadLink);
          const downloadButton = document.createElement('a');
          downloadButton.href = downloadLink;
          downloadButton.textContent = 'Download File';
          linkLoc.appendChild(downloadButton);
        } else {
          console.log('파일 링크를 받아오는데 실패했습니다:', data.error);
        }
      })
      .catch(error => {
        console.error('파일 링크 요청 중 오류 발생:', error);
      });
})