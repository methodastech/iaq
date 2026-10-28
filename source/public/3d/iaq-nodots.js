/* 30 Sep 2026: IAQ copy carries no middle dots ("avoid dots or bullet in iaq"). The delivered bundle writes " · "
   between items in the stage lists, the step counter, the hover names and the door hint; this turns each one into a
   comma as the text lands, so the bundle stays exactly as delivered. It runs on this page by itself and inside the
   home page's frame. Re-check the list on the next delivery: a new string with a dot is caught here too. */
(function () {
  var HAS = /[·•]/, RX = /[  ]*[·•][  ]*/g
  function fixText (t) { if (HAS.test(t.nodeValue)) t.nodeValue = t.nodeValue.replace(RX, ', ') }
  function fix (n) {
    if (n.nodeType === 3) return fixText(n)
    if (n.nodeType !== 1 || n.nodeName === 'SCRIPT' || n.nodeName === 'STYLE') return
    var w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT), t
    while ((t = w.nextNode())) fixText(t)
  }
  new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) {
      var m = list[i]
      if (m.type === 'characterData') fixText(m.target)
      else for (var j = 0; j < m.addedNodes.length; j++) fix(m.addedNodes[j])
    }
  }).observe(document.documentElement, { childList: true, characterData: true, subtree: true })
  if (document.body) fix(document.body)
  document.addEventListener('DOMContentLoaded', function () { fix(document.body) })
  window.__iaqNoDots = true
})()
