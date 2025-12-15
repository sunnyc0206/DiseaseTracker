import axios from 'axios';

// API endpoints
const API_ENDPOINTS = {
  COVID: {
    GLOBAL: 'https://disease.sh/v3/covid-19/all',
    COUNTRIES: 'https://disease.sh/v3/covid-19/countries?sort=cases',
    CONTINENTS: 'https://disease.sh/v3/covid-19/continents'
  }
};

class StatsApi {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get data from cache if available and not expired
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Save data to cache
  saveToCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async getGlobalStatistics() {
    const cacheKey = 'global-stats';
    const cached = this.getFromCache(cacheKey);
    if (cached) return { data: cached };

    try {
      // Fetch COVID-19 global stats from disease.sh
      const response = await axios.get(API_ENDPOINTS.COVID.GLOBAL);
      const covidData = response.data;

      const stats = {
        totalActiveCases: covidData.active || 0,
        totalDeaths: covidData.deaths || 0,
        totalRecovered: covidData.recovered || 0,
        totalCases: covidData.cases || 0,
        todayCases: covidData.todayCases || 0,
        todayDeaths: covidData.todayDeaths || 0,
        todayRecovered: covidData.todayRecovered || 0,
        critical: covidData.critical || 0,
        tests: covidData.tests || 0,
        population: covidData.population || 0,
        affectedCountries: covidData.affectedCountries || 0,
        activeCasesPerMillion: covidData.activePerOneMillion || 0,
        deathsPerMillion: covidData.deathsPerOneMillion || 0,
        testsPerMillion: covidData.testsPerOneMillion || 0,
        countriesAffected: covidData.affectedCountries || 0,
        totalDiseases: 10, // Number of diseases we're tracking
        criticalDiseases: 3, // COVID, TB, Malaria
        highSeverityDiseases: 6, // High severity diseases
        lastUpdated: new Date(covidData.updated || Date.now()).toISOString()
      };

      this.saveToCache(cacheKey, stats);
      return { data: stats };
    } catch (error) {
      console.error('Error fetching global statistics:', error);
      
      // Return default values on error
      return {
        data: {
          totalActiveCases: 0,
          totalDeaths: 0,
          totalRecovered: 0,
          totalCases: 0,
          todayCases: 0,
          todayDeaths: 0,
          todayRecovered: 0,
          critical: 0,
          tests: 0,
          population: 0,
          affectedCountries: 0,
          countriesAffected: 0,
          totalDiseases: 10,
          criticalDiseases: 3,
          highSeverityDiseases: 6,
          lastUpdated: new Date().toISOString()
        }
      };
    }
  }

  async getCountryStatistics(country) {
    const cacheKey = country ? `country-stats-${country}` : 'all-countries-stats';
    const cached = this.getFromCache(cacheKey);
    if (cached) return { data: cached };

    try {
      const response = await axios.get(API_ENDPOINTS.COVID.COUNTRIES);
      const countries = response.data;

      if (country) {
        // Find specific country
        const countryData = countries.find(c => 
          c.country.toLowerCase() === country.toLowerCase() ||
          c.countryInfo.iso3 === country ||
          c.countryInfo.iso2 === country
        );

        if (countryData) {
          const data = {
            country: countryData.country,
            countryCode: countryData.countryInfo.iso2,
            continent: countryData.continent,
            population: countryData.population || 0,
            activeCases: countryData.active || 0,
            totalCases: countryData.cases || 0,
            deaths: countryData.deaths || 0,
            recovered: countryData.recovered || 0,
            newCases: countryData.todayCases || 0,
            newDeaths: countryData.todayDeaths || 0,
            critical: countryData.critical || 0,
            tests: countryData.tests || 0,
            testsPerMillion: countryData.testsPerOneMillion || 0,
            casesPerMillion: countryData.casesPerOneMillion || 0,
            deathsPerMillion: countryData.deathsPerOneMillion || 0,
            flag: countryData.countryInfo.flag,
            lat: countryData.countryInfo.lat,
            long: countryData.countryInfo.long,
            diseases: [
              {
                name: 'COVID-19',
                cases: countryData.cases || 0,
                deaths: countryData.deaths || 0,
                recovered: countryData.recovered || 0
              }
            ],
            lastUpdated: new Date(countryData.updated || Date.now()).toISOString()
          };

          this.saveToCache(cacheKey, data);
          return { data };
        } else {
          throw new Error('Country not found');
        }
      } else {
        // Return all countries
        const allCountries = countries.map(c => ({
          country: c.country,
          countryCode: c.countryInfo.iso2,
          continent: c.continent,
          population: c.population || 0,
          activeCases: c.active || 0,
          totalCases: c.cases || 0,
          deaths: c.deaths || 0,
          recovered: c.recovered || 0,
          newCases: c.todayCases || 0,
          newDeaths: c.todayDeaths || 0,
          critical: c.critical || 0,
          casesPerMillion: c.casesPerOneMillion || 0,
          deathsPerMillion: c.deathsPerOneMillion || 0,
          flag: c.countryInfo.flag,
          lat: c.countryInfo.lat,
          long: c.countryInfo.long,
          diseases: [
            {
              name: 'COVID-19',
              cases: c.cases || 0
            }
          ]
        }));

        this.saveToCache(cacheKey, allCountries);
        return { data: allCountries };
      }
    } catch (error) {
      console.error('Error fetching country statistics:', error);
      
      if (country) {
        return {
          data: {
            country: country,
            population: 0,
            activeCases: 0,
            totalCases: 0,
            deaths: 0,
            recovered: 0,
            newCases: 0,
            newDeaths: 0,
            diseases: []
          }
        };
      } else {
        return { data: [] };
      }
    }
  }

  async getTrendingDiseases() {
    const cacheKey = 'trending-diseases';
    const cached = this.getFromCache(cacheKey);
    if (cached) return { data: cached };

    try {
      // Get global stats to determine trending based on today's cases
      const response = await axios.get(API_ENDPOINTS.COVID.GLOBAL);
      const covidData = response.data;

      const trending = [];

      // COVID-19 is trending if there are significant daily cases
      if (covidData.todayCases > 10000) {
        trending.push({
          id: 1,
          name: 'COVID-19',
          trend: 'increasing',
          newCases: covidData.todayCases,
          totalCases: covidData.cases,
          severity: 'HIGH',
          affectedCountries: covidData.affectedCountries,
          percentageChange: covidData.todayCases > 0 ? 
            ((covidData.todayCases / covidData.cases) * 100).toFixed(2) : 0
        });
      }

      // Add other diseases that might be trending (simulated based on seasonality)
      const month = new Date().getMonth();
      
      // Flu season (October - March)
      if (month >= 9 || month <= 2) {
        trending.push({
          id: 6,
          name: 'Influenza',
          trend: 'seasonal',
          newCases: 500000,
          totalCases: 1000000000,
          severity: 'MEDIUM',
          affectedCountries: 100,
          percentageChange: 5.2
        });
      }

      // Dengue season (rainy seasons)
      if (month >= 5 && month <= 9) {
        trending.push({
          id: 5,
          name: 'Dengue',
          trend: 'increasing',
          newCases: 100000,
          totalCases: 390000000,
          severity: 'MEDIUM',
          affectedCountries: 70,
          percentageChange: 3.8
        });
      }

      // Always include Malaria as it's consistently high
      trending.push({
        id: 3,
        name: 'Malaria',
        trend: 'stable',
        newCases: 600000,
        totalCases: 241000000,
        severity: 'HIGH',
        affectedCountries: 87,
        percentageChange: 0.2
      });

      // Sort by new cases
      trending.sort((a, b) => b.newCases - a.newCases);

      this.saveToCache(cacheKey, trending.slice(0, 5)); // Top 5 trending
      return { data: trending.slice(0, 5) };
    } catch (error) {
      console.error('Error fetching trending diseases:', error);
      return { data: [] };
    }
  }

  // Get statistics by continent
  async getContinentStatistics() {
    const cacheKey = 'continent-stats';
    const cached = this.getFromCache(cacheKey);
    if (cached) return { data: cached };

    try {
      const response = await axios.get(API_ENDPOINTS.COVID.CONTINENTS);
      const continents = response.data;

      const data = continents.map(c => ({
        continent: c.continent,
        countries: c.countries,
        population: c.population || 0,
        cases: c.cases || 0,
        deaths: c.deaths || 0,
        recovered: c.recovered || 0,
        active: c.active || 0,
        critical: c.critical || 0,
        todayCases: c.todayCases || 0,
        todayDeaths: c.todayDeaths || 0,
        casesPerMillion: c.casesPerOneMillion || 0,
        deathsPerMillion: c.deathsPerOneMillion || 0,
        tests: c.tests || 0,
        testsPerMillion: c.testsPerOneMillion || 0
      }));

      this.saveToCache(cacheKey, data);
      return { data };
    } catch (error) {
      console.error('Error fetching continent statistics:', error);
      return { data: [] };
    }
  }

  // Get comprehensive country-wise disease data
  async getCountryWiseDiseaseData() {
    const cacheKey = 'country-wise-disease-data';
    const cached = this.getFromCache(cacheKey);
    if (cached) return { data: cached };

    try {
      // Fetch COVID-19 data for all countries
      const response = await axios.get(API_ENDPOINTS.COVID.COUNTRIES);
      const covidCountries = response.data;

      // Create comprehensive country data with disease breakdown
      const countryData = covidCountries.map(country => {
        // Estimate other disease cases based on population and regional factors
        const population = country.population || 0;
        const region = country.continent;
        
        // Regional disease prevalence factors
        const regionalFactors = {
          'Africa': { malaria: 0.15, tb: 0.008, hiv: 0.04, measles: 0.002 },
          'Asia': { malaria: 0.08, tb: 0.006, hiv: 0.002, measles: 0.001, dengue: 0.05 },
          'South America': { malaria: 0.05, tb: 0.004, hiv: 0.003, dengue: 0.08, yellowFever: 0.001 },
          'North America': { tb: 0.0001, hiv: 0.001, influenza: 0.1 },
          'Europe': { tb: 0.0002, hiv: 0.001, influenza: 0.08 },
          'Australia-Oceania': { tb: 0.0001, hiv: 0.0005, influenza: 0.05 },
        };

        const factors = regionalFactors[region] || { tb: 0.001, hiv: 0.001 };
        
        // Calculate estimated cases for other diseases
        const diseases = [
          {
            name: 'COVID-19',
            cases: country.cases || 0,
            active: country.active || 0,
            deaths: country.deaths || 0,
            recovered: country.recovered || 0
          }
        ];

        // Add other diseases based on regional factors
        if (factors.malaria) {
          diseases.push({
            name: 'Malaria',
            cases: Math.round(population * factors.malaria * 0.01),
            active: Math.round(population * factors.malaria * 0.01 * 0.3),
            deaths: Math.round(population * factors.malaria * 0.01 * 0.002),
            recovered: Math.round(population * factors.malaria * 0.01 * 0.698)
          });
        }

        if (factors.tb) {
          diseases.push({
            name: 'Tuberculosis',
            cases: Math.round(population * factors.tb),
            active: Math.round(population * factors.tb * 0.4),
            deaths: Math.round(population * factors.tb * 0.15),
            recovered: Math.round(population * factors.tb * 0.45)
          });
        }

        if (factors.hiv) {
          diseases.push({
            name: 'HIV/AIDS',
            cases: Math.round(population * factors.hiv),
            active: Math.round(population * factors.hiv * 0.8),
            deaths: Math.round(population * factors.hiv * 0.02),
            recovered: 0 // HIV is managed, not cured
          });
        }

        if (factors.dengue) {
          diseases.push({
            name: 'Dengue',
            cases: Math.round(population * factors.dengue * 0.001),
            active: Math.round(population * factors.dengue * 0.001 * 0.05),
            deaths: Math.round(population * factors.dengue * 0.001 * 0.0001),
            recovered: Math.round(population * factors.dengue * 0.001 * 0.9499)
          });
        }

        if (factors.influenza) {
          diseases.push({
            name: 'Influenza',
            cases: Math.round(population * factors.influenza),
            active: Math.round(population * factors.influenza * 0.02),
            deaths: Math.round(population * factors.influenza * 0.0006),
            recovered: Math.round(population * factors.influenza * 0.9794)
          });
        }

        // Calculate total disease burden
        const totalCases = diseases.reduce((sum, d) => sum + d.cases, 0);
        const totalActive = diseases.reduce((sum, d) => sum + d.active, 0);
        const totalDeaths = diseases.reduce((sum, d) => sum + d.deaths, 0);
        const totalRecovered = diseases.reduce((sum, d) => sum + d.recovered, 0);

        return {
          country: country.country,
          countryCode: country.countryInfo.iso2,
          flag: country.countryInfo.flag,
          continent: country.continent,
          population: population,
          totalCases: totalCases,
          totalActive: totalActive,
          totalDeaths: totalDeaths,
          totalRecovered: totalRecovered,
          casesPerMillion: population > 0 ? Math.round((totalCases / population) * 1000000) : 0,
          deathsPerMillion: population > 0 ? Math.round((totalDeaths / population) * 1000000) : 0,
          diseaseCount: diseases.length,
          diseases: diseases.sort((a, b) => b.cases - a.cases),
          lastUpdated: new Date(country.updated || Date.now()).toISOString()
        };
      });

      // Sort by total cases
      countryData.sort((a, b) => b.totalCases - a.totalCases);

      this.saveToCache(cacheKey, countryData);
      return { data: countryData };
    } catch (error) {
      console.error('Error fetching country-wise disease data:', error);
      return { data: [] };
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export const statsAPI = new StatsApi(); 