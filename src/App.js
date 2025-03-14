import logo from './logo.svg';
import './App.css';
import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image, Group, Rect, Text, Arc } from 'react-konva';
import useImage from 'use-image';

function App() {
  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <WorldMap width="100%" height="100%" />
    </div>
  );
}

// Building types with their properties
const buildingTypes = {
  house: { 
    name: 'House', 
    color: '#8B4513', 
    width: 50, 
    height: 50,
    effects: { happiness: 5, gold: -10, food: -5 }
  },
  church: { 
    name: 'Church', 
    color: '#C0C0C0', 
    width: 60, 
    height: 80,
    effects: { happiness: 15, gold: -20, food: 0 }
  },
  mine: { 
    name: 'Gold Mine', 
    color: '#696969', 
    width: 70, 
    height: 70,
    effects: { happiness: -10, gold: 30, food: 0 }
  },
  farm: { 
    name: 'Wheat Farm', 
    color: '#FFD700', 
    width: 80, 
    height: 60,
    effects: { happiness: 5, gold: 10, food: 25 }
  },
  lumbermill: { 
    name: 'Lumber Mill', 
    color: '#556B2F', 
    width: 65, 
    height: 65,
    effects: { happiness: -5, gold: 20, food: 0 }
  },
  barracks: { 
    name: 'Barracks', 
    color: '#8B0000', 
    width: 75, 
    height: 55,
    effects: { happiness: 0, gold: -15, food: -10 }
  },
  market: { 
    name: 'Market', 
    color: '#DAA520', 
    width: 70, 
    height: 50,
    effects: { happiness: 10, gold: 15, food: 10 }
  },
  warriorcamp: { 
    name: 'Warrior Camp', 
    color: '#800000', 
    width: 65, 
    height: 65,
    effects: { happiness: -5, gold: -20, food: -15 }
  },
  archeryrange: { 
    name: 'Archery Range', 
    color: '#006400', 
    width: 70, 
    height: 60,
    effects: { happiness: -3, gold: -25, food: -10 }
  },
  tavern: { 
    name: 'Tavern', 
    color: '#CD853F', 
    width: 60, 
    height: 55,
    effects: { happiness: 20, gold: 10, food: -5 }
  },
  storehouse: { 
    name: 'Storehouse', 
    color: '#A0522D', 
    width: 75, 
    height: 75,
    effects: { happiness: 0, gold: 5, food: 15 }
  }
};

// Unit types with requirements
const unitTypes = {
  warrior: {
    name: 'Warrior',
    color: '#FF0000',
    width: 30,
    height: 30,
    cost: { gold: 20, food: 10 },
    requiredBuilding: 'warriorcamp',
    buildTime: 3, // Just 3 seconds to complete
    speed: 80 // pixels per second
  },
  archer: {
    name: 'Archer',
    color: '#00FF00',
    width: 30,
    height: 30,
    cost: { gold: 25, food: 8 },
    requiredBuilding: 'archeryrange',
    buildTime: 3, // Just 3 seconds to complete
    speed: 100 // pixels per second
  },
  knight: {
    name: 'Knight',
    color: '#0000FF',
    width: 35,
    height: 35,
    cost: { gold: 40, food: 15 },
    requiredBuilding: 'barracks',
    buildTime: 3, // Just 3 seconds to complete
    speed: 60 // pixels per second
  }
};

// Resource bar component
const ResourceBar = ({ label, value, color }) => {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div style={{ 
        width: '100%', 
        height: '10px', 
        backgroundColor: '#333',
        borderRadius: '5px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          width: `${value}%`, 
          height: '100%', 
          backgroundColor: color,
          transition: 'width 0.5s ease'
        }}></div>
      </div>
    </div>
  );
};

// City stats panel component
const CityStatsPanel = ({ cityStats }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: '15px',
      borderRadius: '5px',
      color: 'white',
      zIndex: 100,
      width: '220px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', textAlign: 'center' }}>City Status</h3>
      <ResourceBar label="Gold" value={cityStats.gold} color="#FFD700" />
      <ResourceBar label="Happiness" value={cityStats.happiness} color="#FF69B4" />
      <ResourceBar label="Food" value={cityStats.food} color="#32CD32" />
      
      <div style={{ marginTop: '15px', fontSize: '14px' }}>
        <p>Population: {cityStats.population}</p>
        <p>Buildings: {cityStats.buildingCount}</p>
        <p>Military: {cityStats.militaryUnits || 0}</p>
        <p style={{ fontStyle: 'italic', marginTop: '10px', fontSize: '12px' }}>
          Tip: Build a balanced city to reach 100% in all resources!
        </p>
      </div>
    </div>
  );
};

// Building menu component
const BuildingMenu = ({ onSelectBuilding, selectedBuilding, availableUnits }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: '10px',
      borderRadius: '5px',
      color: 'white',
      zIndex: 100,
      maxWidth: '180px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <h3 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Buildings</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {Object.entries(buildingTypes).map(([key, building]) => (
          <button 
            key={key}
            onClick={() => onSelectBuilding(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '5px',
              backgroundColor: selectedBuilding === key ? '#4a4a4a' : '#333',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: building.color,
              marginRight: '10px'
            }}></div>
            {building.name}
          </button>
        ))}
      </div>
      
      <h3 style={{ margin: '15px 0 10px 0', textAlign: 'center' }}>Units</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {Object.entries(unitTypes).map(([key, unit]) => {
          const isAvailable = availableUnits.includes(key);
          return (
            <button 
              key={key}
              onClick={() => isAvailable && onSelectBuilding(`unit_${key}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '5px',
                backgroundColor: selectedBuilding === `unit_${key}` ? '#4a4a4a' : '#333',
                border: 'none',
                borderRadius: '3px',
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                color: 'white',
                opacity: isAvailable ? 1 : 0.5,
              }}
              title={!isAvailable ? `Requires ${buildingTypes[unit.requiredBuilding].name}` : ''}
            >
              <div style={{ 
                width: '20px', 
                height: '20px', 
                backgroundColor: unit.color,
                marginRight: '10px',
                borderRadius: '50%'
              }}></div>
              {unit.name}
              {!isAvailable && (
                <div style={{ marginLeft: 'auto', fontSize: '12px' }}>🔒</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Placeholder building component for the map
const Building = ({ type, x, y }) => {
  // Guard against undefined type
  if (!type) {
    console.warn("Building component received undefined type");
    return null;
  }
  
  // Check if it's a unit - with safe type checking
  if (typeof type === 'string' && type.startsWith('unit_')) {
    const unitType = type.replace('unit_', '');
    const unit = unitTypes[unitType];
    
    if (!unit) {
      console.warn(`Unknown unit type: ${unitType}`);
      return null;
    }
    
    return (
      <Group x={x} y={y}>
        <Rect
          width={unit.width}
          height={unit.height}
          fill={unit.color}
          shadowColor="black"
          shadowBlur={3}
          shadowOffsetX={1}
          shadowOffsetY={1}
          cornerRadius={15} // Make units more rounded
        />
        <Text
          text={unit.name}
          fontSize={10}
          fill="white"
          width={unit.width}
          align="center"
          y={unit.height + 5}
        />
      </Group>
    );
  }
  
  // Regular building - with safe type checking
  const building = buildingTypes[type];
  
  if (!building) {
    console.warn(`Unknown building type: ${type}`);
    return null;
  }
  
  return (
    <Group x={x} y={y}>
      <Rect
        width={building.width}
        height={building.height}
        fill={building.color}
        shadowColor="black"
        shadowBlur={5}
        shadowOffsetX={2}
        shadowOffsetY={2}
        cornerRadius={3}
      />
      <Text
        text={building.name}
        fontSize={12}
        fill="white"
        width={building.width}
        align="center"
        y={building.height + 5}
      />
    </Group>
  );
};

// Add the AnimatedUnit component definition
const AnimatedUnit = ({ unit, progress }) => {
  // Make sure we have valid unit information
  if (!unit || !unit.unitType || !unitTypes[unit.unitType]) {
    console.error("Invalid unit data in AnimatedUnit:", unit);
    return null;
  }
  
  const unitInfo = unitTypes[unit.unitType];
  const progressPercent = Math.floor(progress * 100);
  
  return (
    <Group x={unit.x} y={unit.y}>
      {/* Background circle (faded version of the unit) */}
      <Rect
        width={unitInfo.width}
        height={unitInfo.height}
        fill={unitInfo.color}
        opacity={0.3}
        cornerRadius={15}
      />
      
      {/* Progress arc */}
      <Arc
        x={unitInfo.width / 2}
        y={unitInfo.height / 2}
        innerRadius={0}
        outerRadius={Math.max(unitInfo.width, unitInfo.height) / 2 + 5}
        angle={progress * 360}
        fill={unitInfo.color}
        opacity={0.8}
        rotation={-90}
      />
      
      {/* Training text - make more prominent */}
      <Text
        text={`${progressPercent}%`}
        fontSize={12}
        fontStyle="bold"
        fill="white"
        width={unitInfo.width}
        align="center"
        y={unitInfo.height + 5}
      />
      
      {/* Unit type label */}
      <Text
        text={unitInfo.name}
        fontSize={10}
        fill="white"
        width={unitInfo.width}
        align="center"
        y={-15}
      />
    </Group>
  );
};

const WorldMap = ({ width, height }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [mapImage] = useImage('/assets/world-map.jpeg');
  const stageRef = useRef(null);
  
  // Add missing state declarations 
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [unitsInTraining, setUnitsInTraining] = useState([]);
  const [buildProgress, setBuildProgress] = useState({});
  
  // Added state for city management
  const [cityStats, setCityStats] = useState({
    gold: 50,
    happiness: 50,
    food: 50,
    population: 100,
    buildingCount: 0,
    militaryUnits: 0
  });
  
  // Track available units based on built structures
  const [availableUnits, setAvailableUnits] = useState([]);
  
  // Get the viewport dimensions
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Add new states for gold generation
  const [goldDeposits, setGoldDeposits] = useState([]);
  const [lastIncomeTime, setLastIncomeTime] = useState(Date.now());
  const [taxRate, setTaxRate] = useState(10); // Default 10% tax rate
  
  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate initial scale and position when map image loads
  useEffect(() => {
    if (mapImage) {
      // Calculate scale needed to fit map to screen
      const mapWidth = 2000;
      const mapHeight = 1500;
      const widthRatio = dimensions.width / mapWidth;
      const heightRatio = dimensions.height / mapHeight;
      
      // Use the larger ratio to ensure map fills the screen
      const initialScale = Math.max(widthRatio, heightRatio) * 1.01; // Slightly larger to avoid any gaps
      
      setScale(initialScale);
      setPosition({
        x: (dimensions.width - mapWidth * initialScale) / 2,
        y: (dimensions.height - mapHeight * initialScale) / 2
      });
    }
  }, [mapImage, dimensions.width, dimensions.height]);

  // Handle drag move with constraints
  const handleDragMove = (e) => {
    // Apply constraints during drag
    const newPos = constrainPosition({
      x: e.target.x(),
      y: e.target.y()
    }, scale);
    
    // Update position state and set the actual position
    setPosition(newPos);
    e.target.position(newPos);
  };

  // Constrain position to prevent white space
  const constrainPosition = (pos, newScale) => {
    const mapWidth = 2000 * newScale;
    const mapHeight = 1500 * newScale;
    
    // Calculate bounds with a small buffer to ensure no white space
    const minX = Math.min(dimensions.width - mapWidth, 0);
    const minY = Math.min(dimensions.height - mapHeight, 0);
    const maxX = 0;
    const maxY = 0;
    
    // If map is smaller than viewport, center it
    if (mapWidth <= dimensions.width) {
      pos.x = (dimensions.width - mapWidth) / 2;
    } else {
      pos.x = Math.min(maxX, Math.max(minX, pos.x));
    }
    
    if (mapHeight <= dimensions.height) {
      pos.y = (dimensions.height - mapHeight) / 2;
    } else {
      pos.y = Math.min(maxY, Math.max(minY, pos.y));
    }
    
    return pos;
  };

  // Handle zoom with mouse wheel
  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = scale;
    const pointerPosition = stage.getPointerPosition();
    
    // Calculate new scale with min/max constraints
    // Ensure minimum scale always keeps the map filling the screen
    const minScale = Math.max(
      dimensions.width / 2000,  // Full viewport width
      dimensions.height / 1500  // Full viewport height
    ) * 1.01; // Add 1% to avoid any gaps
    
    const maxScale = 5;  // Maximum zoom level
    
    let newScale;
    if (e.evt.deltaY < 0) {
      newScale = Math.min(oldScale * scaleBy, maxScale);
    } else {
      newScale = Math.max(oldScale / scaleBy, minScale);
    }
    
    // Calculate new position based on pointer
    const newPos = {
      x: pointerPosition.x - (pointerPosition.x - position.x) * (newScale / oldScale),
      y: pointerPosition.y - (pointerPosition.y - position.y) * (newScale / oldScale)
    };
    
    // Apply constraints
    const constrainedPos = constrainPosition(newPos, newScale);
    
    setScale(newScale);
    setPosition(constrainedPos);
  };

  // Add keyboard navigation for scrolling the map
  useEffect(() => {
    const handleKeyDown = (e) => {
      const moveDistance = 20 / scale; // Adjust movement based on zoom level
      let newPos = { ...position };
      
      switch (e.key) {
        case 'ArrowUp':
          newPos.y += moveDistance;
          break;
        case 'ArrowDown':
          newPos.y -= moveDistance;
          break;
        case 'ArrowLeft':
          newPos.x += moveDistance;
          break;
        case 'ArrowRight':
          newPos.x -= moveDistance;
          break;
        default:
          return;
      }
      
      // Apply constraints
      const constrainedPos = constrainPosition(newPos, scale);
      setPosition(constrainedPos);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scale, position, dimensions.width, dimensions.height]);

  // Log image loading status for debugging
  useEffect(() => {
    console.log("Map image status:", mapImage);
  }, [mapImage]);

  // Update city stats when buildings change
  useEffect(() => {
    if (buildings.length === 0) return;
    
    // Base stats (starting values)
    let stats = {
      gold: 50,
      happiness: 50,
      food: 50,
    };
    
    let militaryCount = 0;
    
    // Calculate effects from all buildings and count military units
    buildings.forEach(building => {
      if (building.type.startsWith('unit_')) {
        militaryCount++;
        // Units consume resources but don't need to affect stats further
      } else {
        const effects = buildingTypes[building.type].effects;
        
        // Add building effects to stats
        stats.gold += effects.gold;
        stats.happiness += effects.happiness;
        stats.food += effects.food;
      }
    });
    
    // Ensure values are between 0 and 100
    stats.gold = Math.min(100, Math.max(0, stats.gold));
    stats.happiness = Math.min(100, Math.max(0, stats.happiness));
    stats.food = Math.min(100, Math.max(0, stats.food));
    
    // Calculate population based on happiness and food
    const population = 100 + Math.floor((stats.happiness + stats.food) / 2);
    
    // Don't directly set cityStats here, instead update only the calculated values
    // while preserving the current gold/food that may have been reduced by unit training
    setCityStats(prevStats => ({
      ...prevStats,
      happiness: stats.happiness,
      population,
      buildingCount: buildings.filter(b => !b.type.startsWith('unit_')).length,
      militaryUnits: militaryCount
    }));
  }, [buildings]);

  // Determine which units can be trained based on constructed buildings
  useEffect(() => {
    // Check which military buildings exist to determine available units
    const militaryBuildings = new Set();
    
    if (buildings && buildings.length > 0) {
      buildings.forEach(building => {
        if (building && building.type && typeof building.type === 'string' && !building.type.startsWith('unit_')) {
          militaryBuildings.add(building.type);
        }
      });
    }
    
    // Determine which units can be trained based on existing buildings
    const available = [];
    
    Object.entries(unitTypes).forEach(([unitType, unit]) => {
      if (militaryBuildings.has(unit.requiredBuilding)) {
        available.push(unitType);
      }
    });
    
    setAvailableUnits(available);
  }, [buildings]);

  // Improved training progress and completion system
  useEffect(() => {
    if (!unitsInTraining || unitsInTraining.length === 0) return;
    
    const progressInterval = setInterval(() => {
      const now = Date.now();
      const updatedProgress = {...buildProgress};
      let changed = false;
      
      unitsInTraining.forEach(unit => {
        const buildTime = unitTypes[unit.unitType].buildTime * 1000;
        const elapsed = now - unit.startTime;
        const progress = Math.min(1, elapsed / buildTime);
        
        updatedProgress[unit.id] = progress;
        changed = true;
      });
      
      if (changed) {
        setBuildProgress(updatedProgress);
      }
    }, 100); // Update progress more frequently (10 times per second)
    
    return () => clearInterval(progressInterval);
  }, [unitsInTraining]);

  // Separate effect for completing units
  useEffect(() => {
    if (!unitsInTraining || unitsInTraining.length === 0) return;
    
    const completionCheck = setInterval(() => {
      const now = Date.now();
      const completedUnits = [];
      const remainingUnits = [];
      
      unitsInTraining.forEach(unit => {
        const buildTime = unitTypes[unit.unitType].buildTime * 1000;
        if (now - unit.startTime >= buildTime) {
          completedUnits.push(unit);
        } else {
          remainingUnits.push(unit);
        }
      });
      
      if (completedUnits.length > 0) {
        console.log(`${completedUnits.length} units completed training:`, 
          completedUnits.map(u => `${u.unitType} (ID: ${u.id})`));
          
        // Process all completed units
        const newBuildings = [...buildings];
        
        completedUnits.forEach(unit => {
          // Place the unit outside the training building
          const building = unit.trainingBuilding;
          if (!building) {
            console.error("No training building found for unit:", unit);
            return;
          }
          
          const buildingWidth = buildingTypes[building.type]?.width || 50;
          const buildingHeight = buildingTypes[building.type]?.height || 50;
          
          // Position at the bottom of the building with some spacing
          const posX = building.x + buildingWidth/2;
          const posY = building.y + buildingHeight + 20;
          
          newBuildings.push({
            id: unit.id,
            type: `unit_${unit.unitType}`,
            x: posX,
            y: posY
          });
          
          console.log(`Unit ${unit.unitType} created at position (${posX}, ${posY})`);
        });
        
        setBuildings(newBuildings);
        setUnitsInTraining(remainingUnits);
        
        // Update city stats to reflect new military units
        setCityStats(prevStats => ({
          ...prevStats,
          militaryUnits: prevStats.militaryUnits + completedUnits.length
        }));
      }
    }, 500); // Check for completion every half second
    
    return () => clearInterval(completionCheck);
  }, [unitsInTraining, buildings]);

  // Modify handleStageClick to improve unit training
  const handleStageClick = (e) => {
    if (!selectedBuilding) return;
    
    // Get click position relative to the map
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();
    
    // Convert screen coordinates to map coordinates
    const mapX = (pointerPosition.x - position.x) / scale;
    const mapY = (pointerPosition.y - position.y) / scale;
    
    // Check if trying to create a unit (unit training)
    if (typeof selectedBuilding === 'string' && selectedBuilding.startsWith('unit_')) {
      const unitType = selectedBuilding.replace('unit_', '');
      const unit = unitTypes[unitType];
      
      if (!unit) {
        console.error(`Unknown unit type: ${unitType}`);
        return;
      }
      
      // Check if player has the required building
      if (!availableUnits.includes(unitType)) {
        console.log(`Cannot create ${unit.name}. You need a ${buildingTypes[unit.requiredBuilding].name} first!`);
        return;
      }
      
      // Check if player has enough resources
      if (cityStats.gold < unit.cost.gold || cityStats.food < unit.cost.food) {
        console.log(`Not enough resources to train ${unit.name}! Needs ${unit.cost.gold} gold and ${unit.cost.food} food.`);
        return;
      }
      
      // Find the required training buildings
      const trainingBuildingType = unit.requiredBuilding;
      const trainingBuildings = buildings.filter(b => 
        b.type === trainingBuildingType
      );
      
      if (trainingBuildings.length === 0) {
        console.log(`No ${buildingTypes[trainingBuildingType].name} found to train this unit!`);
        return;
      }
      
      // Find closest training building
      let closestBuilding = trainingBuildings[0];
      let closestDistance = Infinity;
      
      trainingBuildings.forEach(building => {
        const dx = building.x - mapX;
        const dy = building.y - mapY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestBuilding = building;
        }
      });
      
      // Deduct resources immediately when training begins
      setCityStats(prevStats => ({
        ...prevStats,
        gold: Math.max(0, prevStats.gold - unit.cost.gold),
        food: Math.max(0, prevStats.food - unit.cost.food)
      }));
      
      const unitId = Date.now();
      
      // Create a unit in training at the training building
      const unitInTraining = {
        id: unitId,
        unitType: unitType,
        x: closestBuilding.x,
        y: closestBuilding.y,
        startTime: Date.now(),
        trainingBuilding: closestBuilding
      };
      
      console.log(`Started training ${unit.name} (ID: ${unitId}) at ${closestBuilding.type}`);
      
      setUnitsInTraining(prev => [...prev, unitInTraining]);
      setBuildProgress(prev => ({
        ...prev,
        [unitId]: 0 // Start at 0%
      }));
    } else {
      // Regular building placement
      const newBuilding = {
        id: Date.now(),
        type: selectedBuilding,
        x: mapX,
        y: mapY
      };
      
      setBuildings([...buildings, newBuilding]);
    }
  };

  // Passive income timer
  useEffect(() => {
    const incomeInterval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - lastIncomeTime) / 1000;
      
      // Calculate passive income from buildings
      let baseIncome = 0;
      
      // Gold from mines and other production buildings
      buildings.forEach(building => {
        if (!building.type || typeof building.type !== 'string') return;
        if (building.type.startsWith('unit_')) return;
        
        const buildingType = buildingTypes[building.type];
        if (buildingType && buildingType.effects && buildingType.effects.gold > 0) {
          baseIncome += buildingType.effects.gold / 20; // Scale down the effect for per-second income
        }
      });
      
      // Gold from population taxes
      const taxIncome = (cityStats.population * taxRate / 100) / 10; // Tax income per 10 seconds
      
      // Total income per second
      const totalIncome = baseIncome + taxIncome;
      
      // Apply income if there is any
      if (totalIncome > 0) {
        setCityStats(prevStats => ({
          ...prevStats,
          gold: Math.min(100, prevStats.gold + totalIncome * elapsedSeconds)
        }));
      }
      
      setLastIncomeTime(now);
      
      // Random chance to spawn gold deposit (5% chance every 10 seconds)
      if (Math.random() < 0.05) {
        spawnGoldDeposit();
      }
    }, 1000); // Check every second
    
    return () => clearInterval(incomeInterval);
  }, [lastIncomeTime, buildings, cityStats.population, taxRate]);
  
  // Function to spawn random gold deposits on the map
  const spawnGoldDeposit = () => {
    // Random position within the map bounds
    const x = Math.random() * 1800 + 100; // Keep away from edges
    const y = Math.random() * 1300 + 100; // Keep away from edges
    
    const newDeposit = {
      id: Date.now(),
      x,
      y,
      amount: Math.floor(Math.random() * 15) + 5, // 5-20 gold
      size: Math.floor(Math.random() * 20) + 20, // 20-40 pixels
    };
    
    setGoldDeposits(prev => [...prev, newDeposit]);
  };
  
  // Function to collect gold deposit when clicked
  const collectGoldDeposit = (depositId) => {
    const deposit = goldDeposits.find(d => d.id === depositId);
    if (!deposit) return;
    
    // Add gold to city stats
    setCityStats(prevStats => ({
      ...prevStats,
      gold: Math.min(100, prevStats.gold + deposit.amount)
    }));
    
    // Remove the collected deposit
    setGoldDeposits(prev => prev.filter(d => d.id !== depositId));
    
    // Show a notification (you can add a visual effect here)
    console.log(`Collected ${deposit.amount} gold!`);
  };
  
  // Add tax control panel
  const TaxControlPanel = () => (
    <div style={{
      position: 'absolute',
      bottom: '10px',
      left: '10px',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: '10px',
      borderRadius: '5px',
      color: 'white',
      zIndex: 100,
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Tax Rate: {taxRate}%</h4>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button 
          onClick={() => setTaxRate(Math.max(0, taxRate - 5))}
          style={{ 
            padding: '5px 10px', 
            marginRight: '10px',
            backgroundColor: '#333',
            border: 'none',
            color: 'white',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          -5%
        </button>
        <div style={{ 
          width: '100px', 
          height: '8px', 
          backgroundColor: '#555',
          borderRadius: '4px',
          position: 'relative'
        }}>
          <div style={{ 
            position: 'absolute',
            left: `${taxRate}%`,
            top: '-4px',
            width: '16px',
            height: '16px',
            backgroundColor: taxRate > 20 ? '#ff4d4d' : '#4da6ff',
            borderRadius: '50%',
            transform: 'translateX(-50%)'
          }} />
        </div>
        <button 
          onClick={() => setTaxRate(Math.min(30, taxRate + 5))}
          style={{ 
            padding: '5px 10px', 
            marginLeft: '10px',
            backgroundColor: '#333',
            border: 'none',
            color: 'white',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          +5%
        </button>
      </div>
      <p style={{ 
        margin: '10px 0 0 0', 
        fontSize: '12px',
        color: taxRate > 20 ? '#ff4d4d' : 'white'
      }}>
        {taxRate <= 10 ? 'Low taxes: Citizens are happy but income is reduced' : 
         taxRate <= 20 ? 'Balanced taxes: Good income without much penalty' : 
         'High taxes: More gold but citizens are unhappy!'}
      </p>
    </div>
  );
  
  // Function to convert food to gold (trade)
  const convertFoodToGold = () => {
    if (cityStats.food < 20) return; // Need at least 20% food
    
    setCityStats(prevStats => ({
      ...prevStats,
      food: prevStats.food - 20,
      gold: Math.min(100, prevStats.gold + 15)
    }));
  };
  
  // Add trade button when you have a market
  const hasMarket = buildings && buildings.some(b => b.type === 'market');
  
  return (
    <>
      <CityStatsPanel cityStats={cityStats} />
      <BuildingMenu 
        onSelectBuilding={setSelectedBuilding} 
        selectedBuilding={selectedBuilding}
        availableUnits={availableUnits}
      />
      
      {/* Tax control panel */}
      <TaxControlPanel />
      
      {/* Trade button (if you have a market) */}
      {hasMarket && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '10px',
          borderRadius: '5px',
          color: 'white',
          zIndex: 100,
        }}>
          <button 
            onClick={convertFoodToGold}
            disabled={cityStats.food < 20}
            style={{ 
              padding: '10px 15px',
              backgroundColor: cityStats.food >= 20 ? '#DAA520' : '#555',
              border: 'none',
              color: 'white',
              borderRadius: '5px',
              cursor: cityStats.food >= 20 ? 'pointer' : 'not-allowed',
              opacity: cityStats.food >= 20 ? 1 : 0.7,
            }}
          >
            Trade 20 Food → 15 Gold
          </button>
        </div>
      )}
      
      {/* Unit tooltip */}
      {selectedBuilding && typeof selectedBuilding === 'string' && selectedBuilding.startsWith('unit_') && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '10px',
          borderRadius: '5px',
          color: 'white',
          zIndex: 100,
        }}>
          {(() => {
            const unitType = selectedBuilding.replace('unit_', '');
            const unit = unitTypes[unitType];
            return `Training ${unit.name}: ${unit.cost.gold} gold, ${unit.cost.food} food`;
          })()}
        </div>
      )}
      
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        ref={stageRef}
        onWheel={handleWheel}
        onClick={handleStageClick}
        style={{ display: 'block' }}
      >
        <Layer>
          <Group
            x={position.x}
            y={position.y}
            scale={{ x: scale, y: scale }}
            draggable={true}
            onDragMove={handleDragMove}
            onDragEnd={(e) => {
              const finalPos = constrainPosition({
                x: e.target.x(),
                y: e.target.y()
              }, scale);
              setPosition(finalPos);
            }}
          >
            {mapImage && (
              <Image
                image={mapImage}
                width={2000}
                height={1500}
              />
            )}
            
            {/* Gold deposits */}
            {goldDeposits.map(deposit => (
              <Group 
                key={deposit.id} 
                x={deposit.x} 
                y={deposit.y}
                onClick={() => collectGoldDeposit(deposit.id)}
                onTap={() => collectGoldDeposit(deposit.id)}
              >
                <Rect
                  width={deposit.size}
                  height={deposit.size / 2}
                  fill="#FFD700"
                  shadowColor="black"
                  shadowBlur={5}
                  shadowOffsetX={2}
                  shadowOffsetY={2}
                  cornerRadius={5}
                />
                <Text
                  text={`${deposit.amount} gold`}
                  fontSize={12}
                  fill="white"
                  width={deposit.size}
                  align="center"
                  y={deposit.size / 2 + 5}
                />
              </Group>
            ))}
            
            {/* Render buildings with robust null/type checking */}
            {buildings && buildings.length > 0 && buildings.map(building => {
              if (!building || !building.type) return null;
              
              // Only render actual buildings (not units)
              if (typeof building.type === 'string' && !building.type.startsWith('unit_')) {
                return (
                  <Building 
                    key={building.id}
                    type={building.type}
                    x={building.x}
                    y={building.y}
                  />
                );
              }
              return null;
            })}
            
            {/* Render units in training with robust null checking */}
            {unitsInTraining && unitsInTraining.length > 0 && unitsInTraining.map(unit => {
              if (!unit) return null;
              return (
                <AnimatedUnit
                  key={unit.id}
                  unit={unit}
                  progress={buildProgress && buildProgress[unit.id] ? buildProgress[unit.id] : 0}
                />
              );
            })}
            
            {/* Render completed units with robust null/type checking */}
            {buildings && buildings.length > 0 && buildings.map(building => {
              if (!building || !building.type) return null;
              
              // Only render units
              if (typeof building.type === 'string' && building.type.startsWith('unit_')) {
                return (
                  <Building 
                    key={building.id}
                    type={building.type}
                    x={building.x}
                    y={building.y}
                  />
                );
              }
              return null;
            })}
          </Group>
        </Layer>
      </Stage>
    </>
  );
};

export default App;
