import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Toy from "./models/Toy.js";
import BorrowRequest from "./models/BorrowRequest.js";
import Review from "./models/Review.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/toy-share";

async function seed() {
  console.log("Connecting to MongoDB...");
  await connectDB(MONGO_URI);

  console.log("Clearing old data...");
  await Promise.all([
    User.deleteMany({}),
    Toy.deleteMany({}),
    BorrowRequest.deleteMany({}),
    Review.deleteMany({}),
  ]);

  console.log("Creating Users...");
  const users = await User.create([
    {
      name: "Nguyễn Văn An",
      email: "an@gmail.com",
      password: "password123",
    },
    {
      name: "Trần Thị Hoa",
      email: "hoa@gmail.com",
      password: "password123",
    },
    {
      name: "Lê Hoàng Dũng",
      email: "dung@gmail.com",
      password: "password123",
    },
    {
      name: "Phạm Minh Tuấn",
      email: "tuan@gmail.com",
      password: "password123",
    },
  ]);

  const [userAn, userHoa, userDung, userTuan] = users;

  console.log("Creating Real Toys...");
  const toys = await Toy.create([
    {
      owner: userAn._id,
      name: "Biệt Thự Đồ Chơi Lego Avengers Tower",
      description: "Mô hình Lego Avengers siêu chi tiết 500+ mảnh ghép, phù hợp cho bé phát triển khả năng tư duy logic và sáng tạo lắp ráp.",
      category: "boardgame",
      ageRange: "9+ tuổi",
      condition: "new",
      status: "available",
      images: ["https://images.unsplash.com/photo-1587654562363-60545657574e?w=800&auto=format&fit=crop&q=80"],
    },
    {
      owner: userHoa._id,
      name: "Máy Bay Mô Hình Bằng Gỗ Cao Cấp",
      description: "Máy bay mô hình bằng gỗ thông tự nhiên mịn màng, sơn phủ an toàn tuyệt đối cho trẻ nhỏ khi chơi.",
      category: "vehicle",
      ageRange: "3-5 tuổi",
      condition: "good",
      status: "available",
      images: ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80"],
    },
    {
      owner: userHoa._id,
      name: "Gấu Bông Thỏ Ngọc Hồng Siêu Mềm",
      description: "Gấu bông vải nỉ cao cấp không xù lông, mềm mại an toàn êm ái cho bé ôm khi ngủ.",
      category: "doll",
      ageRange: "0-2 tuổi",
      condition: "new",
      status: "available",
      images: ["https://images.unsplash.com/photo-1558060370-d644479be6f7?w=800&auto=format&fit=crop&q=80"],
    },
    {
      owner: userDung._id,
      name: "Bộ Đồ Chơi Xếp Hình Khối Gỗ Học Tập STEM",
      description: "Bộ khối gỗ hình học đa màu sắc giúp bé nhận biết màu sắc, hình khối và rèn luyện trí thông minh vận động tinh.",
      category: "educational",
      ageRange: "3-5 tuổi",
      condition: "good",
      status: "available",
      images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80"],
    },
    {
      owner: userAn._id,
      name: "Xe Đua Điều Khiển Từ Xa Tốc Độ Cao",
      description: "Xe đua điều khiển sóng 2.4GHz pin sạc dung lượng cao, chạy cực bốc trên nhiều loại địa hình.",
      category: "vehicle",
      ageRange: "6-8 tuổi",
      condition: "good",
      status: "borrowed",
      images: ["https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop&q=80"],
    },
    {
      owner: userTuan._id,
      name: "Bộ Cờ Vua Gỗ Cao Cấp Nam Châm",
      description: "Bàn cờ vua gỗ khắc thủ công đẹp mắt, các quân cờ có gắn nam châm chống lật khi thi đấu.",
      category: "boardgame",
      ageRange: "9+ tuổi",
      condition: "new",
      status: "available",
      images: ["https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&auto=format&fit=crop&q=80"],
    },
    {
      owner: userHoa._id,
      name: "Bộ Cầu Trượt & Bóng Rổ Trong Nhà Trẻ Em",
      description: "Bộ vận động liên hoàn nhựa HDPE nguyên sinh chắc chắn, giúp bé vận động thể thao năng động ngay tại nhà.",
      category: "outdoor",
      ageRange: "0-2 tuổi",
      condition: "new",
      status: "available",
      images: ["https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80"],
    },
    {
      owner: userDung._id,
      name: "Bộ Đồ Chơi Bác Sĩ & Y Tế Trẻ Em Vali",
      description: "Hộp Vali bác sĩ đầy đủ ống nghe nhịp tim, tai nghe, nhiệt kế phát sáng sinh động cho bé chơi nhập vai.",
      category: "educational",
      ageRange: "3-5 tuổi",
      condition: "new",
      status: "available",
      images: ["https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80"],
    },
    {
      owner: userTuan._id,
      name: "Xe Đạp Trẻ Em 3 Bánh Có Cần Đẩy",
      description: "Xe đạp khung thép sơn tĩnh điện bền bỉ có mái che nắng, phù hợp cho bố mẹ đưa bé đi dạo dã ngoại ngoài trời.",
      category: "outdoor",
      ageRange: "0-2 tuổi",
      condition: "good",
      status: "available",
      images: ["https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&auto=format&fit=crop&q=80"],
    },
  ]);

  console.log("Creating Borrow Requests...");
  const request1 = await BorrowRequest.create({
    toy: toys[4]._id, // Xe Đua
    borrower: userDung._id,
    owner: userAn._id,
    status: "borrowed",
    borrowDate: new Date("2026-07-20"),
    returnDate: new Date("2026-07-28"),
    message: "Cho bé nhà mình mượn chơi cuối tuần nhé bạn!",
  });

  const request2 = await BorrowRequest.create({
    toy: toys[1]._id, // Máy bay gỗ
    borrower: userAn._id,
    owner: userHoa._id,
    status: "returned",
    borrowDate: new Date("2026-07-10"),
    returnDate: new Date("2026-07-17"),
    actualReturnDate: new Date("2026-07-17"),
    message: "Bé thích máy bay này lắm, mình xin mượn 1 tuần nha.",
  });

  console.log("Creating Reviews...");
  await Review.create({
    toy: toys[1]._id,
    reviewer: userAn._id,
    request: request2._id,
    rating: 5,
    comment: "Đồ chơi máy bay mộc mạc đẹp mắt, mượn rất thích, chủ đồ chơi nhiệt tình lắm ạ!",
  });

  console.log("Seeding complete successfully!");
  console.log("-----------------------------------------");
  console.log("Accounts created (password: password123):");
  console.log("1. an@gmail.com (Nguyễn Văn An)");
  console.log("2. hoa@gmail.com (Trần Thị Hoa)");
  console.log("3. dung@gmail.com (Lê Hoàng Dũng)");
  console.log("4. tuan@gmail.com (Phạm Minh Tuấn)");
  console.log("-----------------------------------------");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
