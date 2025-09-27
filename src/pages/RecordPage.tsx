
import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import PageTemplate from './PageTemplate';

const today = new Date().toISOString().split('T')[0];

const RecordPage: React.FC = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(today);
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: handle form submission (e.g., send to API)
    alert(`Canyon: ${name}\nDate: ${date}\nURL: ${url}`);
  };

  return (
    <PageTemplate pageTitle="Record Canyon">
      <Box maxWidth={400} mx="auto" mt={4}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name of the Canyon"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            fullWidth
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Canyon Link URL"
            value={url}
            onChange={e => setUrl(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Submit
          </Button>
        </form>
      </Box>
    </PageTemplate>
  );
};

export default RecordPage;
