// Data cart
const cart = [];

// Qty default per menu (UI counters)
const qtyState = {
  "Es Teh": 1,
  "Nasi Goreng": 1,
  "Kerupuk": 1
};

// helper: format currency id
function formatRp(num) {
  return num.toLocaleString('id-ID');
}

// Increase / decrease qty before add
function increaseQty(name) {
  qtyState[name] = (qtyState[name] || 1) + 1;
  document.getElementById(`qty-${name}`).innerText = qtyState[name];
}
function decreaseQty(name) {
  qtyState[name] = Math.max(1, (qtyState[name] || 1) - 1);
  document.getElementById(`qty-${name}`).innerText = qtyState[name];
}

function addToCart(name, price) {
  const qtyToAdd = qtyState[name] || 1;
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += qtyToAdd;
  } else {
    cart.push({ name, price, qty: qtyToAdd });
  }
  qtyState[name] = 1;
  document.getElementById(`qty-${name}`).innerText = 1;
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  const cartList = document.getElementById("cart");
  const totalEl = document.getElementById("total");
  cartList.innerHTML = "";

  let total = 0;
  if (cart.length === 0) {
    cartList.innerHTML = `<li class="text-gray-500">Keranjang kosong</li>`;
  } else {
    cart.forEach((item, index) => {
      const subtotal = item.price * item.qty;
      total += subtotal;
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          <div>${item.name} x${item.qty}</div>
          <div>Rp${formatRp(subtotal)}</div>
        </div>
        <div>
          <button onclick="decreaseCartQty(${index})">-</button>
          <button onclick="increaseCartQty(${index})">+</button>
          <button onclick="removeFromCart(${index})">Hapus</button>
        </div>
      `;
      cartList.appendChild(li);
    });
  }
  totalEl.textContent = "Total: Rp" + formatRp(total);
}

// adjust qty inside cart
function increaseCartQty(index) {
  cart[index].qty++;
  renderCart();
}
function decreaseCartQty(index) {
  if (cart[index].qty > 1) {
    cart[index].qty--;
  } else {
    cart.splice(index, 1);
  }
  renderCart();
}

// ---------- Antrian harian (localStorage) ----------
const KEY_DATE = 'warung_lastDate';
const KEY_QUEUE = 'warung_lastQueue';

function getTodayKey() {
  return new Date().toDateString();
}

function getNextQueueNumber() {
  const today = getTodayKey();
  const storedDate = localStorage.getItem(KEY_DATE);
  let lastQueue = parseInt(localStorage.getItem(KEY_QUEUE) || '0', 10);

  if (storedDate === today) {
    lastQueue = lastQueue + 1;
  } else {
    lastQueue = 1;
  }

  localStorage.setItem(KEY_DATE, today);
  localStorage.setItem(KEY_QUEUE, String(lastQueue));

  return lastQueue; // number
}

// ---------- Kirim ke WhatsApp ----------
function sendToWhatsApp() {
  const nama = document.getElementById("nama").value.trim();
  if (!nama) {
    alert("Masukkan nama pembeli dulu!");
    return;
  }
  if (cart.length === 0) {
    alert("Keranjang masih kosong!");
    return;
  }

  const queueNum = getNextQueueNumber();
  const queueStr = String(queueNum).padStart(3, '0');

  let message = `Nomor Antrian: #${queueStr}\n`;
  message += `Halo, saya ${nama} ingin memesan:\n`;

  let total = 0;
  cart.forEach(item => {
    const subtotal = item.price * item.qty;
    message += `* ${item.name} x${item.qty} = Rp${formatRp(subtotal)}\n`;
    total += subtotal;
  });

  message += `\nTotal: Rp${formatRp(total)}\nTerima kasih!`;

  const phone = "62895370822178";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");

  cart.length = 0;
  renderCart();
}

// render awal
renderCart();
