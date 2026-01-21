import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../ProductionStatus/DatePickerStyles.css';
import { StationDailyStatus, Station } from '../../services/api';

interface StationDailyModalProps {
  status: StationDailyStatus | null;
  stations: Station[];
  onClose: () => void;
  onSubmit: (data: Omit<StationDailyStatus, 'id'>) => void;
}

export function StationDailyModal({
  status,
  stations,
  onClose,
  onSubmit,
}: StationDailyModalProps) {
  const [formData, setFormData] = useState({
    stationID: '',
    statusDate: null as Date | null,
    startTime: null as Date | null,
    stopTime: null as Date | null,
    totalDowntime: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (status) {
      // Parse time string (HH:mm:ss) to Date object
      const parseTimeString = (timeStr?: string): Date | null => {
        if (!timeStr) return null;
        const today = new Date();
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        today.setHours(hours, minutes, seconds || 0, 0);
        return today;
      };

      setFormData({
        stationID: status.stationID,
        statusDate: status.statusDate ? new Date(status.statusDate) : null,
        startTime: parseTimeString(status.startTime),
        stopTime: parseTimeString(status.stopTime),
        totalDowntime: status.totalDowntime || 0,
      });
    }
  }, [status]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.stationID) {
      newErrors.stationID = 'Trạm là bắt buộc';
    }

    if (!formData.statusDate) {
      newErrors.statusDate = 'Ngày là bắt buộc';
    }

    // Validate start/stop times
    if (formData.startTime && formData.stopTime) {
      const start = formData.startTime.getTime();
      const stop = formData.stopTime.getTime();
      if (stop <= start) {
        newErrors.stopTime = 'Giờ kết thúc phải sau giờ bắt đầu';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Format time to HH:mm:ss format
    const formatTimeOnly = (date: Date | null): string | undefined => {
      if (!date) return undefined;
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    };

    const submitData: Omit<StationDailyStatus, 'id'> = {
      stationID: formData.stationID,
      statusDate: formData.statusDate
        ? formData.statusDate.toISOString().split('T')[0]
        : '',
      startTime: formatTimeOnly(formData.startTime),
      stopTime: formatTimeOnly(formData.stopTime),
      totalDowntime: formData.totalDowntime || undefined,
    };

    onSubmit(submitData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {status ? 'Sửa Station Daily Status' : 'Thêm Station Daily Status'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="stationID">
                Trạm <span className="required">*</span>
              </label>
              <select
                id="stationID"
                name="stationID"
                value={formData.stationID}
                onChange={handleChange}
                className={errors.stationID ? 'error' : ''}
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

            <div className="form-group">
              <label htmlFor="statusDate">
                Ngày <span className="required">*</span>
              </label>
              <DatePicker
                selected={formData.statusDate}
                onChange={(date) => {
                  setFormData((prev) => ({ ...prev, statusDate: date }));
                  if (errors.statusDate) {
                    setErrors((prev) => ({ ...prev, statusDate: '' }));
                  }
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="Chọn ngày"
                className={errors.statusDate ? 'error' : ''}
                id="statusDate"
              />
              {errors.statusDate && (
                <span className="error-text">{errors.statusDate}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">Giờ bắt đầu</label>
                <DatePicker
                  selected={formData.startTime}
                  onChange={(date) => {
                    setFormData((prev) => ({ ...prev, startTime: date }));
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  placeholderText="Chọn ngày và giờ bắt đầu"
                  id="startTime"
                />
              </div>

              <div className="form-group">
                <label htmlFor="stopTime">Giờ kết thúc</label>
                <DatePicker
                  selected={formData.stopTime}
                  onChange={(date) => {
                    setFormData((prev) => ({ ...prev, stopTime: date }));
                    if (errors.stopTime) {
                      setErrors((prev) => ({ ...prev, stopTime: '' }));
                    }
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  placeholderText="Chọn ngày và giờ kết thúc"
                  className={errors.stopTime ? 'error' : ''}
                  id="stopTime"
                />
                {errors.stopTime && (
                  <span className="error-text">{errors.stopTime}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="totalDowntime">Tổng downtime (phút)</label>
              <input
                type="number"
                id="totalDowntime"
                name="totalDowntime"
                value={formData.totalDowntime}
                onChange={handleChange}
                min="0"
                placeholder="Nhập tổng downtime (phút)"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {status ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
