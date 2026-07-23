import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { request, getImageUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Star, User, Tag } from "lucide-react";

const CATEGORY_MAP = {
  educational: "Học tập & Trí tuệ",
  outdoor: "Vận động ngoài trời",
  boardgame: "Boardgame",
  doll: "Búp bê & Gấu bông",
  vehicle: "Xe & Đua xe",
  other: "Khác",
};

const CONDITION_MAP = {
  new: "Mới 100%",
  good: "Còn rất tốt",
  used: "Đã qua sử dụng",
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80";

export function ToyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [toy, setToy] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [borrowDate, setBorrowDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const toyRes = await request(`/toys/${id}`);
        setToy(toyRes.toy || toyRes.data || toyRes);

        const reviewsRes = await request(`/reviews/toy/${id}`);
        const list = reviewsRes.reviews || reviewsRes.data || (Array.isArray(reviewsRes) ? reviewsRes : []);
        setReviews(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Lỗi tải chi tiết đồ chơi:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleRequestBorrow = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await request("/requests", {
        method: "POST",
        body: JSON.stringify({ toyId: id, borrowDate, returnDate, message }),
      });
      setSuccess("Gửi yêu cầu mượn thành công!");
      setTimeout(() => {
        setIsModalOpen(false);
        navigate("/requests");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500 font-medium">Đang tải chi tiết đồ chơi...</div>;
  if (!toy) return <div className="text-center py-20 text-gray-500 font-medium">Không tìm thấy đồ chơi.</div>;

  const isOwner = user && toy.owner && (user._id === toy.owner._id || user._id === toy.owner);
  const isAvailable = toy.status === "available";
  const imageUrl = toy.images && toy.images.length > 0 ? getImageUrl(toy.images[0]) : FALLBACK_IMAGE;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="h-96 bg-[#f4f5f7] rounded-[2rem] p-6 flex items-center justify-center relative overflow-hidden">
          <img
            src={imageUrl}
            alt={toy.name}
            className="max-h-80 w-auto object-contain drop-shadow-md rounded-xl"
            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
          />
        </div>
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={isAvailable ? "success" : "warning"} className="px-3 py-1 text-xs">
                {isAvailable ? "Sẵn sàng mượn" : "Đang được mượn"}
              </Badge>
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> {CATEGORY_MAP[toy.category] || toy.category || "Chung"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">{toy.name}</h1>
            <p className="text-gray-600 text-sm leading-relaxed font-medium">{toy.description}</p>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-600 pt-4 border-t border-gray-100">
              <div>Độ tuổi: <span className="font-extrabold text-gray-900">{toy.ageRange || "N/A"}</span></div>
              <div>Tình trạng: <span className="font-extrabold text-gray-900">{CONDITION_MAP[toy.condition] || toy.condition || "Tốt"}</span></div>
              <div className="flex items-center gap-1.5 col-span-2 text-gray-700">
                <User className="w-4 h-4 text-[#00b05b]" /> Chủ sở hữu: <span className="font-extrabold text-gray-900">{toy.owner?.name || "Người dùng"}</span>
              </div>
            </div>
          </div>

          <div>
            {!user ? (
              <Button variant="primary" className="w-full rounded-2xl py-3 text-base bg-[#00b05b]" onClick={() => navigate("/login")}>
                Đăng nhập để mượn đồ chơi
              </Button>
            ) : isOwner ? (
              <div className="p-3.5 bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold rounded-2xl text-center">
                Bạn là chủ sở hữu đồ chơi này.
              </div>
            ) : !isAvailable ? (
              <Button variant="secondary" className="w-full rounded-2xl py-3" disabled>
                Đồ chơi đang được mượn
              </Button>
            ) : (
              <Button variant="primary" className="w-full rounded-2xl py-3 text-base bg-[#00b05b] hover:bg-[#00964d]" onClick={() => setIsModalOpen(true)}>
                Gửi yêu cầu mượn ngay
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Đánh giá từ người mượn ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500 font-medium">Chưa có đánh giá nào cho đồ chơi này.</p>
        ) : (
          <div className="space-y-4 divide-y divide-gray-100">
            {reviews.map((rev) => (
              <div key={rev._id} className="pt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                  <span className="text-gray-900 font-bold">{rev.reviewer?.name || "Người mượn"}</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400" /> {rev.rating}/5
                  </div>
                </div>
                <p className="text-sm text-gray-700 font-medium">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Borrow Request */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yêu cầu mượn đồ chơi">
        {success ? (
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-center font-bold">{success}</div>
        ) : (
          <form onSubmit={handleRequestBorrow} className="space-y-4">
            {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">{error}</div>}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ngày mượn dự kiến</label>
              <input
                type="date"
                required
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#00b05b] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ngày trả dự kiến</label>
              <input
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#00b05b] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ghi chú cho chủ đồ chơi</label>
              <textarea
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ví dụ: Bé nhà mình muốn mượn chơi thử vài ngày..."
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#00b05b] focus:outline-none"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full bg-[#00b05b] hover:bg-[#00964d] rounded-2xl py-3" disabled={submitting}>
              {submitting ? "Đang gửi..." : "Xác nhận gửi yêu cầu"}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
