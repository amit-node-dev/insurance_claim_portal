const db = require("../models");
const User = db.User;
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../core/jwt/generateToken");

// A single function to handle both login and registration
exports.loginOrRegister = async (req, res) => {
  const { email, password, role } = req.body;

  // Basic validation
  if (!email || !password) {
    return res
      .status(400)
      .send({ message: "Email and password are required." });
  }

  try {
    // Step 1: Try to find the user by email
    let user = await User.findOne({ where: { email: email } });

    // --- SCENARIO A: USER EXISTS (Perform Login) ---
    if (user) {
      // Validate the password
      const passwordIsValid = await user.isValidPassword(password);

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      const accessToken = generateAccessToken(user.id, user.emailId);
      const refreshToken = generateRefreshToken(user.id, user.emailId);

      // Return success response with 200 OK status
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            emailId: user.email,
          },
          accessToken,
          refreshToken,
        },
      });
    }
    // --- SCENARIO B: USER DOES NOT EXIST (Perform Registration and Login) ---
    else {
      // A role is mandatory to create a new user
      if (!role) {
        return res
          .status(400)
          .send({ message: "A 'role' is required to register a new user." });
      }

      // Create the new user. The password will be hashed by the model's hook.
      const newUser = await User.create({
        email: email,
        password: password,
        role: role,
      });

      const accessToken = generateAccessToken(newUser.id, newUser.emailId);
      const refreshToken = generateRefreshToken(newUser.id, newUser.emailId);

      // Return success response with 201 Created status
      return res.status(201).json({
        success: true,
        message: "New user registered and logged in successfully",
        data: {
          user: {
            id: newUser.id,
            emailId: newUser.email,
          },
          accessToken,
          refreshToken,
        },
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: error.message || "An error occurred during the login process.",
    });
  }
};
