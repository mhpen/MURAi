import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { 
  Box, 
  Card, 
  Select, 
  MenuItem, 
  Typography, 
  Container, 
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Slider,
  Divider,
  Slide,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  DarkMode as DarkModeIcon,
  Speed as SpeedIcon,
  ColorLens as ColorLensIcon,
  AccessibilityNew as AccessibilityNewIcon,
  TextFields as TextFieldsIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Warning as WarningIcon,
  CompareArrows as CompareArrowsIcon,
} from '@mui/icons-material';
import Logo from '../../assets/logo.png'; // Add your logo image
import api from '@/utils/api';

const BubbleChart = () => {
  const [timeFrame, setTimeFrame] = useState('day');
  const [bubbleData, setBubbleData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    darkMode: true,
    bubbleColor: '#4CAF50',
    backgroundColor: '#111111',
    showLabels: true,
    reducedMotion: false,
    bounciness: 0.8,
    colorByCount: false,
    showSeverity: false,
    animationSpeed: 1,
    collisions: true,
  });
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample data with more realistic inappropriate words
  const sampleData = {
    words: [
      { word: 'Offensive1', count: 156, severity: 8 },
      { word: 'Harmful2', count: 89, severity: 5 },
      { word: 'Toxic3', count: 120, severity: 7 },
      { word: 'Hate4', count: 200, severity: 9 },
      { word: 'Bullying5', count: 67, severity: 3 },
      { word: 'Threat6', count: 250, severity: 10 },
      { word: 'Slur7', count: 180, severity: 6 },
      { word: 'Harassment8', count: 100, severity: 4 },
      { word: 'Abuse9', count: 145, severity: 8 },
      { word: 'Violence10', count: 167, severity: 9 },
      { word: 'Discrimination11', count: 134, severity: 7 },
      { word: 'Insult12', count: 98, severity: 5 },
    ]
  };

  const getRandomPosition = () => ({
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    velocityX: (Math.random() - 0.5) * 0.2,
    velocityY: (Math.random() - 0.5) * 0.2,
  });

  // Add responsive sizing helper
  const getResponsiveSizes = useCallback((screenWidth) => {
    if (screenWidth < 600) { // mobile
      return {
        bubbleBase: 0.15, // smaller base size for bubbles
        minSize: 30,
        maxSize: 60,
        fontSize: {
          word: '0.7rem',
          count: '0.6rem'
        },
        bottomBarPadding: '6px 12px',
        searchWidth: 120,
        logoHeight: '24px'
      };
    }
    return {
      bubbleBase: 0.3, // original size
      minSize: 40,
      maxSize: 100,
      fontSize: {
        word: '1rem',
        count: '0.8rem'
      },
      bottomBarPadding: '8px 16px',
      searchWidth: 180,
      logoHeight: '32px'
    };
  }, []);

  // Modify processData to properly handle reducedMotion
  const processData = useCallback(() => {
    const sizes = getResponsiveSizes(window.innerWidth);
    const speedMultiplier = settings.reducedMotion ? 0 : 0.2;
    
    // Calculate the maximum count to normalize sizes
    const maxCount = Math.max(...sampleData.words.map(item => item.count));
    
    // Calculate minimum and maximum bubble sizes
    const minSize = 40;
    const maxSize = 100;
    
    // Function to calculate size based on count
    const calculateSize = (count) => {
      return minSize + ((count / maxCount) * (maxSize - minSize));
    };

    // Grid-based positioning to prevent overlaps
    const gridSize = 10; // 10x10 grid
    const cellWidth = 100 / gridSize;
    const cellHeight = 100 / gridSize;
    const usedCells = new Set();

    const findAvailableCell = (size) => {
      const padding = size / window.innerWidth * 100; // Convert size to percentage
      
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const cellKey = `${i}-${j}`;
          if (!usedCells.has(cellKey)) {
            // Calculate position in percentages
            const x = (i * cellWidth) + (cellWidth / 2);
            const y = (j * cellHeight) + (cellHeight / 2);
            
            // Check if this position would overlap with any existing bubbles
            let overlaps = false;
            for (const existingCell of usedCells) {
              const [existingI, existingJ] = existingCell.split('-').map(Number);
              const existingX = (existingI * cellWidth) + (cellWidth / 2);
              const existingY = (existingJ * cellHeight) + (cellHeight / 2);
              
              const distance = Math.sqrt(
                Math.pow(x - existingX, 2) + 
                Math.pow(y - existingY, 2)
              );
              
              if (distance < padding * 2) {
                overlaps = true;
                break;
              }
            }
            
            if (!overlaps) {
              usedCells.add(cellKey);
              return { x, y };
            }
          }
        }
      }
      // Fallback position if no space found
      return { x: 50, y: 50 };
    };

    const newBubbleData = sampleData.words.map(item => {
      const size = calculateSize(item.count);
      const position = findAvailableCell(size);
      
      return {
        ...item,
        size: size,
        x: position.x,
        y: position.y,
        velocityX: (Math.random() - 0.5) * speedMultiplier,
        velocityY: (Math.random() - 0.5) * speedMultiplier,
        color: settings.highContrast ? 
          (item.severity > 5 ? '#FF0000' : '#00FF00') : 
          settings.bubbleColor,
      };
    });
    
    setBubbleData(newBubbleData);
  }, [settings.reducedMotion, settings.highContrast, settings.bubbleColor, getResponsiveSizes]);

  const updateBubblePositions = useCallback(() => {
    if (settings.reducedMotion) return;

    requestAnimationFrame(() => {
      setBubbleData(prevData => {
        const newData = [...prevData];
        
        // Update positions
        for (let i = 0; i < newData.length; i++) {
          let bubble = newData[i];
          let newX = bubble.x + bubble.velocityX;
          let newY = bubble.y + bubble.velocityY;

          // Boundary check with elastic bounce
          if (newX - (bubble.size / 2) < 0 || newX + (bubble.size / 2) > 100) {
            bubble.velocityX *= -0.8; // Add damping
            newX = bubble.x;
          }
          if (newY - (bubble.size / 2) < 0 || newY + (bubble.size / 2) > 100) {
            bubble.velocityY *= -0.8; // Add damping
            newY = bubble.y;
          }

          // Check collisions with other bubbles
          for (let j = 0; j < newData.length; j++) {
            if (i !== j) {
              const other = newData[j];
              const dx = newX - other.x;
              const dy = newY - other.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const minDistance = (bubble.size + other.size) / 2;

              if (distance < minDistance) {
                // Calculate collision response
                const angle = Math.atan2(dy, dx);
                const speed1 = Math.sqrt(bubble.velocityX * bubble.velocityX + 
                                       bubble.velocityY * bubble.velocityY);
                const speed2 = Math.sqrt(other.velocityX * other.velocityX + 
                                       other.velocityY * other.velocityY);

                // New velocities
                const newVelX1 = speed2 * Math.cos(angle);
                const newVelY1 = speed2 * Math.sin(angle);
                const newVelX2 = speed1 * Math.cos(angle + Math.PI);
                const newVelY2 = speed1 * Math.sin(angle + Math.PI);

                // Apply new velocities with damping
                bubble.velocityX = newVelX1 * settings.bounciness;
                bubble.velocityY = newVelY1 * settings.bounciness;
                other.velocityX = newVelX2 * settings.bounciness;
                other.velocityY = newVelY2 * settings.bounciness;

                // Prevent overlap
                newX = other.x + (dx / distance) * minDistance;
                newY = other.y + (dy / distance) * minDistance;
                break;
              }
            }
          }

          bubble.x = newX;
          bubble.y = newY;
        }
        
        return newData;
      });
    });
  }, [settings.reducedMotion, settings.bounciness]);

  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      processData();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [processData]);

  // Also modify the animation effect to properly handle reducedMotion
  useEffect(() => {
    processData();
    let animationId;
    
    const animate = () => {
      if (!settings.reducedMotion) { // Add this check
        updateBubblePositions();
      }
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [processData, updateBubblePositions, settings.reducedMotion]); // Add settings.reducedMotion to dependencies

  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
  };

  const handleBubbleClick = (bubble) => {
    setSelectedBubble({
      ...bubble,
      trendData: getTrendData(bubble.word),
    });
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredBubbles = useMemo(() => {
    return bubbleData.filter(bubble => 
      bubble.word.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bubbleData, searchTerm]);

  // Sample trend data
  const getTrendData = (word) => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      count: Math.floor(Math.random() * 50 + 20),
    }));
  };

  // Modify BubbleComponent to use responsive sizes
  const BubbleComponent = memo(({ item, onClick }) => {
    const sizes = getResponsiveSizes(window.innerWidth);
    
    // Get color based on settings
    const getBubbleColor = () => {
      if (settings.colorByCount) {
        // Generate color based on count (red gradient)
        const intensity = (item.count / maxCount) * 255;
        return `rgb(${intensity}, ${intensity * 0.3}, ${intensity * 0.3})`;
      }
      return settings.highContrast ? 
        (item.severity > 5 ? '#FF0000' : '#00FF00') : 
        settings.bubbleColor;
    };

    return (
      <Box
        onClick={onClick}
        sx={{
          position: 'absolute',
          left: `${item.x}%`,
          top: `${item.y}%`,
          width: `${item.size}px`,
          height: `${item.size}px`,
          borderRadius: '50%',
          bgcolor: getBubbleColor(),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: 'translate(-50%, -50%) scale(1.1)',
            zIndex: 2,
            boxShadow: '0 0 20px rgba(255,255,255,0.2)',
          },
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          padding: '8px',
          border: settings.showSeverity ? 
            `${Math.max(2, item.size * 0.05)}px solid ${
              item.severity > 7 ? '#ff0000' : 
              item.severity > 4 ? '#ff9900' : 
              '#ffff00'
            }` : 'none',
        }}
      >
        {settings.showLabels && (
          <>
            <Typography 
              sx={{ 
                color: 'white',
                fontSize: Math.max(item.size * 0.15, 12), // Responsive font size
                fontWeight: 'bold',
                textAlign: 'center',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.word}
            </Typography>
            <Typography 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontSize: Math.max(item.size * 0.12, 10), // Responsive font size
                mt: 0.5,
              }}
            >
              {item.count}
            </Typography>
          </>
        )}
      </Box>
    );
  });

  const fetchBubbleData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data } = await api.get('/api/analytics/bubble-chart', {
        params: { timeFrame }
      });

      // Log the received data for debugging
      console.log('Raw API response:', data);

      // More flexible data validation
      if (!data) {
        throw new Error('No data received from server');
      }

      // If no words data, use sample data for development/testing
      const wordsData = data.words || sampleData.words;
      
      if (!Array.isArray(wordsData)) {
        throw new Error('Words data is not in the expected format');
      }

      if (wordsData.length === 0) {
        setError('No data available');
        setBubbleData([]);
        return;
      }

      const processedData = wordsData.map(item => ({
        word: item.word || 'Unknown',
        count: item.count || 0,
        severity: item.severity || 1,
        category: item.category || 'unknown',
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        velocityX: settings.reducedMotion ? 0 : (Math.random() - 0.5) * 0.2,
        velocityY: settings.reducedMotion ? 0 : (Math.random() - 0.5) * 0.2,
        color: getColorByCategory(item.category, item.severity)
      }));

      setBubbleData(processedData);
    } catch (error) {
      console.error('Error fetching bubble data:', error);
      // Use sample data as fallback in case of error
      if (process.env.NODE_ENV === 'development') {
        console.log('Using sample data as fallback');
        const processedSampleData = sampleData.words.map(item => ({
          ...item,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          velocityX: settings.reducedMotion ? 0 : (Math.random() - 0.5) * 0.2,
          velocityY: settings.reducedMotion ? 0 : (Math.random() - 0.5) * 0.2,
          color: getColorByCategory(item.category || 'unknown', item.severity || 1)
        }));
        setBubbleData(processedSampleData);
        setError('Using sample data (development mode)');
      } else {
        setError(error.message);
        setBubbleData([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [timeFrame, settings.reducedMotion]);

  // Function to determine bubble color based on category and severity
  const getColorByCategory = (category, severity) => {
    const baseColors = {
      profanity: '#FF4444',
      slur: '#FF8800',
      sexual: '#CC00CC'
    };
    
    // Adjust color opacity based on severity (1-5)
    const opacity = 0.4 + (severity * 0.12); // This will scale from 0.52 to 1
    const baseColor = baseColors[category] || '#666666';
    
    // Convert hex to rgba
    const r = parseInt(baseColor.slice(1,3), 16);
    const g = parseInt(baseColor.slice(3,5), 16);
    const b = parseInt(baseColor.slice(5,7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  useEffect(() => {
    fetchBubbleData();
  }, [fetchBubbleData, timeFrame]);

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'error.main'
      }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  // Show empty state
  if (!isLoading && (!bubbleData.length || !filteredBubbles.length)) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'text.primary'
      }}>
        <Typography variant="h6">
          {searchTerm ? 'No matching words found' : 'No data available'}
        </Typography>
        <Button 
          onClick={fetchBubbleData} 
          startIcon={<RefreshIcon />}
          sx={{ mt: 2 }}
        >
          Refresh
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh',
      width: '100vw',
      bgcolor: settings.backgroundColor,
      overflow: 'hidden',
      position: 'relative',
      background: settings.darkMode ? 
        'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #111111 100%)' : 
        'radial-gradient(circle at 50% 50%, #ffffff 0%, #f5f5f5 100%)'
    }}>
      {/* Toggle Button */}
      <Box
        onClick={() => setIsNavVisible(!isNavVisible)}
        sx={{
          position: 'fixed',
          bottom: isNavVisible ? 
            { xs: 'calc(12px + 140px)', sm: 'calc(24px + 60px)' } : 
            { xs: '12px', sm: '24px' },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 11,
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          
        }}
      >
        {isNavVisible ? 
          <KeyboardArrowDownIcon sx={{ color: 'white' }} /> : 
          <KeyboardArrowUpIcon sx={{ color: 'white' }} />
        }
      </Box>

      {/* Modify bottom bar for mobile - wrap with Slide */}
      <Slide direction="up" in={isNavVisible} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 12, sm: 24 },
            left: 0,
            right: 0,
            margin: '0 auto',
            width: { xs: '90%', sm: 'auto' },
            maxWidth: { xs: '90vw', sm: '800px' },
            zIndex: 10,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
            background: 'rgba(28, 28, 28, 0.85)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: (theme) => ({
              xs: '12px',
              sm: theme.spacing(1, 2)
            }),
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            mx: 'auto',
          }}
        >
          {/* Logo and title section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1.5,
            width: { xs: '100%', sm: 'auto' },
            borderRight: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.1)' },
            borderBottom: { xs: '1px solid rgba(255, 255, 255, 0.1)', sm: 'none' },
            pb: { xs: 1, sm: 0 },
            pr: { xs: 0, sm: 2 },
            justifyContent: { xs: 'center', sm: 'flex-start' },
          }}>
            <img 
              src={Logo} 
              alt="Logo" 
              style={{ 
                height: getResponsiveSizes(window.innerWidth).logoHeight,
                width: 'auto',
                filter: 'brightness(1.1)',
              }} 
            />
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'white',
                fontWeight: 600,
                letterSpacing: '0.5px',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MURAi Flagged Words
            </Typography>
          </Box>

          {/* Controls section */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5, 
            alignItems: 'center',
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'center', sm: 'flex-start' },
          }}>
            <TextField
              placeholder="Search words..."
              value={searchTerm}
              onChange={handleSearch}
              size="small"
              fullWidth
              sx={{
                width: { xs: '100%', sm: getResponsiveSizes(window.innerWidth).searchWidth },
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  '& fieldset': { 
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.1)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  height: '36px',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Select
              value={timeFrame}
              onChange={handleTimeFrameChange}
              size="small"
              fullWidth={false}
              sx={{ 
                minWidth: { xs: '100%', sm: 130 },
                height: '36px',
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.1)',
                },
                '& .MuiSelect-icon': {
                  color: 'rgba(255,255,255,0.5)',
                },
              }}
            >
              <MenuItem value="day">Last 24 Hours</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            gap: 0.5,
            pl: { xs: 0, sm: 2 },
            borderLeft: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.1)' },
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'center', sm: 'flex-start' },
            mt: { xs: 1, sm: 0 },
          }}>
            <IconButton 
              onClick={fetchBubbleData}
              size="small"
              sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
                width: '32px',
                height: '32px',
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton 
              onClick={() => setSettingsOpen(true)}
              size="small"
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
                width: '32px',
                height: '32px',
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Slide>

      {/* Bubble Container with adjusted boundaries */}
      <Box sx={{ 
        height: '100vh',
        width: '100%',
        position: 'relative',
      }}>
        {filteredBubbles.map((item, index) => (
          <BubbleComponent
            key={index}
            item={item}
            onClick={() => handleBubbleClick(item)}
          />
        ))}
      </Box>

      <Dialog 
        open={!!selectedBubble} 
        onClose={() => setSelectedBubble(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: settings.darkMode ? '#1a1a1a' : '#ffffff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }
        }}
      >
        {selectedBubble && (
          <>
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
              Trend Analysis: {selectedBubble.word}
            </DialogTitle>
            <DialogContent sx={{ height: 400, pt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedBubble.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </DialogContent>
          </>
        )}
      </Dialog>

      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      >
        <Box sx={{ 
          width: 300, 
          p: 3, 
          height: '100%', 
          bgcolor: settings.darkMode ? '#1a1a1a' : '#ffffff',
          color: settings.darkMode ? 'white' : 'black' 
        }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Settings</Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <DarkModeIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Dark Mode" 
                secondary="Toggle dark/light theme"
                secondaryTypographyProps={{
                  sx: { color: settings.darkMode ? 'grey.400' : 'grey.600' }
                }}
              />
              <Switch
                checked={settings.darkMode}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  darkMode: e.target.checked,
                  backgroundColor: e.target.checked ? '#111111' : '#ffffff'
                }))}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <ColorLensIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Bubble Color"
                secondary="Choose default bubble color"
                secondaryTypographyProps={{
                  sx: { color: settings.darkMode ? 'grey.400' : 'grey.600' }
                }}
              />
              <input
                type="color"
                value={settings.bubbleColor}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  bubbleColor: e.target.value 
                }))}
                style={{ 
                  width: 32, 
                  height: 32, 
                  padding: 0, 
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer'
                }}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <TextFieldsIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Show Labels" 
                secondary="Display word labels"
                secondaryTypographyProps={{
                  sx: { color: settings.darkMode ? 'grey.400' : 'grey.600' }
                }}
              />
              <Switch
                checked={settings.showLabels}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  showLabels: e.target.checked 
                }))}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <SpeedIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Reduced Motion" 
                secondary="Slower animations"
                secondaryTypographyProps={{
                  sx: { color: settings.darkMode ? 'grey.400' : 'grey.600' }
                }}
              />
              <Switch
                checked={settings.reducedMotion}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  reducedMotion: e.target.checked 
                }))}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <SpeedIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Bounciness" 
                secondary="Bubble collision elasticity"
                secondaryTypographyProps={{
                  sx: { color: settings.darkMode ? 'grey.400' : 'grey.600' }
                }}
              />
              <Slider
                value={settings.bounciness * 100}
                onChange={(e, value) => setSettings(prev => ({ 
                  ...prev, 
                  bounciness: value / 100 
                }))}
                min={0}
                max={100}
                sx={{ width: 100 }}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <ColorLensIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Color by Count" 
                secondary="Gradient based on frequency"
                secondaryTypographyProps={{
                  sx: { color: settings.darkMode ? 'grey.400' : 'grey.600' }
                }}
              />
              <Switch
                checked={settings.colorByCount}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  colorByCount: e.target.checked 
                }))}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <WarningIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Show Severity" 
                secondary="Display severity indicator"
                secondaryTypographyProps={{
                  sx: { color: settings.darkMode ? 'grey.400' : 'grey.600' }
                }}
              />
              <Switch
                checked={settings.showSeverity}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  showSeverity: e.target.checked 
                }))}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <SpeedIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Animation Speed" 
                secondary="Control bubble movement speed"
                secondaryTypographyProps={{
                  sx: { color: settings.darkMode ? 'grey.400' : 'grey.600' }
                }}
              />
              <Slider
                value={settings.animationSpeed * 100}
                onChange={(e, value) => setSettings(prev => ({ 
                  ...prev, 
                  animationSpeed: value / 100 
                }))}
                min={0}
                max={200}
                sx={{ width: 100 }}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <CompareArrowsIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Collisions" 
                secondary="Enable bubble collisions"
                secondaryTypographyProps={{
                  sx: { color: settings.darkMode ? 'grey.400' : 'grey.600' }
                }}
              />
              <Switch
                checked={settings.collisions}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  collisions: e.target.checked 
                }))}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default BubbleChart; 