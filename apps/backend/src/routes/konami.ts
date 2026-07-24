import { Router } from 'express';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { createVerification, findUserById, findVerificationById, updateVerification } from '../services/stateStore';

const router = Router();

function getAuthenticatedUser(req: any) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { sub?: string };
    return findUserById(payload.sub || '');
  } catch {
    return null;
  }
}

router.post('/start', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { konami_id, platform } = req.body as { konami_id?: string; platform?: string };
  if (!konami_id || !platform) {
    return res.status(400).json({ error: 'konami_id and platform are required' });
  }

  const verificationCode = `EF-${randomBytes(3).toString('hex').slice(0, 5).toUpperCase()}`;
  const verification = {
    id: randomBytes(8).toString('hex'),
    userId: user.id,
    konamiId: konami_id,
    verificationCode,
    status: 'pending' as const,
    createdAt: new Date().toISOString()
  };

  createVerification(verification);

  return res.json({
    success: true,
    konami_id,
    platform,
    verification_code: verificationCode,
    verification,
    upload_url: null,
    message: 'Save this code and upload proof for moderator review.'
  });
});

router.post('/submit-proof', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { verification_id, proof_url } = req.body as { verification_id?: string; proof_url?: string };
  if (!verification_id || !proof_url) {
    return res.status(400).json({ error: 'verification_id and proof_url are required' });
  }

  const verification = findVerificationById(verification_id);
  if (!verification || verification.userId !== user.id) {
    return res.status(404).json({ error: 'Verification not found' });
  }

  updateVerification(verification_id, { proofUrl: proof_url, status: 'pending' });

  return res.json({ success: true, message: 'Proof submitted for review' });
});

export default router;
