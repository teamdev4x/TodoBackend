import jwt from 'jsonwebtoken';

class AuthController{

    static generateResponse(data, status = 200, token = null) {
        var res = {};

        res['status'] = status,
        res['data'] = data;

        if (token) {
            res['auth_token'] = token;
        }

        return res;
    }

    static generateToken = (id) => {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        })
    }

}

export default AuthController