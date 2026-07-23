import React, { useEffect, useState } from "react";
import { request } from "../api/client";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Clock, CheckCircle, XCircle, RotateCcw, Star, Calendar } from "lucide-react";

export function Requests() {
  const [activeTab, setActiveTab] = useState("borrowed"); // borrowed | lent
  const [borrowedRequests, setBorrowedRequests] = useState([]);
  const [lentRequests, setLentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [borrowedRes, lentRes] = await Promise.all([
        request("/requests/borrowed"),
        request("/requests/lent"),
      ]);
      const bList = borrowedRes.requests || borrowedRes.items || borrowedRes.data || (Array.isArray(borrowedRes) ? borrowedRes : []);
      const lList = lentRes.requests || lentRes.items || lentRes.data || (Array.isArray(lentRes) ? lentRes : []);

      setBorrowedRequests(Array.isArray(bList) ? bList : []);
      setLentRequests(Array.isArray(lList) ? lList : []);
    } catch (err) {
      console.error("Lỗi tải yêu cầu:", err);
      setBorrowedRequests([]);
      setLentRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await request(`/requests/${id}/${action}`, { method: "PATCH" });
      fetchRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  const openReviewModal = (reqItem) => {
    setSelectedReq(reqItem);
    setRating(5);
    setComment("");
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;
    setSubmittingReview(true);
    try {
      await request("/reviews", {
        method: "POST",
        body: JSON.stringify({
          requestId: selectedReq._id,
          toyId: selectedReq.toy?._id || selectedReq.toy,
          rating: Number(rating),
          comment,
        }),
      });
      setReviewModalOpen(false);
      fetchRequests();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStatusBadge = (status) => {
    const map = {
      requested: { variant: "warning", text: "Chờ duyệt" },
      approved: { variant: "info", text: "Đã duyệt" },
      borrowed: { variant: "success", text: "Đang mượn" },
      returned: { variant: "purple", text: "Đã trả đồ" },
      rejected: { variant: "danger", text: "Từ chối" },
      canceled: { variant: "default", text: "Đã huỷ" },
    };
    const item = map[status] || { variant: "default", text: status };
    return <Badge variant={item.variant}>{item.text}</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" /> Quản lý Mượn & Cho mượn
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-8">
        <button
          onClick={() => setActiveTab("borrowed")}
          className={`pb-3 font-semibold text-sm transition-colors cursor-pointer border-b-2 ${
            activeTab === "borrowed"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Yêu cầu tôi đi mượn ({borrowedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("lent")}
          className={`pb-3 font-semibold text-sm transition-colors cursor-pointer border-b-2 ${
            activeTab === "lent"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Yêu cầu tới đồ của tôi ({lentRequests.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải...</div>
      ) : activeTab === "borrowed" ? (
        /* Tab 1: Borrowed Requests */
        !Array.isArray(borrowedRequests) || borrowedRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            Bạn chưa gửi yêu cầu mượn đồ chơi nào.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
            {borrowedRequests.map((reqItem) => (
              <div key={reqItem._id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900">{reqItem.toy?.name || "Đồ chơi"}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {reqItem.borrowDate ? new Date(reqItem.borrowDate).toLocaleDateString("vi-VN") : "N/A"} - {reqItem.returnDate ? new Date(reqItem.returnDate).toLocaleDateString("vi-VN") : "N/A"}
                    </span>
                    <span>Chủ đồ: {reqItem.owner?.name || "Người dùng"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {renderStatusBadge(reqItem.status)}
                  <div className="flex items-center gap-2">
                    {reqItem.status === "requested" && (
                      <Button variant="outline" size="sm" onClick={() => handleAction(reqItem._id, "cancel")}>
                        Huỷ
                      </Button>
                    )}
                    {reqItem.status === "approved" && (
                      <Button variant="success" size="sm" onClick={() => handleAction(reqItem._id, "return")}>
                        Báo đã trả đồ
                      </Button>
                    )}
                    {reqItem.status === "returned" && !reqItem.isReviewed && (
                      <Button variant="primary" size="sm" onClick={() => openReviewModal(reqItem)}>
                        <Star className="w-3.5 h-3.5 mr-1 fill-white" /> Đánh giá
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Tab 2: Lent Requests */
        !Array.isArray(lentRequests) || lentRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            Chưa có ai gửi yêu cầu mượn đồ chơi của bạn.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
            {lentRequests.map((reqItem) => (
              <div key={reqItem._id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900">{reqItem.toy?.name || "Đồ chơi"}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Người mượn: {reqItem.borrower?.name || "Người dùng"}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {reqItem.borrowDate ? new Date(reqItem.borrowDate).toLocaleDateString("vi-VN") : "N/A"} - {reqItem.returnDate ? new Date(reqItem.returnDate).toLocaleDateString("vi-VN") : "N/A"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {renderStatusBadge(reqItem.status)}
                  <div className="flex items-center gap-2">
                    {reqItem.status === "requested" && (
                      <>
                        <Button variant="success" size="sm" onClick={() => handleAction(reqItem._id, "approve")}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Duyệt
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleAction(reqItem._id, "reject")}>
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Từ chối
                        </Button>
                      </>
                    )}
                    {reqItem.status === "returned" && (
                      <Button variant="primary" size="sm" onClick={() => handleAction(reqItem._id, "confirm-return")}>
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Xác nhận nhận lại đồ
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal Review */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Đánh giá đồ chơi">
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Chấm điểm (1 - 5 sao)</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="5">⭐⭐⭐⭐⭐ (5/5 - Rất tốt)</option>
              <option value="4">⭐⭐⭐⭐ (4/5 - Tốt)</option>
              <option value="3">⭐⭐⭐ (3/5 - Bình thường)</option>
              <option value="2">⭐⭐ (2/5 - Tạm được)</option>
              <option value="1">⭐ (1/5 - Kém)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Bình luận</label>
            <textarea
              rows="3"
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Đồ chơi rất mới, bé nhà mình thích lắm..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={submittingReview}>
            {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
