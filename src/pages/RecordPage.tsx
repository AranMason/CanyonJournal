import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useUser } from '../App';
import PageTemplate from './PageTemplate';
import { useNavigate } from 'react-router-dom';

const today = new Date().toISOString().split('T')[0];

const RecordPage: React.FC = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const [name, setName] = useState('');
  const [date, setDate] = useState(today);
  const [url, setUrl] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [comments, setComments] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, date, url, teamSize, comments }),
      });
      if (response.ok) {
        setName('');
        setDate(today);
        setUrl('');
        setTeamSize(1);
        setComments('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to record canyon.');
      }
    } catch (err) {
      alert('Network error.');
    }
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
            label="Team Size"
            type="number"
            value={teamSize}
            onChange={e => setTeamSize(Number(e.target.value))}
            fullWidth
            required
            margin="normal"
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Canyon Link URL"
            value={url}
            onChange={e => setUrl(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Comments"
            value={comments}
            onChange={e => setComments(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={3}
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
