# Disease Tracker API Documentation

## Overview
The Disease Tracker application fetches data from multiple sources to provide comprehensive disease information.

## Data Sources

### 1. COVID-19 Data (disease.sh API)
- **Global Data**: `https://disease.sh/v3/covid-19/all`
  - Returns: Total cases, deaths, recovered, active cases, affected countries count
  
- **Countries Data**: `https://disease.sh/v3/covid-19/countries`
  - Returns: Country-specific COVID-19 data including:
    - Country name and flag
    - Total cases, active cases, deaths, recovered
    - Cases/deaths per million
    - Testing data
    - Population
    - Continent

- **Historical Data**: `https://disease.sh/v3/covid-19/historical/all?lastdays=30`
  - Returns: Time series data for the last 30 days

### 2. WHO Global Health Observatory (GHO) API
- **Base URL**: `https://ghoapi.azureedge.net/api`
- **Indicators Used**:
  - Tuberculosis cases: `TB_e_inc_num`
  - Tuberculosis deaths: `TB_e_mort_num`
  - Malaria cases: `MALARIA_EST_CASES`
  - Malaria deaths: `MALARIA_EST_DEATHS`
  - HIV prevalence: `HIV_0000000001`
  - Measles cases: `WHS3_48`

### 3. Static/Estimated Data
For diseases without real-time APIs, we use epidemiological estimates:
- Dengue: 390M cases annually, 129 countries
- Influenza: 1B cases annually, 195 countries
- Ebola: Historical data from outbreaks
- Cholera: 2.9M cases annually, 47 countries
- Yellow Fever: 200K cases annually, 34 countries

## Key API Methods

### `getAllDiseases()`
Returns an array of all tracked diseases with:
- Basic disease information (name, description, symptoms, etc.)
- Current statistics (total cases, deaths, active cases)
- Number of affected countries
- Severity level

### `getDiseaseById(id)`
Returns detailed information for a specific disease.

### `getDiseaseCases(id)`
Returns country-specific data for a disease:
- For COVID-19: Real-time data from all affected countries
- For other diseases: Estimated distribution across major affected countries

### `getDiseaseByCountry(diseaseId, limit)`
Returns top affected countries for a specific disease, sorted by total cases.

## Data Structure

### Disease Object
```javascript
{
  id: number,
  name: string,
  description: string,
  symptoms: string,
  prevention: string,
  treatment: string,
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
  totalCases: number,
  activeCases: number,
  deaths: number,
  recoveredCases: number,
  affectedCountries: number,
  lastUpdated: string (ISO date)
}
```

### Country Case Data
```javascript
{
  country: string,
  countryInfo: {
    flag: string (URL),
    iso2: string,
    iso3: string,
    lat: number,
    long: number
  },
  totalCases: number,
  activeCases: number,
  deaths: number,
  recovered: number,
  critical: number,
  todayCases: number,
  todayDeaths: number,
  casesPerOneMillion: number,
  deathsPerOneMillion: number,
  tests: number,
  testsPerOneMillion: number,
  population: number,
  continent: string,
  updated: number (timestamp)
}
```

## Notes
- COVID-19 data is updated in real-time from disease.sh API
- WHO data may have delays and represents annual estimates
- Country-specific data is only available in real-time for COVID-19
- Other diseases use proportional estimates based on epidemiological data 