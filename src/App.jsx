import { useState } from "react";
import "./App.css";

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
      const response = await fetch(
        "http://localhost:4040/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(loginData)
        }
      );

      const data = await response.json();

      if (response.ok && data && data.id) {
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
      console.error(error);
      setAuthMessage("❌ Backend is not running.");
    }
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:4040/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(registerData)
        }
      );

      const data = await response.text();

      if (response.ok) {
        setAuthMessage(
          "✅ Registration successful! Please login."
        );

        setRegisterData({
          name: "",
          email: "",
          password: ""
        });

        setAuthMode("login");
      } else {
        setAuthMessage("❌ " + data);
      }
    } catch (error) {
      console.error(error);
      setAuthMessage("❌ Backend is not running.");
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
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user || !user.id) {
        setMessage("❌ Please login first.");
        return;
      }

      const response = await fetch(
        `http://localhost:4040/api/lost-items?userId=${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(lostItem)
        }
      );

      if (response.ok) {
        setMessage(
          "✅ Lost item reported successfully!"
        );

        setLostItem({
          itemName: "",
          description: "",
          category: "",
          location: "",
          lostDate: ""
        });
      } else {
        setMessage(
          "❌ Failed to report lost item."
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Backend is not running.");
    }
  };

  // SUBMIT FOUND ITEM
  const submitFoundItem = async (e) => {
    e.preventDefault();

    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user || !user.id) {
        setMessage("❌ Please login first.");
        return;
      }

      const response = await fetch(
        `http://localhost:4040/api/found-items?userId=${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(foundItem)
        }
      );

      if (response.ok) {
        setMessage(
          "✅ Found item reported successfully!"
        );

        setFoundItem({
          itemName: "",
          description: "",
          category: "",
          location: "",
          foundDate: ""
        });
      } else {
        setMessage(
          "❌ Failed to report found item."
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Backend is not running.");
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

    const response = await fetch(
      `http://localhost:4040/api/matches/${lostItemId}`
    );

    if (response.ok) {
      const data = await response.json();

      setMatches(data);
      setMessage("");

      if (data.length === 0) {
        setMessage("❌ No matching found items.");
      }
    } else {
      setMatches([]);
      setMessage("❌ Could not find matches.");
    }

  } catch (error) {
    console.error(error);
    setMatches([]);
    setMessage("❌ Backend is not running.");
  }
};

  // LOGIN / REGISTER PAGE
  if (!isLoggedIn) {
    return (
      <div className="app">

        <nav className="navbar">
          <h2>🔍 Lost & Found AI</h2>
        </nav>

        <section className="form-section">

          {authMode === "login" ? (
            <>
              <h1>🔐 Login</h1>

              <p>
                Login to access the Lost & Found system.
              </p>

              <form
                className="item-form"
                onSubmit={handleLogin}
              >

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

                <button type="submit">
                  Login
                </button>

              </form>

              {authMessage && (
                <p className="message">
                  {authMessage}
                </p>
              )}

              <p>
                Don't have an account?
              </p>

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

              <p>
                Register to use the Lost & Found system.
              </p>

              <form
                className="item-form"
                onSubmit={handleRegister}
              >

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

                <button type="submit">
                  Register
                </button>

              </form>

              {authMessage && (
                <p className="message">
                  {authMessage}
                </p>
              )}

              <p>
                Already have an account?
              </p>

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

          <button onClick={() => setPage("home")}>
            Home
          </button>

          <button onClick={() => setPage("lost")}>
            Report Lost
          </button>

          <button onClick={() => setPage("found")}>
            Report Found
          </button>

          <button onClick={() => setPage("matches")}>
            Find Matches
          </button>

          <button onClick={logout}>
            Logout
          </button>

        </div>

      </nav>

      <main>

        {/* HOME */}

        {page === "home" && (

          <section className="hero">

            <h1>
              AI-Based Lost-and-Found Object Matching System
            </h1>

            <p>
              Report lost or found objects and use intelligent
              matching to find possible matches quickly.
            </p>

            <div className="cards">

              <div className="card">

                <h3>📢 Report Lost</h3>

                <p>
                  Submit details about an item you have lost.
                </p>

                <button
                  onClick={() => setPage("lost")}
                >
                  Report Lost Item
                </button>

              </div>

              <div className="card">

                <h3>📦 Report Found</h3>

                <p>
                  Submit details about an item you have found.
                </p>

                <button
                  onClick={() => setPage("found")}
                >
                  Report Found Item
                </button>

              </div>

              <div className="card">

                <h3>🤖 Find Matches</h3>

                <p>
                  Check possible matches for your lost item.
                </p>

                <button
                  onClick={() => setPage("matches")}
                >
                  Find Matches
                </button>

              </div>

            </div>

          </section>

        )}

        {/* REPORT LOST */}

        {page === "lost" && (

          <section className="form-section">

            <h1>Report Lost Item</h1>

            <form
              onSubmit={submitLostItem}
              className="item-form"
            >

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

              <button type="submit">
                Submit Lost Item
              </button>

            </form>

            {message && (
              <p className="message">
                {message}
              </p>
            )}

          </section>

        )}

        {/* REPORT FOUND */}

        {page === "found" && (

          <section className="form-section">

            <h1>Report Found Item</h1>

            <form
              onSubmit={submitFoundItem}
              className="item-form"
            >

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

              <button type="submit">
                Submit Found Item
              </button>

            </form>

            {message && (
              <p className="message">
                {message}
              </p>
            )}

          </section>

        )}

        {/* FIND MATCHES */}

        {page === "matches" && (

          <section className="form-section">

            <h1>🤖 Find Matches</h1>

            <p>
              Enter the Lost Item ID to find possible matching
              found items.
            </p>

            <form
              className="item-form"
              onSubmit={findMatches}
            >

              <input
                type="number"
                placeholder="Enter Lost Item ID"
                value={lostItemId}
                onChange={(e) =>
                  setLostItemId(e.target.value)
                }
                required
              />

              <button type="submit">
                🔍 Find Matches
              </button>

            </form>

            {message && (
              <p className="message">
                {message}
              </p>
            )}

            <div className="matches">

              {matches.map((match, index) => (

                <div
                  className="match-card"
                  key={index}
                >

                  <div className="match-info">

                    <span className="item-badge">
                      Found Item ID: {match.id}
                    </span>

                    <h2>
                      {match.itemName}
                    </h2>

                    <p>
                      📂 <b>Category:</b>{" "}
                      {match.category}
                    </p>

                    <p>
                      📍 <b>Location:</b>{" "}
                      {match.location}
                    </p>

                    <p>
                      📅 <b>Found Date:</b>{" "}
                      {match.foundDate}
                    </p>

                    <p>
                      📝 <b>Description:</b>{" "}
                      {match.description}
                    </p>

                  </div>

                  <div className="score-section">

                    <div className="score-circle">

                      <strong>
                        {match.matchScore}%
                      </strong>

                      <span>
                        Match
                      </span>

                    </div>

                    <div className="match-label">

                      {match.matchScore >= 80
                        ? "⭐ High Match"
                        : "✨ Possible Match"}

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