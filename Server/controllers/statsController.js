const Post = require('../models/postModel'); 

exports.getMonthlyStats = async (req, res) => {
  try {
    const stats = await Post.aggregate([
      {
        $addFields: {
          createdDate: { $toDate: "$createdAt" }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdDate" },
            year: { $year: "$createdDate" },
            group: "$group"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);
    res.json(stats);
  } catch (err) {
    console.error("Error in getMonthlyStats:", err);
    res.status(500).json({ error: err.message });
  }
};


