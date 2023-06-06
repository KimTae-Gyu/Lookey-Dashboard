var alarmData = [{'timestamp':'20230606-101623'},];
const doc = document.getElementById('list-ul');

for(i=0;i<alarmData.length;i++){
  const newList = document.createElement('li');
  newList.setAttribute('class', 'inList');

  const labelInput = document.createElement('label');

  const input = document.createElement('input');
  input.setAttribute('type', 'radio');
  input.setAttribute('name', 'alarm-check');
  input.setAttribute('value', 'alarm-check');
  input.setAttribute('aria-label',"download-form")

  var timeLabel = alarmData[i].timestamp;
  var textNode = document.createTextNode(timeLabel);

  labelInput.appendChild(input);
  labelInput.appendChild(textNode);
  newList.appendChild(labelInput);
  
  doc.appendChild(newList);
}

/*
addList()
  .then(()=>{  
  })
  .catch((error)=>{
    console.error('작업 중 이상 발생')
  })
*/
/*
addList()
  .then(()=>{
    
  })
  .catch((error)=>{
    console.error('작업 중 이상 발생')
  })

  doc.appendChild('list-ul')=`<input type="radio" name="alarm-check" value="alarm-check">${alarmData[i]}</input></li>`;
*/