import React, { useEffect, useState } from "react";
import "./TilesCrud.css";
import {
  getAllTiles,
  addTile,
  updateTile,
  deleteTile
} from "../services/TileService";

function TilesCrud() {

   const [tiles, setTiles] = useState([]);
   const [selectedRole, setSelectedRole] = useState(null); // null = show selection, 'admin' or 'user'
   const [tile, setTile] = useState({
    id: null,
    name: "",
    brand: "",
    size: "",
    countOfBoxes: "",
    price: ""
  });

  const [isEdit, setIsEdit] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const ADMIN_PASSWORD = "admin@123"; // Change this to your desired password

  useEffect(() => {
    console.log("🚀 Component mounted - Loading tiles...");
    loadTiles();
    // Auto-refresh data every 3 seconds to ensure all data is always visible
    const interval = setInterval(() => {
      console.log("🔄 Auto-refresh triggered");
      loadTiles();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadTiles = () => {
    console.log("🔍 Fetching tiles from: http://localhost:8080/tiles");
    getAllTiles()
      .then(res => {
        console.log("✅ SUCCESS! API Response:", res);
        console.log("Response Status:", res.status);
        console.log("Response Data:", res.data);
        
        let tilesData = [];
        
        // Handle different response formats from backend
        if (Array.isArray(res.data)) {
          tilesData = res.data;
          console.log("✅ Data is array:", tilesData);
        } else if (res.data && typeof res.data === 'object') {
          console.log("Data is object, checking for wrapped array...");
          // Check if data is wrapped in properties like 'data', 'tiles', or 'content'
          if (Array.isArray(res.data.data)) {
            tilesData = res.data.data;
            console.log("✅ Found in res.data.data:", tilesData);
          }
          else if (Array.isArray(res.data.tiles)) {
            tilesData = res.data.tiles;
            console.log("✅ Found in res.data.tiles:", tilesData);
          }
          else if (Array.isArray(res.data.content)) {
            tilesData = res.data.content;
            console.log("✅ Found in res.data.content:", tilesData);
          }
        }
        
        console.log(`✅ Loaded ${tilesData.length} tiles from database`);
        setTiles(tilesData);
      })
      .catch(err => {
        console.error("❌ ERROR loading tiles!");
        console.error("Error Message:", err.message);
        
        if (err.response) {
          console.error("❌ Server Error! Status:", err.response.status);
          console.error("Server Response:", err.response.data);
        } else if (err.request) {
          console.error("❌ No response from server!");
          console.error("⚠️ Backend might not be running on localhost:8080");
        }
        
        console.log("🚧 Troubleshooting:");
        console.log("1. Check if backend is running: http://localhost:8080/tiles");
        console.log("2. Verify database has data");
        
        setTiles([]);
      });
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'user') {
      setIsAdmin(false);
    } else if (role === 'admin') {
      setShowLoginModal(true);
    }
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
    setIsAdmin(false);
    setShowLoginModal(false);
    setAdminPassword("");
  };

  const handleChange = (e) => {
    setTile({ ...tile, [e.target.name]: e.target.value });
  };

  const getBackendErrorMessage = (err) => {
    if (!err) return "Unknown error";

    if (err.response?.data) {
      const data = err.response.data;

      if (typeof data === "string") {
        return data;
      }

      if (typeof data === "object") {
        return data.message || data.error || JSON.stringify(data);
      }
    }

    return err.message || "Request failed";
  };

  const buildPayload = () => {
    if (!tile.name || !tile.brand || !tile.size) {
      alert("Please fill tile name, brand, and size.");
      return null;
    }

    if (tile.countOfBoxes === "" || tile.price === "") {
      alert("Please enter boxes and price.");
      return null;
    }

    const countOfBoxes = Number(tile.countOfBoxes);
    const price = Number(tile.price);

    if (Number.isNaN(countOfBoxes) || Number.isNaN(price)) {
      alert("Boxes and price must be valid numbers.");
      return null;
    }

    return {
      ...tile,
      countOfBoxes,
      price
    };
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setAdminPassword("");
    } else {
      alert("❌ Incorrect password!");
      setAdminPassword("");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (!isAdmin) {
      alert("⛔ Admin access required!");
      setShowLoginModal(true);
      return;
    }

    const payload = buildPayload();
    if (!payload) {
      return;
    }

    if (isEdit) {
      // 🔁 UPDATE
      updateTile(tile.id, payload)
        .then(() => {
          loadTiles();
          resetForm();
          alert("Tile updated successfully.");
        })
        .catch((err) => {
          alert(`Failed to update tile: ${getBackendErrorMessage(err)}`);
        });
    } else {
      // ➕ ADD
      addTile(payload)
        .then(() => {
          loadTiles();
          resetForm();
          alert("Tile added successfully.");
        })
        .catch((err) => {
          alert(`Failed to add tile: ${getBackendErrorMessage(err)}`);
        });
    }
  };

  const handleEdit = (t) => {
    if (!isAdmin) {
      alert("⛔ Admin access required to edit!");
      setShowLoginModal(true);
      return;
    }
    setTile(t);
    setIsEdit(true);
  };

  const handleDelete = (id) => {
    if (!isAdmin) {
      alert("⛔ Admin access required to delete!");
      setShowLoginModal(true);
      return;
    }
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteTile(id)
        .then(() => {
          loadTiles();
          alert("Tile deleted successfully.");
        })
        .catch((err) => {
          alert(`Failed to delete tile: ${getBackendErrorMessage(err)}`);
        });
    }
  };

  const resetForm = () => {
    setTile({
      id: null,
      name: "",
      brand: "",
      size: "",
      countOfBoxes: "",
      price: ""
    });
    setIsEdit(false);
  };

  return (
    <div className="container">
      {/* ROLE SELECTION SCREEN */}
      {selectedRole === null ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          gap: '30px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <h1 style={{
              fontSize: '3em',
              background: 'linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 50%, #6d28d9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '10px',
              fontWeight: '800',
              letterSpacing: '-1px'
            }}>
              🏭 Tiles Warehouse
            </h1>
            <p style={{
              fontSize: '1.2em',
              color: '#cbd5e1',
              fontWeight: '500'
            }}>
              Select your access mode
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '30px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {/* USER BUTTON */}
            <button
              onClick={() => handleRoleSelect('user')}
              style={{
                padding: '40px 60px',
                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                color: 'white',
                border: '2px solid rgba(20, 184, 166, 0.5)',
                borderRadius: '18px',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '1.2em',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 30px rgba(20, 184, 166, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
                minWidth: '280px',
                backdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px)';
                e.target.style.boxShadow = '0 15px 40px rgba(20, 184, 166, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(20, 184, 166, 0.3)';
              }}
            >
              <span style={{fontSize: '3em'}}>👁️</span>
              <span>User Mode</span>
              <span style={{fontSize: '0.85em', opacity: 0.9}}>View inventory only</span>
            </button>

            {/* ADMIN BUTTON */}
            <button
              onClick={() => handleRoleSelect('admin')}
              style={{
                padding: '40px 60px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                border: '2px solid rgba(139, 92, 246, 0.5)',
                borderRadius: '18px',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '1.2em',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
                minWidth: '280px',
                backdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px)';
                e.target.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.3)';
              }}
            >
              <span style={{fontSize: '3em'}}>🔐</span>
              <span>Admin Mode</span>
              <span style={{fontSize: '0.85em', opacity: 0.9}}>Full access with password</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* MAIN APP - ONLY SHOW WHEN ROLE SELECTED */}
      {selectedRole !== null && (
        <>
        {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">🔐 Admin Authentication</h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowLoginModal(false);
                  setAdminPassword("");
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">Enter admin password to access edit, create, and delete features</p>
              <input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
                className="modal-input"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-add" 
                onClick={handleAdminLogin}
              >
                <span className="btn-icon">🔓</span>
                Unlock Admin
              </button>
              <button 
                className="btn btn-cancel" 
                onClick={() => {
                  setShowLoginModal(false);
                  setAdminPassword("");
                }}
              >
                <span className="btn-icon">❌</span>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="header-section">
        <button 
          onClick={handleBackToRoleSelection}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '8px 14px',
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9em',
            transition: 'all 0.2s ease'
          }}
          title="Back to role selection"
        >
          ← Back
        </button>
        <div className="header-content">
          <h1 className="main-title">
            <span className="title-icon">🏭</span> Tiles Warehouse Management
          </h1>
          <p className="subtitle">Manage and track your tile inventory efficiently</p>
        </div>
        <div className="stats-box">
          <div className="stat-item">
            <span className="stat-number">{tiles.length}</span>
            <span className="stat-label">Total Items</span>
          </div>
          <div className="auth-status">
            {isAdmin ? (
              <div className="admin-badge">
                <span className="badge-icon">🔓</span>
                <span className="badge-text">Admin Mode</span>
                <button 
                  className="logout-btn" 
                  onClick={handleAdminLogout}
                  title="Logout"
                >
                  🚪
                </button>
              </div>
            ) : (
              <button 
                className="login-btn" 
                onClick={() => setShowLoginModal(true)}
              >
                <span className="badge-icon">🔒</span>
                <span className="badge-text">Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ADMIN SECTION - FORM ONLY VISIBLE TO ADMINS */}
      {isAdmin ? (
        <div className="form-section admin-only">
          <div className="form-header">
            <h3 className="form-title">{isEdit ? "✏️ Update Tile" : "➕ Add New Tile"}</h3>
            <p className="form-description">Admin: Fill in the details below to manage inventory</p>
          </div>
          
          <div className="form-card">
            <div className="form-group">
              <label className="form-label">Tile Name</label>
              <input 
                name="name" 
                placeholder="Enter tile name" 
                value={tile.name} 
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input 
                name="brand" 
                placeholder="Enter brand name" 
                value={tile.brand} 
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Size (cm)</label>
              <input 
                name="size" 
                placeholder="e.g., 60x60" 
                value={tile.size} 
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Boxes</label>
              <input 
                name="countOfBoxes" 
                placeholder="Quantity" 
                value={tile.countOfBoxes} 
                onChange={handleChange}
                type="number"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input 
                name="price" 
                placeholder="Enter price" 
                value={tile.price} 
                onChange={handleChange}
                type="number"
                className="form-input"
              />
            </div>
          </div>

          <div className="button-group">
            <button className={`btn ${isEdit ? "btn-update" : "btn-add"}`} onClick={handleSubmit}>
              <span className="btn-icon">{isEdit ? "💾" : "➕"}</span>
              {isEdit ? "Update Tile" : "Add Tile"}
            </button>
            {isEdit && (
              <button className="btn btn-cancel" onClick={resetForm}>
                <span className="btn-icon">❌</span>
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* USER INFO FOR NON-ADMIN */}
      {!isAdmin && tiles.length > 0 && (
        <div className="user-info-banner">
          <div className="info-content">
            <span className="info-icon">👁️</span>
            <p className="info-text">You are in <strong>Read-Only Mode</strong>. Login with admin credentials to create, update, or delete items.</p>
          </div>
          <button 
            className="banner-btn"
            onClick={() => setShowLoginModal(true)}
          >
            Admin Login
          </button>
        </div>
      )}

      <div className="table-section">
        <div className="table-header">
          <h3 className="table-title">📋 Inventory List</h3>
          <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
            <span className="table-count">{tiles.length} items</span>
            <button 
              onClick={loadTiles}
              style={{
                padding: '8px 14px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9em',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              title="Refresh data from database"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        
        {tiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p className="empty-text">No tiles in inventory yet</p>
            <p className="empty-subtext">{isAdmin ? "Add your first tile to get started" : "Check back later for available items"}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Size</th>
                  <th>Boxes</th>
                  <th>Price</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {tiles.map(t => (
                  <tr key={t.id} className="table-row">
                    <td className="cell-name">{t.name}</td>
                    <td className="cell-brand">{t.brand}</td>
                    <td className="cell-size">{t.size}</td>
                    <td className="cell-boxes">{t.countOfBoxes}</td>
                    <td className="cell-price">₹{t.price}</td>
                    {isAdmin && (
                      <td className="cell-actions">
                        <button 
                          className="action-btn edit" 
                          onClick={() => handleEdit(t)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete" 
                          onClick={() => handleDelete(t.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}

export default TilesCrud;
