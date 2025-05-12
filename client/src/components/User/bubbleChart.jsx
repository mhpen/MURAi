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
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SpeedIcon from '@mui/icons-material/Speed';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Logo from '../../assets/logo.png'; // Add your logo image
import { API_BASE_URL } from '../../config';

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
    const speedMultiplier = settings.reducedMotion ? 0 : 0.2; // Change 0.1 to 0
    
    const newBubbleData = sampleData.words.map(item => ({
      ...item,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.max(sizes.minSize, Math.min(sizes.maxSize, item.count * sizes.bubbleBase)),
      color: settings.highContrast ? 
        (item.severity > 5 ? '#FF0000' : '#00FF00') : 
        settings.bubbleColor,
      velocityX: (Math.random() - 0.5) * speedMultiplier,
      velocityY: (Math.random() - 0.5) * speedMultiplier,
    }));
    
    setBubbleData(newBubbleData);
  }, [settings.reducedMotion, settings.highContrast, settings.bubbleColor, getResponsiveSizes]);

  const updateBubblePositions = useCallback(() => {
    requestAnimationFrame(() => {
      setBubbleData(prevData => 
        prevData.map(bubble => {
          let newX = bubble.x + bubble.velocityX;
          let newY = bubble.y + bubble.velocityY;

          // Simple boundary check with velocity reversal
          if (newX < 10 || newX > 90) {
            bubble.velocityX *= -1;
            newX = Math.max(10, Math.min(90, newX));
          }
          if (newY < 10 || newY > 90) {
            bubble.velocityY *= -1;
            newY = Math.max(10, Math.min(90, newY));
          }

          return {
            ...bubble,
            x: newX,
            y: newY,
          };
        })
      );
    });
  }, []);

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
    
    return (
      <Box
        onClick={onClick}
        sx={{
          position: 'absolute',
          left: `${item.x}%`,
          top: `${item.y}%`,
          width: item.size,
          height: item.size,
          borderRadius: '50%',
          bgcolor: item.color,
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
        }}
      >
        {settings.showLabels && (
          <>
            <Typography 
              sx={{ 
                color: 'white',
                fontSize: sizes.fontSize.word,
                fontWeight: 'bold',
                textAlign: 'center',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {item.word}
            </Typography>
            <Typography 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontSize: sizes.fontSize.count,
                mt: 0.5,
              }}
            >
              {item.count}
            </Typography>
            <Typography 
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.6rem',
                mt: 0.2,
              }}
            >
              {item.language}
            </Typography>
          </>
        )}
      </Box>
    );
  });

  const fetchBubbleData = useCallback(async () => {
    try {
      console.log('Fetching from:', `${API_BASE_URL}/api/user/bubble-data`);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('Fetching data with timeFrame:', timeFrame);

      const response = await fetch(`${API_BASE_URL}/api/user/bubble-data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      if (!data.words || !Array.isArray(data.words)) {
        throw new Error('Invalid data format received');
      }

      if (data.words.length === 0) {
        setError('No data available');
        return;
      }

      // Process the data for visualization
      const processedData = data.words.map(item => ({
        ...item,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        velocityX: settings.reducedMotion ? 0 : (Math.random() - 0.5) * 0.2,
        velocityY: settings.reducedMotion ? 0 : (Math.random() - 0.5) * 0.2,
        color: getColorByCategory(item.category, item.severity)
      }));

      console.log('Processed data:', processedData);
      setBubbleData(processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching bubble data:', error);
      setError(error.message || 'Failed to load data');
      return null;
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
    const fetchData = async () => {
      try {
        console.log('Fetching from:', `${API_BASE_URL}/api/user/bubble-data`);
        const result = await fetchBubbleData();
        console.log('Received data:', result);
        setBubbleData(result);
      } catch (err) {
        console.error('Bubble chart error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default BubbleChart; 