import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { request, getImageUrl } from "../api/client";
import { Star, Heart, ChevronDown } from "lucide-react";
import { Button } from "../components/ui/Button";

const CATEGORY_LIST = [
  { id: "educational", label: "Học tập & Trí tuệ", count: 12 },
  { id: "outdoor", label: "Vận động ngoài trời", count: 8 },
  { id: "boardgame", label: "Boardgame", count: 15 },
  { id: "doll", label: "Búp bê & Gấu bông", count: 20 },
  { id: "vehicle", label: "Xe & Đua xe", count: 10 },
  { id: "other", label: "Đồ chơi khác", count: 5 },
];

const AGE_RANGES = [
  { id: "0-2 tuổi", label: "0 đến 2 tuổi" },
  { id: "3-5 tuổi", label: "3 đến 5 tuổi" },
  { id: "6-8 tuổi", label: "6 đến 8 tuổi" },
  { id: "9+ tuổi", label: "9 tuổi trở lên" },
];

// High quality real toy photos for fallback demonstration
const REAL_TOY_IMAGES = [
  "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1587654562363-60545657574e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1558060370-d644479be6f7?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop&q=80",
];

export function Home() {
  const [searchParams] = useSearchParams();
  const searchUrlParam = searchParams.get("search") || "";

  const [toys, setToys] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [loading, setLoading] = useState(true);

  const fetchToys = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchUrlParam) params.append("search", searchUrlParam);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedAge) params.append("ageRange", selectedAge);
      if (selectedCondition) params.append("condition", selectedCondition);

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
  }, [searchUrlParam, selectedCategory, selectedAge, selectedCondition]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Dribbble Style Hero Banner with Real Photo */}
      <div className="bg-[#a4e2cd] rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden flex items-center justify-between min-h-[320px] shadow-xs">
        <div className="max-w-xl z-10 space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Gifts and Toys for 13 to Young Adults
          </h1>
          <p className="text-gray-800 text-sm md:text-base font-medium leading-relaxed max-w-md">
            ToyShare sets encourage young adults to pursue their passion for building, engineering, STEM and robotics in a creative way.
          </p>
        </div>

        {/* Real Toy Image in Banner */}
        <div className="hidden lg:block relative z-10 w-96 h-64 flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80"
            alt="Kid Toy Airplane"
            className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = REAL_TOY_IMAGES[0];
            }}
          />
        </div>

        {/* Background Subtle Shape */}
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-white/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Main Catalog Header Bar */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-base font-bold text-gray-900">
          Showing {toys.length} Products
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 rounded-full px-4 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#00b05b] cursor-pointer shadow-2xs"
          >
            <option value="recommended">Recommended</option>
            <option value="newest">Newest Arrival</option>
          </select>
        </div>
      </div>

      {/* Catalog Section: Sidebar Filters + Products Grid */}
      <div className="flex gap-10">
        {/* Left Sidebar Filters */}
        <aside className="w-64 shrink-0 hidden md:block space-y-8">
          {/* Filter: Age */}
          <div className="border-b border-gray-100 pb-6 space-y-3">
            <div className="flex items-center justify-between font-bold text-sm text-gray-900">
              <span>Age</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-2 pt-1">
              {AGE_RANGES.map((age) => (
                <label key={age.id} className="flex items-center gap-3 text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                  <input
                    type="radio"
                    name="ageFilter"
                    checked={selectedAge === age.id}
                    onChange={() => setSelectedAge(selectedAge === age.id ? "" : age.id)}
                    className="w-4 h-4 text-[#00b05b] accent-[#00b05b] rounded-sm"
                  />
                  <span>{age.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter: Product Type / Category */}
          <div className="border-b border-gray-100 pb-6 space-y-3">
            <div className="flex items-center justify-between font-bold text-sm text-gray-900">
              <span>Product type</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-2.5 pt-1">
              {CATEGORY_LIST.map((cat) => (
                <label key={cat.id} className="flex items-center justify-between text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCategory === cat.id}
                      onChange={() => setSelectedCategory(selectedCategory === cat.id ? "" : cat.id)}
                      className="w-4 h-4 text-[#00b05b] accent-[#00b05b] rounded-sm"
                    />
                    <span>{cat.label}</span>
                  </div>
                  <span className="text-gray-400 font-semibold">{cat.count}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter: Condition */}
          <div className="space-y-3">
            <div className="flex items-center justify-between font-bold text-sm text-gray-900">
              <span>Condition</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-2 pt-1">
              {[
                { id: "new", label: "Mới 100%" },
                { id: "good", label: "Còn rất tốt" },
                { id: "used", label: "Đã qua sử dụng" },
              ].map((cond) => (
                <label key={cond.id} className="flex items-center gap-3 text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                  <input
                    type="radio"
                    name="conditionFilter"
                    checked={selectedCondition === cond.id}
                    onChange={() => setSelectedCondition(selectedCondition === cond.id ? "" : cond.id)}
                    className="w-4 h-4 text-[#00b05b] accent-[#00b05b] rounded-sm"
                  />
                  <span>{cond.label}</span>
                </label>
              ))}
            </div>
          </div>

          {(selectedCategory || selectedAge || selectedCondition) && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setSelectedCategory("");
                setSelectedAge("");
                setSelectedCondition("");
              }}
            >
              Clear filters
            </Button>
          )}
        </aside>

        {/* Right Main Product Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="text-center py-20 text-gray-500 font-medium">Đang tải danh sách đồ chơi...</div>
          ) : !Array.isArray(toys) || toys.length === 0 ? (
            <div className="text-center py-20 bg-[#f4f5f7] rounded-3xl text-gray-500 font-medium">
              Không tìm thấy đồ chơi nào phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {toys.map((toy, idx) => {
                const isAvailable = toy.status === "available";
                const fallbackImg = REAL_TOY_IMAGES[idx % REAL_TOY_IMAGES.length];
                const rawUrl = toy.images && toy.images.length > 0 ? toy.images[0] : null;
                const imageUrl = rawUrl ? getImageUrl(rawUrl) : fallbackImg;

                return (
                  <div key={toy._id} className="group flex flex-col justify-between">
                    {/* Dribbble Product Card Container */}
                    <div className="bg-[#f4f5f7] rounded-[2rem] p-6 relative flex items-center justify-center h-64 group-hover:bg-gray-200/70 transition-colors overflow-hidden">
                      <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-2xs hover:scale-110 text-gray-400 hover:text-rose-500 transition-all cursor-pointer z-10">
                        <Heart className="w-4 h-4" />
                      </button>

                      <img
                        src={imageUrl}
                        alt={toy.name}
                        className="max-h-48 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300 rounded-xl"
                        onError={(e) => {
                          e.currentTarget.src = fallbackImg;
                        }}
                      />
                    </div>

                    {/* Product Metadata & Actions */}
                    <div className="pt-4 text-center space-y-2">
                      <h3 className="font-extrabold text-gray-900 text-base line-clamp-1 group-hover:text-[#00b05b] transition-colors">
                        {toy.name}
                      </h3>

                      <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <Star className="w-4 h-4 fill-amber-400" />
                        <Star className="w-4 h-4 fill-amber-400" />
                        <Star className="w-4 h-4 fill-amber-400" />
                        <Star className="w-4 h-4 fill-amber-400" />
                      </div>

                      <div className="text-sm font-extrabold text-gray-900">
                        {isAvailable ? (
                          <span className="text-[#00b05b]">Cho mượn miễn phí</span>
                        ) : (
                          <span className="text-amber-600">Đang được mượn</span>
                        )}
                      </div>

                      <Link to={`/toys/${toy._id}`} className="block pt-1">
                        <Button
                          variant="outline"
                          className="w-full rounded-2xl border-gray-200 text-gray-800 font-bold hover:border-[#00b05b] hover:text-[#00b05b] hover:bg-white text-xs py-2.5 shadow-2xs"
                        >
                          {isAvailable ? "Xem chi tiết & Mượn" : "Xem chi tiết"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
