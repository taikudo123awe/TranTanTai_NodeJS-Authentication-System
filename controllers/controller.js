import mongoose from "mongoose";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import { transporter } from "../config/nodemailerConfig.js";
import dotenv from "dotenv";

dotenv.config();

export class UserGetController {
    // GET: Sign Up page
    getSignUpPage = (req, res) => {
        res.render("signup", {
            studentId: process.env.STUDENT_ID || "N/A",
            fullname: process.env.STUDENT_NAME || "N/A",
            message: ""
        });
    }

    // GET: Sign In page
    getSignInPage = (req, res) => {
        res.render("signin", {
            studentId: process.env.STUDENT_ID || "N/A",
            fullname: process.env.STUDENT_NAME || "N/A",
            message: ""
        });
    }

    // GET: Homepage
    homePage = (req, res) => {
        const email = req.session.userEmail;
        if (!email) {
            return res.status(404).render("signin", {
                message: "Please sign in to view the homepage",
                studentId: process.env.STUDENT_ID,
                fullname: process.env.STUDENT_NAME
            });
        }
        res.render("homepage", {
            studentId: process.env.STUDENT_ID,
            fullname: process.env.STUDENT_NAME,
            user: { email: email }
        });
    }


    // GET: Forgot Password page
    getForgotPassword = (req, res) => {
        res.render("forgot-password", {
            studentId: process.env.STUDENT_ID,
            fullname: process.env.STUDENT_NAME,
            message: ""
        });
    }

    // GET: Change Password page
    getChangePassword = (req, res) => {
        const email = req.session.userEmail;
        if (!email) {
            return res.status(404).render("signin", {
                studentId: process.env.STUDENT_ID,
                fullname: process.env.STUDENT_NAME,
                message: "Please sign in to change password"
            });
        }
        res.render("change-password", {
            studentId: process.env.STUDENT_ID,
            fullname: process.env.STUDENT_NAME,
            message: ""
        });
    }

    // GET: Logout
    logoutUser = (req, res) => {
        req.session.destroy(err => {
            if (err) {
                console.error('Error signing out:', err);
                return res.status(500).send('Error signing out');
            }
            res.render("signin", {
                studentId: process.env.STUDENT_ID,
                fullname: process.env.STUDENT_NAME,
                message: "User logged out successfully"
            });
        });
    }
}


export class UserPostController {
    // POST: Sign Up
    createUser = async(req, res) => {
        const { username, email, password, cpassword } = req.body;

        if (password !== cpassword) {
            return res.status(400).render("signup", {
                studentId: process.env.STUDENT_ID,
                fullname: process.env.STUDENT_NAME,
                message: "Passwords don't match"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).render("signup", {
                studentId: process.env.STUDENT_ID,
                fullname: process.env.STUDENT_NAME,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        try {
            await newUser.save();
            res.render("signin", {
                studentId: process.env.STUDENT_ID,
                fullname: process.env.STUDENT_NAME,
                message: "User created successfully"
            });
        } catch (error) {
            res.status(500).render("signup", {
                studentId: process.env.STUDENT_ID,
                fullname: process.env.STUDENT_NAME,
                message: error.message
            });
        }
    }

    // POST: Sign In
    signInUser = async(req, res) => {
        const { email, password } = req.body;

        const recaptcha = req.body['g-recaptcha-response'];
        if (!recaptcha) {
            return res.status(400).render("signin", {
                studentId: process.env.STUDENT_ID,
                fullname: process.env.STUDENT_NAME,
                message: "Please select captcha"
            });
        }

        try {
            const existingUser = await User.findOne({ email });
            if (!existingUser) {
                return res.status(404).render("signin", {
                    studentId: process.env.STUDENT_ID,
                    fullname: process.env.STUDENT_NAME,
                    message: "User doesn't exist"
                });
            }

            const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
            if (!isPasswordCorrect) {
                return res.status(400).render("signin", {
                    studentId: process.env.STUDENT_ID,
                    fullname: process.env.STUDENT_NAME,
                    message: "Incorrect password"
                });
            }

            req.session.userEmail = email;
            res.redirect("/user/homepage");
        } catch (error) {
            res.status(500).render("signin", {
                studentId: process.env.STUDENT_ID,
                fullname: process.env.STUDENT_NAME,
                message: error.message
            });
        }
    }

    // POST: Forgot Password
    forgotPassword = async(req, res) => {
        const { email } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).render("forgot-password", {
                    studentId: process.env.STUDENT_ID,
                    fullname: process.env.STUDENT_NAME,
                    message: "User doesn't exist"
                });
            }

            const newPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await transporter.sendMail({
                from: process.env.EMAIL,
                to: email,
                subject: "Password Reset",
                text: `Your new password is: ${newPassword}`
            });

            user.password = hashedPassword;
            await user.save();

            res.render("signin", {
                studentId: process.env.STUDENT_ID,
                fullname: process.env.STUDENT_NAME,
                message: "New password sent to your email"
            });
        } catch (error) {
            res.status(500).render("forgot-password", {
                studentId: process.env.STUDENT_ID,
                fullname: process.env.STUDENT_NAME,
                message: error.message
            });
        }
    }

    // POST: Change Password
    changePassword = async(req, res) => {
        const { oldPassword, newPassword } = req.body;
        const email = req.session.userEmail;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).render("change-password", {
                    studentId: process.env.STUDENT_ID,
                    fullname: process.env.STUDENT_NAME,
                    message: "User doesn't exist"
                });
            }

            const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordCorrect) {
                return res.status(400).render("change-password", {
                    studentId: process.env.STUDENT_ID,
                    fullname: process.env.STUDENT_NAME,
                    message: "Incorrect old password"
                });
            }

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            res.render("signin", {
                studentId: process.env.STUDENT_ID,
                fullname: process.env.STUDENT_NAME,
                message: "Password changed successfully"
            });
        } catch (error) {
            res.status(500).render("change-password", {
                studentId: process.env.STUDENT_ID,
                fullname: process.env.STUDENT_NAME,
                message: error.message
            });
        }
    }
}