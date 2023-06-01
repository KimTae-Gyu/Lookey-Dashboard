function downloadFile() {
  // 이미지로 캡처할 HTML 요소 선택
  //const element = document.querySelector('section'); //오류로 주석처리
  const element = document.body; //body요소들을 가져옴.

  // html2canvas를 사용하여 요소를 이미지로 캡처
  html2canvas(element)
    .then(canvas => {
      // 캡처된 이미지를 Data URL로 변환
      const imageData = canvas.toDataURL('image/jpg');

      // 이미지 데이터를 서버로 전송하여 다운로드
      fetch('http://127.0.0.1:3000/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'image/jpg'
        },
        body: imageData,
        mode: 'cors', // CORS를 허용하는 모드로 설정
        credentials: 'same-origin' // 동일 출처 요청을 위해 credentials를 same-origin으로 설정
      })
        .then(response => response.blob())
        .then(blob => {
          // 다운로드 링크 생성
          const downloadLink = document.createElement('a');
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = 'image.jpg';
          downloadLink.click();

          // 링크 해제
          URL.revokeObjectURL(downloadLink.href);
        })
        .catch(error => {
          console.error('이미지 다운로드 중 오류 발생:', error);
        });
    })
    .catch(error => {
      console.error('이미지 캡처 중 오류 발생:', error);
    });
}
