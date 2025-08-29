const JWT_SECRET = "abcd@abcd";
import Jwt, {} from "jsonwebtoken";
export const userMiddleware = (req, res, next) => {
    const header = req.headers["authorization"];
    try {
        const decoded = Jwt.verify(header, JWT_SECRET);
        if (typeof decoded === "string" || !("id" in decoded)) {
            return res.status(403).json({ msg: "Invalid token" });
        }
        if (decoded) {
            req.userId = decoded.id;
            next();
        }
        else {
            res.status(401).json({
                msg: "You are  not loggged in!"
            });
        }
    }
    catch (error) {
        console.error("Error is here", error);
        res.status(403).json({
            alert: "You are not logged in !"
        });
    }
};
//# sourceMappingURL=auth.js.map