const headers = ['시간', '계정', '유형', '이름', '심각도', '제목', '설명', 'ip 주소']; // 헤더(열 이름) 배열 정의

const awsData = [{"schemaVersion":"2.0","accountId":"944697335072","region":"us-east-1","partition":"aws","id":"24c432a0934a7dc7dcc838171813277a","arn":"arn:aws:guardduty:us-east-1:944697335072:detector/8ec4112177d98dd3e09397321135caea/finding/24c432a0934a7dc7dcc838171813277a","type":"Policy:IAMUser/RootCredentialUsage","resource":{"resourceType":"AccessKey","accessKeyDetails":{"accessKeyId":"ASIA5X5CZLUQGWWD3ZGU","principalId":"944697335072","userType":"Root","userName":"Root"}},"service":{"serviceName":"guardduty","detectorId":"8ec4112177d98dd3e09397321135caea","action":{"actionType":"AWS_API_CALL","awsApiCallAction":{"api":"DescribeSubscribersForNotification","serviceName":"budgets.amazonaws.com","callerType":"Remote IP","remoteIpDetails":{"ipAddressV4":"175.120.35.227","organization":{"asn":"9318","asnOrg":"SK Broadband Co Ltd","isp":"SK Broadband","org":"SK Broadband"},"country":{"countryName":"South Korea"},"city":{"cityName":"Dobong-gu"},"geoLocation":{"lat":37.6474,"lon":127.0245}},"affectedResources":{}}},"resourceRole":"TARGET","additionalInfo":{"value":"{}","type":"default"},"eventFirstSeen":"2023-05-29T01:59:45.000Z","eventLastSeen":"2023-06-07T01:41:10.000Z","archived":false,"count":35},"severity":2,"createdAt":"2023-05-29T02:05:48.564Z","updatedAt":"2023-06-07T01:47:21.652Z","title":"API DescribeSubscribersForNotification was invoked using root credentials.","description":"API DescribeSubscribersForNotification was invoked using root credentials from IP address 175.120.35.227."}
]; //AWS로부터 받은 jsonData

function parsingData(i){
  var dataList = {
    time:awsData[i].createdAt,
    account : awsData[i].accountId,
    type : awsData[i].type,
    name : awsData[i].service.action.actionType,
    severity : awsData[i].severity,
    title : awsData[i].title,
    desc : awsData[i].description,
    //ipAddress : ipAddressParsing(i)
  };
  
    return dataList;
}

function ipAddressParsing(i) {
  const x = awsData[i].service.action;
  if (x[i].hasOwnproperty('NetworkConnectionAction')){   //네트워크커넥션액션
    return awsData[i].service.action.NetworkConnectionAction.RemoteIpDetails.IpAddressV4;
  }
  else if (x[i].hasOwnproperty('AwsApiCallAction')){ //API Call 액션
    return awsData[i].service.action.AwsApiCallAction.RemoteIpDetails.IpAddressV4;
  }
  else if (x[i].hasOwnproperty('PortProbeAction')){ //Port 프로브 액션
    return awsData[i].service.action.PortProbeAction.PortProbeDetails.RemoteIpDetails.IpAddressV4;
  }
  else if (x[i].hasOwnproperty('KubernetesApiCallAction')){ //쿠버네티스 API Call 액션
    return awsData[i].service.action.KubernetesApiCallAction.RemoteIpDetails.IpAddressV4;
  }
  else if (x[i].hasOwnproperty('RdsLoginAttemptAction')){ //RdsLogin 액션
    return awsData[i].service.action.RdsLoginAttemptAction.RemoteIpDetails.IpAddressV4;
  }
  else {
    return 'Data 없음';
  }

}
/*
const data = [
  {'time' : dataList.time, 'account' : dataList.account, 'type' : dataList.type, 'name' : dataList.name , 'severity' : dataList.severity, 'title' : dataList.title, 'description' : dataList.desc, 'ipAddress' : dataList.ipAddress}
];
*/
function downloadCSV(data, filename) {
  const csv = convertToCSV(data);
  const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  // 파일 다운로드 링크 생성
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(csvData);
  downloadLink.setAttribute('download', filename);
  downloadLink.click();
}

function toDOM(row) {
    var tr = "";
    tr += "<tr>";
    tr += "  <td>" + row.time + "</td>";
    tr += "  <td>" + row.type + "</td>";
    tr += "  <td>" + row.name + "</td>";
    tr += "  <td>" + row.desc + "</td>";
    tr += "  <td>" + row.severity + "</td>";
    tr += "</tr>";
    return tr;
}
function renderTable(id, dataList) {
    var size = dataList.length;
    var trList = "";
    for (var i = 0; i < size; i++) {
    trList += toDOM(parsingData(i));
    }
    document.querySelector("#" + id + " tbody").innerHTML = trList;
    }

window.onload = function getTable() {
    renderTable("table", awsData);
};

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