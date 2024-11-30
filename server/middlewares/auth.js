import jwt from "jsonwebtoken";

function authMiddleware(req, res, next) {
    try {
        const token = req.headers['auth'];
        if (!token)
            return res.status(401).json({ msg: 'Unauthorized!' });
        
        req.team = jwt.verify(token, 'sherl0ck');
        return next();
    } catch (error) {
        return res.status(401).json({msg: 'Invalid/Expired Token!'});
    }
}

export default authMiddleware;