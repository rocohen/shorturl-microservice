require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');
const app = express();
const generateUniqueId = require('generate-unique-id');
const Url = require('./model');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:urlid', async (req, res) => {
  const { urlid } = req.params;
  if(!isNaN(urlid)) {
    const data = await Url.findOne({ url_id: urlid }).exec()
    if(data !== null) {
      res.redirect(301, data.original_url);
    } else {
      res.json({ error: 'No short URL found for the given input' }) 
    }
  } else {
    res.json({ error: 'Wrong format'})  
  }
})

app.post('/api/shorturl', (req, res) => {
  const { url: lookupUrl } = req.body;
  const URIRegex =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/;

  if (URIRegex.test(lookupUrl)) {
    const URI = new URL(lookupUrl);
    dns.lookup(URI.protocol ? URI.host : URI.path, async (error, address, family) => {
      if (error || !address) {
        res.json({ error: 'Invalid Hostname' });
      } else {
        // Configuration to generate unique ids
        const id = generateUniqueId({
          length: 5,
          useLetters: false,
        });

        const newUrl = new Url({
          original_url: lookupUrl,
          url_id: id,
        });

        await newUrl.save(function(err, data) {
          if (err) return console.log(err);
          console.log(data);
        });

        res.json({ original_url: lookupUrl, short_url: id });
      }
    });

  } else {
    res.json({ error: 'Invalid URL' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
