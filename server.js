const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.get('/get-audio-list', (req, res) => {
  const uploadFolderPath = 'uploads';

  fs.readdir(uploadFolderPath, (err, files) => {
    if (err) {
      console.error('Error reading upload folder:', err);
      res.status(500).json({ error: 'Failed to retrieve audio files' });
      return;
    }

    res.json({ audioFiles: files });
  });
});

app.get('/uploads/:audioFile', (req, res) => {
  const audioFile = req.params.audioFile;
  const filePath = `uploads/${audioFile}`;

  res.download(filePath, audioFile, (err) => {
    if (err) {
      console.error('Error downloading audio file:', err);
      res.status(500).json({ error: 'Failed to download audio file' });
    }
  });
});

app.post('/upload-audio', upload.single('audio'), (req, res) => {
  const uploadFolderPath = 'uploads';

  fs.readdir(uploadFolderPath, (err, files) => {
    if (err) {
      console.error('Error reading upload folder:', err);
      res.status(500).json({ error: 'Failed to save audio file' });
      return;
    }

    const fileCount = files.length;
    const newFileName = `${fileCount}.wav`; // Assuming the recorded file format is 'wav'

    fs.rename(req.file.path, `${uploadFolderPath}/${newFileName}`, (err) => {
      if (err) {
        console.error('Error renaming audio file:', err);
        res.status(500).json({ error: 'Failed to save audio file' });
        return;
      }

      res.sendStatus(200);
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});