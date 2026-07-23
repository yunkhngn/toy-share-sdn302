import React, { useEffect, useState } from "react";
import { request, getImageUrl } from "../api/client";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Plus, Edit, Trash2, Package } from "lucide-react";

export function MyToys() {
  const [toys, setToys] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingToy, setEditingToy] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Khác");
  const [ageGroup, setAgeGroup] = useState("3-5 tuổi");
  const [condition, setCondition] = useState("Tốt");
  const [imageFile, setImageFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchMyToys = async () => {
    setLoading(true);
    try {
      const data = await request("/toys/mine");
      setToys(data.data || data);
    } catch (err) {
      console.error("Lỗi tải đồ chơi của tôi:", err);
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
    setCategory("Khác");
    setAgeGroup("3-5 tuổi");
    setCondition("Tốt");
    setImageFile(null);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (toy) => {
    setEditingToy(toy);
    setName(toy.name);
    setDescription(toy.description || "");
    setCategory(toy.category || "Khác");
    setAgeGroup(toy.ageGroup || "3-5 tuổi");
    setCondition(toy.condition || "Tốt");
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
    formData.append("ageGroup", ageGroup);
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" /> Quản lý Đồ chơi của tôi
          </h1>
          <p className="text-xs text-gray-500 mt-1">Danh sách đồ chơi bạn đã đăng để cho mượn.</p>
        </div>
        <Button variant="primary" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-1" /> Đăng đồ chơi mới
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải danh sách...</div>
      ) : toys.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
          Bạn chưa đăng đồ chơi nào. Hãy bấm "Đăng đồ chơi mới" ở trên!
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-gray-100">
            {toys.map((toy) => (
              <div key={toy._id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <img
                    src={toy.images && toy.images.length > 0 ? getImageUrl(toy.images[0]) : "https://placehold.co/100x100?text=No+Image"}
                    alt={toy.name}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-100"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{toy.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>{toy.category}</span> • <span>{toy.ageGroup}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={toy.status === "available" ? "success" : "warning"}>
                    {toy.status === "available" ? "Sẵn sàng" : "Đang mượn"}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(toy)}>
                      <Edit className="w-3.5 h-3.5 mr-1" /> Sửa
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
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
          {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg">{error}</div>}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tên đồ chơi</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Danh mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Gấu bông">Gấu bông</option>
                <option value="Xếp hình">Xếp hình</option>
                <option value="Đua xe">Đua xe</option>
                <option value="Búp bê">Búp bê</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Độ tuổi</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="0-2 tuổi">0-2 tuổi</option>
                <option value="3-5 tuổi">3-5 tuổi</option>
                <option value="6-8 tuổi">6-8 tuổi</option>
                <option value="9+ tuổi">9+ tuổi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tình trạng</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Mới">Mới</option>
                <option value="Tốt">Tốt</option>
                <option value="Cũ">Cũ</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Hình ảnh</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? "Đang lưu..." : editingToy ? "Cập nhật" : "Tạo đồ chơi"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
