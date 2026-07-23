import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { request, getImageUrl } from "../api/client";
import { Search, Sparkles } from "lucide-react";
import { Badge } from "../components/ui/Badge";

const CATEGORY_MAP = {
  educational: "Học tập & Trí tuệ",
  outdoor: "Vận động ngoài trời",
  boardgame: "Boardgame",
  doll: "Búp bê & Gấu bông",
  vehicle: "Xe & Đua xe",
  other: "Khác",
};

const CONDITION_MAP = {
  new: "Mới",
  good: "Tốt",
  used: "Cũ",
};

export function Home() {
  const [toys, setToys] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchToys = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (ageRange) params.append("ageRange", ageRange);

      const data = await request(`/toys?${params.toString()}`);
      const list = data.items || data.toys || data.data || (Array.isArray(data) ? data : []);
      setToys(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Lỗi tải đồ chơi:", err);
      setToys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToys();
  }, [search, category, ageRange]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-md flex items-center justify-between">
        <div className="space-y-2 max-w-xl">
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            Chia sẻ đồ chơi, lan toả niềm vui <Sparkles className="text-amber-300" />
          </h1>
          <p className="text-blue-100 text-sm">
            Nền tảng mượn và cho mượn đồ chơi cho bé an toàn, tiết kiệm và thân thiện.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên đồ chơi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Tất cả danh mục</option>
            <option value="educational">Học tập & Trí tuệ</option>
            <option value="outdoor">Vận động ngoài trời</option>
            <option value="boardgame">Boardgame</option>
            <option value="doll">Búp bê & Gấu bông</option>
            <option value="vehicle">Xe & Đua xe</option>
            <option value="other">Khác</option>
          </select>

          <select
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Tất cả độ tuổi</option>
            <option value="0-2 tuổi">0-2 tuổi</option>
            <option value="3-5 tuổi">3-5 tuổi</option>
            <option value="6-8 tuổi">6-8 tuổi</option>
            <option value="9+ tuổi">9+ tuổi</option>
          </select>
        </div>
      </div>

      {/* Toy Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải danh sách đồ chơi...</div>
      ) : !Array.isArray(toys) || toys.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Không tìm thấy đồ chơi phù hợp.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {toys.map((toy) => {
            const isAvailable = toy.status === "available";
            const imageUrl = toy.images && toy.images.length > 0 ? getImageUrl(toy.images[0]) : "https://placehold.co/400x300?text=No+Image";

            return (
              <Link
                key={toy._id}
                to={`/toys/${toy._id}`}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={toy.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={isAvailable ? "success" : "warning"}>
                      {isAvailable ? "Sẵn sàng" : "Đang mượn"}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1">
                      {toy.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{toy.description}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>{CATEGORY_MAP[toy.category] || toy.category || "Khác"}</span>
                    <span>{toy.ageRange || "Mọi lứa tuổi"}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
