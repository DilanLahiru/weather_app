import React, {useCallback, useState, useEffect} from 'react';
import {
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {theme} from '../utils/theme';
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline';
import {MapPinIcon} from 'react-native-heroicons/solid';
import {debounce} from 'lodash';
import {fetchLocations, fetchWeatherForecast} from '../api/weather';
import {weatherImages} from '../constants';
import * as Progress from 'react-native-progress';

function HomeScreen() {
  const [showSearch, setShowSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentLocationData();
  }, []);

  const getCurrentLocationData = () => {
    fetchWeatherForecast({
      cityName: 'Sri Lanka',
      days: '7',
    }).then(data => {
      setWeather(data);
      setLoading(false);
    });
  };

  const handleLocation = location => {
    setLocations([]);
    setShowSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: location.name,
      days: '7',
    }).then(data => {
      setWeather(data);
      setLoading(false);
      console.log('====================================');
      console.log('forecast data : ', data);
      console.log('====================================');
    });
  };

  const handleSearch = value => {
    // fetch locations
    if (value.length > 2) {
      fetchLocations({cityName: value}).then(data => {
        console.log('got location', data);
        setLocations(data);
      });
    } else {
      setLocations([]);
    }
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const {current, location} = weather;

  return (
    <View className="flex-1 relative">
      <Image
        blurRadius={70}
        source={require('../assets/images/bg.png')}
        className="absolute w-full h-full"
      />
      {loading ? (
        <View className="flex-1 flex-row justify-center items-center">
          <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
        </View>
      ) : (
        <SafeAreaView className="flex flex-1">
          <View style={{height: '7%'}} className="mx-4 relative z-50 mt-1">
            <View
              style={{
                backgroundColor: showSearch
                  ? theme.bgWhite(0.2)
                  : 'transparent',
              }}
              className="flex-row justify-end items-center rounded-full">
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search City"
                  placeholderTextColor={'lightgray'}
                  className="pl-6 h-10 pb-1 flex-1 text-base text-white"
                />
              ) : null}

              <TouchableOpacity
                onPress={() => setShowSearch(!showSearch)}
                style={{backgroundColor: theme.bgWhite(0.3)}}
                className="rounded-full p-3 m-1">
                <MagnifyingGlassIcon size="25" color="white" />
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                {locations.map((location, index) => {
                  let showBorder = index + 1 != locations.length;
                  let borderClass = showBorder
                    ? 'border-b-2 border-b-gray-400'
                    : '';
                  return (
                    <TouchableOpacity
                      onPress={() => handleLocation(location)}
                      key={index}
                      className={
                        'flex-row items-center border-0 p-3 px-4 mb-1' +
                        borderClass
                      }>
                      <MapPinIcon size="20" color="gray" />
                      <Text className="text-black text-base ml-2 font-sans">
                        {location?.name}, {location?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>

          <View className="mx-4 flex justify-around flex-1 mb-2">
            <Text className="text-white text-center text-2xl font-bold">
              {location?.name},
              <Text className="text-gray-300 text-lg font-semibold">
                {' ' + location?.country}
              </Text>
            </Text>

            <View className="flex-row justify-center">
              <Image
                source={weatherImages[current?.condition?.text]}
                className="w-52 h-52"
              />
            </View>

            <View className="space-y-2">
              <Text className="text-white text-center text-6xl ml-5 font-bold">
                {current?.temp_c}&#176;
              </Text>
              <Text className="text-white text-center text-xl tracking-widest">
                {current?.condition?.text}
              </Text>
            </View>

            <View className="flex-row justify-between mx-4">
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require('../assets/icons/wind.png')}
                  className="w-6 h-6"
                />
                <Text className="text-white text-center text-base font-semibold">
                  {current?.wind_kph}Km
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require('../assets/icons/drop.png')}
                  className="w-6 h-6"
                />
                <Text className="text-white text-center text-base font-semibold">
                  {current?.humidity}%
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require('../assets/icons/sun.png')}
                  className="w-6 h-6"
                />
                <Text className="text-white text-center text-base font-semibold">
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>

            <View className="mb-2 space-y-3">
              <View className="flex-row items-center mx-5 space-x-5">
                <CalendarDaysIcon size="22" color="white" />
                <Text className="text-white text-center text-base">
                  Daily Forecast
                </Text>
              </View>
              <ScrollView
                horizontal
                contentContainerStyle={{paddingHorizontal: 15}}
                showsHorizontalScrollIndicator={false}>
                {weather?.forecast?.forecastday?.map((item, index) => {
                  // let date = new Date(item.date);
                  // let options = {weekday: 'long'};
                  // let dayName = date.toLocaleDateString('en-US', options);
                  // dayName = dayName.split(',')[0]
                  return (
                    <View
                      key={index}
                      className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-3 mr-4"
                      style={{backgroundColor: theme.bgWhite(0.15)}}>
                      <Image
                        source={weatherImages[item?.day?.condition?.text]}
                        className="h-11 w-11"
                      />
                      <Text className="text-white">{item.date}</Text>
                      <Text className="text-white text-center text-xl font-semibold">
                        {item?.day?.avgtemp_c}&#176;
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

export default HomeScreen;
