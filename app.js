import express from "express";
import bodyParser from "body-parser";
import ejsLayouts from "express-ejs-layouts";
import path from "path";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { connectUsingMongoose } from "./config/mongodb.js";
import router from "./routes/routes.js";
import authrouter from "./routes/authRoutes.js";

// Load biến môi trường từ file .env
dotenv.config();

// ==================== DEBUG ENV ====================
console.log("📌 Checking environment variables:");
console.log("DB_CONNECTION_STRING:", process.env.DB_CONNECTION_STRING ? "Loaded" : "Missing");
console.log("CLIENT_ID:", process.env.CLIENT_ID ? "Loaded" : "Missing");
console.log("CLIENT_SECRET:", process.env.CLIENT_SECRET ? "Loaded" : "Missing");
console.log("CALLBACK_URL:", process.env.CALLBACK_URL || "Missing");

// ==================== EXPRESS APP ====================
const app = express();

// ==================== SESSION ====================
app.use(
    session({
        secret: process.env.SESSION_SECRET || "defaultSecret",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // nếu deploy https thì đổi thành true
    })
);

// ==================== MIDDLEWARE ====================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// ==================== PASSPORT CONFIG ====================
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GoogleStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
        },
        function(accessToken, refreshToken, profile, done) {
            return done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// ==================== VIEWS ====================
app.set("view engine", "ejs");
app.use(ejsLayouts);
app.set("views", path.join(path.resolve(), "views"));

// ==================== DATABASE ====================
connectUsingMongoose();

// ==================== ROUTES ====================
app.get("/", (req, res) => {
    res.send("Hey Ninja! Go to /user/signin for the login page.");
});
app.use("/user", router);
app.use("/auth", authrouter);

// ==================== SERVER LISTEN ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});