var serverData = [
    { time: 5465325, ruleSet: "룰셋", matchData: "2021-02-01", action: "Horong", level:10 },
  ];

function toDOM(row) {
    var tr = "";
    tr += "<tr>";
    tr += "  <td>" + row.time + "</td>";
    tr += "  <td>" + row.ruleSet + "</td>";
    tr += "  <td>" + row.level + "</td>";
    tr += "  <td>" + row.matchData + "</td>";
    tr += "  <td>" + row.action + "</td>";
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