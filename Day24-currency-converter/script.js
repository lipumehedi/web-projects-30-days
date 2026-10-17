
const converterForm = document.querySelector("#converterForm");
const amountInput = document.querySelector("#amount");
const fromCurrency = document.querySelector("#fromCurrency");
const toCurrency = document.querySelector("#toCurrency");

const swapButton = document.querySelector("#swapButton");
const convertButton = document.querySelector("#convertButton");
const statusMessage = document.querySelector("#statusMessage");

const resultCard = document.querySelector("#resultCard");
const resultAmount = document.querySelector("#resultAmount");
const conversionSummary = document.querySelector("#conversionSummary");
const exchangeRate = document.querySelector("#exchangeRate");
const rateDate = document.querySelector("#rateDate");

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}

async function getExchangeRates(baseCurrency) {
  const url =
    `https://open.er-api.com/v6/latest/${encodeURIComponent(baseCurrency)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to connect to the exchange-rate service.");
  }

  const data = await response.json();

  if (data.result !== "success" || !data.rates) {
    throw new Error("Exchange rates are currently unavailable.");
  }

  return data;
}

async function convertCurrency() {
  const amount = Number(amountInput.value);
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if (!Number.isFinite(amount) || amount <= 0) {
    showStatus("Please enter an amount greater than zero.", true);
    resultCard.hidden = true;
    return;
  }

  convertButton.disabled = true;
  convertButton.textContent = "Converting...";
  resultCard.hidden = true;
  showStatus("Fetching the latest available exchange rate...");

  try {
    let rate;
    let updatedAt = "Not required for same-currency conversion";

    if (from === to) {
      rate = 1;
    } else {
      const data = await getExchangeRates(from);

      rate = data.rates[to];
      updatedAt = data.time_last_update_utc || "Date unavailable";

      if (typeof rate !== "number" || !Number.isFinite(rate)) {
        throw new Error(
          `Exchange rate for ${to} is not available right now.`
        );
      }
    }

    const convertedAmount = amount * rate;

    resultAmount.textContent = formatCurrency(convertedAmount, to);

    conversionSummary.textContent =
      `${formatCurrency(amount, from)} = ${formatCurrency(convertedAmount, to)}`;

    exchangeRate.textContent =
      `1 ${from} = ${rate.toLocaleString("en-US", {
        maximumFractionDigits: 6
      })} ${to}`;

    rateDate.textContent = from === to
      ? "Same currency selected. Exchange rate is 1."
      : `Last updated by provider: ${updatedAt}`;

    resultCard.hidden = false;
    showStatus("Conversion completed successfully.");
  } catch (error) {
    showStatus(
      error.message || "Something went wrong. Please try again.",
      true
    );
  } finally {
    convertButton.disabled = false;
    convertButton.textContent = "Convert Currency";
  }
}

converterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  convertCurrency();
});

swapButton.addEventListener("click", () => {
  const previousFrom = fromCurrency.value;

  fromCurrency.value = toCurrency.value;
  toCurrency.value = previousFrom;

  // Automatically recalculate using the swapped currencies.
  convertCurrency();
});
