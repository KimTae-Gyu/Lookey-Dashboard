const currentURL = window.location.href;
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has('id')) {
    const form = document.getElementById('controlForm');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const alarmId = urlParams.get('id');

        const ruleData = {
          protocol: formData.get('protocol'),
          sourcePort: formData.get('sourcePort'),
          source: formData.get('source'),
          direction: formData.get('direction'),
          destPort: formData.get('destPort'),
          dest: formData.get('dest'),
          action: formData.get('action'),
          alarmId: alarmId
        };
        
        fetch('http://52.6.101.20:3000/control/nfw', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(ruleData)
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('제어 post result: ', data);
          })
          .catch((error) => {
            console.error(error.message);
          });
  });      
}