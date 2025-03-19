import jwt from 'jsonwebtoken'
export const generateToken = (id,role)=>{
    try {
      // Generating a JWT token with the user ID and role as payload
      const token = jwt.sign({ id, role }, process.env.SECRET_KEY, {
        expiresIn: "30m",
      }); // Token expiration time set to 30 minutes
      return token;
    } catch (error) {
        console.log(error)
    }
}