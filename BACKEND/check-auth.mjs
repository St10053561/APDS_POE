// check-auth.mjs
import jwt from 'jsonwebtoken';

const checkAuth = (req, res, next) => {
    try {
        // Get the Authorization header from the request
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.error('Authentication failed: No authorization header provided');
            return res.status(401).json({ message: "Authentication failed: No authorization header provided" });
        }

        // Extract the token from the Authorization header
        const token = authHeader.split(" ")[1];
        if (!token) {
            console.error('Authentication failed: No token provided');
            return res.status(401).json({ message: "Authentication failed: No token provided" });
        }

        // Verify the token using the secret key
        const decoded = jwt.verify(token, "this_secret_should_be_Longer_than_it_is");
        // Attach the decoded token data to the request object
        req.userData = decoded;
        // Call the next middleware or route handler
        next();
    } catch (error) {
        // Log error and send a 401 Unauthorized response if token verification fails
        console.error('Authentication failed:', error);
        return res.status(401).json({ message: "Authentication failed" });
    }
};

export default checkAuth; // Export the checkAuth middleware function