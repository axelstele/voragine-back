const { ExtractJwt } = require('passport-jwt');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_PASSWORD,
};

module.exports = opts;
