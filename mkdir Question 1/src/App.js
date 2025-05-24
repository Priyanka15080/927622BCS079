import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import axios from "axios";
import "./styles/App.css";

const STOCK_API = "http://20.244.56.144/evaluation-service/stocks/";
const timeOptions = [5, 15, 30, 60];

const App = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState("NVDA");
  const [timeFrame, setTimeFrame] = useState(15);
  const [avg, setAvg] = useState(null);

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${STOCK_API}${selectedStock}?minutes=${timeFrame}`);
      const cleanedData = response.data.filter(d => d.price && d.lastUpdatedAt);
      setStockData(cleanedData);
      const sum = cleanedData.reduce((acc, curr) => acc + curr.price, 0);
      setAvg(sum / cleanedData.length);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [selectedStock, timeFrame]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Stock Price Chart - {selectedStock}
      </Typography>

      <FormControl sx={{ m: 1, minWidth: 120 }}>
        <InputLabel>Stock</InputLabel>
        <Select value={selectedStock} onChange={(e) => setSelectedStock(e.target.value)}>
          <MenuItem value="NVDA">NVDA</MenuItem>
          <MenuItem value="AAPL">AAPL</MenuItem>
          <MenuItem value="GOOG">GOOG</MenuItem>
          <MenuItem value="MSFT">MSFT</MenuItem>
        </Select>
      </FormControl>

      <FormControl sx={{ m: 1, minWidth: 120 }}>
        <InputLabel>Minutes</InputLabel>
        <Select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)}>
          {timeOptions.map((min) => (
            <MenuItem key={min} value={min}>
              Last {min} min
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box className="chart-box">
        {loading ? (
          <CircularProgress />
        ) : (
          <ResponsiveContainer>
            <LineChart data={stockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="lastUpdatedAt"
                tickFormatter={(tick) => new Date(tick).toLocaleTimeString()}
              />
              <YAxis />
              <RechartTooltip
                formatter={(value) => [`$${value.toFixed(2)}`, "Price"]}
                labelFormatter={(label) => new Date(label).toLocaleString()}
              />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#8884d8" dot={true} />
              {avg && (
                <Line
                  type="monotone"
                  dataKey={() => avg}
                  stroke="#ff7300"
                  strokeDasharray="5 5"
                  dot={false}
                  name={`Average: $${avg.toFixed(2)}`}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Container>
  );
};

export default App;
