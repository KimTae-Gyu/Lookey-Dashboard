//해당 파일 취합 후 삭제 부탁드립니다.

function downloadFile() {
    console.log('download를 위한 버튼 클릭');
    const element = document.querySelector('#reportImg');
    captureHTML(element);
  }
  
  function captureHTML(element){
    //const element = document.querySelector(captureX);
    console.log('캡처 HTML 실행');
    html2canvas(element, {
      useCORS: true,
          onrendered: function(canvas) {
              var dataUrl= canvas.toDataURL("image/png");
              // DO SOMETHING WITH THE DATAURL
              // Eg. write it to the page
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