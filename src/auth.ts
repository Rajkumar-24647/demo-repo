
const JWT_SECRET = "abcd@abcd";
import type {Request,Response, NextFunction } from "express";
import Jwt, {type JwtPayload}  from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string | number;
}

export const userMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {

    const header = req.headers["authorization"];
try {
    const decoded = Jwt.verify(header as string, JWT_SECRET);

     if (typeof decoded === "string" || !("id" in decoded)) {
      return res.status(403).json({ msg: "Invalid token" });
    }

    if(decoded){
        req.userId = (decoded as JwtPayload & { id: string | number }).id;
        next();
    }else{
        res.status(401).json({
            msg: "You are  not loggged in!"
        })
    }
    
} catch (error) {
    console.error("Error is here", error);
    res.status(403).json({
        alert: "You are not logged in !"
    })
}



}