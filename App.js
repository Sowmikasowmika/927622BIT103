import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, MenuItem, Select, FormControl, InputLabel, CircularProgress, Tooltip, Tabs, Tab, Paper, Grid
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

const API_URL = "http://your-api-server.com"; // Replace with actual API URL

const timeOptions = [1, 5, 15, 30, 60];

const StockPage = () => {
  const [timeFrame, setTimeFrame] = useState(15);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/stock-data?minutes=${timeFrame}`);
      const result = await response.json();
      setStockData(result);
    } catch (error) {
      console.error("Error fetching stock data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
    const intervalId = setInterval(fetchStockData, 60000);
    return () => clearInterval(intervalId);
  }, [timeFrame]);

  const average = useMemo(() => {
    if (!stockData) return 0;
    let total = 0;
    let count = 0;
    for (const item of stockData) {
      total += item.price;
      count += 1;
    }
    return count ? total / count : 0;
  }, [stockData]);

  return (
    <Box p={4}>
      <Typography variant="h4">Stock Price Viewer</Typography>
      <FormControl sx={{ mt: 2, mb: 4, minWidth: 200 }}>
        <InputLabel>Time Frame (minutes)</InputLabel>
        <Select
          value={timeFrame}
          label="Time Frame"
          onChange={(e) => setTimeFrame(e.target.value)}
        >
          {timeOptions.map((option) => (
            <MenuItem key={option} value={option}>Last {option} minute{option > 1 ? 's' : ''}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <CircularProgress />
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={stockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey={() => average} stroke="#ff7300" dot={false} name="Average" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

const HeatmapPage = () => {
  const [timeFrame, setTimeFrame] = useState(15);
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/heatmap-data?minutes=${timeFrame}`);
      const result = await response.json();
      setHeatmapData(result);
    } catch (error) {
      console.error("Error fetching heatmap data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
  }, [timeFrame]);

  return (
    <Box p={4}>
      <Typography variant="h4">Correlation Heatmap</Typography>
      <FormControl sx={{ mt: 2, mb: 4, minWidth: 200 }}>
        <InputLabel>Time Frame (minutes)</InputLabel>
        <Select
          value={timeFrame}
          label="Time Frame"
          onChange={(e) => setTimeFrame(e.target.value)}
        >
          {timeOptions.map((option) => (
            <MenuItem key={option} value={option}>Last {option} minute{option > 1 ? 's' : ''}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={1}>
          {heatmapData && heatmapData.labels && heatmapData.matrix ? (
            <>
              <Grid item xs={12}>
                <Typography variant="body2">(Heatmap matrix rendered here)</Typography>
              </Grid>
              {heatmapData.matrix.map((row, i) => (
                <Grid container item xs={12} spacing={1} key={`row-${i}`}>
                  {row.map((value, j) => (
                    <Grid item key={`cell-${i}-${j}`}
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: `rgba(0, 0, 255, ${Math.abs(value)})`,
                        color: "white",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: 12
                      }}
                    >
                      {value.toFixed(2)}
                    </Grid>
                  ))}
                </Grid>
              ))}
            </>
          ) : (
            <Typography>No data available</Typography>
          )}
        </Grid>
      )}
    </Box>
  );
};

const NavTabs = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
    if (newValue === 0) navigate("/");
    else if (newValue === 1) navigate("/heatmap");
  };

  return (
    <Paper square>
      <Tabs
        value={tab}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab label="Stock Page" />
        <Tab label="Heatmap Page" />
      </Tabs>
    </Paper>
  );
};

const App = () => {
  return (
    <Router>
      <NavTabs />
      <Routes>
        <Route path="/" element={<StockPage />} />
        <Route path="/heatmap" element={<HeatmapPage />} />
      </Routes>
    </Router>
  );
};

export default App;