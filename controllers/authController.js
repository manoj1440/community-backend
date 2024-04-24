const jwt = require('jsonwebtoken');
const User = require('../models/User');

const login = async (req, res, next) => {

    try {
        const { password, email } = req.body;
        const user = await User.findOne({ email, role: { $ne: "customer" } }).populate('warehouseId');

        if (!user) {
            return res.send({ status: false, message: 'Invalid email' });
        }
        const matchPassword = user.validatePassword(password);
        if (!matchPassword) {
            return res.send({ status: false, message: 'Invalid Password' });
        }

        delete user.password;
        const expiresIn = process.env.USER_EXPIRE ? Number(process.env.USER_EXPIRE) : 60 * 60;
        const token = jwt.sign({
            user
        },
            process.env.JWT_SECRET,
            { expiresIn });

        const isLocal = process.env.NODE_ENV !== 'production';
        if (isLocal) {
            res.cookie('token', token, {
                maxAge: expiresIn * 1000
            });
        } else {
            res.cookie('token', token, {
                maxAge: expiresIn * 1000,
                httpOnly: true,
                secure: true, // Set this to true for HTTPS connections
                sameSite: 'none' // Required for cross-site cookies
            });
        }

        return res.send({
            status: true,
            message: 'success',
            data: {
                user,
                token
            }
        });
    } catch (err) {
        console.error('Error in login:', err);
        return res.send({ status: false, message: 'An error occurred', error: err });
    }
}

const logout = async (req, res, next) => {
    try {
        const isLocal = process.env.NODE_ENV !== 'production';

        if (isLocal) {
            res.clearCookie('token');
        } else {
            res.clearCookie('token', {
                httpOnly: true,
                secure: true, // Use 'false' for non-HTTPS connections during development
                sameSite: 'none', // Use 'Lax' for non-HTTPS connections during development
            });
        }

        return res.send({
            status: true,
            message: 'Logged out successfully',
            data: null
        });
    } catch (err) {
        return res.send({ status: false, message: 'An error occurred', error: err });
    }
}

module.exports = { login, logout };
