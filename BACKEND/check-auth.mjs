// check-auth.mjs
import jwt from 'jsonwebtoken';

const checkAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.error('Authentication failed: No authorization header provided');
            return res.status(401).json({ message: "Authentication failed: No authorization header provided" });
        }

        const token = authHeader.split(" ")[1]; // Extract the token from the Authorization header
        if (!token) {
            console.error('Authentication failed: No token provided');
            return res.status(401).json({ message: "Authentication failed: No token provided" });
        }

        const decoded = jwt.verify(token, "this_secret_should_be_Longer_than_it_is"); // Verify the token
        req.userData = decoded; // Attach the decoded token data to the request object
        next(); // Call the next middleware or route handler
    } catch (error) {
        console.error('Authentication failed:', error); // Log error
        return res.status(401).json({ message: "Authentication failed" }); // Send a 401 Unauthorized response if token verification fails
    }
};

export default checkAuth; // Export the checkAuth middleware function