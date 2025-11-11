import dbConnect from '../../lib/mongodb';
import Message from '../../models/Message';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { user1, user2 } = req.query;

    if (!user1 || !user2) {
      return res.status(400).json({ message: 'Both user1 and user2 are required' });
    }

    // Fetch all messages between user1 and user2
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ timestamp: 1 }); // Sort by oldest first

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
