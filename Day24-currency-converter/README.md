# 💱 Day 24 — Currency Converter

A responsive currency converter built with HTML, CSS, and JavaScript. Convert amounts between supported currencies using exchange-rate data from a public API.

## ✨ Features

- Convert between JPY, USD, EUR, BDT, GBP, and INR
- Fetch exchange rates from an API
- Swap source and target currencies
- Format amounts using `Intl.NumberFormat()`
- Validate numeric input
- Display the exchange rate and provider update timestamp
- Handle loading states and API errors
- Responsive design for desktop and mobile
- No API key required

## 🛠️ Technologies

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API
- Async/Await
- ExchangeRate-API Open Access endpoint
- Intl.NumberFormat

## 📁 Project Structure

```text
Day-24-currency-converter/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🚀 How to Run

1. Open the project folder in VS Code.
2. Run `index.html` using the Live Server extension.
3. Enter an amount.
4. Select the source and target currencies.
5. Click **Convert Currency**.
6. Use the swap button to reverse the currencies.

An internet connection is required for exchange-rate requests.

## 📚 What I Learned

- Fetching external API data
- Using async/await and try/catch/finally
- Converting amounts using exchange rates
- Validating numeric input
- Formatting currency values
- Updating the DOM with JavaScript
- Handling API and network errors
- Working with event listeners

## 🌐 Data Source

ExchangeRate-API Open Access: https://www.exchangerate-api.com/docs/free

Rates are reference data and may not match bank, card, or money-transfer rates. Check the provider's terms and update schedule before production use.

## 🔮 Future Improvements

- Add more supported currencies
- Display historical exchange rates
- Build a currency conversion history
- Add a favorites list
- Save recent conversions with Local Storage
- Deploy the application online

---

**Day 24 of my 30 Days Web Development Challenge.**