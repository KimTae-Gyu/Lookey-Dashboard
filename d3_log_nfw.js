const headers = ['Name', 'Age', 'Email']; // 헤더(열 이름) 배열 정의

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

// 데이터 예시
const data = [
  { name: 'John Doe', age: 30, email: 'johndoe@example.com' },
  { name: 'Jane Smith', age: 25, email: 'janesmith@example.com' },
  // 추가 데이터...
];

// CSV 다운로드 실행
function runTest() {
  downloadCSV(data, 'output.csv');
}