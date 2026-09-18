/* Carry the constructor reference to the existing form without sending a lead. */
(() => {
  'use strict';
  function prefill() {
    if(new URLSearchParams(location.search).get('from')!=='studio') return;
    const field=document.querySelector('#order textarea[name="comment"]');
    if(!field || field.value.trim()) return;
    try {
      let reference=sessionStorage.getItem('gc_grillz_order_payload');
      if(!reference) reference=JSON.parse(localStorage.getItem('gc_grillz_order_payload')||'null')?.text;
      if(typeof reference!=='string'||!reference.startsWith('Grillz Customs')||reference.length>16000) return;
      field.value=reference;
      field.dispatchEvent(new Event('input',{bubbles:true}));
      const note=document.createElement('p');note.className='studio-order-note';note.setAttribute('role','status');
      note.textContent='Ваш дизайн и ориентировочная смета добавлены в комментарий. Заполните контакт и отправьте заявку.';
      (field.closest('label')||field).insertAdjacentElement('afterend',note);
    } catch (_) { /* Form remains usable if browser storage is unavailable. */ }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',prefill);
  else prefill();
})();
