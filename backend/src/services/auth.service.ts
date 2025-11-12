/**
 * auth.service.ts
 * Production-ready authentication service.
 * Handles user login, registration, token refresh, and password management.
 */

import prisma from "../config/db.config";
import logger from "../config/logger";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "please-change-me-in-production";
const REFRESH_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "please-change-refresh-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const BCRYPT_ROUNDS = 10;

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  tenantName: string;
}

interface TokenPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}

class AuthService {
  /**
   * User login
   */
  static async login({ email, password }: LoginPayload) {
    try {
      // Find user with tenant
      const user = await prisma.user.findFirst({
        where: { email },
        include: { tenant: true },
      });

      if (!user) {
        logger.warn(`Login attempt with non-existent email: ${email}`);
        throw new Error("Invalid email or password");
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        logger.warn(`Failed login attempt for user: ${user.id}`);
        throw new Error("Invalid email or password");
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error("Account is disabled");
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      logger.info(`User logged in: ${user.id}`);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenant: user.tenant,
        },
      };
    } catch (error) {
      logger.error("Login error:", error);
      throw error;
    }
  }

  /**
   * User registration (creates user and tenant)
   */
  static async register({
    email,
    password,
    name,
    tenantName,
  }: RegisterPayload) {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: { email },
      });

      if (existingUser) {
        throw new Error("Email already registered");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

      // Create tenant and user in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create tenant
        const tenant = await tx.tenant.create({
          data: {
            name: tenantName,
            isActive: true,
          },
        });

        // Create user (owner)
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            role: "OWNER",
            tenantId: tenant.id,
            isActive: true,
          },
        });

        return { tenant, user };
      });

      const { accessToken, refreshToken } = this.generateTokens(result.user);

      logger.info(
        `User registered: ${result.user.id} with tenant: ${result.tenant.id}`
      );

      return {
        accessToken,
        refreshToken,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          tenantId: result.tenant.id,
        },
      };
    } catch (error) {
      logger.error("Registration error:", error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string) {
    try {
      const payload: any = jwt.verify(refreshToken, REFRESH_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { tenant: true },
      });

      if (!user || !user.isActive) {
        throw new Error("User not found or inactive");
      }

      const { accessToken } = this.generateTokens(user);

      logger.info(`Token refreshed for user: ${user.id}`);

      return { accessToken };
    } catch (error) {
      logger.error("Token refresh error:", error);
      throw new Error("Invalid refresh token");
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new Error("User not found");
      }

      // Verify old password
      const passwordValid = await bcrypt.compare(oldPassword, user.password);
      if (!passwordValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      logger.info(`Password changed for user: ${userId}`);

      return { message: "Password changed successfully" };
    } catch (error) {
      logger.error("Password change error:", error);
      throw error;
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private static generateTokens(user: any) {
    const tokenPayload: TokenPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(
      tokenPayload,
      JWT_SECRET as string,
      {
        expiresIn: JWT_EXPIRES_IN,
      } as SignOptions
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      REFRESH_SECRET as string,
      {
        expiresIn: "7d",
      } as SignOptions
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify token
   */
  static verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}

export default AuthService;
