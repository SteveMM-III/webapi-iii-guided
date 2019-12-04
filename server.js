const express = require('express'); // importing a CommonJS module

const hubsRouter = require('./hubs/hubs-router.js');
const helmet = require('helmet');

const server = express();

function logger(req, res, next) {
  console.log(`${req.method}to ${req.originalUrl}`)
  next();
}

function gatekeeper( req, res, next ) {
  const pass = req.headers.password;
  
  if ( pass && pass === 'melon' ) {
    next();
  } else {
    res.status( 401 ).json( { message: 'bad password' } );
  }
}

const checkRole = role => {
  return function( req, res, next ) {
    if ( role && role === req.headers.role ) {
      next()
    } else {
      res.status( 403 ).json( { message: "can't touch this" } );
    }
  };

}

server.use(helmet());
server.use(express.json());
server.use( logger );

server.use('/api/hubs', checkRole('admin'), hubsRouter);

server.get('/', (req, res) => {
  const nameInsert = (req.name) ? ` ${req.name}` : '';

  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome${nameInsert} to the Lambda Hubs API</p>
    `);
});

server.get( '/echo', (req, res) => {
  res.send(req.headers);
})

server.get( '/area51', gatekeeper, checkRole( 'agent' ),(req, res) => {
  res.send(req.headers);
})

module.exports = server;
