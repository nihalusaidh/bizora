import { loginSchema, signupSchema, forgotPasswordSchema } from "@/lib/validators/auth";

describe("Auth Validators", () => {
  describe("loginSchema", () => {
    it("accepts valid login", () => {
      const result = loginSchema.safeParse({ email: "test@example.com", password: "password123" });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({ email: "not-an-email", password: "password123" });
      expect(result.success).toBe(false);
    });

    it("rejects short password", () => {
      const result = loginSchema.safeParse({ email: "test@example.com", password: "12345" });
      expect(result.success).toBe(false);
    });

    it("rejects missing fields", () => {
      expect(loginSchema.safeParse({}).success).toBe(false);
      expect(loginSchema.safeParse({ email: "test@example.com" }).success).toBe(false);
      expect(loginSchema.safeParse({ password: "password123" }).success).toBe(false);
    });
  });

  describe("signupSchema", () => {
    it("accepts valid signup", () => {
      const result = signupSchema.safeParse({
        full_name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirm_password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects mismatched passwords", () => {
      const result = signupSchema.safeParse({
        full_name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirm_password: "different",
      });
      expect(result.success).toBe(false);
    });

    it("rejects short name", () => {
      const result = signupSchema.safeParse({
        full_name: "J",
        email: "john@example.com",
        password: "password123",
        confirm_password: "password123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("accepts valid email", () => {
      expect(forgotPasswordSchema.safeParse({ email: "test@example.com" }).success).toBe(true);
    });

    it("rejects invalid email", () => {
      expect(forgotPasswordSchema.safeParse({ email: "bad" }).success).toBe(false);
    });
  });
});
