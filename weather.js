class WeatherApp {

    constructor() {
        this.API_KEY = "dbde9e669255f6bf34b3a3cf447f0e3c";
        this.unit = localStorage.getItem("unit") || "metric";
        this.lastCity = localStorage.getItem("lastCity") || "";
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.unitToggle.value = this.unit;

        if (this.lastCity) {
            this.fetchWeather(this.lastCity);
        }
    }

    cacheDOM() {
        this.searchInput = document.getElementById("searchInput");
        this.unitToggle = document.getElementById("unitToggle");
        this.weatherCard = document.getElementById("weatherCard");
        this.loading = document.getElementById("loading");
        this.errorBox = document.getElementById("errorMessage");
    }

    bindEvents() {
        this.searchInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                this.fetchWeather(this.searchInput.value);
            }
        });

        this.unitToggle.addEventListener("change", () => {
            this.unit = this.unitToggle.value;
            localStorage.setItem("unit", this.unit);
            if (this.lastCity) this.fetchWeather(this.lastCity);
        });
    }


    async fetchForecast(lat, lon) {

        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=${this.unit}&exclude=current,minutely,hourly,alerts`
        );

        const data = await res.json();

        if (!data.daily) {
            console.error("Forecast API Error:", data);
            return;
        }

        this.renderForecast(data.daily);

    }



    async fetchWeather(city) {

        if (!city) return;

        try {
            this.showLoading(true);
            this.showError("");

            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.API_KEY}&units=${this.unit}`
            );


            if (!res.ok) throw new Error("City not found");

            const data = await res.json();  // FIRST get data

            this.lastCity = city;
            localStorage.setItem("lastCity", city);

            this.render(data);  // Render current weather

            await this.fetchForecast(data.coord.lat, data.coord.lon);  // THEN forecast

        } catch (err) {
            this.showError(err.message);
            this.weatherCard.classList.add("hidden");
        } finally {
            this.showLoading(false);
        }

    }

    render(data) {


        document.getElementById("cityName").innerText = data.name;
        document.getElementById("temperature").innerText = `${Math.round(data.main.temp)}°${this.unit === "metric" ? "C" : "F"}`;
        document.getElementById("description").innerText = data.weather[0].description;
        document.getElementById("humidity").innerText = `${data.main.humidity}%`;
        document.getElementById("wind").innerText = `${data.wind.speed} ${this.unit === "metric" ? "km/h" : "mph"}`;

        document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;


        this.weatherCard.classList.remove("hidden");
    }

    showLoading(state) {
        this.loading.classList.toggle("hidden", !state);
    }

    showError(msg) {
        if (!msg) {
            this.errorBox.classList.add("hidden");
        } else {
            this.errorBox.innerText = msg;
            this.errorBox.classList.remove("hidden");
        }
    }


    renderForecast(dailyData) {

        const forecastContainer = document.getElementById("forecast");
        forecastContainer.innerHTML = "";

        dailyData.slice(0, 7).forEach(day => {

            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

            const card = document.createElement("div");
            card.classList.add("forecast-card");

            card.innerHTML = `
                <p>${dayName}</p>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <p>${Math.round(day.temp.day)}°</p>
            `;

            forecastContainer.appendChild(card);
        });

        forecastContainer.classList.remove("hidden");
    }
}

new WeatherApp();