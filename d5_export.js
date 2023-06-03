function loadCheck(){
    console.log('로딩 완료');
    processMainHtml();
    }


function downloadFile() {
    console.log('download를 위한 버튼 클릭');
    loadCheck();
  }
  
function captureHTML(element){
    //const element = document.querySelector(captureX);
    console.log('캡처 HTML 실행');

    html2canvas(element, { //여기서 문제 발생
        useCORS: true,
            onrendered: function(canvas) {
                var dataUrl= canvas.toDataURL("image/png"); 
                document.write('<img src="' + dataUrl + '"/>');
            }
        })
      .then(canvas => {
        // 캡처된 이미지를 Data URL로 변환
        const imageData = canvas.toDataURL('image/jpg');
        
        // Data URL을 Blob으로 변환
        const blob = dataURLtoBlob(imageData);
        
        // 파일 생성
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        
        // 파일 다운로드 링크 생성
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(file);
        downloadLink.download = 'image.jpg';
        downloadLink.click();
        
        // 링크 해제
        URL.revokeObjectURL(downloadLink.href);
      })
      .catch(error => {
        console.error('이미지 캡처 중 오류 발생:', error);
      });
}

  // Data URL을 Blob으로 변환하는 함수 - 성공
function dataURLtoBlob(dataURL) {
    const byteString = atob(dataURL.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
    return blob;
  }
// main.html 파일을 가져오는 함수 - 성공
function fetchMainHtml() {
    return fetch('/d2_main.html')
      .then(response => response.text())
      .catch(error => {
        console.error('main.html 가져오기 실패:', error);
      });
  }
  
  // main.html 파일을 가져와서 요소를 사용하는 함수 - 성공
  function processMainHtml() {
    fetchMainHtml()
      .then(html => {
        // 가져온 HTML 문자열을 파싱하여 DOM 요소로 변환
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        // 원하는 요소를 선택하고 작업을 수행
        const element = doc.querySelector('#reportImg');
        //확인 완료된 사항 - console.log("element:", element);
        if (element) {
          console.log('reportImg 요소를 찾았습니다:', element);
          // 요소와 함께 작업을 수행하면 됩니다.
          captureHTML(element);
        } else {
          console.error('reportImg 요소를 찾을 수 없습니다.');
        }
      })
      .catch(error => {
        console.error('main.html 처리 중 오류 발생:', error);
      });
  }