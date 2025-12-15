import axios from 'axios';

// API endpoints for different disease data sources
const API_ENDPOINTS = {
  COVID: {
    GLOBAL: 'https://disease.sh/v3/covid-19/all',
    COUNTRIES: 'https://disease.sh/v3/covid-19/countries',
    HISTORICAL: 'https://disease.sh/v3/covid-19/historical/all?lastdays=30'
  },
  WHO_GHO: {
    BASE: 'https://ghoapi.azureedge.net/api',
    INDICATORS: {
      TB_INCIDENCE: 'TB_e_inc_num',
      TB_DEATHS: 'TB_e_mort_num',
      MALARIA_CASES: 'MALARIA_EST_CASES',
      MALARIA_DEATHS: 'MALARIA_EST_DEATHS',
      HIV_PREVALENCE: 'HIV_0000000001',
      MEASLES_CASES: 'WHS3_48'
    }
  },
  PROXY: 'https://api.allorigins.win/raw?url='
};

// Disease metadata with real data sources
const DISEASE_METADATA = {
  'COVID-19': {
    id: 1,
    description: 'Coronavirus disease caused by SARS-CoV-2',
    symptoms: 'Fever, cough, shortness of breath, loss of taste/smell',
    prevention: 'Vaccination, mask wearing, hand hygiene, social distancing',
    treatment: 'Supportive care, antiviral medications, monoclonal antibodies',
    severity: 'HIGH',
    dataSource: 'covid'
  },
  'Tuberculosis': {
    id: 2,
    description: 'Bacterial infection that primarily affects the lungs',
    symptoms: 'Persistent cough, chest pain, weight loss, fever, night sweats',
    prevention: 'BCG vaccination, infection control, treating latent TB',
    treatment: 'Antibiotics (6-9 months), directly observed therapy',
    severity: 'HIGH',
    dataSource: 'who',
    indicator: 'TB_INCIDENCE'
  },
  'Malaria': {
    id: 3,
    description: 'Mosquito-borne parasitic disease',
    symptoms: 'Fever, chills, headache, nausea, vomiting, muscle pain',
    prevention: 'Insecticide-treated nets, antimalarial drugs, mosquito control',
    treatment: 'Antimalarial medications (artemisinin-based therapy)',
    severity: 'HIGH',
    dataSource: 'who',
    indicator: 'MALARIA_CASES'
  },
  'HIV/AIDS': {
    id: 4,
    description: 'Human immunodeficiency virus infection',
    symptoms: 'Flu-like symptoms initially, then immunodeficiency',
    prevention: 'Safe sex practices, PrEP, needle exchange programs',
    treatment: 'Antiretroviral therapy (ART)',
    severity: 'HIGH',
    dataSource: 'who',
    indicator: 'HIV_PREVALENCE'
  },
  'Dengue': {
    id: 5,
    description: 'Mosquito-borne viral infection',
    symptoms: 'High fever, severe headache, joint pain, rash',
    prevention: 'Mosquito control, protective clothing, vaccine (in some countries)',
    treatment: 'Supportive care, fluid management',
    severity: 'MEDIUM',
    dataSource: 'static'
  },
  'Influenza': {
    id: 6,
    description: 'Seasonal respiratory viral infection',
    symptoms: 'Fever, cough, body aches, fatigue',
    prevention: 'Annual vaccination, hand hygiene, avoid close contact',
    treatment: 'Antiviral drugs, supportive care',
    severity: 'MEDIUM',
    dataSource: 'static'
  },
  'Measles': {
    id: 7,
    description: 'Highly contagious viral disease',
    symptoms: 'High fever, cough, runny nose, red eyes, rash',
    prevention: 'MMR vaccination, isolation of cases',
    treatment: 'Supportive care, vitamin A supplementation',
    severity: 'MEDIUM',
    dataSource: 'who',
    indicator: 'MEASLES_CASES'
  },
  'Ebola': {
    id: 8,
    description: 'Severe hemorrhagic fever caused by Ebola virus',
    symptoms: 'Fever, severe headache, muscle pain, weakness, diarrhea, bleeding',
    prevention: 'Vaccine (Ervebo), infection control, safe burial practices',
    treatment: 'Supportive care, monoclonal antibodies',
    severity: 'CRITICAL',
    dataSource: 'static'
  },
  'Cholera': {
    id: 9,
    description: 'Acute diarrheal infection caused by Vibrio cholerae',
    symptoms: 'Severe watery diarrhea, dehydration, vomiting',
    prevention: 'Clean water, sanitation, oral cholera vaccine',
    treatment: 'Oral rehydration, antibiotics in severe cases',
    severity: 'HIGH',
    dataSource: 'static'
  },
  'Yellow Fever': {
    id: 10,
    description: 'Viral hemorrhagic disease transmitted by mosquitoes',
    symptoms: 'Fever, headache, jaundice, muscle pain, bleeding',
    prevention: 'Vaccination, mosquito control',
    treatment: 'Supportive care',
    severity: 'HIGH',
    dataSource: 'static'
  }
};

const BACKEND_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

class DiseaseApi {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes instead of 5
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

  // Fetch COVID-19 data from disease.sh
  async fetchCovidData() {
    try {
      const response = await axios.get(API_ENDPOINTS.COVID.GLOBAL);
      return {
        activeCases: response.data.active || 0,
        totalCases: response.data.cases || 0,
        deaths: response.data.deaths || 0,
        recoveredCases: response.data.recovered || 0,
        affectedCountries: response.data.affectedCountries || 0,
        todayCases: response.data.todayCases || 0,
        todayDeaths: response.data.todayDeaths || 0,
        critical: response.data.critical || 0,
        tests: response.data.tests || 0
      };
    } catch (error) {
      console.error('Error fetching COVID data:', error);
      return {
        activeCases: 0,
        totalCases: 0,
        deaths: 0,
        recoveredCases: 0,
        affectedCountries: 0
      };
    }
  }

  // Fetch COVID-19 data by countries
  async fetchCovidCountriesData() {
    try {
      const response = await axios.get(API_ENDPOINTS.COVID.COUNTRIES);
      return response.data.map(country => ({
        country: country.country,
        countryInfo: country.countryInfo,
        totalCases: country.cases || 0,
        activeCases: country.active || 0,
        deaths: country.deaths || 0,
        recovered: country.recovered || 0,
        critical: country.critical || 0,
        todayCases: country.todayCases || 0,
        todayDeaths: country.todayDeaths || 0,
        casesPerOneMillion: country.casesPerOneMillion || 0,
        deathsPerOneMillion: country.deathsPerOneMillion || 0,
        tests: country.tests || 0,
        testsPerOneMillion: country.testsPerOneMillion || 0,
        population: country.population || 0,
        continent: country.continent || 'Unknown',
        updated: country.updated
      }));
    } catch (error) {
      console.error('Error fetching COVID countries data:', error);
      return [];
    }
  }

  // Fetch WHO data for other diseases - REMOVED DUE TO CORS AND PERFORMANCE ISSUES
  // Using static data instead
  async fetchWHOData(indicator) {
    // Return static data instead of making API calls
    return { totalCases: 0, dataAvailable: false };
  }

  // Fetch diseases from backend
  async fetchBackendDiseases() {
    try {
      const response = await fetch(`${BACKEND_URL}/diseases`);
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      console.error('Backend fetch error:', error);
      return [];
    }
  }

  // Get all diseases with real data
  async getAllDiseases() {
    const cacheKey = 'all-diseases';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // First try to fetch from backend
      const backendDiseases = await this.fetchBackendDiseases();
      
      if (backendDiseases && backendDiseases.length > 0) {
        // Transform backend data to match frontend format
        const diseases = backendDiseases.map(disease => ({
          id: disease.id,
          name: disease.name,
          cases: disease.totalCases || 0,
          totalCases: disease.totalCases || 0,
          deaths: disease.deaths || 0,
          recovered: disease.recoveredCases || 0,
          recoveredCases: disease.recoveredCases || 0,
          active: disease.activeCases || 0,
          activeCases: disease.activeCases || 0,
          countries: disease.affectedCountries || 0,
          affectedCountries: disease.affectedCountries || 0,
          description: disease.description,
          symptoms: disease.symptoms,
          prevention: disease.prevention,
          treatment: disease.treatment,
          severity: disease.severity || 'MODERATE',
          featured: disease.featured || false,
          source: disease.source || 'Backend',
          createdAt: disease.createdAt,
          updatedAt: disease.updatedAt,
          lastUpdated: disease.updatedAt || disease.createdAt
        }));
        
        this.saveToCache(cacheKey, diseases);
        return diseases;
      }
    } catch (error) {
      console.error('Error fetching from backend, falling back to external APIs:', error);
    }

    // Fallback to external APIs if backend is not available
    const diseases = [];
    
    // Fetch COVID-19 data from disease.sh
    try {
      const covidCountries = await this.fetchCovidCountriesData();
      const covidGlobal = await this.fetchCovidGlobalData();
      
      diseases.push({
        id: 1,
        name: 'COVID-19',
        cases: covidGlobal.totalCases || 0, // Changed to totalCases
        deaths: covidGlobal.deaths || 0,
        recovered: covidGlobal.recoveredCases || 0,
        active: covidGlobal.activeCases || 0,
        countries: covidCountries.length,
        ...DISEASE_METADATA['COVID-19']
      });
    } catch (error) {
      console.error('Error fetching COVID data:', error);
    }

    // Use static data for other diseases instead of WHO API
    const staticDiseaseData = {
      'Tuberculosis': { 
        totalCases: 10600000, 
        deaths: 1300000, 
        activeCases: 4500000,
        countries: 195 
      },
      'Malaria': { 
        totalCases: 247000000, 
        deaths: 619000, 
        activeCases: 85000000,
        countries: 87 
      },
      'HIV/AIDS': { 
        totalCases: 38400000, 
        deaths: 690000, 
        activeCases: 28700000,
        countries: 195 
      },
      'Measles': { 
        totalCases: 9000000, 
        deaths: 128000, 
        activeCases: 450000,
        countries: 140 
      },
      'Dengue': { 
        totalCases: 390000000, 
        deaths: 40000, 
        activeCases: 19500000,
        countries: 129 
      },
      'Influenza': { 
        totalCases: 1000000000, 
        deaths: 650000, 
        activeCases: 50000000,
        countries: 195 
      },
      'Ebola': { 
        totalCases: 35000, 
        deaths: 15000, 
        activeCases: 1750,
        countries: 10 
      },
      'Cholera': { 
        totalCases: 2900000, 
        deaths: 95000, 
        activeCases: 145000,
        countries: 47 
      },
      'Yellow Fever': { 
        totalCases: 200000, 
        deaths: 30000, 
        activeCases: 10000,
        countries: 34 
      }
    };

    // Add static disease data
    Object.entries(staticDiseaseData).forEach(([name, data]) => {
      if (DISEASE_METADATA[name]) {
        diseases.push({
          id: DISEASE_METADATA[name].id,
          name,
          cases: data.totalCases,
          totalCases: data.totalCases,
          deaths: data.deaths,
          recovered: data.totalCases - data.deaths - data.activeCases,
          recoveredCases: data.totalCases - data.deaths - data.activeCases,
          active: data.activeCases,
          activeCases: data.activeCases,
          countries: data.countries,
          affectedCountries: data.countries,
          ...DISEASE_METADATA[name]
        });
      }
    });

    this.saveToCache(cacheKey, diseases);
    return diseases;
  }

  async getDiseaseById(id) {
    const diseases = await this.getAllDiseases();
    const disease = diseases.find(d => d.id === parseInt(id));
    if (!disease) throw new Error('Disease not found');
    return { data: disease };
  }

  async getDiseaseCases(id) {
    const disease = await this.getDiseaseById(id);
    
    if (disease.data.name === 'COVID-19') {
      try {
        // Fetch country-specific data for COVID-19
        const countriesData = await this.fetchCovidCountriesData();
        // Sort by total cases descending and return all countries
        return { 
          data: countriesData
            .sort((a, b) => b.totalCases - a.totalCases)
        };
      } catch (error) {
        console.error('Error fetching disease cases:', error);
        return { data: [] };
      }
    }
    
    // For other diseases, return sample country data (since we don't have real APIs for them)
    const sampleCountries = [
      { country: 'United States', totalCases: Math.round(disease.data.totalCases * 0.15), activeCases: Math.round(disease.data.activeCases * 0.15), deaths: Math.round(disease.data.deaths * 0.15) },
      { country: 'India', totalCases: Math.round(disease.data.totalCases * 0.12), activeCases: Math.round(disease.data.activeCases * 0.12), deaths: Math.round(disease.data.deaths * 0.12) },
      { country: 'Brazil', totalCases: Math.round(disease.data.totalCases * 0.08), activeCases: Math.round(disease.data.activeCases * 0.08), deaths: Math.round(disease.data.deaths * 0.08) },
      { country: 'China', totalCases: Math.round(disease.data.totalCases * 0.07), activeCases: Math.round(disease.data.activeCases * 0.07), deaths: Math.round(disease.data.deaths * 0.07) },
      { country: 'United Kingdom', totalCases: Math.round(disease.data.totalCases * 0.05), activeCases: Math.round(disease.data.activeCases * 0.05), deaths: Math.round(disease.data.deaths * 0.05) },
      { country: 'Russia', totalCases: Math.round(disease.data.totalCases * 0.04), activeCases: Math.round(disease.data.activeCases * 0.04), deaths: Math.round(disease.data.deaths * 0.04) },
      { country: 'France', totalCases: Math.round(disease.data.totalCases * 0.03), activeCases: Math.round(disease.data.activeCases * 0.03), deaths: Math.round(disease.data.deaths * 0.03) },
      { country: 'Germany', totalCases: Math.round(disease.data.totalCases * 0.03), activeCases: Math.round(disease.data.activeCases * 0.03), deaths: Math.round(disease.data.deaths * 0.03) },
      { country: 'Italy', totalCases: Math.round(disease.data.totalCases * 0.025), activeCases: Math.round(disease.data.activeCases * 0.025), deaths: Math.round(disease.data.deaths * 0.025) },
      { country: 'Spain', totalCases: Math.round(disease.data.totalCases * 0.025), activeCases: Math.round(disease.data.activeCases * 0.025), deaths: Math.round(disease.data.deaths * 0.025) },
      { country: 'Mexico', totalCases: Math.round(disease.data.totalCases * 0.02), activeCases: Math.round(disease.data.activeCases * 0.02), deaths: Math.round(disease.data.deaths * 0.02) },
      { country: 'Indonesia', totalCases: Math.round(disease.data.totalCases * 0.02), activeCases: Math.round(disease.data.activeCases * 0.02), deaths: Math.round(disease.data.deaths * 0.02) },
      { country: 'Japan', totalCases: Math.round(disease.data.totalCases * 0.015), activeCases: Math.round(disease.data.activeCases * 0.015), deaths: Math.round(disease.data.deaths * 0.015) },
      { country: 'Canada', totalCases: Math.round(disease.data.totalCases * 0.015), activeCases: Math.round(disease.data.activeCases * 0.015), deaths: Math.round(disease.data.deaths * 0.015) },
      { country: 'South Africa', totalCases: Math.round(disease.data.totalCases * 0.01), activeCases: Math.round(disease.data.activeCases * 0.01), deaths: Math.round(disease.data.deaths * 0.01) }
    ];
    
    return { data: sampleCountries };
  }

  async getDiseaseStatistics(id) {
    const disease = await this.getDiseaseById(id);
    const d = disease.data;
    
    const mortalityRate = d.totalCases > 0 ? ((d.deaths / d.totalCases) * 100).toFixed(2) : '0';
    const recoveryRate = d.totalCases > 0 ? ((d.recoveredCases / d.totalCases) * 100).toFixed(2) : '0';
    
    return {
      data: {
        mortalityRate: `${mortalityRate}%`,
        recoveryRate: `${recoveryRate}%`,
        activeCases: d.activeCases || 0,
        totalCases: d.totalCases || 0,
        deaths: d.deaths || 0,
        recovered: d.recoveredCases || 0,
        affectedCountries: d.affectedCountries || 0,
        lastUpdated: d.lastUpdated
      }
    };
  }

  // Get diseases by severity
  async getDiseasesBySeverity(severity) {
    const { data } = await this.getAllDiseases();
    return { data: data.filter(d => d.severity === severity) };
  }

  // Search diseases
  async searchDiseases(query) {
    const { data } = await this.getAllDiseases();
    const searchTerm = query.toLowerCase();
    return {
      data: data.filter(d => 
        d.name.toLowerCase().includes(searchTerm) ||
        d.description.toLowerCase().includes(searchTerm) ||
        d.symptoms.toLowerCase().includes(searchTerm)
      )
    };
  }

  // Get country-specific data for any disease
  async getDiseaseByCountry(diseaseId, limit = 20) {
    const disease = await this.getDiseaseById(diseaseId);
    
    if (disease.data.name === 'COVID-19') {
      const countriesData = await this.fetchCovidCountriesData();
      return { 
        data: countriesData
          .sort((a, b) => b.totalCases - a.totalCases)
          .slice(0, limit)
      };
    }
    
    // For other diseases, return estimated data
    const cases = await this.getDiseaseCases(diseaseId);
    return cases;
  }
}

export const diseaseAPI = new DiseaseApi(); 