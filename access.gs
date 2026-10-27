var GATE = "cc437fbc854e76247ad58a80a377907dcede4a3a00c5a35429f787fc5a0a928b";

function doGet(e) {
  var params = (e && e.parameter) || {};
  var result = params.grant == null || params.grant === ""
    ? { ok: allowed_(params.email) }
    : grant_(params.email, params.name, params.pass, params.grant === "0");
  var body = JSON.stringify(result);
  var callback = String(params.callback || "");
  if (/^ramiaCb\d+$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + "(" + body + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}

function allowed_(email) {
  email = normalize_(email);
  if (!email) return false;
  return onAccessSheet_(email);
}

function grant_(email, name, pass, remove) {
  if (sha256_(String(pass || "")) !== GATE) return { ok: false, error: "pass" };
  email = normalize_(email);
  if (!email || email.indexOf("@") === -1) return { ok: false, error: "email" };
  var sheet = accessSheet_();
  var rows = sheet.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (normalize_(rows[i][0]) !== email) continue;
    if (remove) sheet.deleteRow(i + 1);
    else return { ok: true, already: true };
    break;
  }
  if (!remove) sheet.appendRow([email, name || "", new Date()]);
  return { ok: true };
}

function onAccessSheet_(email) {
  var sheet = accessSheet_();
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (normalize_(rows[i][0]) === email) return true;
  }
  return false;
}

function accessSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Access");
  if (!sheet) {
    sheet = ss.insertSheet("Access");
    sheet.appendRow(["Email", "Name", "Added"]);
  }
  return sheet;
}

function normalize_(value) {
  return String(value || "").trim().toLowerCase();
}

function sha256_(text) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  var hex = "";
  for (var i = 0; i < raw.length; i++) {
    var b = raw[i];
    if (b < 0) b += 256;
    var h = b.toString(16);
    if (h.length === 1) hex += "0";
    hex += h;
  }
  return hex;
}
