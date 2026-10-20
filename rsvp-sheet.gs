var HEADERS = ["Time", "Name", "Answer", "People", "Contact"];

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  var data = {};
  try {
    data = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : "{}");
  } catch (err) {
    data = e.parameter || {};
  }
  sheet.appendRow([
    new Date(),
    data.name || "",
    data.answer || "",
    data.people === 0 ? 0 : (data.people || ""),
    data.contact || ""
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
