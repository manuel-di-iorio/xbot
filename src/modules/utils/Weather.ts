import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import axios from "axios";
import { addModule } from "../index.js";
import { addCmd } from "../../lib/discord/registerCmds.js";
import { BOT_COLOR, OPEN_WEATHER_MAP_APIKEY } from "../../config.js";
import moment from "moment";

const OPEN_WEATHER_MAP_HOST = 'https://api.openweathermap.org/data/2.5';

type OpenWeatherDataStep = {
  name: string;
  weather: [{ description: string, icon: string }],
  main: { temp: number, humidity: number },
  pop: number
};

type OpenWeatherResponseForecast = {
  city: {
    name: string
  }
};

const extractWeatherData = (data: OpenWeatherDataStep, response: OpenWeatherResponseForecast = { city: { name: "" } }) => {
  const name = data.name ? data.name : response.city.name;
  const { weather: weatherData, main, pop } = data;
  const { description, icon: iconCode } = weatherData[0];

  return {
    city: name[0].toUpperCase() + name.slice(1),
    weather: description[0].toUpperCase() + description.slice(1),
    icon: `http://openweathermap.org/img/wn/${iconCode}@2x.png`,
    temp: Math.round(main.temp),
    humidity: main.humidity,
    rainProb: Math.round(pop * 100)
  };
};

export const WeatherModule = () => addModule("Weather", () => {
  addCmd({
    data: new SlashCommandBuilder()
      .setName("weather")
      .setDescription("Mostra il meteo della tua città")
      .addStringOption((option) => option.setName("city").setDescription("Città").setRequired(true)),

    exec: async (interaction) => {
      const input = encodeURIComponent(interaction.options.data[0].value as string) + ',IT';
      await interaction.deferReply();

      // Get the weather data
      try {
        const [{ data: weather }, { data: forecast }] = await Promise.all([
          axios(`${OPEN_WEATHER_MAP_HOST}/weather?appid=${OPEN_WEATHER_MAP_APIKEY}&lang=it&units=metric&q=${input}`),
          axios(`${OPEN_WEATHER_MAP_HOST}/forecast?appid=${OPEN_WEATHER_MAP_APIKEY}&lang=it&units=metric&cnt=18&q=${input}`)
        ]);

        // Extract the weather data
        const weatherCurrent = extractWeatherData(weather);

        const { list } = forecast;
        const now = new Date();
        const timeToday = moment(now).date();
        const timeTomorrowDate = moment(now).add(1, 'd').date();
        const timeDayAfterTomorrowDate = moment(now).add(2, 'd').date();

        let weatherToday;
        let weatherTomorrow;
        let weatherDayAfterTomorrow;

        for (const step of list) {
          const dt = step.dt * 1000;
          const stepDate = moment(dt).date();

          if (!weatherToday && stepDate === timeToday) {
            weatherToday = extractWeatherData(step, forecast);
          } else if (!weatherTomorrow && stepDate === timeTomorrowDate) {
            weatherTomorrow = extractWeatherData(step, forecast);
          } else if (!weatherDayAfterTomorrow && stepDate === timeDayAfterTomorrowDate) {
            weatherDayAfterTomorrow = extractWeatherData(step, forecast);
            break;
          }
        }

        // Send the embed
        const embed = new EmbedBuilder();
        embed.setColor(BOT_COLOR);
        embed.setTitle('Meteo di ' + weatherCurrent.city);
        embed.setThumbnail(weatherCurrent.icon);
        embed.setFooter({ text: "Fonte: OpenWeatherMap", iconURL: 'https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/icons/logo_32x32.png' });

        embed.addFields({ name: "Adesso", value: `${weatherCurrent.weather}, ${weatherCurrent.temp}°, ${weatherCurrent.humidity}% umidità, ${weatherToday ? `${weatherToday.rainProb}% pioggia` : ''}` });

        if (weatherTomorrow) {
          embed.addFields({ name: "Domani", value: `${weatherTomorrow.weather}, ${weatherTomorrow.temp}°, ${weatherTomorrow.humidity}% umidità, ${weatherTomorrow.rainProb}% pioggia` });
        }

        if (weatherDayAfterTomorrow) {
          embed.addFields({ name: "Dopo domani", value: `${weatherDayAfterTomorrow.weather}, ${weatherDayAfterTomorrow.temp}°, ${weatherDayAfterTomorrow.humidity}% umidità, ${weatherDayAfterTomorrow.rainProb}% pioggia` });
        }

        await interaction.editReply({ embeds: [embed] });
      } catch (err) {
        await interaction.editReply('Non ho trovato questa città oppure è avvenuto un errore');
      }
    }
  });
});
