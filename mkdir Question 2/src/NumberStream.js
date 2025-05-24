import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Paper,
} from "@mui/material";

const BACKEND_BASE = "http://localhost:9876/numbers"; // Your test server
const WINDOW_SIZE = 10;
const TYPES = ["p", "f", "e", "r"];

const typeLabelMap = {
  p: "Prime",
  f: "Fibonacci",
  e: "Even",
  r: "Random",
};

const NumberStream = () => {
  const [selectedType, setSelectedType] = useState("e");
  const [windowState, setWindowState] = useState([]);
  const [prevWindow, setPrevWindow] = useState([]);
  const [avg, setAvg] = useState(0);

  const fetchNumbers = async () => {
    try {
      const res = await axios.get(`${BACKEND_BASE}/${selectedType}`);
      const incoming = res.data.numbers || [];

      setPrevWindow([...windowState]);

      // Merge, dedupe, and retain last 10
      const combined = [...windowState, ...incoming];
      const deduped = [...new Set(combined)].slice(-WINDOW_SIZE);

      setWindowState(deduped);
      if (deduped.length) {
        const average = deduped.reduce((a, b) => a + b, 0) / deduped.length;
        setAvg(average);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchNumbers, 2000);
    return () => clearInterval(interval);
  }, [selectedType, windowState]);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Number Stream - {typeLabelMap[selectedType]}
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Number Type</InputLabel>
        <Select
          value={selectedType}
          label="Number Type"
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {typeLabelMap[type]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6">Previous Window:</Typography>
        <Box className="box">{JSON.stringify(prevWindow)}</Box>

        <Typography variant="h6">Current Window:</Typography>
        <Box className="box">{JSON.stringify(windowState)}</Box>

        <Typography variant="h6">Average:</Typography>
        <Box className="box">{avg.toFixed(2)}</Box>
      </Paper>
    </Container>
  );
};

export default NumberStream;
