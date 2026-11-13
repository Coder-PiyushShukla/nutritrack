import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  hashToken,
  generateAccessToken,
  verifyAccessToken,
} from '../../src/utils/security.js';

describe('Security and Cryptography Unit Tests', () => {
  it('should hash password with Argon2id and correctly verify valid password', async () => {
    const plain = 'SecretPassword123!';
    const hash = await hashPassword(plain);

    expect(hash).toContain('$argon2id$');
    expect(hash).not.toBe(plain);

    const isMatch = await verifyPassword(hash, plain);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword(hash, 'WrongPassword123!');
    expect(isWrongMatch).toBe(false);
  });

  it('should generate secure random tokens and hash them with sha256', () => {
    const raw1 = generateSecureToken(32);
    const raw2 = generateSecureToken(32);

    expect(raw1).toHaveLength(64);
    expect(raw2).toHaveLength(64);
    expect(raw1).not.toBe(raw2);

    const hash1 = hashToken(raw1);
    const hash2 = hashToken(raw2);

    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hashToken(raw1)); // deterministic
    expect(hash1).not.toBe(hash2);
  });

  it('should sign and verify JWT access tokens with subject and role claims', () => {
    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      role: 'USER',
      email: 'test@nutritrack.io',
    };
    const sessionId = 'session_test_abc123';

    const token = generateAccessToken(mockUser, sessionId);
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(mockUser._id);
    expect(decoded.role).toBe('USER');
    expect(decoded.email).toBe('test@nutritrack.io');
    expect(decoded.sessionId).toBe(sessionId);
  });
});
