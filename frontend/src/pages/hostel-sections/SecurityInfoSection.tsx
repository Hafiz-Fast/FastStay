import { useState, useEffect } from 'react';
import styles from "../../styles/AddHostel.module.css";

interface SecurityInfoProps {
    hostelId: number | null;
    editingMode: boolean;
    hostelDetails?: any;
}

export default function SecurityInfoSection({ 
    hostelId,
    editingMode
}: SecurityInfoProps) {
    const [gateTimings, setGateTimings] = useState("");
    const [isCameras, setIsCameras] = useState(false);
    const [isGuard, setIsGuard] = useState(false);
    const [isOutsiderVerification, setIsOutsiderVerification] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [existingSecurityInfo, setExistingSecurityInfo] = useState<any>(null);
    const [securityId, setSecurityId] = useState<number | null>(null);

    // Fetch existing security info if editing
    useEffect(() => {
        if (editingMode && hostelId) {
            fetchSecurityInfo(hostelId);
        } else {
            // Reset form when not editing
            setGateTimings("");
            setIsCameras(false);
            setIsGuard(false);
            setIsOutsiderVerification(false);
            setExistingSecurityInfo(null);
            setSecurityId(null);
        }
    }, [editingMode, hostelId]);

    async function fetchSecurityInfo(hostelId: number) {
        try {
            setLoading(true);
            const res = await fetch(`http://127.0.0.1:8000/faststay_app/display/security_info?p_HostelId=${hostelId}`, {
                method: "GET",
                headers: { 
                    "Accept": "application/json"
                }
            });

            const data = await res.json();

            if (res.ok && !data.error) {
                setExistingSecurityInfo(data);
                setSecurityId(data.p_SecurityId || data.p_securityid);
                setGateTimings(data.p_GateTimings?.toString() || data.p_gatetimings?.toString() || "");
                setIsCameras(data.p_isCameras || data.p_iscameras || false);
                setIsGuard(data.p_isGuard || data.p_isguard || false);
                setIsOutsiderVerification(data.p_isOutsiderVerification || data.p_isoutsiderverification || false);
            } else {
                // No existing security info or error
                setExistingSecurityInfo(null);
                setSecurityId(null);
                setGateTimings("");
                setIsCameras(false);
                setIsGuard(false);
                setIsOutsiderVerification(false);
            }
        } catch (error) {
            console.error("Error fetching security info:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSecuritySubmit(e: any) {
        e.preventDefault();
        setMessage("");

        if (!hostelId) {
            setMessage("Please fill Basic Information first.");
            return;
        }

        if (!gateTimings || parseInt(gateTimings) < 0) {
            setMessage("Security guard time is required");
            return;
        }

        const payload = existingSecurityInfo
            ? {
                p_SecurityId: securityId,
                p_GateTimings: gateTimings,
                p_isCameras: isCameras,
                p_isGuard: isGuard,
                p_isOutsiderVerification: isOutsiderVerification
            }
            : {
                p_HostelId: hostelId,
                p_GateTimings: gateTimings,
                p_isCameras: isCameras,
                p_isGuard: isGuard,
                p_isOutsiderVerification: isOutsiderVerification
            };

        try {
            const url = existingSecurityInfo
                ? "http://127.0.0.1:8000/faststay_app/update/security_info"
                : "http://127.0.0.1:8000/faststay_app/add/security_info";

            const method = "POST"; // Both APIs use POST

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });


            if (res.ok) {
                setMessage(
                    existingSecurityInfo
                        ? "Security Information Updated Successfully!"
                        : "Security Information Added Successfully!"
                );
                // Refresh data
                setTimeout(() => fetchSecurityInfo(hostelId), 500);
            } else {
                setMessage("Failed to save security information. Please try again.");
            }
        } catch (error) {
            console.error("Error saving security info:", error);
            setMessage("Something went wrong. Please try again later.");
        }
    }

    async function deleteSecurityInfo() {
        if (!securityId) {
            setMessage("No security information to delete");
            return;
        }

        if (!window.confirm("Are you sure you want to delete security information?")) {
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:8000/faststay_app/delete/security_info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ p_SecurityId: securityId }),
            });


            if (res.ok) {
                setMessage("Security Information Deleted Successfully!");
                setExistingSecurityInfo(null);
                setSecurityId(null);
                setGateTimings("");
                setIsCameras(false);
                setIsGuard(false);
                setIsOutsiderVerification(false);
            } else {
                setMessage("Failed to delete security information. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting security info:", error);
            setMessage("Something went wrong. Please try again later.");
        }
    }

    return (
        <div className={styles.card} id="security">
            <div className={styles.cardHead}>
                <h3>
                    Security Information
                </h3>
                <div className={styles.cardActions}>
                    {existingSecurityInfo && (
                        <>
                            <button type="button" className={styles.editBtn} onClick={handleSecuritySubmit}>
                                Update
                            </button>
                            <button type="button" className={styles.deleteBtn} onClick={deleteSecurityInfo}>
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Loading security information...
                </div>
            ) : (
                <form onSubmit={handleSecuritySubmit} className={styles.sectionForm}>
                    {/* Gate Timings */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>Security Guard Time (Hours) *</label>
                            <input
                                type="number"
                                value={gateTimings}
                                onChange={(e) => setGateTimings(e.target.value)}
                                placeholder="5"
                                required
                                min="0"
                                max="24"
                            />
                            <small style={{ color: '#666', fontSize: '12px' }}>Number of hours security guard is present</small>
                        </div>
                    </div>

                    {/* Cameras */}
                    <div className={styles.row}>
                        <div className={styles.checkboxGroup}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isCameras}
                                    onChange={(e) => setIsCameras(e.target.checked)}
                                />
                                Cameras Installed
                            </label>
                        </div>
                    </div>

                    {/* Guards */}
                    <div className={styles.row}>
                        <div className={styles.checkboxGroup}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isGuard}
                                    onChange={(e) => setIsGuard(e.target.checked)}
                                />
                                Security Guard
                            </label>
                        </div>
                    </div>

                    {/* Outsider Verification */}
                    <div className={styles.row}>
                        <div className={styles.checkboxGroup}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isOutsiderVerification}
                                    onChange={(e) => setIsOutsiderVerification(e.target.checked)}
                                />
                                Outsider Verification
                            </label>
                        </div>
                    </div>

                    <button className={styles.btn} style={{ marginTop: "10px" }} type="submit">
                        {existingSecurityInfo ? "Update Security Info" : "Save Security Info"}
                    </button>

                    {message && (
                        <p className={`${styles.message} ${
                            message.includes("Successfully") ? styles.success : styles.error
                        }`}>
                            {message}
                        </p>
                    )}
                </form>
            )}
        </div>
    );
}