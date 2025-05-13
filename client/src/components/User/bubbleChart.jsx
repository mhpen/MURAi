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
    showLabels: true,
    animationSpeed: 1,
    showSeverity: false,
  });
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actualData, setActualData] = useState([]);

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
    x: Math.random() * 90 + 5, // Keep within 5-95% range
    y: Math.random() * 90 + 5,
    velocityX: (Math.random() - 0.5) * 0.2 * settings.animationSpeed,
    velocityY: (Math.random() - 0.5) * 0.2 * settings.animationSpeed,
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

  // Fetch data from the API
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/analytics/flagged-words?timeFrame=${timeFrame}`);
      
      // Transform API data to match required format
      const transformedData = response.data.map(item => ({
        word: item.word,
        count: item.frequency || item.count,
        severity: item.severity || 5, // Default severity if not provided
      }));

      setActualData(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      // Fallback to sample data if API fails
      setActualData(sampleData.words);
    } finally {
      setIsLoading(false);
    }
  }, [timeFrame]);

  // Update useEffect to fetch data
  useEffect(() => {
    fetchData();
  }, [fetchData, timeFrame]);

  // Modify processData to use actualData instead of sampleData
  const processData = useCallback(() => {
    const sizes = getResponsiveSizes(window.innerWidth);
    const speedMultiplier = settings.reducedMotion ? 0.1 : 0.2;
    
    // Use actualData instead of sampleData
    const maxCount = Math.max(...actualData.map(item => item.count));
    
    const minSize = sizes.minSize;
    const maxSize = sizes.maxSize;
    
    const newBubbleData = actualData.map(item => {
      const sizePercentage = item.count / maxCount;
      const size = minSize + (sizePercentage * (maxSize - minSize));
      
      return {
        ...item,
        ...getRandomPosition(),
        size: size,
        velocityX: (Math.random() - 0.5) * speedMultiplier,
        velocityY: (Math.random() - 0.5) * speedMultiplier,
        color: settings.colorByCount 
          ? getColorByCount(item.count, maxCount)
          : settings.showSeverity
            ? getSeverityColor(item.severity)
            : settings.bubbleColor
      };
    });

    setBubbleData(newBubbleData);
  }, [settings, getResponsiveSizes, actualData]);

  const updateBubblePositions = useCallback(() => {
    if (settings.reducedMotion) return;

    requestAnimationFrame(() => {
      setBubbleData(prevData => {
        const newData = [...prevData];
        
        // Update positions
        for (let i = 0; i < newData.length; i++) {
          let bubble = newData[i];
          
          // Calculate new position
          let newX = bubble.x + (bubble.velocityX * settings.animationSpeed);
          let newY = bubble.y + (bubble.velocityY * settings.animationSpeed);

          // Fixed boundary check (using percentage-based boundaries)
          const padding = 5; // Percentage padding from edges
          
          // Bounce off walls with proper direction change
          if (newX < padding) {
            newX = padding;
            bubble.velocityX = Math.abs(bubble.velocityX) * settings.bounciness;
          } else if (newX > 100 - padding) {
            newX = 100 - padding;
            bubble.velocityX = -Math.abs(bubble.velocityX) * settings.bounciness;
          }

          if (newY < padding) {
            newY = padding;
            bubble.velocityY = Math.abs(bubble.velocityY) * settings.bounciness;
          } else if (newY > 100 - padding) {
            newY = 100 - padding;
            bubble.velocityY = -Math.abs(bubble.velocityY) * settings.bounciness;
          }

          // Only check collisions if enabled
          if (settings.collisions) {
            for (let j = 0; j < newData.length; j++) {
              if (i !== j) {
                const other = newData[j];
                const dx = newX - other.x;
                const dy = newY - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = 10; // Minimum distance between bubbles

                if (distance < minDistance) {
                  // Elastic collision response
                  const angle = Math.atan2(dy, dx);
                  
                  // Swap velocities for elastic collision
                  const tempVelX = bubble.velocityX;
                  const tempVelY = bubble.velocityY;
                  
                  bubble.velocityX = other.velocityX * settings.bounciness;
                  bubble.velocityY = other.velocityY * settings.bounciness;
                  
                  other.velocityX = tempVelX * settings.bounciness;
                  other.velocityY = tempVelY * settings.bounciness;

                  // Push bubbles apart to prevent sticking
                  newX = other.x + (minDistance * Math.cos(angle));
                  newY = other.y + (minDistance * Math.sin(angle));
                  break;
                }
              }
            }
          }

          // Apply minimum velocity threshold to prevent very slow movement
          const minVelocity = 0.01;
          if (Math.abs(bubble.velocityX) < minVelocity) {
            bubble.velocityX = minVelocity * (Math.random() > 0.5 ? 1 : -1);
          }
          if (Math.abs(bubble.velocityY) < minVelocity) {
            bubble.velocityY = minVelocity * (Math.random() > 0.5 ? 1 : -1);
          }

          // Update bubble position
          bubble.x = newX;
          bubble.y = newY;
        }
        
        return newData;
      });
    });
  }, [settings.reducedMotion, settings.bounciness, settings.collisions, settings.animationSpeed]);

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
          backgroundColor: settings.darkMode ? item.color : item.color,
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
            boxShadow: settings.darkMode 
              ? '0 0 20px rgba(255,255,255,0.2)'
              : '0 0 20px rgba(0,0,0,0.2)',
          },
          boxShadow: settings.darkMode 
            ? '0 4px 12px rgba(0,0,0,0.3)'
            : '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        {settings.showLabels && (
          <>
            <Typography 
              sx={{ 
                color: settings.darkMode ? 'white' : 'black',
                fontSize: `${Math.max(item.size * 0.2, 12)}px`, // Responsive font size
                fontWeight: 'bold',
                textAlign: 'center',
                textShadow: settings.darkMode 
                  ? '1px 1px 2px rgba(0,0,0,0.5)'
                  : 'none',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                padding: '0 4px',
              }}
            >
              {item.word}
            </Typography>
            <Typography 
              sx={{ 
                color: settings.darkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)',
                fontSize: `${Math.max(item.size * 0.15, 10)}px`, // Smaller count size
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

  // Add helper functions for colors
  const getColorByCount = (count, maxCount) => {
    const intensity = (count / maxCount) * 255;
    return settings.darkMode
      ? `rgba(${intensity}, ${intensity * 0.3}, ${intensity * 0.3}, 0.9)`
      : `rgba(${intensity}, ${intensity * 0.3}, ${intensity * 0.3}, 0.7)`;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: '#ff4444',
      medium: '#ffaa00',
      low: '#ffdd00'
    };
    
    if (severity > 7) return colors.high;
    if (severity > 4) return colors.medium;
    return colors.low;
  };

  // Add refresh functionality
  const handleRefresh = () => {
    setIsLoading(true);
    fetchData();
  };

  // Update the UI to show loading state
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100%',
        minHeight: '400px'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: 4 
      }}>
        <Typography color="error">Error: {error}</Typography>
        <Button 
          variant="contained" 
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
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
          onClick={handleRefresh} 
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
              onClick={handleRefresh}
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
            {/* Theme Setting */}
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
                  darkMode: e.target.checked 
                }))}
              />
            </ListItem>

            {/* Bubble Color */}
            <ListItem>
              <ListItemIcon>
                <ColorLensIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Bubble Color" 
                secondary="Choose default color"
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
                  width: '32px', 
                  height: '32px',
                  padding: 0,
                  border: 'none'
                }}
              />
            </ListItem>

            {/* Show Labels */}
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

            {/* Animation Speed */}
            <ListItem>
              <ListItemIcon>
                <SpeedIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Animation Speed" 
                secondary="Control movement speed"
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

            {/* Show Severity */}
            <ListItem>
              <ListItemIcon>
                <WarningIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Show Severity" 
                secondary="Indicate word severity"
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
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default BubbleChart; 