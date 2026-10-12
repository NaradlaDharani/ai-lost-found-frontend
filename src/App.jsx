import { useState, useEffect } from "react";
import "./App.css";
import { ENDPOINTS } from "./api";

function App() {
  const [page, setPage] = useState("home");

  // LOGIN / REGISTER
  const [authMode, setAuthMode] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("user")
  );

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [authMessage, setAuthMessage] = useState("");
  const [backendStatus, setBackendStatus] = useState("checking");

  // LOST / FOUND / MATCHING
  const [lostItemId, setLostItemId] = useState("");
  const [matches, setMatches] = useState([]);

  const [lostItem, setLostItem] = useState({
    itemName: "",
    description: "",
    category: "",
    location: "",
    lostDate: ""
  });

  const [foundItem, setFoundItem] = useState({
    itemName: "",
    description: "",
    category: "",
    location: "",
    foundDate: ""
  });

  const [message, setMessage] = useState("");

  // ITEMS BROWSER (LOST & FOUND)
  const [itemsView, setItemsView] = useState("all"); // "all", "lost", "found"
  const [lostItemsList, setLostItemsList] = useState([]);
  const [foundItemsList, setFoundItemsList] = useState([]);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // CHECK BACKEND HEALTH ON MOUNT
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(ENDPOINTS.HEALTH);
      if (res.ok) {
        setBackendStatus("online");
      } else {
        setBackendStatus("degraded");
      }
    } catch {
      setBackendStatus("offline");
    }
  };

  // FETCH ALL ITEMS FOR BROWSER
  const fetchAllItems = async () => {
    setIsLoadingItems(true);
    try {
      const [lostRes, foundRes] = await Promise.all([
        fetch(ENDPOINTS.LOST_ITEMS),
        fetch(ENDPOINTS.FOUND_ITEMS)
      ]);

      if (lostRes.ok) {
        const lostData = await lostRes.json();
        setLostItemsList(Array.isArray(lostData) ? lostData : []);
      }
      if (foundRes.ok) {
        const foundData = await foundRes.json();
        setFoundItemsList(Array.isArray(foundData) ? foundData : []);
      }
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setIsLoadingItems(false);
    }
  };

  // Auto-fetch items when entering browse page
  useEffect(() => {
    if (page === "browse" && isLoggedIn) {
      fetchAllItems();
    }
  }, [page, isLoggedIn]);

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setPage("home");
    setMessage("");
    setAuthMessage("");
    setAuthMode("login");
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
      });

      if (!response.ok) {
        let errText = "Invalid email or password.";
        try {
          const errData = await response.json();
          if (errData && errData.message) errText = errData.message;
        } catch {
          const raw = await response.text().catch(() => "");
          if (raw) errText = raw;
        }
        setAuthMessage(`❌ ${errText}`);
        return;
      }

      const data = await response.json();

      if (data && data.id) {
        localStorage.setItem("user", JSON.stringify(data));
        setIsLoggedIn(true);
        setPage("home");
        setAuthMessage("");
        setLoginData({
          email: "",
          password: ""
        });
      } else {
        setAuthMessage("❌ Invalid email or password.");
      }
    } catch (error) {
      console.error("Login request error:", error);
      setAuthMessage("❌ Could not connect to backend. Please check network/CORS.");
    }
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(ENDPOINTS.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registerData)
      });

      const data = await response.text();

      if (response.ok) {
        setAuthMessage("✅ Registration successful! Please login.");
        setRegisterData({
          name: "",
          email: "",
          password: ""
        });
        setAuthMode("login");
      } else {
        setAuthMessage("❌ " + (data || "Registration failed."));
      }
    } catch (error) {
      console.error("Register request error:", error);
      setAuthMessage("❌ Could not connect to backend. Please check network/CORS.");
    }
  };

  // LOST ITEM CHANGE
  const handleLostChange = (e) => {
    setLostItem({
      ...lostItem,
      [e.target.name]: e.target.value
    });
  };

  // FOUND ITEM CHANGE
  const handleFoundChange = (e) => {
    setFoundItem({
      ...foundItem,
      [e.target.name]: e.target.value
    });
  };

  // SUBMIT LOST ITEM
  const submitLostItem = async (e) => {
    e.preventDefault();

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.id) {
        setMessage("❌ Please login first.");
        return;
      }

      const response = await fetch(
        `${ENDPOINTS.LOST_ITEMS}?userId=${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(lostItem)
        }
      );

      if (response.ok) {
        const saved = await response.json().catch(() => null);
        const idNotice = saved && saved.id ? ` (ID: ${saved.id})` : "";
        setMessage(`✅ Lost item reported successfully!${idNotice}`);

        setLostItem({
          itemName: "",
          description: "",
          category: "",
          location: "",
          lostDate: ""
        });
      } else {
        setMessage("❌ Failed to report lost item.");
      }
    } catch (error) {
      console.error("Submit lost item error:", error);
      setMessage("❌ Could not connect to backend.");
    }
  };

  // SUBMIT FOUND ITEM
  const submitFoundItem = async (e) => {
    e.preventDefault();

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.id) {
        setMessage("❌ Please login first.");
        return;
      }

      const response = await fetch(
        `${ENDPOINTS.FOUND_ITEMS}?userId=${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(foundItem)
        }
      );

      if (response.ok) {
        const saved = await response.json().catch(() => null);
        const idNotice = saved && saved.id ? ` (ID: ${saved.id})` : "";
        setMessage(`✅ Found item reported successfully!${idNotice}`);

        setFoundItem({
          itemName: "",
          description: "",
          category: "",
          location: "",
          foundDate: ""
        });
      } else {
        setMessage("❌ Failed to report found item.");
      }
    } catch (error) {
      console.error("Submit found item error:", error);
      setMessage("❌ Could not connect to backend.");
    }
  };

  // FIND MATCHES
  const findMatches = async (e) => {
    e.preventDefault();

    if (!lostItemId) {
      setMessage("❌ Please enter a Lost Item ID.");
      return;
    }

    try {
      setMessage("🔍 Finding matches...");
      setMatches([]);

      const response = await fetch(ENDPOINTS.MATCHES(lostItemId));

      if (response.ok) {
        const data = await response.json();
        setMatches(Array.isArray(data) ? data : []);
        setMessage("");

        if (!data || data.length === 0) {
          setMessage("❌ No matching found items.");
        }
      } else {
        setMatches([]);
        let errDetail = "Could not find matches.";
        try {
          const errJson = await response.json();
          if (errJson && errJson.message) errDetail = errJson.message;
        } catch {
          const raw = await response.text().catch(() => "");
          if (raw) errDetail = raw;
        }
        setMessage(`❌ ${errDetail}`);
      }
    } catch (error) {
      console.error("Find matches error:", error);
      setMatches([]);
      setMessage("❌ Could not connect to backend.");
    }
  };

  // FILTERED ITEMS FOR BROWSER
  const filteredLostItems = lostItemsList.filter((item) => {
    const q = itemSearchQuery.toLowerCase();
    return (
      (item.itemName && item.itemName.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  const filteredFoundItems = foundItemsList.filter((item) => {
    const q = itemSearchQuery.toLowerCase();
    return (
      (item.itemName && item.itemName.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  // LOGIN / REGISTER PAGE
  if (!isLoggedIn) {
    return (
      <div className="app">
        <nav className="navbar">
          <h2>🔍 Lost & Found AI</h2>
          <span style={{ fontSize: "12px", color: backendStatus === "online" ? "#28a745" : "#ffc107" }}>
            Backend: {backendStatus === "online" ? "🟢 Connected" : backendStatus === "checking" ? "🟡 Connecting..." : "🔴 Offline"}
          </span>
        </nav>

        <section className="form-section">
          {authMode === "login" ? (
            <>
              <h1>🔐 Login</h1>
              <p>Login to access the Lost & Found system.</p>

              <form className="item-form" onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({
                      ...loginData,
                      email: e.target.value
                    })
                  }
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({
                      ...loginData,
                      password: e.target.value
                    })
                  }
                  required
                />

                <button type="submit">Login</button>
              </form>

              {authMessage && <p className="message">{authMessage}</p>}

              <p>Don't have an account?</p>

              <button
                className="switch-button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthMessage("");
                }}
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              <h1>📝 Create Account</h1>
              <p>Register to use the Lost & Found system.</p>

              <form className="item-form" onSubmit={handleRegister}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={registerData.name}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      name: e.target.value
                    })
                  }
                  required
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      email: e.target.value
                    })
                  }
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value
                    })
                  }
                  required
                />

                <button type="submit">Register</button>
              </form>

              {authMessage && <p className="message">{authMessage}</p>}

              <p>Already have an account?</p>

              <button
                className="switch-button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthMessage("");
                }}
              >
                Back to Login
              </button>
            </>
          )}
        </section>
      </div>
    );
  }

  // MAIN APPLICATION
  return (
    <div className="app">
      {/* NAVBAR */}
      <nav className="navbar">
        <h2>🔍 Lost & Found AI</h2>

        <div className="nav-buttons">
          <button onClick={() => { setPage("home"); setMessage(""); }}>Home</button>
          <button onClick={() => { setPage("browse"); setMessage(""); }}>Browse Items</button>
          <button onClick={() => { setPage("lost"); setMessage(""); }}>Report Lost</button>
          <button onClick={() => { setPage("found"); setMessage(""); }}>Report Found</button>
          <button onClick={() => { setPage("matches"); setMessage(""); }}>Find Matches</button>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <main>
        {/* HOME */}
        {page === "home" && (
          <section className="hero">
            <h1>AI-Based Lost-and-Found Object Matching System</h1>
            <p>
              Report lost or found objects and use intelligent matching to find
              possible matches quickly.
            </p>

            <div className="cards">
              <div className="card">
                <h3>🔍 Browse Items</h3>
                <p>View all currently reported lost and found items in the system.</p>
                <button onClick={() => setPage("browse")}>Browse Items</button>
              </div>

              <div className="card">
                <h3>📢 Report Lost</h3>
                <p>Submit details about an item you have lost.</p>
                <button onClick={() => setPage("lost")}>Report Lost Item</button>
              </div>

              <div className="card">
                <h3>📦 Report Found</h3>
                <p>Submit details about an item you have found.</p>
                <button onClick={() => setPage("found")}>Report Found Item</button>
              </div>

              <div className="card">
                <h3>🤖 Find Matches</h3>
                <p>Check possible matches for your lost item using intelligent scoring.</p>
                <button onClick={() => setPage("matches")}>Find Matches</button>
              </div>
            </div>
          </section>
        )}

        {/* BROWSE ITEMS */}
        {page === "browse" && (
          <section className="form-section" style={{ maxWidth: "900px" }}>
            <h1>📋 Browse Reported Items</h1>
            <p>View and search all lost and found items recorded in the database.</p>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0", flexWrap: "wrap" }}>
              <button
                className="switch-button"
                style={{ backgroundColor: itemsView === "all" ? "#0d6efd" : "#6c757d", color: "#fff" }}
                onClick={() => setItemsView("all")}
              >
                All Items ({lostItemsList.length + foundItemsList.length})
              </button>
              <button
                className="switch-button"
                style={{ backgroundColor: itemsView === "lost" ? "#dc3545" : "#6c757d", color: "#fff" }}
                onClick={() => setItemsView("lost")}
              >
                Lost Items ({lostItemsList.length})
              </button>
              <button
                className="switch-button"
                style={{ backgroundColor: itemsView === "found" ? "#198754" : "#6c757d", color: "#fff" }}
                onClick={() => setItemsView("found")}
              >
                Found Items ({foundItemsList.length})
              </button>
              <button
                className="switch-button"
                onClick={fetchAllItems}
                disabled={isLoadingItems}
              >
                🔄 Refresh
              </button>
            </div>

            <div style={{ margin: "15px 0" }}>
              <input
                type="text"
                placeholder="🔍 Search items by name, category, or location..."
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ced4da" }}
              />
            </div>

            {isLoadingItems ? (
              <p>Loading items from database...</p>
            ) : (
              <div className="matches" style={{ marginTop: "20px" }}>
                {(itemsView === "all" || itemsView === "lost") &&
                  filteredLostItems.map((item) => (
                    <div className="match-card" key={`lost-${item.id}`} style={{ borderLeft: "4px solid #dc3545" }}>
                      <div className="match-info">
                        <span className="item-badge" style={{ backgroundColor: "#dc3545" }}>
                          📢 Lost Item #ID: {item.id}
                        </span>
                        <h2>{item.itemName}</h2>
                        <p>📂 <b>Category:</b> {item.category}</p>
                        <p>📍 <b>Location:</b> {item.location}</p>
                        <p>📅 <b>Lost Date:</b> {item.lostDate || "Not specified"}</p>
                        <p>📝 <b>Description:</b> {item.description}</p>
                        {item.user && (
                          <p>👤 <b>Reported by:</b> {item.user.name} ({item.user.email})</p>
                        )}
                        <button
                          style={{ marginTop: "10px", padding: "6px 12px", fontSize: "13px" }}
                          onClick={() => {
                            setLostItemId(String(item.id));
                            setPage("matches");
                          }}
                        >
                          🤖 Find Matches for this Item
                        </button>
                      </div>
                    </div>
                  ))}

                {(itemsView === "all" || itemsView === "found") &&
                  filteredFoundItems.map((item) => (
                    <div className="match-card" key={`found-${item.id}`} style={{ borderLeft: "4px solid #198754" }}>
                      <div className="match-info">
                        <span className="item-badge" style={{ backgroundColor: "#198754" }}>
                          📦 Found Item #ID: {item.id}
                        </span>
                        <h2>{item.itemName}</h2>
                        <p>📂 <b>Category:</b> {item.category}</p>
                        <p>📍 <b>Location:</b> {item.location}</p>
                        <p>📅 <b>Found Date:</b> {item.foundDate || "Not specified"}</p>
                        <p>📝 <b>Description:</b> {item.description}</p>
                        {item.user && (
                          <p>👤 <b>Reported by:</b> {item.user.name} ({item.user.email})</p>
                        )}
                      </div>
                    </div>
                  ))}

                {filteredLostItems.length === 0 && filteredFoundItems.length === 0 && (
                  <p style={{ textAlign: "center", color: "#6c757d", margin: "30px 0" }}>
                    No items found matching your criteria.
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* REPORT LOST */}
        {page === "lost" && (
          <section className="form-section">
            <h1>Report Lost Item</h1>

            <form onSubmit={submitLostItem} className="item-form">
              <input
                type="text"
                name="itemName"
                placeholder="Item Name"
                value={lostItem.itemName}
                onChange={handleLostChange}
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={lostItem.description}
                onChange={handleLostChange}
                required
              />

              <input
                type="text"
                name="category"
                placeholder="Category"
                value={lostItem.category}
                onChange={handleLostChange}
                required
              />

              <input
                type="text"
                name="location"
                placeholder="Lost Location"
                value={lostItem.location}
                onChange={handleLostChange}
                required
              />

              <input
                type="date"
                name="lostDate"
                value={lostItem.lostDate}
                onChange={handleLostChange}
                required
              />

              <button type="submit">Submit Lost Item</button>
            </form>

            {message && <p className="message">{message}</p>}
          </section>
        )}

        {/* REPORT FOUND */}
        {page === "found" && (
          <section className="form-section">
            <h1>Report Found Item</h1>

            <form onSubmit={submitFoundItem} className="item-form">
              <input
                type="text"
                name="itemName"
                placeholder="Item Name"
                value={foundItem.itemName}
                onChange={handleFoundChange}
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={foundItem.description}
                onChange={handleFoundChange}
                required
              />

              <input
                type="text"
                name="category"
                placeholder="Category"
                value={foundItem.category}
                onChange={handleFoundChange}
                required
              />

              <input
                type="text"
                name="location"
                placeholder="Found Location"
                value={foundItem.location}
                onChange={handleFoundChange}
                required
              />

              <input
                type="date"
                name="foundDate"
                value={foundItem.foundDate}
                onChange={handleFoundChange}
                required
              />

              <button type="submit">Submit Found Item</button>
            </form>

            {message && <p className="message">{message}</p>}
          </section>
        )}

        {/* FIND MATCHES */}
        {page === "matches" && (
          <section className="form-section">
            <h1>🤖 Find Matches</h1>
            <p>
              Enter the Lost Item ID to find possible matching found items using
              our AI similarity matching algorithm.
            </p>

            <form className="item-form" onSubmit={findMatches}>
              <input
                type="number"
                placeholder="Enter Lost Item ID (e.g. 1)"
                value={lostItemId}
                onChange={(e) => setLostItemId(e.target.value)}
                required
              />

              <button type="submit">🔍 Find Matches</button>
            </form>

            {message && <p className="message">{message}</p>}

            <div className="matches">
              {matches.map((match, index) => (
                <div className="match-card" key={index}>
                  <div className="match-info">
                    <span className="item-badge">Found Item ID: {match.id}</span>
                    <h2>{match.itemName}</h2>
                    <p>📂 <b>Category:</b> {match.category}</p>
                    <p>📍 <b>Location:</b> {match.location}</p>
                    <p>📅 <b>Found Date:</b> {match.foundDate}</p>
                    <p>📝 <b>Description:</b> {match.description}</p>
                  </div>

                  <div className="score-section">
                    <div className="score-circle">
                      <strong>{match.matchScore}%</strong>
                      <span>Match</span>
                    </div>

                    <div className="match-label">
                      {match.matchScore >= 80 ? "⭐ High Match" : "✨ Possible Match"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;