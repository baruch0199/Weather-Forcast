const weatherForeCastData = document.querySelector(".weather-forecast-data");

const select = document.querySelector("select");
const currentBtn = document.querySelector(".current");
const dailyBtn = document.querySelector(".daily");
const hourlyBtn = document.querySelector(".hourly");
const minutelyBtn = document.querySelector(".minutely");
const test = document.querySelector("#test-select");
let LatListener = "";
let LngListener = "";
let flag = true;
let flagTwo = true;

// Update latitude and longitude
const updateLatAndLng = (lat, lng) => {
  LatListener = lat;
  LngListener = lng;
};

////navbar links activate these functions
function hourly() {
  const city = select.value;
  getCityForCastHourly(LatListener, LngListener, city);
}

function daily() {
  const city = select.value;
  getCityForCastDaily(LatListener, LngListener, city);
}

function current() {
  const city = select.value;
  getCityForCastCurrent(LatListener, LngListener, city);
}

hourlyBtn.addEventListener("click", () => {
  hourly();
});

////inputs activate these functions
dailyBtn.addEventListener("click", () => {
  daily();
});

currentBtn.addEventListener("click", () => {
  current();
});

for (const cityObj of israelCitiesArrOfObj) {
  const { city, lat, lng } = cityObj; //55 cities;

  select.innerHTML += `<option value="${city}">${city}</option>`;

  select.addEventListener("change", getCityForCast);
  //call getCityForCast to show specific area
  function getCityForCast() {
    if (flag) {
      if (select.value === city) {
        updateLatAndLng(lat, lng);
        getCityForCastDaily(lat, lng, city);
      }
    } else if (flagTwo) {
      if (select.value === city) {
        updateLatAndLng(lat, lng);
        getCityForCastHourly(lat, lng, city);
      }
    } else {
      if (select.value === city) {
        updateLatAndLng(lat, lng);
        getCityForCastCurrent(lat, lng, city);
      }
    }
  }

  //call getCityForCast and show all data in the page
  getCityForCast();
}

////////////////////////////////////////
/////////////////// daily
async function getCityForCastDaily(lat, lng, city) {
  flag = true;
  // console.log("DAILY ---> " + flag);
  try {
    let response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&units=metric&appid=7cdf68e1872fb5b2e62035f03e64bd11`
    );
    let output = await response.json();
    const { daily } = output;

    //feels like object
    let feelsLike = [];
    for (let i = 0; i < daily.length; i++) {
      feelsLike.push(daily[i].feels_like);
    }
    //temp object
    let temp = [];
    for (let i = 0; i < daily.length; i++) {
      temp.push(daily[i].temp);
    }

    const slicedDayFn = function () {
      return daily.map((days) => {
        const day = new Date(days.dt * 1000).toString().slice(0, 11);
        return day;
      });
    };
    const slicedDay = slicedDayFn();

    let html = "";
    let pic = "";
    for (let i = 0; i < 8; i++) {
      if (temp[i].day >= 21) {
        pic = "sunny";
      } else if (temp[i].day < 21 && temp[i].day > 11) {
        pic = "partly_cloudy";
      } else if (temp[i].day <= 11) {
        pic = "cloudy";
      }

      html += dailyToHtml(city, slicedDay[i], feelsLike[i], temp[i], pic, i);
    }

    weatherForeCastData.innerHTML = html;
  } catch (err) {
    throw new Error(err);
  }
}
////////////////////////////////////////
//// hourly
async function getCityForCastHourly(lat, lng, city, pic) {
  flag = false;
  flagTwo = true;
  // console.log("HOURLY ---> FLAG one: " + flag + " and FLAG two: " + flagTwo);
  let html = "";
  try {
    let response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&units=metric&appid=7cdf68e1872fb5b2e62035f03e64bd11`
    );
    let output = await response.json();
    const { hourly: hourlyArrOfObj } = output;

    for (let i = 0; i < 8; i++) {
      let hourlyObj = hourlyArrOfObj[i];
      const hour = new Date(hourlyObj.dt * 1000).toString().slice(16, 21);
      const day = new Date(hourlyObj.dt * 1000).toString().slice(0, 11);

      if (hourlyArrOfObj[i].temp >= 21) {
        pic = "sunny";
      } else if (hourlyArrOfObj[i].temp < 21 && hourlyArrOfObj[i].temp > 11) {
        pic = "partly_cloudy";
      } else if (hourlyArrOfObj[i].temp <= 11) {
        pic = "cloudy";
      }

      html += hourlyToHtml(hourlyObj, city, i, hour, day, pic);
    }
    weatherForeCastData.innerHTML = html;
  } catch (err) {
    throw new Error(err);
  }
}

////////////////////////////////////////
//// current
async function getCityForCastCurrent(lat, lng, city) {
  flag = false;
  flagTwo = false;
  // console.log("HOURLY ---> FLAG one: " + flag + " and FLAG two: " + flagTwo);

  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&units=metric&appid=7cdf68e1872fb5b2e62035f03e64bd11`
  );

  let output = await response.json();
  let { current: currentObj } = output;

  const currentHour = new Date(currentObj.dt * 1000).toString().slice(16, 21);

  if (currentObj.temp >= 21) {
    pic = "sunny";
  } else if (currentObj.temp < 21 && currentObj.temp > 11) {
    pic = "partly_cloudy";
  } else if (currentObj.temp <= 11) {
    pic = "cloudy";
  }
  weatherForeCastData.innerHTML = currentToHtml(
    currentObj,
    city,
    pic,
    currentHour
  );
}

/////////////////////// daily
const dailyToHtml = function (city, day, feelsLike, temp, pic, i) {
  return `<div class="item-${i} width-107  ">
  <div class="item-${i}-card ">
    <div class="pic ">
      <img class="margin-auto" style="width:45px"
        src="pictures/${pic}.png" alt="..."/>
    </div>
    <div class="item-card-content">
      <h6 class="city">${city}</h6>
      <p class="daily-days">${day}</p>
      <p class="daily-paragraph">morning: ${Math.round(temp.morn)}°</p>
      <p class="daily-paragraph">day: ${Math.round(temp.day)}°</p>
      <p class="daily-paragraph">evening: ${Math.round(temp.eve)}°</p>
    </div>
  </div>
</div>`;
};

/////////////////////// hourly
const hourlyToHtml = function (hourlyObj, city, i, hour, day, hourlyPic) {
  return `<div class="item-${i} width-107">
  <div class="item-${i}-card">
     <div class="pic">
       <img style="width:45px"
         src="pictures/${hourlyPic}.png" alt="..."/>
     </div>
     <div class="item-card-content">
       <h6 class="city">${city}</h6>
       <p class="hourly-days">${day}</p>
       <p class="hourly-paragraph hour">hour: ${hour}</p>
       <p class="hourly-paragraph">temp:${Math.round(hourlyObj.temp)}°</p>
       <p class="hourly-paragraph">humidity: ${hourlyObj.pressure}</p>
     </div>
  </div>
</div>`;
};

/////////////////////// current
const currentToHtml = function (currentObj, city, pic, currentHour) {
  return `<div class="current-wether" >
  <div>
  <div class="pic">
  <img style="width:45px"
    src="pictures/${pic}.png" alt="..."/>
</div>
       <h3 class="current-city">${city}</h3>
       <p class="the-time-now">now: ${currentHour}</p>
       <p class="current-paragraph"> temp: ${Math.round(currentObj.temp)}°</p>
       <p class="current-paragraph"> humidity: ${currentObj.humidity}</p>
</div>
</div>`;
};
