import React, { useEffect, useState } from "react";
import { request, getImageUrl } from "../api/client";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Plus, Edit, Trash2, Package } from "lucide-react";

const CATEGORY_MAP = {
  educational: "Học tập & Trí tuệ",
  outdoor: "Vận động ngoài trời",
  boardgame: "Boardgame",
  doll: "Búp bê & Gấu bông",
  vehicle: "Xe & Đua xe",
  other: "Khác",
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80";

export function MyToys() {
  const [toys, setToys] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingToy, setEditingToy] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [ageRange, setAgeRange] = useState("3-5 tuổi");
  const [condition, setCondition] = useState("good");
  const [imageFile, setImageFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchMyToys = async () => {
    setLoading(true);
    try {
      const data = await request("/toys/mine");
      const list = data.toys || data.items || data.data || (Array.isArray(data) ? data : []);
      setToys(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Lỗi tải đồ chơi của tôi:", err);
      setToys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyToys();
  }, []);

  const openAddModal = () => {
    setEditingToy(null);
    setName("");
    setDescription("");
    setCategory("other");
    setAgeRange("3-5 tuổi");
    setCondition("good");
    setImageFile(null);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (toy) => {
    setEditingToy(toy);
    setName(toy.name);
    setDescription(toy.description || "");
    setCategory(toy.category || "other");
    setAgeRange(toy.ageRange || "3-5 tuổi");
    setCondition(toy.condition || "good");
    setImageFile(null);
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("ageRange", ageRange);
    formData.append("condition", condition);
    if (imageFile) {
      formData.append("images", imageFile);
    }

    try {
      if (editingToy) {
        await request(`/toys/${editingToy._id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        await request("/toys", {
          method: "POST",
          body: formData,
        });
      }
      setIsModalOpen(false);
      fetchMyToys();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (toyId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá đồ chơi này?")) return;
    try {
      await request(`/toys/${toyId}`, { method: "DELETE" });
      fetchMyToys();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-[#00b05b]" /> Quản lý Đồ chơi của tôi
          </h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">Danh sách đồ chơi bạn đã đăng để chia sẻ cho mượn.</p>
        </div>
        <Button variant="primary" className="bg-[#00b05b] hover:bg-[#00964d] rounded-2xl" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-1" /> Đăng đồ chơi mới
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500 font-medium">Đang tải danh sách...</div>
      ) : !Array.isArray(toys) || toys.length === 0 ? (
        <div className="text-center py-16 text-gray-500 font-medium bg-[#f4f5f7] rounded-[2rem]">
          Bạn chưa đăng đồ chơi nào. Hãy bấm "Đăng đồ chơi mới" ở trên!
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xs">
          <div className="divide-y divide-gray-100">
            {toys.map((toy) => (
              <div key={toy._id} className="p-5 flex items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#f4f5f7] p-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={toy.images && toy.images.length > 0 ? getImageUrl(toy.images[0]) : FALLBACK_IMAGE}
                      alt={toy.name}
                      className="max-h-full max-w-full object-contain rounded-lg"
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                    />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900">{toy.name}</h4>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mt-1">
                      <span>{CATEGORY_MAP[toy.category] || toy.category}</span> • <span>{toy.ageRange}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={toy.status === "available" ? "success" : "warning"} className="px-3 py-1 text-xs font-bold">
                    {toy.status === "available" ? "Sẵn sàng" : "Đang mượn"}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold" onClick={() => openEditModal(toy)}>
                      <Edit className="w-3.5 h-3.5 mr-1" /> Sửa
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="rounded-xl text-xs font-bold"
                      onClick={() => handleDelete(toy._id)}
                      disabled={toy.status !== "available"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingToy ? "Chỉnh sửa đồ chơi" : "Đăng đồ chơi mới"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">{error}</div>}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tên đồ chơi</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f4f5f7] border border-transparent focus:border-[#00b05b] focus:bg-white rounded-xl text-sm font-medium focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Mô tả</label>
            <textarea
              rows="3"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f4f5f7] border border-transparent focus:border-[#00b05b] focus:bg-white rounded-xl text-sm font-medium focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Danh mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2 py-2.5 bg-[#f4f5f7] border border-transparent focus:border-[#00b05b] focus:bg-white rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="educational">Học tập & Trí tuệ</option>
                <option value="outdoor">Vận động ngoài trời</option>
                <option value="boardgame">Boardgame</option>
                <option value="doll">Búp bê & Gấu bông</option>
                <option value="vehicle">Xe & Đua xe</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Độ tuổi</label>
              <select
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="w-full px-2 py-2.5 bg-[#f4f5f7] border border-transparent focus:border-[#00b05b] focus:bg-white rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="0-2 tuổi">0-2 tuổi</option>
                <option value="3-5 tuổi">3-5 tuổi</option>
                <option value="6-8 tuổi">6-8 tuổi</option>
                <option value="9+ tuổi">9+ tuổi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tình trạng</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-2 py-2.5 bg-[#f4f5f7] border border-transparent focus:border-[#00b05b] focus:bg-white rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="new">Mới</option>
                <option value="good">Tốt</option>
                <option value="used">Cũ</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Hình ảnh</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#00b05b]/10 file:text-[#00b05b] hover:file:bg-[#00b05b]/20 cursor-pointer"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full bg-[#00b05b] hover:bg-[#00964d] rounded-2xl py-3 text-sm font-bold" disabled={submitting}>
            {submitting ? "Đang lưu..." : editingToy ? "Cập nhật" : "Tạo đồ chơi"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
