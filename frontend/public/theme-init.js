try {
  var s = JSON.parse(localStorage.getItem('spacenet-theme') || '{}').state;
  if (s && s.dark) document.documentElement.classList.add('dark');
} catch (e) { /* sin preferencia guardada */ }
