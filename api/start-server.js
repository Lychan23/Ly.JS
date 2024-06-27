const { exec } = require('child_process');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  exec('npm run svr', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting server: ${error}`);
      return res.status(500).send(`Error starting server: ${stderr}`);
    }
    res.status(200).send(`Server started: ${stdout}`);
  });
};
