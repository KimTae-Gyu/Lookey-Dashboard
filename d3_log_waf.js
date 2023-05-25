data={
    "timestamp": 1684825816966,
    "formatVersion": 1,
    "webaclId": "arn:aws:wafv2:us-east-1:944697335072:regional/webacl/cloudmonitoring-waf/8acf338d-9594-449d-b99a-f4e88a4cbac5",
    "terminatingRuleId": "AWS-AWSManagedRulesAnonymousIpList",
    "terminatingRuleType": "MANAGED_RULE_GROUP",
    "action": "BLOCK",
    "terminatingRuleMatchDetails": [],
    "httpSourceName": "ALB",
    "httpSourceId": "944697335072-app/alb/1e3b6eac51c9c245",
    "ruleGroupList": [
      {
        "ruleGroupId": "AWS#AWSManagedRulesCommonRuleSet",
        "terminatingRule": null,
        "nonTerminatingMatchingRules": [],
        "excludedRules": null,
        "customerConfig": null
      },
      {
        "ruleGroupId": "AWS#AWSManagedRulesAnonymousIpList",
        "terminatingRule": {
          "ruleId": "HostingProviderIPList",
          "action": "BLOCK",
          "ruleMatchDetails": null
        },
        "nonTerminatingMatchingRules": [],
        "excludedRules": null,
        "customerConfig": null
      }
    ],
    "rateBasedRuleList": [],
    "nonTerminatingMatchingRules": [],
    "requestHeadersInserted": null,
    "responseCodeSent": null,
    "httpRequest": {
      "clientIp": "185.254.196.186",
      "country": "US",
      "headers": [
        {
          "name": "Host",
          "value": "52.54.199.152"
        },
        {
          "name": "User-agent",
          "value": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36"
        },
        {
          "name": "Accept-Encoding",
          "value": "gzip, deflate"
        },
        {
          "name": "Accept",
          "value": "*/*"
        },
        {
          "name": "Connection",
          "value": "keep-alive"
        }
      ],
      "uri": "/.env",
      "args": "REDACTED",
      "httpVersion": "HTTP/1.1",
      "httpMethod": "GET",
      "requestId": "1-646c66d8-23174f95617bd0c633b81f3a"
    },
    "labels": [
      {
        "name": "awswaf:managed:aws:anonymous-ip-list:HostingProviderIPList"
      }
    ]
  }
  /*
function dataList(){
    timeData = data.timestamp;
    ruleSet = data.labels.name;
    act = data.action;
    sourceID = data.httpSourceId;
    ipData = data.httpRequest.clientIp;
    ipCountry = data.httpRequest.country;
}*/
/*
function dataEdit(){
    let lastName = "";
    dataName = data.labels.name;
    for(let i = 0; i<dataName.length; i++){
        if(dataName=='-'){
            console.log(i);
            console.log(lastName);
        }
        else{
            lastName = lastName+data.lables.name[i];
            console.log(lastName);
        }
    }
    document.write(lastName) ;

    return 0;
}
*/
const options = {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
};

const dataTime = new Date(data.timestamp)
const utcDate = dataTime.toUTCString();
const koreaTime = dataTime.toLocaleString('en-US',options);


var serverData = [
    {
        timeData: koreaTime,
        ruleSet: data.labels[0].name,
        act : data.action,
        sourceID : data.httpSourceId,
        ipData : data.httpRequest.clientIp,
        ipCountry : data.httpRequest.country}
]

function toDOM(row) {
    var tr = "";
    tr += "<tr>";
    tr += "  <td>" + row.timeData + "</td>";
    tr += "  <td>" + row.ruleSet + "</td>";
    tr += "  <td>" + row.act + "</td>";
    tr += "  <td>" + row.sourceID + "</td>";
    tr += "  <td>" + row.ipData + "</td>";
    tr += "  <td>" + row.ipCountry + "</td>";
    tr += "</tr>";
    return tr;
}
function renderTable(id, dataList) {
    var size = dataList.length;
    var trList = "";
    for (var i = 0; i < size; i++) {
    trList += toDOM(dataList[i]);
    }
    document.querySelector("#" + id + " tbody").innerHTML = trList;
    }

window.onload = function getTable() {
    renderTable("table", serverData);
};