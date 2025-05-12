import React, { useState, useEffect, useCallback } from 'react';
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

const Dashboard = () => {
  const [timeFrame, setTimeFrame] = useState('day');
  const [bubbleData, setBubbleData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    darkMode: true,
    animationSpeed: 'normal',
    showSeverity: true,
    bubbleColor: '#4CAF50',
    backgroundColor: '#111111',
    textSize: 1,
    highContrast: false,
    reducedMotion: false,
    showLabels: true,
    colorBlindMode: false,
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
    x: Math.random() * 85 + 7.5,
    y: Math.random() * 85 + 7.5,
    velocityX: (Math.random() - 0.5) * 0.2,
    velocityY: (Math.random() - 0.5) * 0.2,
  });

  const processData = useCallback(() => {
    const speedMultiplier = {
      slow: 0.1,
      normal: 0.2,
      fast: 0.4
    }[settings.animationSpeed];

    const newBubbleData = sampleData.words.map(item => ({
      ...item,
      ...getRandomPosition(),
      size: Math.max(40, Math.min(120, item.count * 0.4 * settings.textSize)),
      color: settings.colorBlindMode 
        ? `hsl(${Math.floor(item.severity * 25)}, 80%, 60%)`
        : settings.highContrast
          ? item.severity > 5 ? '#FF0000' : '#00FF00'
          : settings.bubbleColor,
      velocityX: (Math.random() - 0.5) * speedMultiplier * (settings.reducedMotion ? 0.5 : 1),
      velocityY: (Math.random() - 0.5) * speedMultiplier * (settings.reducedMotion ? 0.5 : 1),
    }));
    setBubbleData(newBubbleData);
  }, [settings]);

  const updateBubblePositions = useCallback(() => {
    setBubbleData(prevData => 
      prevData.map(bubble => {
        let newX = bubble.x + bubble.velocityX;
        let newY = bubble.y + bubble.velocityY;
        let newVelocityX = bubble.velocityX;
        let newVelocityY = bubble.velocityY;

        // Bounce off walls
        if (newX < 5 || newX > 95) {
          newVelocityX *= -1;
          newX = newX < 5 ? 5 : 95;
        }
        if (newY < 5 || newY > 95) {
          newVelocityY *= -1;
          newY = newY < 5 ? 5 : 95;
        }

        return {
          ...bubble,
          x: newX,
          y: newY,
          velocityX: newVelocityX,
          velocityY: newVelocityY,
        };
      })
    );
  }, []);

  useEffect(() => {
    processData();
    const animationInterval = setInterval(updateBubblePositions, 50);
    return () => clearInterval(animationInterval);
  }, [timeFrame, processData, updateBubblePositions]);

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

  return (
    <Box sx={{ 
      height: '100vh',
      width: '100vw',
      bgcolor: settings.backgroundColor,
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Box sx={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        p: 2,
        zIndex: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
      }}>
        <Typography variant="h4" sx={{ 
          color: 'white',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          Flagged Words Monitor
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search words..."
            value={searchTerm}
            onChange={handleSearch}
            size="small"
            sx={{
              width: 200,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
            }}
          />
          <Select
            value={timeFrame}
            onChange={handleTimeFrameChange}
            sx={{ 
              minWidth: 150,
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.2)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            <MenuItem value="day">Last 24 Hours</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
          <IconButton 
            onClick={processData}
            sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton 
            onClick={() => setSettingsOpen(true)}
            sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ 
        height: '100%',
        width: '100%',
        position: 'relative',
      }}>
        {filteredBubbles.map((item, index) => (
          <Box
            key={index}
            onClick={() => handleBubbleClick(item)}
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
              transition: 'background-color 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translate(-50%, -50%) scale(1.1)',
                zIndex: 10,
                boxShadow: '0 0 20px rgba(255,255,255,0.3)',
              },
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <Typography 
              sx={{ 
                color: 'white',
                fontSize: item.size > 80 ? '1.2rem' : '0.9rem',
                fontWeight: 'bold',
                textAlign: 'center',
                px: 1,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {item.word}
            </Typography>
            <Typography 
              sx={{ 
                color: 'white',
                fontSize: item.size > 80 ? '1.1rem' : '0.8rem',
                opacity: 0.9,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              +{item.count}
            </Typography>
          </Box>
        ))}
      </Box>

      <Dialog 
        open={!!selectedBubble} 
        onClose={() => setSelectedBubble(null)}
        maxWidth="md"
        fullWidth
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
          width: 350, 
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
              <ListItemText primary="Dark Mode" />
              <Switch
                checked={settings.darkMode}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  darkMode: e.target.checked,
                  backgroundColor: e.target.checked ? '#111111' : '#ffffff'
                }))}
              />
            </ListItem>

            <Divider sx={{ my: 2 }} />

            <ListItem>
              <ListItemIcon>
                <SpeedIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Animation Speed" 
                secondary={settings.reducedMotion ? "Reduced motion enabled" : null}
              />
              <Select
                value={settings.animationSpeed}
                onChange={(e) => setSettings(prev => ({ ...prev, animationSpeed: e.target.value }))}
                size="small"
                sx={{ width: 100 }}
                disabled={settings.reducedMotion}
              >
                <MenuItem value="slow">Slow</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="fast">Fast</MenuItem>
              </Select>
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <ColorLensIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText primary="Bubble Color" />
              <input
                type="color"
                value={settings.bubbleColor}
                onChange={(e) => setSettings(prev => ({ ...prev, bubbleColor: e.target.value }))}
                disabled={settings.colorBlindMode || settings.highContrast}
                style={{ width: 40, height: 40, padding: 0, border: 'none' }}
              />
            </ListItem>

            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" sx={{ px: 2, py: 1 }}>Accessibility</Typography>

            <ListItem>
              <ListItemIcon>
                <AccessibilityNewIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="High Contrast" 
                secondary="Enhances visibility with strong colors"
              />
              <Switch
                checked={settings.highContrast}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  highContrast: e.target.checked,
                  colorBlindMode: false 
                }))}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <AccessibilityNewIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Color Blind Mode" 
                secondary="Uses color blind friendly palette"
              />
              <Switch
                checked={settings.colorBlindMode}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  colorBlindMode: e.target.checked,
                  highContrast: false 
                }))}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <AccessibilityNewIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Reduced Motion" 
                secondary="Decreases animation speed"
              />
              <Switch
                checked={settings.reducedMotion}
                onChange={(e) => setSettings(prev => ({ ...prev, reducedMotion: e.target.checked }))}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <TextFieldsIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Text Size" 
                secondary="Adjust text visibility"
              />
              <Slider
                value={settings.textSize}
                min={0.8}
                max={1.5}
                step={0.1}
                onChange={(e, newValue) => setSettings(prev => ({ ...prev, textSize: newValue }))}
                sx={{ width: 100, ml: 2 }}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <TextFieldsIcon sx={{ color: settings.darkMode ? 'white' : 'black' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Show Labels" 
                secondary="Display word labels"
              />
              <Switch
                checked={settings.showLabels}
                onChange={(e) => setSettings(prev => ({ ...prev, showLabels: e.target.checked }))}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Dashboard; 