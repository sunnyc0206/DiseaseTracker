import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Tooltip } from 'react-tooltip';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const WorldMap = ({ data = [], onCountryClick, selectedCountry, showTooltip = true }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [hoveredCountry, setHoveredCountry] = useState(null);
  
  // Create a color scale based on case numbers
  const maxCases = Math.max(...data.map(d => d.totalCases || d.activeCases || d.value || 0), 1);
  const colorScale = scaleLinear()
    .domain([0, maxCases / 4, maxCases / 2, maxCases])
    .range(['#E3F2FD', '#64B5F6', '#1976D2', '#0D47A1']);

  const getCountryData = (geo) => {
    const countryName = geo.properties.NAME || geo.properties.name;
    const iso2 = geo.properties.ISO_A2;
    const iso3 = geo.properties.ISO_A3;
    
    // Try multiple matching strategies
    return data.find(d => 
      d.country === countryName || 
      d.countryCode === iso2 ||
      d.countryCode === iso3 ||
      // Handle special cases
      (countryName === 'United States of America' && d.country === 'USA') ||
      (countryName === 'United Kingdom' && (d.country === 'UK' || d.country === 'United Kingdom')) ||
      (countryName === 'South Korea' && d.country === 'S. Korea') ||
      (countryName === 'Czech Republic' && d.country === 'Czechia') ||
      // Partial matching for complex names
      (d.country && countryName && countryName.toLowerCase().includes(d.country.toLowerCase())) ||
      (d.country && countryName && d.country.toLowerCase().includes(countryName.toLowerCase()))
    );
  };

  const getFillColor = (geo) => {
    const countryData = getCountryData(geo);
    if (!countryData) return '#F5F5F5';
    
    const value = countryData.totalCases || countryData.activeCases || countryData.value || 0;
    return colorScale(value);
  };

  const handleMouseEnter = (geo) => {
    const countryData = getCountryData(geo);
    const countryName = geo.properties.NAME || geo.properties.name;
    
    if (countryData) {
      const content = `
        <div class="font-semibold text-lg mb-2">${countryName}</div>
        <div class="space-y-1 text-sm">
          ${countryData.totalCases ? `<div>Total Cases: ${countryData.totalCases.toLocaleString()}</div>` : ''}
          ${countryData.activeCases ? `<div>Active Cases: ${countryData.activeCases.toLocaleString()}</div>` : ''}
          ${countryData.deaths ? `<div>Deaths: ${countryData.deaths.toLocaleString()}</div>` : ''}
          ${countryData.recovered ? `<div>Recovered: ${countryData.recovered.toLocaleString()}</div>` : ''}
        </div>
      `;
      setTooltipContent(content);
    } else {
      setTooltipContent(`<div class="font-semibold">${countryName}</div><div class="text-sm text-gray-500">No data available</div>`);
    }
    setHoveredCountry(countryName);
  };

  const handleMouseLeave = () => {
    setTooltipContent('');
    setHoveredCountry(null);
  };

  const handleCountryClick = (geo) => {
    if (onCountryClick) {
      const countryData = getCountryData(geo);
      const countryName = geo.properties.NAME || geo.properties.name;
      onCountryClick({
        ...countryData,
        country: countryName,
        properties: geo.properties
      });
    }
  };

  return (
    <div className="relative w-full h-[500px] bg-gray-50 rounded-lg overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 147,
          center: [0, 20]
        }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isSelected = selectedCountry && 
                  (selectedCountry.country === (geo.properties.NAME || geo.properties.name) ||
                   selectedCountry.countryCode === geo.properties.ISO_A2);
                const isHovered = hoveredCountry === (geo.properties.NAME || geo.properties.name);
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getFillColor(geo)}
                    stroke={isSelected ? '#1976D2' : '#FFFFFF'}
                    strokeWidth={isSelected ? 2 : 0.5}
                    style={{
                      default: {
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      },
                      hover: {
                        fill: isHovered ? '#FFC107' : getFillColor(geo),
                        stroke: '#333333',
                        strokeWidth: 1,
                        outline: 'none',
                        cursor: onCountryClick ? 'pointer' : 'default'
                      },
                      pressed: {
                        fill: '#FF9800',
                        outline: 'none'
                      }
                    }}
                    onMouseEnter={() => handleMouseEnter(geo)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleCountryClick(geo)}
                    data-tooltip-id="map-tooltip"
                    data-tooltip-html={tooltipContent}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <p className="text-xs font-semibold mb-2">Disease Cases</p>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-[#E3F2FD]"></div>
          <div className="w-4 h-4 bg-[#64B5F6]"></div>
          <div className="w-4 h-4 bg-[#1976D2]"></div>
          <div className="w-4 h-4 bg-[#0D47A1]"></div>
          <span className="text-xs ml-2">Low → High</span>
        </div>
      </div>
      
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="bg-white p-2 rounded shadow hover:bg-gray-100 transition-colors" title="Zoom In">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button className="bg-white p-2 rounded shadow hover:bg-gray-100 transition-colors" title="Zoom Out">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>
      
      {showTooltip && (
        <Tooltip 
          id="map-tooltip" 
          className="!bg-gray-900 !text-white !p-3 !rounded-lg !text-sm !max-w-xs"
          opacity={0.95}
        />
      )}
    </div>
  );
};

export default WorldMap; 