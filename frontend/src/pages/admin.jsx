import React, { useEffect, useState, useCallback,useMemo } from "react";
import axios from "axios";

export default function AdminUserManager() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState({ name: "", role: "" });


 const config = useMemo(() => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
}), []);
  // useCallback to memoize the function
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users", config);
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, [config]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // ✅ No warning now

  const handleEdit = (user) => {
    setSelectedUser(user);
setEditUser({ name: user.name, role: user.role, password: "" });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        editUser,
        config
      );
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, config);
      fetchUsers();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Admin User Management</h2>

      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user._id}
            className="border p-4 rounded-lg shadow-md bg-white flex justify-between items-center"
          >
            <div>
              <p><span className="font-semibold">Name:</span> {user.name}</p>
              <p><span className="font-semibold">Email:</span> {user.email}</p>
              <p><span className="font-semibold">Role:</span> {user.role}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(user)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(user._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedUser && (
        <div className="mt-10 p-6 bg-gray-100 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold mb-4">Edit User</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={editUser.name}
              onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              className="w-full px-3 py-2 border rounded"
              value={editUser.role}
              onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            onClick={handleUpdate}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
