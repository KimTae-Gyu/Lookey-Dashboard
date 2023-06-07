const currentURL = window.location.href;
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has('id')) {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const ruleData = {
          protocol: formData.get('protocol'),
          sourcePort: formData.get('sourcePort'),
          sourceIP: formData.get('source'),
          direction: formData.get('direction'),
          destPort: formData.get('destPort'),
          destIP: formData.get('dest'),
          action: formData.get('action'),
        };
      
        try {
          const alarmResponse = await fetch(`http://52.6.101.20:3000/alarmAction?id=${alarmId}`);
          const alarmResult = await alarmResponse.json();
      
          const controlResponse = await fetch('http://52.6.101.20:3000/control/nfw', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(ruleData),
          });
      
          if (controlResponse.ok) {
            const controlResult = await controlResponse.json();
            console.log(controlResult);
          } else {
            throw new Error('POST 요청이 실패했습니다.');
          }
        } catch (error) {
          console.error(error);
        }
  });      
}