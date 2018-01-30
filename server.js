const express = require('express');
const expressGraphQL = require('express-graphql');
const schema = require('./schema/schema');

const app = express();

// Middleware for handling GraphQL requests
app.use('/graphql', expressGraphQL({
  schema,
  graphiql: true
}));

const port = process.env.PORT || 4000;

app.listen(port, _ => console.log(`Listening on port ${port}`));
