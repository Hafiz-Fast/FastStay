// src/components/hostel-sections/BasicInfoSection.tsx
import React from 'react';
import styles from "../../styles/AddHostel.module.css";
import MapPicker from '../MapPicker';

interface BasicInfoSectionProps {
    form: {
        p_ManagerId: number;
        p_HostelId: number;
        p_BlockNo: string;
        p_HouseNo: string;
        p_HostelType: string;
        p_isParking: boolean;
        p_NumRooms: string;
        p_NumFloors: string;
        p_WaterTimings: string;
        p_CleanlinessTenure: string;
        p_IssueResolvingTenure: string;
        p_MessProvide: boolean;
        p_GeezerFlag: boolean;
        p_name: string;
        p_Latitude: string;
        p_Longitude: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    message: string;
    editingMode: boolean;
    selectedHostelId: number | null;
    hostelId: number | null;
    hostelPics: string[];
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    pendingFiles: File[];
    setPendingFiles: React.Dispatch<React.SetStateAction<File[]>>;
    onRemoveUploadedPic: (index: number) => void;
}

export default function BasicInfoSection({
    form,
    handleChange,
    handleSubmit,
    message,
    editingMode,
    hostelPics,
    pendingFiles,
    setPendingFiles,
    onRemoveUploadedPic,
}: BasicInfoSectionProps) {

    const totalImages = hostelPics.length + pendingFiles.length;

    function handleLocalFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const remaining = 5 - totalImages;
        if (remaining <= 0) {
            alert("Maximum 5 images allowed.");
            return;
        }

        const newFiles = Array.from(files).slice(0, remaining);
        setPendingFiles(prev => [...prev, ...newFiles]);

        // Reset input so same file can be selected again
        e.target.value = "";
    }

    function removePendingFile(index: number) {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    }

    const crossBtnStyle: React.CSSProperties = {
        position: "absolute",
        top: "-6px",
        right: "-6px",
        background: "#e74c3c",
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        width: "22px",
        height: "22px",
        fontSize: "14px",
        lineHeight: "20px",
        textAlign: "center",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        padding: 0,
    };

    return (
        <div className={styles.card} id="basic">
            <div className={styles.cardHead}>
                <h3>Basic Information</h3>
            </div>

            <form onSubmit={handleSubmit} className={styles.sectionForm}>
                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>Hostel Name *</label>
                        <input
                            type="text"
                            name="p_name"
                            value={form.p_name}
                            onChange={handleChange}
                            placeholder="Enter hostel name"
                            required
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>Block No *</label>
                        <input
                            type="text"
                            name="p_BlockNo"
                            value={form.p_BlockNo}
                            onChange={handleChange}
                            placeholder="A Faisal Town"
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>House No *</label>
                        <input
                            type="text"
                            name="p_HouseNo"
                            value={form.p_HouseNo}
                            onChange={handleChange}
                            placeholder="House number"
                            required
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>Hostel Type *</label>
                        <select
                            name="p_HostelType"
                            value={form.p_HostelType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select type</option>
                            <option value="Portion">Portion</option>
                            <option value="Building">Building</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Number of Rooms *</label>
                        <input
                            type="number"
                            name="p_NumRooms"
                            value={form.p_NumRooms}
                            onChange={handleChange}
                            placeholder="Total rooms"
                            min="1"
                            required
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>Number of Floors *</label>
                        <input
                            type="number"
                            name="p_NumFloors"
                            value={form.p_NumFloors}
                            onChange={handleChange}
                            placeholder="Total floors"
                            min="1"
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Water Timing (hours) *</label>
                        <input
                            type="number"
                            name="p_WaterTimings"
                            value={form.p_WaterTimings}
                            onChange={handleChange}
                            placeholder="Hours per day"
                            min="0"
                            required
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>Cleanliness Tenure (days) *</label>
                        <input
                            type="number"
                            name="p_CleanlinessTenure"
                            value={form.p_CleanlinessTenure}
                            onChange={handleChange}
                            placeholder="Days between cleaning"
                            min="1"
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Issue Resolving Tenure (days) *</label>
                        <input
                            type="number"
                            name="p_IssueResolvingTenure"
                            value={form.p_IssueResolvingTenure}
                            onChange={handleChange}
                            placeholder="Days to resolve issues"
                            min="1"
                            required
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="p_isParking"
                                checked={form.p_isParking}
                                onChange={handleChange}
                            />
                            <span>Parking Available</span>
                        </label>
                    </div>
                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="p_MessProvide"
                                checked={form.p_MessProvide}
                                onChange={handleChange}
                            />
                            <span>Mess Provided</span>
                        </label>
                    </div>
                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="p_GeezerFlag"
                                checked={form.p_GeezerFlag}
                                onChange={handleChange}
                            />
                            <span>Geyser Available</span>
                        </label>
                    </div>
                </div>

                {/* ---------------- Hostel Pics Upload ---------------- */}
                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>Upload Hostel Pictures (max 5)</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleLocalFileSelect}
                            disabled={totalImages >= 5}
                        />
                        <p style={{ fontSize: "12px", marginTop: "5px", color: "#777" }}>
                            {`${totalImages}/5 images selected. Images will be uploaded on ${editingMode ? "update" : "save"}.`}
                        </p>
                    </div>
                </div>

                {/* Preview uploaded pics */}
                {(hostelPics.length > 0 || pendingFiles.length > 0) && (
                    <div style={{ marginTop: "10px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        {hostelPics.map((pic, idx) => (
                            <div key={`uploaded-${idx}`} style={{ position: "relative", display: "inline-block" }}>
                                <img
                                    src={pic}
                                    alt={`Hostel pic ${idx + 1}`}
                                    style={{
                                        width: "140px",
                                        height: "100px",
                                        borderRadius: "8px",
                                        objectFit: "cover",
                                        border: "1px solid #ddd"
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => onRemoveUploadedPic(idx)}
                                    style={crossBtnStyle}
                                    title="Remove image"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {pendingFiles.map((file, idx) => (
                            <div key={`pending-${idx}`} style={{ position: "relative", display: "inline-block" }}>
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Pending pic ${idx + 1}`}
                                    style={{
                                        width: "140px",
                                        height: "100px",
                                        borderRadius: "8px",
                                        objectFit: "cover",
                                        border: "2px dashed #4a90e2"
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removePendingFile(idx)}
                                    style={crossBtnStyle}
                                    title="Remove image"
                                >
                                    ×
                                </button>
                                <div style={{
                                    position: "absolute",
                                    bottom: "4px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    background: "rgba(74,144,226,0.85)",
                                    color: "#fff",
                                    fontSize: "9px",
                                    padding: "1px 6px",
                                    borderRadius: "4px",
                                    whiteSpace: "nowrap",
                                }}>
                                    Pending upload
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>Hostel Location *</label>

                        <MapPicker
                            lat={form.p_Latitude ? parseFloat(form.p_Latitude) : null}
                            lng={form.p_Longitude ? parseFloat(form.p_Longitude) : null}
                            onSelect={(lat, lng) => {
                                handleChange({
                                    target: {
                                        name: "p_Latitude",
                                        value: lat.toFixed(6)
                                    }
                                } as any);

                                handleChange({
                                    target: {
                                        name: "p_Longitude",
                                        value: lng.toFixed(6)
                                    }
                                } as any);
                            }}
                        />

                        <p style={{ fontSize: "12px", color: "#777" }}>
                            Click on map or search to select hostel location
                        </p>
                    </div>
                </div>

                <button
                    className={styles.btn}
                    type="submit"
                    disabled={!form.p_Latitude || !form.p_Longitude}
                >
                    {editingMode ? "Update Hostel" : "Save Hostel"}
                </button>

                {message && (
                    <div className={`${styles.message} ${message.includes("Successfully") ||
                        message.includes("successfully") ||
                        message.includes("Added") ||
                        message.includes("Updated") ||
                        message.includes("success")
                        ? styles.success
                        : styles.error
                        }`}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
}