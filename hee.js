window.onload = async function () {
  await fetchExchangeRate();
  calculateAll(); 
};

async function fetchExchangeRate() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/CNY");
    const data = await response.json();
    document.getElementById("exchangeRate").value = data.rates.KRW.toFixed(2);
  } catch (e) {
    console.error("환율 로드 실패");
  }
}

function resetSection(sectionId) {
  const inputs = document.querySelectorAll(`#${sectionId} input`);
  inputs.forEach((input) => {
    if (input.id === "cnQty" || input.classList.contains("kr-q"))
      input.value = 1;
    else if (input.id === "exchangeRate")
      return; 
    else input.value = "";
  });
  calculateAll();
}

function calculateAll() {
  const price = parseFloat(document.getElementById("cnPrice").value) || 0;
  const qty = parseFloat(document.getElementById("cnQty").value) || 1;
  const discount = parseFloat(document.getElementById("cnDiscount").value) || 0;
  const shippingCn =
    parseFloat(document.getElementById("cnShippingFee").value) || 0;
  const rate = parseFloat(document.getElementById("exchangeRate").value) || 0;

  const totalCnKrw = Math.round(
    (price * (1 - discount / 100) + shippingCn) * rate * 1.03,
  );
  document.getElementById("cnTotalCost").innerText =
    totalCnKrw.toLocaleString();

  let minKrTotal = Infinity;
  const cards = document.querySelectorAll(".compare-card");

  cards.forEach((card) => {
    const p = parseFloat(card.querySelector(".kr-p").value) || 0;
    const q = parseFloat(card.querySelector(".kr-q").value) || 1;
    const s = parseFloat(card.querySelector(".kr-s").value) || 0;

    const totalKr = Math.round(p * q + s);
    card.querySelector(".unit-res span").innerText = totalKr.toLocaleString();

    if (totalKr > 0 && totalKr < minKrTotal) minKrTotal = totalKr;

    card.querySelector(".unit-res").style.color =
      totalKr > totalCnKrw && totalCnKrw > 0 ? "#27ae60" : "#e74c3c";
  });

  const vsBox = document.getElementById("finalComparison");
  if (totalCnKrw > 0 && minKrTotal !== Infinity) {
    const diff = minKrTotal - totalCnKrw;
    if (diff > 0) {
      vsBox.innerHTML = `중국에서 수입하면 국내 최저가 대비 <span class="benefit">${diff.toLocaleString()}원</span> 더 저렴합니다! 🚀`;
    } else {
      vsBox.innerHTML = `국내에서 사는게 <span class="loss">${Math.abs(diff).toLocaleString()}원</span> 더 유리합니다. ⚠️`;
    }
  }
}
