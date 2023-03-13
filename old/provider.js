function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
  if (dom.querySelector('#tb > button.btn.btn-default.btn-primary').textContent.trim() === '列表') {
      return '<div id="type">list</div>' + dom.querySelector('#kblist_table').outerHTML
  } else {
      return '<div id="type">table</div>' + dom.querySelector('#kbgrid_table_0').outerHTML
  }
}