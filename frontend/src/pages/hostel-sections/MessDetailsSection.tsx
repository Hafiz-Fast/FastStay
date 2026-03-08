import { useState, useEffect } from 'react';
import styles from "../../styles/AddHostel.module.css";

interface MessDetailsProps {
    hostelId: number | null;
    editingMode: boolean;
    hostelDetails?: any;
}

export default function MessDetailsSection({ 
    hostelId, 
    editingMode
}: MessDetailsProps) {
    const [messTimeCount, setMessTimeCount] = useState("");
    const [dishes, setDishes] = useState<string[]>([""]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [existingMessDetails, setExistingMessDetails] = useState<any>(null);
    const [messId, setMessId] = useState<number | null>(null);

    useEffect(() => {
        if (hostelId) {
            fetchMessDetails(hostelId);
        } else {
            setMessTimeCount("");
            setDishes([""]);
            setExistingMessDetails(null);
            setMessId(null);
        }
    }, [hostelId, editingMode]);

    async function fetchMessDetails(hostelId: number) {
        try {
            setLoading(true);

            const url = `http://127.0.0.1:8000/faststay_app/display/hostel_mess?p_HostelId=${hostelId}`;
            const res = await fetch(url, {
                method: "GET",
                headers: { "Accept": "application/json" }
            });

            const responseText = await res.text();
            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error("Invalid response format");
            }

            if (res.ok) {
                if (data.error) {
                    setExistingMessDetails(null);
                    setMessId(null);
                    setMessTimeCount("");
                    setDishes([""]);
                } else {
                    setExistingMessDetails(data);

                    const extractedMessId = data.p_messid;
                    setMessId(extractedMessId || null);

                    const timeCount = data.p_messtimecount;
                    setMessTimeCount(timeCount ? timeCount.toString() : "");

                    let dishesArray: string[] = [""];

                    const dishesData = data.p_dishes;
                    if (Array.isArray(dishesData)) {
                        dishesArray = dishesData
                            .map(d => d?.toString()?.trim())
                            .filter(d => d);
                    } else if (typeof dishesData === "string") {
                        dishesArray = dishesData.split(",")
                            .map(d => d.trim())
                            .filter(d => d !== "");
                    }

                    if (!dishesArray.length) dishesArray = [""];
                    setDishes(dishesArray);
                }
            } else {
                setExistingMessDetails(null);
                setMessId(null);
                setMessTimeCount("");
                setDishes([""]);
            }
        } catch {
            setExistingMessDetails(null);
            setMessId(null);
            setMessTimeCount("");
            setDishes([""]);
        } finally {
            setLoading(false);
        }
    }

    function addDishField() {
        setDishes(prev => [...prev, ""]);
    }

    function removeDishField(index: number) {
        setDishes(prev => prev.filter((_, i) => i !== index));
    }

    function updateDish(index: number, value: string) {
        setDishes(prev => {
            const newDishes = [...prev];
            newDishes[index] = value;
            return newDishes;
        });
    }

    async function handleMessSubmit(e: any) {
        e.preventDefault();
        setMessage("");

        if (!hostelId) {
            setMessage("Please fill Basic Information first.");
            return;
        }

        const filteredDishes = dishes.filter(d => d.trim() !== "");
        if (!filteredDishes.length) {
            setMessage("Please add at least one dish");
            return;
        }

        const timeCount = parseInt(messTimeCount);
        if (!messTimeCount || isNaN(timeCount) || timeCount < 1 || timeCount > 3) {
            setMessage("Meals per day must be between 1 and 3");
            return;
        }

        const payload = existingMessDetails && messId
            ? {
                p_MessId: messId,
                p_MessTimeCount: timeCount,
                p_Dishes: filteredDishes
            }
            : {
                p_HostelId: hostelId,
                p_MessTimeCount: timeCount,
                p_Dishes: filteredDishes
            };

        try {
            const url = existingMessDetails && messId
                ? "http://127.0.0.1:8000/faststay_app/messDetails/update/"
                : "http://127.0.0.1:8000/faststay_app/messDetails/add/";

            const method = existingMessDetails && messId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });


            if (res.ok) {
                setMessage(
                    existingMessDetails ? "Mess Details Updated Successfully!" : "Mess Details Added Successfully!"
                );

                if (hostelId) fetchMessDetails(hostelId);
            } else {
                setMessage("Failed to save mess details. Please try again.");
            }
        } catch {
            setMessage("Something went wrong. Please try again later.");
        }
    }

    async function deleteMessDetails() {
        if (!messId) {
            setMessage("No mess details to delete");
            return;
        }

        if (!window.confirm("Are you sure you want to delete mess details?")) return;

        try {
            const res = await fetch("http://127.0.0.1:8000/faststay_app/messDetails/delete/", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ p_MessId: messId }),
            });

            const data = await res.json();

            if (res.ok && data.result === true) {
                setMessage("Mess Details Deleted Successfully!");
                setExistingMessDetails(null);
                setMessId(null);
                setMessTimeCount("");
                setDishes([""]);
            } else {
                setMessage("Failed to delete mess details. Please try again.");
            }
        } catch {
            setMessage("Something went wrong. Please try again later.");
        }
    }

    return (
        <div className={styles.card} id="mess">
            <div className={styles.cardHead}>
                <h3>
                    Mess Details
                </h3>
                <div className={styles.cardActions}>
                    {existingMessDetails && messId && (
                        <>
                            <button type="button" className={styles.editBtn} onClick={handleMessSubmit}>
                                <i className="fa-solid fa-pen-to-square" /> Update
                            </button>
                            <button type="button" className={styles.deleteBtn} onClick={deleteMessDetails}>
                                <i className="fa-solid fa-trash" /> Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <i className="fa-solid fa-spinner fa-spin" /> Loading mess details...
                </div>
            ) : (
                <form onSubmit={handleMessSubmit} className={styles.sectionForm}>
                    {!hostelId && (
                        <div className={`${styles.message} ${styles.warning}`}>
                            Please fill and save Basic Information first before adding mess details.
                        </div>
                    )}

                    {hostelId && (
                        <>
                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Meals Per Day *</label>
                                    <input
                                        type="number"
                                        value={messTimeCount}
                                        onChange={(e) => setMessTimeCount(e.target.value)}
                                        placeholder="1-3"
                                        min={1}
                                        max={3}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Dishes *</label>

                                    {dishes.map((dish, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                            <input
                                                type="text"
                                                value={dish}
                                                onChange={(e) => updateDish(index, e.target.value)}
                                                placeholder={`Dish ${index + 1}`}
                                                required={index === 0}
                                                style={{ flex: 1 }}
                                            />

                                            {dishes.length > 1 && (
                                                <button
                                                    type="button"
                                                    className={styles.deleteBtn}
                                                    onClick={() => removeDishField(index)}
                                                    style={{ width: '40px', padding: '8px' }}
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        className={styles.editBtn}
                                        onClick={addDishField}
                                        style={{ width: "150px", marginTop: "10px" }}
                                    >
                                        <i className="fa-solid fa-plus"></i> Add Dish
                                    </button>
                                </div>
                            </div>

                            <button 
                                className={styles.btn} 
                                style={{ marginTop: "15px" }}
                                type="submit"
                                disabled={loading}
                            >
                                {existingMessDetails ? "Update Mess Details" : "Save Mess Details"}
                            </button>
                        </>
                    )}

                    {message && (
                        <div className={`${styles.message} ${
                            message.includes("Successfully")
                                ? styles.success 
                                : styles.error
                        }`}>
                            {message}
                        </div>
                    )}
                </form>
            )}
        </div>
    );
}