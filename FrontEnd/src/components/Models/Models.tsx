import { useCallback, useEffect, useState } from 'react';
import { modelsApi, Model } from '../../services/api';
import { ModelModal } from './ModelModal';
import { DeleteModelModal } from './DeleteModelModal';
import './Models.css';

export function Models() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [deletingModel, setDeletingModel] = useState<Model | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await modelsApi.getAllModels();
      setModels(data);
    } catch (err: any) {
      console.error('Error fetching models:', err);
      setError(err?.response?.data?.message || err?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleOpenModal = (model?: Model) => {
    setEditingModel(model || null);
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setShowModal(false);
      setEditingModel(null);
    }
  };

  const handleSubmit = async (data: Model) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingModel) {
        await modelsApi.updateModel(editingModel.modelId, data);
        setSuccess('Cập nhật model thành công!');
      } else {
        await modelsApi.createModel(data);
        setSuccess('Tạo model thành công!');
      }
      await fetchModels();
      setShowModal(false);
      setEditingModel(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving model:', err);
      setError(err?.response?.data?.message || err?.message || 'Lỗi khi lưu model');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (model: Model) => {
    setDeletingModel(model);
    setError(null);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    if (!submitting) {
      setShowDeleteModal(false);
      setDeletingModel(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingModel) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await modelsApi.deleteModel(deletingModel.modelId);
      await fetchModels();
      setShowDeleteModal(false);
      setDeletingModel(null);
      setSuccess('Xóa model thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting model:', err);
      setError(err?.response?.data?.message || err?.message || 'Lỗi khi xóa model');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="models">
      {/* Header */}
      <header className="models-header">
        <div className="models-header-left">QUẢN LÝ MODEL</div>
        <div className="models-header-center">DANH SÁCH MODEL</div>
        <div className="models-header-right">
          <button
            className="models-button models-button-create"
            onClick={() => handleOpenModal()}
            disabled={submitting}
          >
            + Tạo model mới
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="models-main">
        {loading && models.length === 0 ? (
          <div className="models-loading">Đang tải...</div>
        ) : error && models.length === 0 ? (
          <div className="models-error">{error}</div>
        ) : (
          <div className="models-table-wrapper">
            <table className="models-table">
              <thead>
                <tr>
                  <th>Model ID</th>
                  <th>Tên model</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {models.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="no-data">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  models.map((model) => (
                    <tr key={model.modelId}>
                      <td>{model.modelId}</td>
                      <td>{model.name}</td>
                      <td>{model.description || '-'}</td>
                      <td className="action-cell">
                        <div className="action-buttons">
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => handleOpenModal(model)}
                            title="Sửa"
                          >
                            Sửa
                          </button>
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => handleDelete(model)}
                            title="Xóa"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {error && (
        <div className="models-error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="models-success-message">
          {success}
        </div>
      )}

      <ModelModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        loading={submitting}
        initialData={editingModel || undefined}
      />

      <DeleteModelModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        loading={submitting}
        model={deletingModel}
      />
    </div>
  );
}
