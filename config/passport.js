const JwtStrategy = require('passport-jwt').Strategy;
const passport = require('passport');
const jwtOps = require('./jwt');

passport.use(new JwtStrategy(jwtOps, ((jwtPayload, done) => {
  // If the token has expiration, raise unauthorized
  const expirationDate = new Date(jwtPayload.exp * 1000);
  if (expirationDate < new Date()) {
    return done(null, false);
  }
  return done(null, jwtPayload);
})));

passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser((email, done) => {
  done(null, email);
});

module.exports = passport;
