const knex = require('knex');

module.exports = knex({
  client: 'pg',
  connection: {
    connectionString: "postgres://u2bv3qhcbo7kd:pf5bb1dabcf4c3cf32fedaf65f4ccaa0d5f862918fea7cb61b9a069eeb21f6a5d@cav8p52l9arddb.cluster-czz5s0kz4scl.eu-west-1.rds.amazonaws.com:5432/d37u7q0lkphnrb",
    ssl: {
      rejectUnauthorized: false,
    },
  },
});