import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import styles from "../styles/Signup.module.css";

interface SignupForm {
  fname: string;
  lname: string;
  age: string;
  gender: string;
  city: string;
  usertype: string;
  email: string;
  password: string;
}

const Signup: React.FC = () => {
  const [form, setForm] = useState<SignupForm>({
    fname: "",
    lname: "",
    age: "",
    gender: "",
    city: "",
    usertype: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    const userType = form.usertype.trim().toLowerCase();

    if (userType === "hostel manager" && !form.email.endsWith(".faststay")) {
      setMessageType("error");
      setMessage("Invalid email domain.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/faststay_app/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setMessageType("error");
        setMessage(data.error || "Signup failed");
      } else {
        setMessageType("success");
        setMessage("Account created successfully!");

        if (userType === "student") {
          setTimeout(
            () =>
              (window.location.href = `/studentdemographics?user_id=${data.user_id}`),
            1200
          );
        } else if (userType === "hostel manager") {
          setTimeout(
            () =>
              (window.location.href = `/managerdemographics?user_id=${data.user_id}`),
            1200
          );
        }
      }
    } catch (err) {
      setMessageType("error");
      setMessage("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <div className={styles.signupCard}>

          <h2 className={styles.title}>
            <i className="fa-solid fa-user-plus"></i> Create Account
          </h2>

          <form onSubmit={handleSubmit}>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <i className="fa-solid fa-user"></i>
                <input
                  type="text"
                  name="fname"
                  placeholder="First Name"
                  value={form.fname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <i className="fa-solid fa-user"></i>
                <input
                  type="text"
                  name="lname"
                  placeholder="Last Name"
                  value={form.lname}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <i className="fa-solid fa-hashtag"></i>
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={form.age}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <i className="fa-solid fa-venus-mars"></i>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option disabled value="">Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <i className="fa-solid fa-city"></i>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <i className="fa-solid fa-users"></i>
                <select
                  name="usertype"
                  value={form.usertype}
                  onChange={handleChange}
                  required
                >
                  <option disabled value="">Type</option>
                  <option>Student</option>
                  <option>Hostel Manager</option>
                </select>
              </div>
            </div>

            <div className={`${styles.inputGroup} ${styles.full}`}>
              <i className="fa-solid fa-envelope"></i>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={`${styles.inputGroup} ${styles.full}`}>
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button className={styles.btn} type="submit" disabled={loading}>
              {loading ? <div className={styles.spinner}></div> : "Create Account"}
            </button>

          </form>

          <p className={styles.bottomText}>
            Already have an account? <a href="/">Login</a>
          </p>

          {message && (
            <div className={`${styles.toast} ${styles[messageType]}`}>
              {message}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Signup;