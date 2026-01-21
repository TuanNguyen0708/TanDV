import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePickerStyles.css';
import { 
  ProductionStatus, 
  Station, 
  stationsApi,
  productionStatusApi,
  UpdateStationTimelineDto,
  UpdateQualityDto
} from '../../services/api';

interface UpdateStationModalProps {
  status: ProductionStatus;
  onClose: () => void;
  onSuccess: () => void;
}

export function UpdateStationModal({
  status,
  onClose,
  onSuccess,
}: UpdateStationModalProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [selectedStationID, setSelectedStationID] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [updateQuality, setUpdateQuality] = useState(false);
  const [quality, setQuality] = useState<'' | 'OK' | 'NG'>('');
  const [qualityRemark, setQualityRemark] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      setLoadingStations(true);
      try {
        const data = await stationsApi.getAllStations();
        setStations(data.filter(s => s.isActive));
      } catch (err) {
        console.error('Error fetching stations:', err);
      } finally {
        setLoadingStations(false);
      }
    };

    fetchStations();
  }, []);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedStationID) {
      newErrors.stationID = 'Vui lòng chọn trạm';
    }
    if (!startTime) {
      newErrors.startTime = 'Vui lòng chọn thời gian bắt đầu';
    }
    
    if (updateQuality && !quality) {
      newErrors.quality = 'Vui lòng chọn chất lượng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      // Thêm trạm mới
      const station = stations.find(s => s.id === selectedStationID);
      const stationData: UpdateStationTimelineDto = {
        stationID: selectedStationID,
        stationName: station?.stationName,
        startTime: startTime ? startTime.toISOString() : undefined,
      };
      await productionStatusApi.addStation(status.id, stationData);

      // Nếu cập nhật chất lượng, gọi API updateQuality
      // Điều này sẽ set endTime cho trạm vừa thêm và cập nhật chất lượng
      if (updateQuality) {
        const qualityData: UpdateQualityDto = {
          quality: quality as 'OK' | 'NG',
          remark: qualityRemark || undefined,
        };
        await productionStatusApi.updateQuality(status.id, qualityData);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Lỗi khi cập nhật';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const currentStations = status.stationTimeline || [];
  const lastStation = currentStations.length > 0 ? currentStations[currentStations.length - 1] : null;
  const hasUnfinishedStation = lastStation && !lastStation.endTime;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Cập nhật trạm - {status.vehicleID}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Timeline hiện tại */}
            <div className="form-group">
              <label>Timeline hiện tại:</label>
              {currentStations.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px', margin: '8px 0' }}>
                  Chưa có trạm nào
                </p>
              ) : (
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  marginTop: '8px'
                }}>
                  {currentStations.map((station, index) => (
                    <div key={index} style={{ 
                      marginBottom: '8px', 
                      paddingBottom: '8px',
                      borderBottom: index < currentStations.length - 1 ? '1px solid #ddd' : 'none'
                    }}>
                      <strong>{station.stationName || station.stationID}</strong>
                      <br />
                      <small style={{ color: '#666' }}>
                        Bắt đầu: {new Date(station.startTime).toLocaleString('vi-VN')}
                        {station.endTime && (
                          <> • Kết thúc: {new Date(station.endTime).toLocaleString('vi-VN')}</>
                        )}
                        {!station.endTime && <> • <span style={{ color: '#1890ff' }}>Đang xử lý</span></>}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chọn trạm */}
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label htmlFor="stationID">
                Chọn trạm <span className="required">*</span>
              </label>
              <select
                id="stationID"
                value={selectedStationID}
                onChange={(e) => {
                  setSelectedStationID(e.target.value);
                  if (errors.stationID) {
                    setErrors((prev) => ({ ...prev, stationID: '' }));
                  }
                }}
                className={errors.stationID ? 'error' : ''}
                disabled={loadingStations}
              >
                <option value="">-- Chọn trạm --</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.stationName}
                  </option>
                ))}
              </select>
              {errors.stationID && (
                <span className="error-text">{errors.stationID}</span>
              )}
            </div>

            {/* Thời gian bắt đầu */}
            <div className="form-group">
              <label htmlFor="startTime">
                Thời gian bắt đầu <span className="required">*</span>
              </label>
              <DatePicker
                selected={startTime}
                onChange={(date) => {
                  setStartTime(date);
                  if (errors.startTime) {
                    setErrors((prev) => ({ ...prev, startTime: '' }));
                  }
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="Chọn ngày và giờ bắt đầu"
                className={errors.startTime ? 'error' : ''}
                id="startTime"
              />
              {errors.startTime && (
                <span className="error-text">{errors.startTime}</span>
              )}
              {hasUnfinishedStation && (
                <small style={{ color: '#ff4d4f', display: 'block', marginTop: '4px' }}>
                  Lưu ý: Trạm "{lastStation?.stationName}" sẽ được set endTime = startTime này
                </small>
              )}
            </div>

            {/* Checkbox cập nhật chất lượng */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={updateQuality}
                  onChange={(e) => {
                    setUpdateQuality(e.target.checked);
                    if (!e.target.checked) {
                      setQuality('');
                      setQualityRemark('');
                      setErrors((prev) => ({ ...prev, quality: '' }));
                    }
                  }}
                  style={{ marginRight: '8px' }}
                />
                Cập nhật chất lượng (trạm này là trạm cuối cùng)
              </label>
            </div>

            {/* Select chất lượng (hiện khi checkbox được tích) */}
            {updateQuality && (
              <>
                <div className="form-group">
                  <label htmlFor="quality">
                    Chất lượng <span className="required">*</span>
                  </label>
                  <select
                    id="quality"
                    value={quality}
                    onChange={(e) => {
                      setQuality(e.target.value as '' | 'OK' | 'NG');
                      if (errors.quality) {
                        setErrors((prev) => ({ ...prev, quality: '' }));
                      }
                    }}
                    className={errors.quality ? 'error' : ''}
                  >
                    <option value="">-- Chọn chất lượng --</option>
                    <option value="OK">OK</option>
                    <option value="NG">NG</option>
                  </select>
                  {errors.quality && (
                    <span className="error-text">{errors.quality}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="qualityRemark">Ghi chú</label>
                  <textarea
                    id="qualityRemark"
                    value={qualityRemark}
                    onChange={(e) => setQualityRemark(e.target.value)}
                    rows={3}
                    placeholder="Nhập ghi chú..."
                  />
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Đang xử lý...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
