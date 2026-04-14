import { requireAuth } from '../../../lib/auth';

export default requireAuth(async function handler(req, res) {
  return res.status(200).json({ user: { id: req.session.sub, email: req.session.email } });
});
