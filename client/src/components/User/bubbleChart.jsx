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
  ResponsiveContainer,
  Brush
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
  BarChart as BarChart3,
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
  }, [settings.bubbleColor, settings.reducedMotion, settings.animationSpeed, getResponsiveSizes]);

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

  // State for trend analysis time frame
  const [trendTimeFrame, setTrendTimeFrame] = useState('day');

  const handleBubbleClick = async (bubble, event) => {
    // Stop event propagation to prevent bubbling
    if (event) {
      event.stopPropagation();
    }

    // Prevent animation from continuing while dialog is open
    if (settings.reducedMotion === false) {
      // Store current setting to restore later
      setSettings(prev => ({
        ...prev,
        _previousMotionSetting: prev.reducedMotion,
        reducedMotion: true
      }));
    }

    // Show loading state in the bubble
    setSelectedBubble({
      ...bubble,
      trendData: [],
      isLoading: true
    });

    // Fetch trend data with the current time frame
    const trendData = await getTrendData(bubble.word, trendTimeFrame);

    // Update with the fetched data
    setSelectedBubble(prev => ({
      ...prev,
      trendData,
      isLoading: false
    }));
  };

  // Handle dialog close and restore animation settings
  const handleDialogClose = () => {
    // Restore previous motion setting if it was changed
    if (settings._previousMotionSetting !== undefined) {
      setSettings(prev => ({
        ...prev,
        reducedMotion: prev._previousMotionSetting,
        _previousMotionSetting: undefined
      }));
    }

    setSelectedBubble(null);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredBubbles = useMemo(() => {
    return bubbleData.filter(bubble =>
      bubble.word.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bubbleData, searchTerm]);

  // Fetch trend data for a specific word with time frame option
  const getTrendData = async (word, selectedTimeFrame = 'day') => {
    try {
      // Try to get data from API
      try {
        const { data } = await api.get('/api/analytics/word-trend', {
          params: { word, timeFrame: selectedTimeFrame }
        });

        if (data && Array.isArray(data) && data.some(item => item.count > 0)) {
          console.log('Received trend data from API:', data);
          return data;
        }
      } catch (apiError) {
        console.warn('API error, using sample data:', apiError);
      }

      console.log('Generating sample trend data for:', word, selectedTimeFrame);

      // Generate sample data with random values based on time frame
      // This is for demonstration purposes when the API doesn't return data
      const generateRandomCount = (base) => Math.floor(Math.random() * base) + 1;

      if (selectedTimeFrame === 'day') {
        // Generate hourly data with a pattern (higher in certain hours)
        return Array.from({ length: 24 }, (_, i) => {
          // More activity during working hours (9-17)
          const isWorkHour = i >= 9 && i <= 17;
          // More activity in the evening (19-22)
          const isEveningHour = i >= 19 && i <= 22;

          let baseCount;
          if (isWorkHour) baseCount = 15;
          else if (isEveningHour) baseCount = 20;
          else baseCount = 5;

          return {
            time: `${i}:00`,
            count: generateRandomCount(baseCount)
          };
        });
      } else if (selectedTimeFrame === 'month') {
        // Generate daily data with weekend patterns
        return Array.from({ length: 30 }, (_, i) => {
          // Weekends (assuming day 1 is Monday)
          const isWeekend = (i % 7 === 5) || (i % 7 === 6);
          const baseCount = isWeekend ? 25 : 15;

          return {
            time: `Day ${i + 1}`,
            count: generateRandomCount(baseCount)
          };
        });
      } else if (selectedTimeFrame === 'year') {
        // Generate monthly data with seasonal patterns
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Different patterns for different months
        const seasonalFactors = [0.7, 0.8, 1.0, 1.2, 1.5, 1.8, 2.0, 1.8, 1.5, 1.2, 1.0, 1.5];

        return months.map((month, i) => ({
          time: month,
          count: Math.floor(generateRandomCount(30) * seasonalFactors[i])
        }));
      }

      // Default fallback with some random data
      return Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        count: generateRandomCount(10)
      }));
    } catch (error) {
      console.error('Error generating trend data:', error);

      // Even if everything fails, return some random data
      return Array.from({ length: 12 }, (_, i) => ({
        time: `Sample ${i + 1}`,
        count: Math.floor(Math.random() * 20) + 1
      }));
    }
  };

  // Enhanced BubbleComponent with better visual effects
  const BubbleComponent = memo(({ item, onClick }) => {
    // Extract RGB values for glow effect
    const extractRGB = (color) => {
      if (color.startsWith('rgba')) {
        const parts = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
        if (parts) return [parts[1], parts[2], parts[3]];
      } else if (color.startsWith('rgb')) {
        const parts = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (parts) return [parts[1], parts[2], parts[3]];
      } else if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return [r, g, b];
      }
      return [75, 192, 192]; // Default teal color
    };

    const [r, g, b] = extractRGB(item.color);
    const glowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
    const glowColorIntense = `rgba(${r}, ${g}, ${b}, 0.8)`;

    // Calculate if this is a large bubble (for enhanced styling)
    const isLargeBubble = item.size > 60;

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
          background: `radial-gradient(circle at 30% 30%, ${item.color.replace(/[\d.]+\)$/, '1)')}, ${item.color})`, // Add gradient for 3D effect
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, background-color 0.3s ease', // Bouncy animation
          aspectRatio: '1 / 1', // Force aspect ratio to be 1:1
          overflow: 'hidden', // Ensure text doesn't overflow
          '&:hover': {
            transform: 'translate(-50%, -50%) scale(1.15)',
            zIndex: 10,
            boxShadow: `0 0 20px ${glowColor}, 0 0 10px ${glowColorIntense}`,
          },
          boxShadow: `0 4px 12px rgba(0,0,0,0.2), 0 0 ${isLargeBubble ? '15px' : '8px'} ${glowColor}`,
          // Add subtle pulsing animation for larger bubbles
          animation: isLargeBubble ? 'pulse 3s infinite alternate' : 'none',
          '@keyframes pulse': {
            '0%': {
              boxShadow: `0 4px 12px rgba(0,0,0,0.2), 0 0 10px ${glowColor}`
            },
            '100%': {
              boxShadow: `0 4px 12px rgba(0,0,0,0.2), 0 0 20px ${glowColor}`
            }
          },
        }}
      >
        {settings.showLabels && (
          <Box sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
          }}>
            {/* Semi-transparent background for better text readability */}
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '85%',
              height: '85%',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.15)',
              opacity: 0.7,
              zIndex: 0,
            }} />

            {/* Word text */}
            <Typography
              sx={{
                color: 'white',
                fontSize: `${Math.max(item.size * 0.22, 13)}px`, // Slightly larger font
                fontWeight: 'bold',
                textAlign: 'center',
                textShadow: '0px 1px 3px rgba(0,0,0,0.8), 0px 0px 5px rgba(0,0,0,0.5)', // Enhanced text shadow
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                padding: '0 4px',
                maxWidth: `${item.size * 0.9}px`, // Prevent text from overflowing
                zIndex: 1,
                position: 'relative',
                letterSpacing: '0.5px', // Improved readability
              }}
            >
              {item.word}
            </Typography>

            {/* Count with background pill for better visibility */}
            <Box sx={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: '10px',
              padding: `${Math.max(item.size * 0.03, 2)}px ${Math.max(item.size * 0.06, 4)}px`,
              mt: 0.5,
              zIndex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: `${Math.max(item.size * 0.3, 20)}px`,
            }}>
              <Typography
                sx={{
                  color: 'white',
                  fontSize: `${Math.max(item.size * 0.16, 11)}px`, // Slightly larger count
                  fontWeight: 'bold',
                  textShadow: '0px 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                {item.count}
              </Typography>
            </Box>
          </Box>
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

  // Enhanced function to determine bubble color based on category and severity
  const getColorByCategory = useCallback((category, severity) => {
    // More vibrant base colors with better contrast
    const baseColors = {
      profanity: '#FF3B30', // Brighter red
      slur: '#FF9500',      // Vibrant orange
      sexual: '#AF52DE',    // Rich purple
      hate: '#FF2D55',      // Pink
      violence: '#FF3824',  // Red-orange
      default: '#5856D6'    // Indigo for uncategorized
    };

    // If no category is provided, use the settings color
    if (!category) {
      return settings.bubbleColor;
    }

    // Normalize severity to 1-5 range if needed
    const normalizedSeverity = Math.min(5, Math.max(1, severity || 3));

    // Create a gradient effect based on severity
    // Higher severity = more saturated and slightly darker
    const baseColor = baseColors[category] || baseColors.default;

    try {
      // Convert hex to HSL for better color manipulation
      const r = parseInt(baseColor.slice(1,3), 16) / 255;
      const g = parseInt(baseColor.slice(3,5), 16) / 255;
      const b = parseInt(baseColor.slice(5,7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        h /= 6;
      }

      // Adjust saturation and lightness based on severity
      s = Math.min(1, s + (normalizedSeverity * 0.05)); // Increase saturation with severity
      l = Math.max(0.3, Math.min(0.7, l - (normalizedSeverity * 0.03))); // Slightly darker with higher severity

      // Convert back to RGB
      let r1, g1, b1;
      if (s === 0) {
        r1 = g1 = b1 = l; // achromatic
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r1 = hue2rgb(p, q, h + 1/3);
        g1 = hue2rgb(p, q, h);
        b1 = hue2rgb(p, q, h - 1/3);
      }

      // Add a slight glow effect with box-shadow in the component
      return `rgba(${Math.round(r1 * 255)}, ${Math.round(g1 * 255)}, ${Math.round(b1 * 255)}, 0.9)`;
    } catch (error) {
      console.error('Error processing color:', error);
      // Fallback to the original color if there's an error
      return settings.bubbleColor;
    }
  }, [settings.bubbleColor]);

  // Fetch data when timeFrame changes
  useEffect(() => {
    fetchBubbleData();
  }, [fetchBubbleData, timeFrame]);

  // Reprocess data when settings change
  useEffect(() => {
    if (bubbleData.length > 0) {
      // Create a deep copy of the data to ensure React detects the change
      const dataCopy = {
        words: bubbleData.map(item => ({
          ...item,
          // Force color update for items without category
          color: item.category ? getColorByCategory(item.category, item.severity) : settings.bubbleColor
        }))
      };

      // Process the copied data with updated settings
      processData(dataCopy);

      // Log for debugging
      console.log('Reprocessing data with new settings', settings.bubbleColor);
    }
  }, [settings.bubbleColor, bubbleData, processData, getColorByCategory]);

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
            onClick={(e) => handleBubbleClick(item, e)}
          />
        ))}
      </Box>

      <Dialog
        open={!!selectedBubble}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: settings.darkMode ? '#1a1a1a' : '#ffffff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }
        }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating
      >
        {selectedBubble && (
          <>
            <DialogTitle sx={{
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChart3 size={20} />
                <Typography variant="h6" component="span">
                  Trend Analysis: {selectedBubble.word}
                </Typography>
              </Box>

              {/* Time frame selector */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Time Range:
                </Typography>
                <Select
                  value={trendTimeFrame}
                  onChange={(e) => {
                    setTrendTimeFrame(e.target.value);
                    // Refresh data with new time frame
                    handleBubbleClick(selectedBubble);
                  }}
                  size="small"
                  sx={{
                    height: 32,
                    minWidth: 120,
                    color: 'white',
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.7)',
                    },
                    '.MuiSvgIcon-root': {
                      color: 'rgba(255,255,255,0.7)',
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: settings.darkMode ? '#1a1a1a' : '#ffffff',
                      }
                    }
                  }}
                >
                  <MenuItem value="day">Last 24 Hours</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                  <MenuItem value="year">Last Year</MenuItem>
                </Select>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ height: 400, pt: 2, pb: 3 }}>
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
                    <CartesianGrid strokeDasharray="3 3" stroke={settings.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: settings.darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
                      axisLine={{ stroke: settings.darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
                    />
                    <YAxis
                      tick={{ fill: settings.darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
                      axisLine={{ stroke: settings.darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: settings.darkMode ? '#333' : '#fff',
                        borderColor: settings.darkMode ? '#555' : '#ddd',
                        color: settings.darkMode ? '#fff' : '#333'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                    <Brush
                      dataKey="time"
                      height={30}
                      stroke={settings.darkMode ? '#666' : '#8884d8'}
                      fill={settings.darkMode ? '#333' : '#f5f5f5'}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: 2
                }}>
                  <Typography sx={{ color: settings.darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    No trend data available for this time period
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => handleBubbleClick(selectedBubble)}
                  >
                    Refresh Data
                  </Button>
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
        onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the drawer
        PaperProps={{
          sx: {
            width: 300,
            bgcolor: settings.darkMode ? '#1a1a1a' : '#ffffff',
          }
        }}
      >
        <Box
          sx={{
            width: '100%',
            p: 3,
            height: '100%',
            bgcolor: settings.darkMode ? '#1a1a1a' : '#ffffff',
            color: settings.darkMode ? 'white' : 'black'
          }}
          onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling
        >
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
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <input
                  type="color"
                  value={settings.bubbleColor}
                  onChange={(e) => {
                    e.preventDefault(); // Prevent form submission
                    const newColor = e.target.value;
                    console.log('Color picker changed to:', newColor);
                    setSettings(prev => ({
                      ...prev,
                      bubbleColor: newColor
                    }));
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent event bubbling
                  style={{
                    width: '32px',
                    height: '32px',
                    padding: 0,
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                />
                <Box sx={{
                  display: 'flex',
                  gap: 0.5,
                  mt: 1,
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                  maxWidth: '100px'
                }}>
                  {/* Preset colors */}
                  {['#4CAF50', '#2196F3', '#FF5722', '#9C27B0', '#FF9800', '#F44336'].map(color => (
                    <Box
                      key={color}
                      onClick={(e) => {
                        e.preventDefault(); // Prevent form submission
                        e.stopPropagation(); // Prevent event bubbling
                        console.log('Preset color selected:', color);
                        setSettings(prev => ({ ...prev, bubbleColor: color }));
                      }}
                      sx={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: color,
                        borderRadius: '3px',
                        cursor: 'pointer',
                        border: settings.bubbleColor === color ? '2px solid white' : '1px solid rgba(255,255,255,0.3)',
                        boxShadow: settings.bubbleColor === color ? '0 0 5px rgba(255,255,255,0.5)' : 'none',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.2)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
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