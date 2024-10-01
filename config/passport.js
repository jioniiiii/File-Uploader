const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//configure LocalStrategy
passport.use(
  new LocalStrategy(async (email, password, done) => {
    try {
      const user = await prisma.user.findFirst({ where: { email } })
      if (!user) {
        return done(null, false, { message: "Incorrect email" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

//serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

//deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;