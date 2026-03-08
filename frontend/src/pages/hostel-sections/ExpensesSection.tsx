import { useState, useEffect } from 'react';
import styles from "../../styles/AddHostel.module.css";

interface ExpensesProps {
    hostelId: number | null;
    editingMode: boolean;
    hostelDetails?: any;
}

export default function ExpensesSection({
    hostelId,
    editingMode
}: ExpensesProps) {
    const [isExpensesIncluded, setIsExpensesIncluded] = useState(false);
    const [securityCharges, setSecurityCharges] = useState("");
    const [messCharges, setMessCharges] = useState("");
    const [kitchenCharges, setKitchenCharges] = useState("");
    const [internetCharges, setInternetCharges] = useState("");
    const [acServiceCharges, setAcServiceCharges] = useState("");
    const [electricityBillType, setElectricityBillType] = useState("");
    const [electricityCharges, setElectricityCharges] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [existingExpenses, setExistingExpenses] = useState<any>(null);
    const [expenseId, setExpenseId] = useState<number | null>(null);
    const [hasRooms, setHasRooms] = useState(false);
    const [checkingRooms, setCheckingRooms] = useState(false);

    useEffect(() => {
        if (editingMode && hostelId) {
            fetchExpenses(hostelId);
        } else {
            resetForm();
        }
    }, [editingMode, hostelId]);

    useEffect(() => {
        if (hostelId) {
            checkRoomsExist(hostelId);
        } else {
            setHasRooms(false);
        }
    }, [hostelId]);

    async function checkRoomsExist(hostelId: number) {
        setCheckingRooms(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/faststay_app/Rooms/DisplayAllHostel/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ p_HostelId: hostelId })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const roomList = Array.isArray(data.result) ? data.result : (data.result ? [data.result] : []);
                setHasRooms(roomList.length > 0);
            } else {
                setHasRooms(false);
            }
        } catch (error) {
            console.error("Error checking rooms:", error);
            setHasRooms(false);
        } finally {
            setCheckingRooms(false);
        }
    }

    function resetForm() {
        setIsExpensesIncluded(false);
        setSecurityCharges("");
        setMessCharges("");
        setKitchenCharges("");
        setInternetCharges("");
        setAcServiceCharges("");
        setElectricityBillType("");
        setElectricityCharges("");
        setExistingExpenses(null);
        setExpenseId(null);
    }

    async function fetchExpenses(hostelId: number) {
        try {
            setLoading(true);
            const res = await fetch("http://127.0.0.1:8000/faststay_app/Expenses/display/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ p_HostelId: hostelId })
            });

            const data = await res.json();

            if (res.ok && data.success && data.result) {
                const expenses = data.result;
                setExistingExpenses(expenses);
                setExpenseId(expenses.p_ExpenseId);
                setIsExpensesIncluded(expenses.p_isIncludedInRoomCharges);
                setSecurityCharges(expenses.p_SecurityCharges?.toString() || "");
                setMessCharges(expenses.p_MessCharges?.toString() || "");
                setKitchenCharges(expenses.p_KitchenCharges?.toString() || "");
                setInternetCharges(expenses.p_InternetCharges?.toString() || "");
                setAcServiceCharges(expenses.p_AcServiceCharges?.toString() || "");
                setElectricityBillType(expenses.p_ElectricitybillType || "");
                setElectricityCharges(expenses.p_ElectricityCharges?.toString() || "");
            } else {
                resetForm();
            }
        } catch (error) {
            console.error("Error fetching expenses:", error);
            setMessage("Failed to load expenses. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleExpensesSubmit(e: any) {
        e.preventDefault();
        setMessage("");

        if (!hostelId) {
            setMessage("Please fill Basic Information first.");
            return;
        }

        let payload: any = {};

        if (isExpensesIncluded) {
            if (!securityCharges) {
                setMessage("Security charges are required when expenses are included in room rent.");
                return;
            }

            payload = existingExpenses
                ? {
                    p_ExpenseId: expenseId,
                    p_isIncludedInRoomCharges: true,
                    p_RoomCharges: [],
                    p_SecurityCharges: parseFloat(securityCharges),
                    p_MessCharges: 0,
                    p_KitchenCharges: 0,
                    p_InternetCharges: 0,
                    p_AcServiceCharges: 0,
                    p_ElectricitybillType: "RoomMeterFull",
                    p_ElectricityCharges: 0
                }
                : {
                    p_HostelId: hostelId,
                    p_isIncludedInRoomCharges: true,
                    p_RoomCharges: [],
                    p_SecurityCharges: parseFloat(securityCharges),
                    p_MessCharges: 0,
                    p_KitchenCharges: 0,
                    p_InternetCharges: 0,
                    p_AcServiceCharges: 0,
                    p_ElectricitybillType: "RoomMeterFull",
                    p_ElectricityCharges: 0
                };

        } else {
            if (!securityCharges || !messCharges || !kitchenCharges || !internetCharges ||
                !acServiceCharges || !electricityBillType || !electricityCharges) {
                setMessage("All fields are required when expenses are not included in room rent.");
                return;
            }

            payload = existingExpenses
                ? {
                    p_ExpenseId: expenseId,
                    p_isIncludedInRoomCharges: false,
                    p_RoomCharges: [],
                    p_SecurityCharges: parseFloat(securityCharges),
                    p_MessCharges: parseFloat(messCharges),
                    p_KitchenCharges: parseFloat(kitchenCharges),
                    p_InternetCharges: parseFloat(internetCharges),
                    p_AcServiceCharges: parseFloat(acServiceCharges),
                    p_ElectricitybillType: electricityBillType,
                    p_ElectricityCharges: parseFloat(electricityCharges)
                }
                : {
                    p_HostelId: hostelId,
                    p_isIncludedInRoomCharges: false,
                    p_RoomCharges: [],
                    p_SecurityCharges: parseFloat(securityCharges),
                    p_MessCharges: parseFloat(messCharges),
                    p_KitchenCharges: parseFloat(kitchenCharges),
                    p_InternetCharges: parseFloat(internetCharges),
                    p_AcServiceCharges: parseFloat(acServiceCharges),
                    p_ElectricitybillType: electricityBillType,
                    p_ElectricityCharges: parseFloat(electricityCharges)
                };
        }

        try {
            const url = existingExpenses
                ? "http://127.0.0.1:8000/faststay_app/Expenses/update/"
                : (isExpensesIncluded
                    ? "http://127.0.0.1:8000/faststay_app/ExpensesRoomIncluded/add/"
                    : "http://127.0.0.1:8000/faststay_app/Expenses/add/");

            const method = existingExpenses ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });


            if (res.ok) {
                setMessage("Expenses Saved Successfully!");
                setTimeout(() => fetchExpenses(hostelId), 500);
            } else {
                setMessage("Failed to save expenses. Please check your inputs and try again.");
            }
        } catch (error) {
            console.error("Error saving expenses:", error);
            setMessage("Something went wrong. Please try again later.");
        }
    }

    async function deleteExpenses() {
        if (!expenseId) {
            setMessage("No expenses to delete");
            return;
        }

        if (!window.confirm("Are you sure you want to delete expenses?")) return;

        try {
            const res = await fetch("http://127.0.0.1:8000/faststay_app/Expenses/delete/", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ p_ExpenseId: expenseId })
            });


            if (res.ok) {
                setMessage("Expenses Deleted Successfully!");
                resetForm();
            } else {
                setMessage("Failed to delete expenses. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting expenses:", error);
            setMessage("Something went wrong. Please try again later.");
        }
    }

    return (
        <div className={styles.card} id="expenses">
            <div className={styles.cardHead}>
                <h3>
                    Expenses
                </h3>
                <div className={styles.cardActions}>
                    {existingExpenses && (
                        <>
                            <button type="button" className={styles.editBtn} onClick={handleExpensesSubmit}>
                                Update
                            </button>
                            <button type="button" className={styles.deleteBtn} onClick={deleteExpenses}>
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Loading expenses...
                </div>
            ) : checkingRooms ? (
                <div className={styles.loading}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Checking rooms...
                </div>
            ) : !hasRooms && !existingExpenses ? (
                <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    backgroundColor: '#fff3f3',
                    borderRadius: '10px',
                    border: '2px dashed #e74c3c',
                    margin: '20px 0'
                }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{
                        fontSize: '48px',
                        color: '#e74c3c',
                        marginBottom: '15px',
                        display: 'block'
                    }}></i>
                    <p style={{
                        fontWeight: 700,
                        fontSize: '1.3rem',
                        color: '#c0392b',
                        marginBottom: '10px'
                    }}>
                        No Rooms Found for This Hostel
                    </p>
                    <p style={{
                        color: '#555',
                        fontSize: '1rem',
                        maxWidth: '400px',
                        margin: '0 auto',
                        lineHeight: '1.5'
                    }}>
                        You must add at least one room before you can configure expenses.
                        Please go to the <strong>"Add Room"</strong> page first.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleExpensesSubmit} className={styles.sectionForm}>
                    <div className={styles.row} style={{ marginTop: '10px' }}>
                        <div className={styles.checkboxGroup} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <label style={{ marginRight: '10px', fontWeight: '600' }}>
                                Expenses Included in Room Rent
                            </label>
                            <input
                                type="checkbox"
                                checked={isExpensesIncluded}
                                onChange={(e) => setIsExpensesIncluded(e.target.checked)}
                                style={{ width: '20px', height: '20px' }}
                            />
                        </div>
                    </div>

                    <p className={styles.note} style={{ marginBottom: '15px', color: '#666' }}>
                        {isExpensesIncluded
                            ? "Only security charges need to be specified."
                            : "All expenses need to be specified separately."}
                    </p>

                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>Security Charges *</label>
                            <input
                                type="number"
                                value={securityCharges}
                                onChange={(e) => setSecurityCharges(e.target.value)}
                                placeholder="0"
                                required
                                min="0"
                                step="100"
                            />
                        </div>
                    </div>

                    {!isExpensesIncluded && (
                        <>
                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Mess Charges *</label>
                                    <input
                                        type="number"
                                        value={messCharges}
                                        onChange={(e) => setMessCharges(e.target.value)}
                                        placeholder="0"
                                        required
                                        min="0"
                                        step="100"
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Kitchen Charges *</label>
                                    <input
                                        type="number"
                                        value={kitchenCharges}
                                        onChange={(e) => setKitchenCharges(e.target.value)}
                                        placeholder="0"
                                        required
                                        min="0"
                                        step="100"
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Internet Charges *</label>
                                    <input
                                        type="number"
                                        value={internetCharges}
                                        onChange={(e) => setInternetCharges(e.target.value)}
                                        placeholder="0"
                                        required
                                        min="0"
                                        step="100"
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>AC Service Charges *</label>
                                    <input
                                        type="number"
                                        value={acServiceCharges}
                                        onChange={(e) => setAcServiceCharges(e.target.value)}
                                        placeholder="0"
                                        required
                                        min="0"
                                        step="100"
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Electricity Bill Type *</label>
                                    <select
                                        value={electricityBillType}
                                        onChange={(e) => setElectricityBillType(e.target.value)}
                                        required
                                    >
                                        <option value="">Select</option>
                                        <option value="RoomMeterFull">Room Meter Full — Full room electricity on meter</option>
                                        <option value="ACSubmeter">AC Submeter — Separate submeter for AC</option>
                                        <option value="UnitBased">Unit Based — Charged per unit consumed</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Electricity Charges *</label>
                                    <input
                                        type="number"
                                        value={electricityCharges}
                                        onChange={(e) => setElectricityCharges(e.target.value)}
                                        placeholder="0"
                                        required
                                        min="0"
                                        step="100"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        className={styles.btn}
                        style={{ marginTop: "10px" }}
                        type="submit"
                        disabled={!hasRooms}
                        title={!hasRooms ? "Add at least one room first" : ""}
                    >
                        {existingExpenses ? "Update Expenses" : "Save Expenses"}
                    </button>

                    {message && (
                        <p className={`${styles.message} ${message.includes("Successfully") ? styles.success : styles.error}`}>
                            {message}
                        </p>
                    )}
                </form>
            )}
        </div>
    );
}