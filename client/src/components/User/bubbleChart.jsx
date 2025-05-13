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
        backgroundColor: item.color,
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
        },
      }}
    >
      {item.word && (
        <Typography
          sx={{
            color: 'white',
            fontSize: '0.8rem',
            textAlign: 'center',
            padding: '4px',
          }}
        >
          {item.word}
          <br />
          {item.count}
        </Typography>
      )}
    </Box>
  );
});

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

  const getColorByCategory = useCallback((category, severity) => {
    const baseColors = {
      profanity: '#FF4444',
      slur: '#FF8800',
      sexual: '#CC00CC'
    };
    
    const opacity = 0.4 + (severity * 0.12);
    const baseColor = baseColors[category] || '#666666';
    
    const r = parseInt(baseColor.slice(1,3), 16);
    const g = parseInt(baseColor.slice(3,5), 16);
    const b = parseInt(baseColor.slice(5,7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }, []);

  const getRandomPosition = useCallback(() => ({
    x: Math.random() * 90 + 5,
    y: Math.random() * 90 + 5,
    velocityX: (Math.random() - 0.5) * 0.2 * settings.animationSpeed,
    velocityY: (Math.random() - 0.5) * 0.2 * settings.animationSpeed,
  }), [settings.animationSpeed]);

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

  const fetchBubbleData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/api/analytics/bubble-chart', {
        params: { timeFrame }
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      const wordsData = Array.isArray(response.data) ? response.data : response.data.words;

      if (!Array.isArray(wordsData)) {
        throw new Error('Invalid data format received from server');
      }

      const sizes = getResponsiveSizes(window.innerWidth);
      const maxCount = Math.max(...wordsData.map(item => parseInt(item.count) || 0));

      const processedData = wordsData.map(item => {
        const count = parseInt(item.count) || 0;
        const sizePercentage = count / maxCount;
        const size = Math.max(
          sizes.minSize,
          Math.min(sizes.maxSize, sizes.minSize + (sizePercentage * (sizes.maxSize - sizes.minSize)))
        );

        return {
          word: item.word || 'Unknown',
          count,
          severity: parseInt(item.severity) || 1,
          category: item.category || 'unknown',
          ...getRandomPosition(),
          size,
          color: getColorByCategory(item.category, item.severity)
        };
      });

      console.log('Processed data:', processedData);
      setBubbleData(processedData);

    } catch (error) {
      console.error('Error fetching bubble data:', error);
      setError(`Failed to load data: ${error.message}`);
      setBubbleData([]);
    } finally {
      setIsLoading(false);
    }
  }, [timeFrame, settings.reducedMotion, getColorByCategory, getRandomPosition, getResponsiveSizes]);

  const processData = useCallback(() => {
    if (!bubbleData.length) return;

    const sizes = getResponsiveSizes(window.innerWidth);
    const speedMultiplier = settings.reducedMotion ? 0 : 0.2;
    
    const maxCount = Math.max(...bubbleData.map(item => item.count));
    const minSize = sizes.minSize;
    const maxSize = sizes.maxSize;
    
    const newBubbleData = bubbleData.map(item => {
      const sizePercentage = item.count / maxCount;
      const size = Math.max(minSize, Math.min(maxSize, minSize + (sizePercentage * (maxSize - minSize))));
      
      // Preserve existing position and velocity if they exist
      const position = item.x && item.y ? { x: item.x, y: item.y } : getRandomPosition();
      const velocity = item.velocityX && item.velocityY ? {
        velocityX: item.velocityX,
        velocityY: item.velocityY
      } : {
        velocityX: (Math.random() - 0.5) * speedMultiplier,
        velocityY: (Math.random() - 0.5) * speedMultiplier
      };
      
      return {
        ...item,
        ...position,
        ...velocity,
        size,
        color: getColorByCategory(item.category, item.severity)
      };
    });
    
    setBubbleData(newBubbleData);
  }, [settings, getResponsiveSizes, bubbleData, getRandomPosition, getColorByCategory]);

  const updateBubblePositions = useCallback(() => {
    if (settings.reducedMotion) return;

    setBubbleData(prevData => {
      return prevData.map(bubble => {
        // Calculate new position
        let newX = bubble.x + (bubble.velocityX * settings.animationSpeed);
        let newY = bubble.y + (bubble.velocityY * settings.animationSpeed);

        // Fixed boundary check (using percentage-based boundaries)
        const padding = 5; // Percentage padding from edges
        let newVelocityX = bubble.velocityX;
        let newVelocityY = bubble.velocityY;
        
        // Bounce off walls
        if (newX < padding) {
          newX = padding;
          newVelocityX = Math.abs(bubble.velocityX) * settings.bounciness;
        } else if (newX > 100 - padding) {
          newX = 100 - padding;
          newVelocityX = -Math.abs(bubble.velocityX) * settings.bounciness;
        }

        if (newY < padding) {
          newY = padding;
          newVelocityY = Math.abs(bubble.velocityY) * settings.bounciness;
        } else if (newY > 100 - padding) {
          newY = 100 - padding;
          newVelocityY = -Math.abs(bubble.velocityY) * settings.bounciness;
        }

        // Apply minimum velocity threshold
        const minVelocity = 0.05;
        if (Math.abs(newVelocityX) < minVelocity) {
          newVelocityX = minVelocity * (Math.random() > 0.5 ? 1 : -1);
        }
        if (Math.abs(newVelocityY) < minVelocity) {
          newVelocityY = minVelocity * (Math.random() > 0.5 ? 1 : -1);
        }

        return {
          ...bubble,
          x: newX,
          y: newY,
          velocityX: newVelocityX,
          velocityY: newVelocityY
        };
      });
    });
  }, [settings.reducedMotion, settings.bounciness, settings.animationSpeed]);

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
    let lastTime = 0;
    const fps = 60;
    const interval = 1000 / fps;
    
    const animate = (currentTime) => {
      if (!lastTime) lastTime = currentTime;
      
      const delta = currentTime - lastTime;
      
      if (delta > interval) {
        if (!settings.reducedMotion) {
          updateBubblePositions();
        }
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [processData, updateBubblePositions, settings.reducedMotion]);

  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
  };

  const handleBubbleClick = async (bubble) => {
    setSelectedBubble(bubble);
    const trendData = await getTrendData(bubble.word);
    setSelectedBubble(prev => ({
      ...prev,
      trendData
    }));
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredBubbles = useMemo(() => {
    return bubbleData.filter(bubble => 
      bubble.word.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bubbleData, searchTerm]);

  // Replace getTrendData with actual API call
  const getTrendData = async (word) => {
    try {
      const { data } = await api.get('/api/analytics/word-trends', {
        params: { word, timeFrame }
      });
      return data.trends;
    } catch (error) {
      console.error('Error fetching trend data:', error);
      return [];
    }
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
  if (error && !bubbleData.length) {  // Only show error if there's no data
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

  // Show empty state - modified condition
  if (!isLoading && bubbleData.length === 0) {  // Only check for empty bubbleData
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

  // Show filtered empty state
  if (filteredBubbles.length === 0) {
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
          No matching words found
        </Typography>
        <Button 
          onClick={() => setSearchTerm('')} 
          startIcon={<RefreshIcon />}
          sx={{ mt: 2 }}
        >
          Clear Search
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
      {/* Bubble Container */}
      <Box sx={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
      }}>
        {filteredBubbles.map((bubble, index) => (
          <BubbleComponent
            key={`${bubble.word}-${index}`}
            item={{
              ...bubble,
              size: bubble.size || 60, // Provide default size if not set
            }}
            onClick={() => handleBubbleClick(bubble)}
          />
        ))}
      </Box>

      {/* Toggle Button */}
      <Box
        onClick={() => setIsNavVisible(!isNavVisible)}
        sx={{
          position: 'fixed',
          bottom: isNavVisible ? 
            { 
              xs: 'calc(12px + 180px)', // Increased spacing for mobile
              sm: 'calc(24px + 60px)' 
            } : 
            { 
              xs: '12px', 
              sm: '24px' 
            },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 11,
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Added background for better visibility
          borderRadius: '12px',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          width: '36px',
          height: '36px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }
        }}
      >
        {isNavVisible ? 
          <KeyboardArrowDownIcon sx={{ color: 'white' }} /> : 
          <KeyboardArrowUpIcon sx={{ color: 'white' }} />
        }
      </Box>

      {/* Bottom Navigation Bar */}
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
              xs: '16px 12px', // Increased vertical padding
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
                  darkMode: e.target.checked 
                }))}
              />
            </ListItem>

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