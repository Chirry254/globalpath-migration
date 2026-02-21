const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    const { session_id } = req.body;
    if (!session_id) { res.status(400).json({ error: 'Missing session_id' }); return; }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      res.status(200).json({
        paid: true,
        name: session.metadata.name,
        email: session.metadata.email,
        country: session.metadata.country,
        amount: session.amount_total / 100,
        currency: session.currency.toUpperCase()
      });
    } else {
      res.status(200).json({ paid: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
