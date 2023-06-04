const headers = ['시간', '계정', '유형', '이름', '심각도', '제목', '설명', 'ip 주소']; // 헤더(열 이름) 배열 정의

const awsData = 0; //AWS로부터 받은 jsonData

var dataList = {
  time:awsData.CreatedAt,
  account : awsData.AccountId,
  type : awsData.type,
  name : awsData.Service.Action.ActionType,
  severity : awsData.severity,
  title : awsData.Title,
  desc : awsData.Description,
  ipAddress : ipAddressParsing()};

function ipAddressParsing() {
  const x = awsData.Service.Action;
  if (x.hasOwnproperty('NetworkConnectionAction')){   //네트워크커넥션액션
    return awsData.Service.Action.NetworkConnectionAction.RemoteIpDetails.IpAddressV4;
  }
  else if (x.hasOwnproperty('AwsApiCallAction')){ //API Call 액션
    return awsData.Service.Action.AwsApiCallAction.RemoteIpDetails.IpAddressV4;
  }
  else if (x.hasOwnproperty('PortProbeAction')){ //Port 프로브 액션
    return awsData.Service.Action.PortProbeAction.PortProbeDetails.RemoteIpDetails.IpAddressV4;
  }
  else if (x.hasOwnproperty('KubernetesApiCallAction')){ //쿠버네티스 API Call 액션
    return awsData.Service.Action.KubernetesApiCallAction.RemoteIpDetails.IpAddressV4;
  }
  else if (x.hasOwnproperty('RdsLoginAttemptAction')){ //RdsLogin 액션
    return awsData.Service.Action.RdsLoginAttemptAction.RemoteIpDetails.IpAddressV4;
  }
  else {
    return 'Data 없음';
  }

}

// 데이터 예시
const data = [
  {'time' : dataList.time, 'account' : dataList.account, 'type' : dataList.type, 'name' : dataList.name , 'severity' : dataList.severity, 'title' : dataList.title, 'description' : dataList.desc, 'ipAddress' : dataList.ipAddress}
];

function downloadCSV(data, filename) {
  const csv = convertToCSV(data);
  const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  // 파일 다운로드 링크 생성
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(csvData);
  downloadLink.setAttribute('download', filename);
  downloadLink.click();
}

function convertToCSV(data) {
  const csvRows = [];

  // 헤더 생성
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(','));

  // 데이터 생성
  data.forEach(item => {
    const values = headers.map(header => {
      let fieldValue = item[header];

      // fieldValue 값이 문자열이 아닐 경우 빈 문자열로 초기화
      if (typeof fieldValue !== 'string' && fieldValue !== null && fieldValue !== undefined) {
        fieldValue = fieldValue ? fieldValue.toString() : '';
      }

      const escapedValue = fieldValue.replace(/"/g, '""');
      return `"${escapedValue}"`;
    });
    csvRows.push(values.join(','));
  });

  // CSV 문자열 반환
  return csvRows.join('\n');
}

// CSV 다운로드 실행
function runTest() {
  downloadCSV(data, 'guardDuty_data.csv');
}