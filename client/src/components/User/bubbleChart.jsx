import React, { useState, useEffect, useCallback, memo } from 'react';
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Logo from '../../assets/logo.png'; // Add your logo image

const Dashboard = () => {
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

  const processData = useCallback(() => {
    const speedMultiplier = settings.reducedMotion ? 0.1 : 0.2;
    
    const newBubbleData = sampleData.words.map(item => ({
      ...item,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.max(40, Math.min(100, item.count * 0.3)),
      color: settings.highContrast ? 
        (item.severity > 5 ? '#FF0000' : '#00FF00') : 
        settings.bubbleColor,
      velocityX: (Math.random() - 0.5) * speedMultiplier,
      velocityY: (Math.random() - 0.5) * speedMultiplier,
    }));
    
    setBubbleData(newBubbleData);
  }, [settings.reducedMotion, settings.highContrast, settings.bubbleColor]);

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

  useEffect(() => {
    processData();
    let animationId;
    
    const animate = () => {
      updateBubblePositions();
      animationId = requestAnimationFrame(animate);
    };
    
    if (!settings.reducedMotion) {
      animationId = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [processData, updateBubblePositions, settings.reducedMotion]);

  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
    processData(); // Regenerate positions when timeframe changes
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

  const filteredBubbles = bubbleData.filter(bubble => 
    bubble.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sample trend data
  const getTrendData = (word) => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      count: Math.floor(Math.random() * 50 + 20),
    }));
  };

  // Optimize the bubble rendering
  const BubbleComponent = memo(({ item, onClick }) => (
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
              fontSize: item.size > 80 ? '1rem' : '0.8rem',
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
              fontSize: item.size > 80 ? '0.9rem' : '0.7rem',
              mt: 0.5,
            }}
          >
            {item.count}
          </Typography>
        </>
      )}
    </Box>
  ));

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
      {/* Floating bottom bar */}
      <Box sx={{ 
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: 'rgba(28, 28, 28, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        padding: '8px 16px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1.5,
          pr: 2,
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <img 
            src={Logo} 
            alt="Logo" 
            style={{ 
              height: '32px',
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
              background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            MURAi Flagged Words
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 1.5, 
          alignItems: 'center',
        }}>
          <TextField
            placeholder="Search words..."
            value={searchTerm}
            onChange={handleSearch}
            size="small"
            sx={{
              width: 180,
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
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255,255,255,0.5)',
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
            sx={{ 
              minWidth: 130,
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
          pl: 2,
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <IconButton 
            onClick={processData}
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

export default Dashboard; 