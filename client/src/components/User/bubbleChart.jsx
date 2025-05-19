import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  Box,
  Select,
  MenuItem,
  Typography,
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
  Slide,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  DarkMode as DarkModeIcon,
  Speed as SpeedIcon,
  ColorLens as ColorLensIcon,
  TextFields as TextFieldsIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';
import Logo from '../../assets/logo.png';
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
    reducedMotion: false,
    bounciness: 0.8,
    animationSpeed: 1,
  });
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Process data from API
  const processData = useCallback((data) => {
    if (!data || !data.words || !Array.isArray(data.words) || data.words.length === 0) {
      setBubbleData([]);
      return;
    }

    const sizes = getResponsiveSizes(window.innerWidth);
    const speedMultiplier = settings.reducedMotion ? 0.1 : 0.2;

    // Calculate the maximum count to normalize sizes
    const maxCount = Math.max(...data.words.map(item => item.count || 0));

    // Calculate minimum and maximum bubble sizes
    const minSize = sizes.minSize;
    const maxSize = sizes.maxSize;

    const newBubbleData = data.words.map(item => {
      // Calculate size based on count relative to maxCount
      // Using square root scaling for better visual representation of differences
      const count = item.count || 0;
      const sizePercentage = Math.sqrt(count / maxCount);
      const size = minSize + (sizePercentage * (maxSize - minSize));

      // Determine color based on settings
      let bubbleColor;
      if (item.category) {
        // If category exists, use category-based coloring
        bubbleColor = getColorByCategory(item.category, item.severity);
      } else {
        // Otherwise use the user-selected color
        bubbleColor = settings.bubbleColor;
      }

      return {
        ...item,
        ...getRandomPosition(),
        size: size, // This will now properly scale based on count with better visual distribution
        velocityX: (Math.random() - 0.5) * speedMultiplier,
        velocityY: (Math.random() - 0.5) * speedMultiplier,
        color: bubbleColor
      };
    });

    setBubbleData(newBubbleData);
  }, [settings, getResponsiveSizes]);

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

  const handleBubbleClick = async (bubble) => {
    // Show loading state in the bubble
    setSelectedBubble({
      ...bubble,
      trendData: [],
      isLoading: true
    });

    // Fetch trend data
    const trendData = await getTrendData(bubble.word);

    // Update with the fetched data
    setSelectedBubble(prev => ({
      ...prev,
      trendData,
      isLoading: false
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

  // Fetch trend data for a specific word
  const getTrendData = async (word) => {
    try {
      const { data } = await api.get('/api/analytics/word-trend', {
        params: { word, timeFrame }
      });

      if (data && Array.isArray(data)) {
        return data;
      }

      // Return empty data if API fails
      return Array.from({ length: 24 }, (i) => ({
        time: `${i}:00`,
        count: 0
      }));
    } catch (error) {
      console.error('Error fetching trend data:', error);
      // Return empty data if API fails
      return Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        count: 0
      }));
    }
  };

  // Modify BubbleComponent to use responsive sizes and ensure perfect circles
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
          borderRadius: '50%', // Ensures perfect circle
          backgroundColor: settings.darkMode ? item.color : item.color,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          aspectRatio: '1 / 1', // Force aspect ratio to be 1:1
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
                maxWidth: `${item.size * 0.9}px`, // Prevent text from overflowing
              }}
            >
              {item.word}
            </Typography>
            <Typography
              sx={{
                color: settings.darkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)',
                fontSize: `${Math.max(item.size * 0.15, 10)}px`, // Smaller count size
                mt: 0.5,
                fontWeight: 'bold', // Make count more prominent
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

      if (!data.words || !Array.isArray(data.words)) {
        throw new Error('Words data is not in the expected format');
      }

      if (data.words.length === 0) {
        setError('No data available');
        setBubbleData([]);
        return;
      }

      // Process the data
      processData(data);
    } catch (error) {
      console.error('Error fetching bubble data:', error);
      setError(error.message || 'Failed to load data');
      setBubbleData([]);
    } finally {
      setIsLoading(false);
    }
  }, [timeFrame, processData]);

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
              {selectedBubble.isLoading ? (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  <CircularProgress />
                </Box>
              ) : selectedBubble.trendData && selectedBubble.trendData.length > 0 ? (
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
              ) : (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  <Typography>No trend data available</Typography>
                </Box>
              )}
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
                primary="Animation Speed"
                secondary="Control bubble movement speed"
                secondaryTypographyProps={{
                  sx: { color: settings.darkMode ? 'grey.400' : 'grey.600' }
                }}
              />
              <Slider
                value={settings.animationSpeed * 100}
                onChange={(_, value) => setSettings(prev => ({
                  ...prev,
                  animationSpeed: value / 100
                }))}
                min={0}
                max={200}
                sx={{ width: 100 }}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default BubbleChart;