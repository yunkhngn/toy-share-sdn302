import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { request, getImageUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Star, User, Tag } from "lucide-react";

export function ToyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [toy, setToy] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const toyData = await request(`/toys/${id}`);
        setToy(toyData.data || toyData);

        const reviewsData = await request(`/reviews/toy/${id}`);
        setReviews(reviewsData.data || reviewsData);
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
        body: JSON.stringify({ toyId: id, startDate, endDate, note }),
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

  if (loading) return <div className="text-center py-16 text-gray-500">Đang tải chi tiết đồ chơi...</div>;
  if (!toy) return <div className="text-center py-16 text-gray-500">Không tìm thấy đồ chơi.</div>;

  const isOwner = user && toy.owner && (user._id === toy.owner._id || user._id === toy.owner);
  const isAvailable = toy.status === "available";
  const imageUrl = toy.images && toy.images.length > 0 ? getImageUrl(toy.images[0]) : "https://placehold.co/600x400?text=No+Image";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-2">
        <div className="h-80 md:h-auto bg-gray-100">
          <img src={imageUrl} alt={toy.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={isAvailable ? "success" : "warning"}>
                {isAvailable ? "Sẵn sàng mượn" : "Đang được mượn"}
              </Badge>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> {toy.category || "Chung"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{toy.name}</h1>
            <p className="text-gray-600 text-sm leading-relaxed">{toy.description}</p>

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <div>Độ tuổi: <span className="font-semibold text-gray-900">{toy.ageGroup || "N/A"}</span></div>
              <div>Tình trạng: <span className="font-semibold text-gray-900">{toy.condition || "Tốt"}</span></div>
              <div className="flex items-center gap-1 col-span-2">
                <User className="w-4 h-4 text-gray-400" /> Chủ sở hữu: <span className="font-semibold text-gray-900">{toy.owner?.name || "Người dùng"}</span>
              </div>
            </div>
          </div>

          <div>
            {!user ? (
              <Button variant="primary" className="w-full" onClick={() => navigate("/login")}>
                Đăng nhập để mượn đồ chơi
              </Button>
            ) : isOwner ? (
              <div className="p-3 bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-lg text-center">
                Bạn là chủ sở hữu đồ chơi này.
              </div>
            ) : !isAvailable ? (
              <Button variant="secondary" className="w-full" disabled>
                Đồ chơi đang được mượn
              </Button>
            ) : (
              <Button variant="primary" className="w-full" onClick={() => setIsModalOpen(true)}>
                Gửi yêu cầu mượn
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Đánh giá từ người dùng ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có đánh giá nào cho đồ chơi này.</p>
        ) : (
          <div className="space-y-3 divide-y divide-gray-100">
            {reviews.map((rev) => (
              <div key={rev._id} className="pt-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium text-gray-800">{rev.reviewer?.name || "Người mượn"}</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {rev.rating}/5
                  </div>
                </div>
                <p className="text-sm text-gray-700">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Borrow Request */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yêu cầu mượn đồ chơi">
        {success ? (
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg text-center font-medium">{success}</div>
        ) : (
          <form onSubmit={handleRequestBorrow} className="space-y-4">
            {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg">{error}</div>}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ngày mượn dự kiến</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ngày trả dự kiến</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú cho chủ đồ chơi</label>
              <textarea
                rows="3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Bé nhà mình muốn mượn chơi thử vài ngày..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
              {submitting ? "Đang gửi..." : "Xác nhận gửi yêu cầu"}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
