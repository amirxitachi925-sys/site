
(function(){
  const CART_KEY = 'nike_cart_v1';

  function readCart(){
    try{
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e){
      console.error('readCart error', e);
      return [];
    }
  }

  function saveCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount(){
    const cart = readCart();
    const count = cart.reduce((s,i)=> s + (i.qty||1), 0);
    const els = document.querySelectorAll('#cart-count');
    els.forEach(el => el.textContent = count);
  }

  function initAddToCartButtons(){
    const buttons = document.querySelectorAll('.add-to-cart');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const price = Number(btn.dataset.price) || 0;
        const imgEl = btn.closest('.product-card')?.querySelector('img');
        const img = imgEl ? imgEl.src : '';

        const cart = readCart();
        const existing = cart.find(i => i.id === id);
        if(existing){
          existing.qty = (existing.qty || 1) + 1;
        } else {
          cart.push({ id, name, price, qty:1, img });
        }
        saveCart(cart);

        // feedback
        const original = btn.textContent;
        btn.textContent = 'Added ✓';
        setTimeout(()=> btn.textContent = original, 900);
      });
    });
  }

  function renderCartPage(){
    const cartEl = document.getElementById('cart-items');
    if(!cartEl) return;
    const cart = readCart();
    cartEl.innerHTML = '';

    if(cart.length === 0){
      cartEl.innerHTML = '<p style="color:var(--muted)">Your cart is empty.</p>';
      document.getElementById('cart-total').textContent = '0';
      return;
    }

    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.img}" alt="${escapeHtml(item.name)}">
        <div class="meta">
          <h4>${escapeHtml(item.name)}</h4>
          <p>Price: $${Number(item.price)} × ${item.qty}</p>
        </div>
        <div>
          <button class="remove-btn" data-id="${item.id}">Remove</button>
        </div>
      `;
      cartEl.appendChild(div);
    });

    const removes = cartEl.querySelectorAll('.remove-btn');
    removes.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        let cart = readCart();
        cart = cart.filter(i => i.id !== id);
        saveCart(cart);
        renderCartPage();
      });
    });

    const total = cart.reduce((s,i)=> s + (Number(i.price) * (i.qty || 1)), 0);
    document.getElementById('cart-total').textContent = total.toFixed(2);
  }

  function escapeHtml(str){
    if(!str) return '';
    return String(str).replace(/[&<>"']/g, (m)=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));
  }

  function initClearCart(){
    const btn = document.getElementById('clear-cart');
    if(!btn) return;
    btn.addEventListener('click', () => {
      if(confirm('Are you sure you want to clear the cart?')){
        localStorage.removeItem(CART_KEY);
        updateCartCount();
        renderCartPage();
      }
    });
  }

  function initCheckout(){
    const btn = document.getElementById('checkout');
    if(!btn) return;
    btn.addEventListener('click', () => {
      const cart = readCart();
      if(cart.length === 0){
        alert('Your cart is empty!');
        return;
      }

      alert('Succesfully payed! Thank you for your purchase 😊Hope to see you agian');
      localStorage.removeItem(CART_KEY);
      updateCartCount();
      renderCartPage();
    });
  }

  function initYears(){
    const y = new Date().getFullYear();
    ['year-index','year-dunk','year-jordan','year-travis','year-af1','year-cart'].forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.textContent = y;
    });
  }

  function initCommon(){
    initYears();
    updateCartCount();
    initAddToCartButtons();
    renderCartPage();
    initClearCart();
    initCheckout();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initCommon);
  } else {
    initCommon();
  }
})();
