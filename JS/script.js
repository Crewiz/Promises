const API_KEYS = {
    unsplash: 'SlNq2mfhlVnNOMVOhErMy11b97SKlZ5lz7ClAAmaZf4',
    openWeather: '8455cb9d4367302b7740ec570f08cb1e',
    worldNews: '9e7f2989a69f4c11805bf2b3d756ae7e'
};

async function fetchAPI(url, params={}, headers={}) {
    try {
        const response = await axios.get(url, {params, headers});
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getBackgroundImage() {
    const data = await fetchAPI('https://api.unsplash.com/photos/random', {}, {
        'Authorization': `Client-ID ${API_KEYS.unsplash}`
    });

    return {
        photographer: data.user.name,
        imageUrl: data.urls.regular
    };
}

async function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

async function getWeatherByPosition() {
    const position = await getCurrentPosition();
    return fetchAPI('https://api.openweathermap.org/data/2.5/weather', {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        appid: API_KEYS.openWeather
    });
}

async function getBitcoinPrice() {
    const data = await fetchAPI('https://api.coindesk.com/v1/bpi/currentprice.json');
    return data.bpi.USD.rate;
}

async function getNews() {
    const data = await fetchAPI('https://api.worldnewsapi.com/search-news?text=javascript&api-key=' + API_KEYS.worldNews, {}, {
        'Content-Type': 'application/json'
    });

    return data.news.map(item => `<li><a href="${item.url}" target="_blank">${item.title}</a></li>`).join('');
}

function updateDateTime() {
    const currentTime = new Date();
    document.getElementById("time").textContent = currentTime.toLocaleTimeString();
    document.getElementById("date").textContent = currentTime.toLocaleDateString();
}

(async function loadPage() {
    try {
        const [bgImage, weather, bitcoinPrice, news] = await Promise.all([
            getBackgroundImage(),
            getWeatherByPosition(),
            getBitcoinPrice(),
            getNews()
        ]);

        document.body.style.backgroundImage = `url(${bgImage.imageUrl})`;
        document.getElementById("credit").textContent = `Photo by: ${bgImage.photographer}`;

        document.getElementById("temperature").textContent = Math.floor(weather.main.temp - 273.15);
        document.getElementById("location").textContent = weather.name;
        document.getElementById("weather").textContent = weather.weather[0].main;
        document.getElementById("weather-icon").src = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;

        document.getElementById("bitcoin-price").textContent = `Bitcoin Price: ${bitcoinPrice} USD`;

        document.getElementById("news").innerHTML = news;

        setInterval(updateDateTime, 1000);
    } catch (error) {
        console.log(error);
    }
})();
