var RAMIA_ACCESS = {
  emails: [],
  checkUrl: ""
};

function ramiaEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function ramiaAccessLocked() {
  return !!(RAMIA_ACCESS.checkUrl || (RAMIA_ACCESS.emails && RAMIA_ACCESS.emails.length));
}

function ramiaAccessHas(email) {
  var want = ramiaEmail(email);
  return (RAMIA_ACCESS.emails || []).some(function (item) {
    return ramiaEmail(item) === want;
  });
}

function ramiaJsonp(params) {
  var base = RAMIA_ACCESS.checkUrl;
  if (!base) return Promise.reject(new Error("no-endpoint"));
  return new Promise(function (resolve, reject) {
    var cb = "ramiaCb" + Date.now() + Math.floor(Math.random() * 1000);
    var script = document.createElement("script");
    var timer = setTimeout(function () { finish(new Error("timeout")); }, 10000);
    function finish(err, data) {
      clearTimeout(timer);
      try { delete window[cb]; } catch (e) { window[cb] = undefined; }
      if (script.parentNode) script.parentNode.removeChild(script);
      if (err) reject(err);
      else resolve(data || {});
    }
    window[cb] = function (data) { finish(null, data); };
    script.onerror = function () { finish(new Error("network")); };
    script.referrerPolicy = "no-referrer";
    var query = ["callback=" + cb];
    Object.keys(params).forEach(function (key) {
      if (params[key] == null || params[key] === "") return;
      query.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
    });
    script.src = base + (base.indexOf("?") === -1 ? "?" : "&") + query.join("&");
    document.head.appendChild(script);
  });
}

function ramiaAllowed(email) {
  var want = ramiaEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(want)) return Promise.resolve(false);
  if (ramiaAccessHas(want)) return Promise.resolve(true);
  if (!RAMIA_ACCESS.checkUrl) return Promise.resolve(!ramiaAccessLocked());
  return ramiaJsonp({ email: want }).then(function (data) {
    return !!(data && data.ok);
  });
}
