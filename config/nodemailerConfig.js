import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Tạo transporter
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, // Email Gmail
        pass: process.env.PASSWORD // Mật khẩu ứng dụng (App Password)
    }
});

// Hàm gửi email test
export const sendTestEmail = async() => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: process.env.EMAIL, // Gửi về chính email của bạn để kiểm tra
            subject: 'Test Nodemailer',
            text: 'Hello! Đây là email test từ NodeJS Auth System.'
        });
        console.log('✅ Email test gửi thành công:', info.response);
    } catch (error) {
        console.error('❌ Lỗi khi gửi email test:', error);
    }
};

// Gọi hàm test ngay khi chạy file này (có thể comment khi deploy)
sendTestEmail();