import passport from 'passport';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const authRouter = express.Router();

// Bắt đầu Google OAuth
authRouter.get("/google",
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback Google OAuth
authRouter.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/user/signin" }),
    (req, res) => {
        // Lưu email vào session để dùng sau
        if (req.user && req.user.emails) {
            req.session.userEmail = req.user.emails[0].value;
        }
        // Redirect về homepage sau khi login thành công
        res.redirect("/user/homepage");
    }
);

// Logout Google
authRouter.get("/logout", (req, res) => {
    req.logout(() => {
        req.session.destroy();
        res.redirect("/user/signin");
    });
});

export default authRouter;